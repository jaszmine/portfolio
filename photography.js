// photography.js - Lightbox and Filter Functionality
// loads data from JSON file

let allPhotosData = []; // Store all photo data
let currentPhotos = []; // Current filtered photos
let currentIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.photo-gallery')) {
        initializePhotographyPage();
    }
});

async function initializePhotographyPage() {
    console.log('Initializing photography page...');
    
    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) loadingIndicator.style.display = 'block';
    
    try {
        // Load photo data from JSON file
        const response = await fetch('photos-data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        allPhotosData = data.photos;
        
        console.log(`Loaded ${allPhotosData.length} photos from JSON`);
        
        // Initialize the page with the loaded data
        setupPageWithData();
        
    } catch (error) {
        console.error('Error loading photo data:', error);
        // Fallback: Show error message
        const gallery = document.querySelector('.photo-gallery');
        if (gallery) {
            gallery.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px;"></i>
                    <h3>Unable to load photos</h3>
                    <p>Please check your internet connection and try again.</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;">
                        Retry
                    </button>
                </div>
            `;
        }
    } finally {
        // Hide loading indicator
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
}

function setupPageWithData() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const leftColumn = document.getElementById('left-column');
    const rightColumn = document.getElementById('right-column');
    
    // Lightbox elements
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDescription = document.getElementById('lightbox-description');
    const lightboxCategory = document.getElementById('lightbox-category');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    // Function to create photo element from data
    function createPhotoElement(photoData, index) {
        const photoDiv = document.createElement('div');
        photoDiv.className = 'photo-item';
        photoDiv.setAttribute('data-id', photoData.id);
        photoDiv.setAttribute('data-category', photoData.category);
        photoDiv.setAttribute('data-order', photoData.order);
        photoDiv.setAttribute('data-title', photoData.title);
        photoDiv.setAttribute('data-description', photoData.description);
        photoDiv.setAttribute('data-date', photoData.date);
        if (photoData.location) photoDiv.setAttribute('data-location', photoData.location);
        if (photoData.camera) photoDiv.setAttribute('data-camera', photoData.camera);
        
        const img = document.createElement('img');
        img.src = photoData.src;
        img.alt = photoData.alt;
        img.loading = 'lazy'; // Lazy loading for better performance
        
        photoDiv.appendChild(img);
        
        // Add click event
        photoDiv.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Click animation
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 300);
            
            // Open lightbox
            setTimeout(() => {
                openLightbox(currentPhotos, index, img);
            }, 150);
        });
        
        return photoDiv;
    }
    
    // Function to reorganize photos into two columns
    function reorganizeColumns(photosArray) {
        // Clear columns
        leftColumn.innerHTML = '';
        rightColumn.innerHTML = '';
        
        // Sort by order
        const sortedPhotos = [...photosArray].sort((a, b) => a.order - b.order);
        
        // Distribute into columns
        sortedPhotos.forEach((photo, index) => {
            const photoElement = createPhotoElement(photo, index);
            if (index % 2 === 0) {
                leftColumn.appendChild(photoElement);
            } else {
                rightColumn.appendChild(photoElement);
            }
        });
        
        // Update current photos
        currentPhotos = sortedPhotos;
    }
    
    // Function to open lightbox
    function openLightbox(photos, index, clickedImg = null) {
        currentPhotos = photos;
        currentIndex = index;
        
        // Update lightbox with current photo data
        updateLightbox();
        
        // Show lightbox
        setTimeout(() => {
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show/hide navigation
            const showNav = photos.length > 1;
            lightboxPrev.classList.toggle('hidden', !showNav);
            lightboxNext.classList.toggle('hidden', !showNav);
        }, 10);
    }
    
    // Function to update lightbox content
    function updateLightbox() {
        const currentPhoto = currentPhotos[currentIndex];
        
        if (!currentPhoto) return;
        
        // Update lightbox elements
        lightboxImage.src = currentPhoto.src;
        lightboxImage.alt = currentPhoto.alt;
        lightboxTitle.textContent = currentPhoto.title;
        lightboxDescription.textContent = currentPhoto.description;
        

        // Build meta info - only including fields that have data
        let metaHTML = '';
        let hasContent = false;

        // Only add date if it exists and isn't empty
        if (currentPhoto.date && currentPhoto.date.trim() !== '') {
            metaHTML += `<span>Date: ${currentPhoto.date}</span>`;
            hasContent = true;
        }

        if (currentPhoto.location && currentPhoto.location.trim() !== '') {
            if (hasContent) {
                metaHTML += '<br>';
            }
            metaHTML += `<span>Location: ${currentPhoto.location}</span>`;
            hasContent = true;
        }

        if (currentPhoto.camera && currentPhoto.camera.trim() !== '') {
            if (hasContent) {
                metaHTML += '<br>';
            }
            metaHTML += `<span>Camera: ${currentPhoto.camera}</span>`;
            hasContent = true;
        }

        // If no meta info at all, hide the entire meta section
        if (!hasContent) {
            document.querySelector('.lightbox-meta').style.display = 'none';
        } else {
            document.querySelector('.lightbox-meta').style.display = 'block';
        }
        
        lightboxCategory.innerHTML = metaHTML;
    }
    
    // Function to close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        setTimeout(() => {
            document.body.style.overflow = 'auto';
        }, 400);
    }
    
    // Function to navigate photos
    // Function to navigate to next photo - ultra smooth slide
function nextPhoto() {
    if (currentPhotos.length <= 1) return;
    
    const container = document.querySelector('.lightbox-content').parentNode;
    const lightboxContent = document.querySelector('.lightbox-content');
    
    // Create outgoing slide element
    const outgoingSlide = lightboxContent.cloneNode(true);
    outgoingSlide.classList.add('outgoing-slide');
    outgoingSlide.style.position = 'absolute';
    outgoingSlide.style.top = '0';
    outgoingSlide.style.left = '0';
    outgoingSlide.style.width = '100%';
    outgoingSlide.style.height = '100%';
    outgoingSlide.style.zIndex = '2';
    outgoingSlide.style.transform = 'translateX(0)';
    outgoingSlide.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    // Create incoming slide element
    const incomingSlide = lightboxContent.cloneNode(true);
    incomingSlide.classList.add('incoming-slide');
    incomingSlide.style.position = 'absolute';
    incomingSlide.style.top = '0';
    incomingSlide.style.left = '0';
    incomingSlide.style.width = '100%';
    incomingSlide.style.height = '100%';
    incomingSlide.style.zIndex = '1';
    incomingSlide.style.transform = 'translateX(100%)';
    incomingSlide.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    // Add both to container
    container.appendChild(outgoingSlide);
    container.appendChild(incomingSlide);
    
    // Hide original
    lightboxContent.style.visibility = 'hidden';
    
    // Update photo for incoming slide
    currentIndex = (currentIndex + 1) % currentPhotos.length;
    updateLightboxForElement(incomingSlide);
    
    // Animate both simultaneously
    setTimeout(() => {
        outgoingSlide.style.transform = 'translateX(-100%)'; // Slide current out left
        incomingSlide.style.transform = 'translateX(0)'; // Slide new in from right
        
        // Clean up after animation
        setTimeout(() => {
            // Update the actual lightbox content
            updateLightbox();
            
            // Show original again
            lightboxContent.style.visibility = 'visible';
            lightboxContent.style.transform = 'translateX(0)';
            
            // Remove temp slides
            outgoingSlide.remove();
            incomingSlide.remove();
        }, 600);
    }, 10);
}


    function nextPhoto() {
        if (currentPhotos.length <= 1) return;
        currentIndex = (currentIndex + 1) % currentPhotos.length;
        updateLightbox();
    }
    
    function prevPhoto() {
        if (currentPhotos.length <= 1) return;
        currentIndex = (currentIndex - 1 + currentPhotos.length) % currentPhotos.length;
        updateLightbox();
    }


    
    
    // Initialize with recents photos
    const recentsPhotos = allPhotosData.filter(photo => photo.category === 'recents');
    reorganizeColumns(recentsPhotos);
    
    // Add click events to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            // Filter photos
            let filteredPhotos;
            if (filterValue === 'recents') {
                filteredPhotos = allPhotosData.filter(photo => photo.category === 'recents');
            } else {
                filteredPhotos = allPhotosData.filter(photo => photo.category === filterValue);
            }
            
            // Reorganize columns with filtered photos
            reorganizeColumns(filteredPhotos);
        });
    });
    
    // Lightbox event listeners
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', prevPhoto);
    lightboxNext.addEventListener('click', nextPhoto);
    
    // Close lightbox on overlay click
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                prevPhoto();
                break;
            case 'ArrowRight':
                nextPhoto();
                break;
        }
    });
    
    // Touch support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightbox.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});
    
    lightbox.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextPhoto();
            } else {
                prevPhoto();
            }
        }
    }, {passive: true});
}