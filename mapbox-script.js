// mapbox-script.js - Fixed version with proper state coloring and marker hover
console.log('🗺️ Loading Mapbox travel map...');

let map = null;
let travelData = null;
let markers = [];

document.addEventListener('DOMContentLoaded', async function() {
    console.log('📄 DOM loaded');
    
    if (!window.API_CONFIG?.MAPBOX_ACCESS_TOKEN) {
        showError('Add Mapbox token to config.js');
        return;
    }
    
    try {
        await loadTravelData();
        initializeMapbox();
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load map');
    }
});

async function loadTravelData() {
    const response = await fetch('map-data.json');
    travelData = await response.json();
    console.log(`✅ Loaded ${travelData.areas?.length || 0} areas and ${travelData.locations?.length || 0} locations`);
    return travelData;
}

function initializeMapbox() {
    // Hide loading
    document.getElementById('mapLoading').style.display = 'none';
    
    // Initialize map
    mapboxgl.accessToken = window.API_CONFIG.MAPBOX_ACCESS_TOKEN;
    
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-98.5795, 39.8283],
        zoom: 3,
        projection: 'globe'
    });
    
    // When map loads, add features IN THE RIGHT ORDER
    map.on('load', async () => {
        console.log('✅ Map loaded');
        
        // 1. Add the atmosphere/space effect
        addSpaceBackground();
        
        // 2. FIRST add markers (they go on top)
        addLocationMarkers();
        
        // 3. Wait for states to load, THEN add countries
        await addUSStatesLayer();
        
        // 4. Add countries (they go under states)
        addCountriesLayer();
        
        // 5. Update statistics
        updateStatistics();
        
        console.log('🎉 Map fully loaded and ready');
        
        // Debug: check if states are visible
        setTimeout(() => {
            debugStateVisibility();
        }, 1000);
    });
    
    // Add controls
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.FullscreenControl());
}

function addSpaceBackground() {
    // Set the atmosphere/space effect
    map.setFog({
        'color': 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
    });
    
    // Add globe curvature effect
    map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
    
    console.log('✨ Added space/globe background');
}

function addUSStatesLayer() {
    console.log('🗺️ Loading US states data...');
    
    const visitedStates = getVisitedStates();
    console.log('📍 Visited states to color:', visitedStates);
    
    // Return a promise so we can await it
    return new Promise((resolve, reject) => {
        // Load local GeoJSON file
        fetch('us-states.geojson')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load states GeoJSON: ${response.status}`);
                }
                return response.json();
            })
            .then(geoJsonData => {
                console.log(`✅ Loaded US states GeoJSON with ${geoJsonData.features.length} states`);
                
                // Add the GeoJSON source
                map.addSource('us-states', {
                    type: 'geojson',
                    data: geoJsonData
                });
                
                // Add the fill layer for states - THIS COLORS THEM
                map.addLayer({
                    id: 'us-states-fill',
                    type: 'fill',
                    source: 'us-states',
                    paint: {
                        'fill-color': [
                            'case',
                            ['in', ['get', 'STATE_ABBR'], ['literal', visitedStates]],
                            '#34a853', // Bright green for visited
                            'rgba(255, 255, 255, 0.1)' // Make unvisited MORE VISIBLE for debugging
                        ],
                        'fill-opacity': 0.8,
                        'fill-outline-color': '#ffffff'
                    }
                }, 'waterway-label');
                
                // Add state borders
                map.addLayer({
                    id: 'state-borders',
                    type: 'line',
                    source: 'us-states',
                    paint: {
                        'line-color': '#ffffff',
                        'line-width': 1,
                        'line-opacity': 0.3
                    }
                }, 'us-states-fill');
                
                console.log(`✅ Added coloring for ${visitedStates.length} visited US states`);
                
                // Force a style update to ensure states appear
                setTimeout(() => {
                    // Make sure the layer is visible
                    map.setPaintProperty('us-states-fill', 'fill-opacity', 0.8);
                    
                    // DEBUG: Try making unvisited states more visible temporarily
                    map.setPaintProperty('us-states-fill', 'fill-color', [
                        'case',
                        ['in', ['get', 'STATE_ABBR'], ['literal', visitedStates]],
                        '#34a853', // Green for visited
                        'rgba(255, 0, 0, 0.3)' // RED for unvisited (to debug)
                    ]);
                    
                    console.log('🔍 State layer should now be visible');
                    console.log('Visited states:', visitedStates);
                }, 100);
                
                resolve();
            })
            .catch(error => {
                console.error('❌ Failed to load US states:', error);
                reject(error);
            });
    });
}

function getVisitedStates() {
    const visitedStates = new Set();
    
    // Add states from areas
    if (travelData?.areas) {
        travelData.areas.forEach(area => {
            if (area.type === 'state' && area.status === 'visited' && area.state) {
                visitedStates.add(area.state.toUpperCase()); // Ensure uppercase
            }
        });
    }
    
    // Add states from locations
    if (travelData?.locations) {
        travelData.locations.forEach(location => {
            if (location.state && location.country === 'US') {
                visitedStates.add(location.state.toUpperCase()); // Ensure uppercase
            }
        });
    }
    
    console.log('📍 All visited states found:', Array.from(visitedStates));
    return Array.from(visitedStates);
}

function tryAlternativeStateColoring() {
    console.log('🔄 Trying alternative state coloring...');
    
    // Use a different GeoJSON source
    fetch('https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_040_00_5m.json')
        .then(response => response.json())
        .then(geoJsonData => {
            const visitedStates = getVisitedStates();
            
            map.addSource('us-states-alt', {
                type: 'geojson',
                data: geoJsonData
            });
            
            map.addLayer({
                id: 'us-states-fill-alt',
                type: 'fill',
                source: 'us-states-alt',
                paint: {
                    'fill-color': [
                        'case',
                        ['in', ['get', 'STATE'], ['literal', visitedStates]],
                        '#34a853',
                        'rgba(220, 220, 220, 0.05)'
                    ],
                    'fill-opacity': 0.8,
                    'fill-outline-color': '#ffffff'
                }
            });
            
            console.log('✅ Added alternative state coloring');
        })
        .catch(error => {
            console.error('❌ Alternative also failed:', error);
        });
}

function addStateHoverEffects() {
    // Create a popup but don't add it to the DOM yet
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });
    
    let hoveredStateId = null;
    
    map.on('mouseenter', 'us-states-fill', (e) => {
        if (e.features.length > 0) {
            const state = e.features[0];
            const stateName = state.properties.STATE_NAME || state.properties.name;
            const stateCode = state.properties.STATE_ABBR || state.properties.STATE;
            
            // Check if state is visited
            const visitedStates = getVisitedStates();
            const isVisited = visitedStates.includes(stateCode);
            
            // Update cursor
            map.getCanvas().style.cursor = 'pointer';
            
            // Set hover effect
            map.setPaintProperty('us-states-fill', 'fill-opacity', [
                'case',
                ['==', ['get', 'STATE_ABBR'], stateCode],
                1.0, // Brighter for hovered state
                0.8  // Normal for others
            ]);
            
            // Show tooltip
            // popup.setLngLat(e.lngLat)
            //     .setHTML(`
            //         <div class="state-tooltip">
            //             <strong>${stateName} (${stateCode})</strong>
            //             <small>${isVisited ? '✅ Visited' : '❌ Not visited'}</small>
            //         </div>
            //     `)
            //     .addTo(map);
            
            hoveredStateId = stateCode;
        }
    });
    
    map.on('mouseleave', 'us-states-fill', () => {
        map.getCanvas().style.cursor = '';
        map.setPaintProperty('us-states-fill', 'fill-opacity', 0.8);
        
        if (hoveredStateId) {
            popup.remove();
            hoveredStateId = null;
        }
    });
}

function addCountriesLayer() {
    if (!travelData?.areas) return;
    
    const visitedCountries = travelData.areas
        .filter(area => area.type === 'country' && area.status === 'visited')
        .map(country => country.country);
    
    if (visitedCountries.length === 0) return;
    
    console.log('🌍 Coloring visited countries:', visitedCountries);
    
    // Add country boundaries source
    map.addSource('country-boundaries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1'
    });
    
    // Add the fill layer for countries (BELOW states)
    map.addLayer({
        id: 'visited-countries-fill',
        type: 'fill',
        source: 'country-boundaries',
        'source-layer': 'country_boundaries',
        paint: {
            'fill-color': [
                'case',
                ['in', ['get', 'iso_3166_1_alpha_3'], ['literal', visitedCountries]],
                '#4285f4', // Blue for visited countries
                'rgba(220, 220, 220, 0.05)'
            ],
            'fill-opacity': 0.6,
            'fill-outline-color': '#ffffff'
        },
        'filter': ['!=', ['get', 'disputed'], 'true']
    }, 'us-states-fill'); // Put below states layer
    
    console.log('✅ Country coloring layer added');
}

function addLocationMarkers() {
    if (!travelData?.locations || travelData.locations.length === 0) {
        console.log('⚠️ No locations to add markers for');
        return;
    }
    
    console.log(`📍 Adding ${travelData.locations.length} markers...`);
    
    markers = []; // Clear any existing markers
    
    travelData.locations.forEach(location => {
        // Create a custom marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        
        // Create tooltip element
        const tooltipElement = document.createElement('div');
        tooltipElement.className = 'marker-tooltip';
        tooltipElement.textContent = location.name;
        
        // Add tooltip to marker
        markerElement.appendChild(tooltipElement);
        
        // Create the marker
        const marker = new mapboxgl.Marker({
            element: markerElement,
            anchor: 'bottom' // Anchor at bottom for proper positioning
        })
        .setLngLat([location.coordinates.lng, location.coordinates.lat])
        .setPopup(
            new mapboxgl.Popup({ 
                offset: 25,
                className: 'custom-popup',
                closeButton: true,
                closeOnClick: true
            })
            .setHTML(createPopupContent(location))
        );
        
        // Add click event to marker element
        markerElement.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent map click events
            marker.togglePopup();
        });
        
        // Add marker to map
        marker.addTo(map);
        markers.push(marker);
        
        console.log(`📍 Added marker for ${location.name}`);
    });
    
    console.log('✅ All markers added');
}

function createPopupContent(location) {
    return `
        <div class="popup-content">
            <div class="popup-header">
                <h3>${location.name}</h3>
                <div class="popup-subtitle">
                    <span class="popup-type">${location.type}</span>
                    ${location.state ? `<span class="popup-state">${location.state}, ${location.country}</span>` : ''}
                    ${location.date ? `<span class="popup-date">${location.date}</span>` : ''}
                </div>
            </div>
            
            <div class="popup-body">
                <p>${location.description || 'No description available.'}</p>
                
                ${location.photos?.length > 0 ? `
                    <div class="popup-photo">
                        <img src="${location.photos[0].url}" 
                             alt="${location.photos[0].caption || location.name}"
                             loading="lazy">
                        ${location.photos[0].caption ? `
                            <p class="photo-caption"><em>${location.photos[0].caption}</em></p>
                        ` : ''}
                    </div>
                ` : ''}
                
                ${location.tags?.length > 0 ? `
                    <div class="popup-tags">
                        ${location.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="popup-footer">
                <small>Click outside to close</small>
            </div>
        </div>
    `;
}

function updateStatistics() {
    if (!travelData?.areas) return;
    
    // Get unique visited states
    const visitedStates = getVisitedStates();
    const visitedCountries = travelData.areas
        .filter(area => area.type === 'country' && area.status === 'visited').length;
    
    const visitedCount = visitedStates.length + visitedCountries;
    const unvisitedCount = 50 - visitedStates.length; // 50 US states
    const locationsCount = travelData.locations?.length || 0;
    
    console.log(`📊 Stats: ${visitedCount} visited areas, ${unvisitedCount} unvisited, ${locationsCount} locations`);
    
    // Update HTML
    const visitedEl = document.getElementById('visitedCount');
    const unvisitedEl = document.getElementById('unvisitedCount');
    const locationsEl = document.getElementById('locationsCount');
    
    if (visitedEl) visitedEl.textContent = visitedCount;
    if (unvisitedEl) unvisitedEl.textContent = unvisitedCount;
    if (locationsEl) locationsEl.textContent = locationsCount;
}

function showError(message) {
    const mapElement = document.getElementById('map');
    if (mapElement) {
        mapElement.innerHTML = `
            <div class="map-error">
                <h3>⚠️ Map Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()" style="
                    background: #ffff00;
                    color: #000;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 10px;
                ">Retry</button>
            </div>
        `;
    }
}

// Debug function to check layers
function debugLayers() {
    if (!map) return;
    console.log('=== DEBUG LAYERS ===');
    console.log('All layers:', map.getStyle().layers.map(l => l.id));
    console.log('Sources:', Object.keys(map.getStyle().sources));
    console.log('US States layer exists:', !!map.getLayer('us-states-fill'));
    console.log('Countries layer exists:', !!map.getLayer('visited-countries-fill'));
}

function debugStateColoring() {
    console.log('=== DEBUG STATE COLORING ===');
    
    // 1. Check if source is loaded
    const source = map.getSource('states-data');
    console.log('States source exists:', !!source);
    
    // 2. Check if layer is added
    const layer = map.getLayer('states-fill');
    console.log('States layer exists:', !!layer);
    
    // 3. Get visited states
    const visitedStates = getVisitedStates();
    console.log('Visited states array:', visitedStates);
    
    // 4. Check paint properties
    if (layer) {
        const paintProps = map.getPaintProperty('states-fill', 'fill-color');
        console.log('Paint properties:', paintProps);
    }
    
    // 5. Manually test a state
    console.log('Testing CA in visitedStates:', visitedStates.includes('CA'));
    console.log('Testing NY in visitedStates:', visitedStates.includes('NY'));
    console.log('Testing AZ in visitedStates:', visitedStates.includes('AZ'));
}

// Call this after map loads
setTimeout(debugStateColoring, 2000);