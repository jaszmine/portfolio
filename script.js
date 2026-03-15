// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
    // Prevent background scrolling when modal is open
    lockScroll: () => document.body.style.overflow = 'hidden',
    
    // Restore background scrolling when modal is closed
    unlockScroll: () => document.body.style.overflow = '',
    
    // Close all modals of a given type
    closeAllModals: (selector) => {
        document.querySelectorAll(selector).forEach(modal => {
            modal.classList.remove('active');
        });
        Utils.unlockScroll();
    }
};

// ============================================
// MOBILE NAVIGATION
// ============================================

const MobileNav = {
    init: function() {
        this.menuToggle = document.querySelector('.menu-toggle');
        this.navLinks = document.querySelector('.nav-links');
        
        if (!this.menuToggle) return;
        
        this.setupEventListeners();
        this.setActiveNavItem();
        this.setPageClass();
    },
    
    setupEventListeners: function() {
        // Toggle menu on hamburger click
        this.menuToggle.addEventListener('click', () => this.toggleMenu());
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
        
        // Close menu when clicking a nav link
        if (this.navLinks) {
            this.navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });
        }
    },
    
    toggleMenu: function() {
        // Toggle the menu
        this.navLinks.classList.toggle('active');
        this.menuToggle.classList.toggle('active');
        
        // Update icon based on new state
        const isOpen = this.navLinks.classList.contains('active');
        const icon = this.menuToggle.querySelector('i');
        
        if (icon) {
            if (isOpen) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
        
        // Toggle body class
        document.body.classList.toggle('menu-open', isOpen);
    },
    
    closeMenu: function() {
        this.navLinks.classList.remove('active');
        this.menuToggle.classList.remove('active');
        
        // Reset icon to hamburger
        const icon = this.menuToggle.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
        
        document.body.classList.remove('menu-open');
    },
    
    handleOutsideClick: function(event) {
        if (!this.menuToggle || !this.navLinks) return;
        
        const clickedOutside = !this.menuToggle.contains(event.target) && 
                              !this.navLinks.contains(event.target);
        
        if (clickedOutside && this.navLinks.classList.contains('active')) {
            this.closeMenu();
        }
    },
    
    setActiveNavItem: function() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a').forEach(link => {
            const linkPage = link.getAttribute('href');
            if (currentPage === linkPage || (currentPage === '' && linkPage === 'index.html')) {
                link.classList.add('active');
            }
        });
    },
    
    setPageClass: function() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.body.className = document.body.className.replace(/\b\w*-page\b/g, '').trim();
        
        // page classes
        if (currentPage === 'index.html' || currentPage === '') {
            document.body.classList.add('home-page');
        } else if (currentPage.includes('about')) {
            document.body.classList.add('about-page');
        } else if (currentPage.includes('experience')) {
            document.body.classList.add('experience-page');
        } else if (currentPage.includes('projects')) {
            document.body.classList.add('projects-page');
        } else if (currentPage.includes('photography')) {
            document.body.classList.add('photography-page');
        } else if (currentPage.includes('misc')) {
            document.body.classList.add('misc-page');
        }
    }
};

// ============================================
// HERO SECTION - MATRIX ANIMATION
// ============================================

const MatrixAnimation = (function() {
    // Configuration
    const CONFIG = {
        canvasWidth: 400,
        canvasHeight: 400,
        monochromeFill: (opacity) => `rgba(255, 255, 255, ${Math.max(0, Math.min(1, opacity))})`,
        globalSpeed: 0.5,
        gridSize: 5,
        spacing: 35
    };
    
    // Easing function
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    function createCanvasInContainer(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;
        
        container.innerHTML = "";
        const canvas = document.createElement("canvas");
        canvas.width = CONFIG.canvasWidth;
        canvas.height = CONFIG.canvasHeight;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        container.appendChild(canvas);
        
        return canvas.getContext("2d");
    }
    
    // Add corner decorations (the plus signs)
    function addCornerDecorations() {
        const container = document.querySelector(".animation-container");
        if (!container || container.querySelector(".corner")) return;
        
        const corners = ["top-left", "top-right", "bottom-left", "bottom-right"];
        corners.forEach((position) => {
            const corner = document.createElement("div");
            corner.className = `corner ${position}`;
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width", "16");
            svg.setAttribute("height", "16");
            svg.setAttribute("viewBox", "0 0 512 512");
            svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            polygon.setAttribute("points", "448,224 288,224 288,64 224,64 224,224 64,224 64,288 224,288 224,448 288,448 288,288 448,288");
            polygon.setAttribute("fill", "currentColor");
            svg.appendChild(polygon);
            corner.appendChild(svg);
            container.appendChild(corner);
        });
    }
    
    function setupVoxelMatrixMorph() {
        const ctx = createCanvasInContainer("voxel-matrix-morph");
        if (!ctx) return;
        
        let time = 0;
        let lastTime = 0;
        const centerX = CONFIG.canvasWidth / 2;
        const centerY = CONFIG.canvasHeight / 2;
        
        // Create 3D grid of points
        const points = [];
        for (let x = 0; x < CONFIG.gridSize; x++) {
            for (let y = 0; y < CONFIG.gridSize; y++) {
                for (let z = 0; z < CONFIG.gridSize; z++) {
                    points.push({
                        x: (x - (CONFIG.gridSize - 1) / 2) * CONFIG.spacing,
                        y: (y - (CONFIG.gridSize - 1) / 2) * CONFIG.spacing,
                        z: (z - (CONFIG.gridSize - 1) / 2) * CONFIG.spacing
                    });
                }
            }
        }
        
        function animate(timestamp) {
            if (!lastTime) lastTime = timestamp;
            const deltaTime = timestamp - lastTime;
            lastTime = timestamp;
            time += deltaTime * 0.0005 * CONFIG.globalSpeed;
            
            ctx.clearRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
            
            const rotX = time * 0.4;
            const rotY = time * 0.6;
            const totalSize = (CONFIG.gridSize - 1) * CONFIG.spacing;
            const easedTime = easeInOutCubic((Math.sin(time * 2) + 1) / 2);
            const scanLine = (easedTime * 2 - 1) * (totalSize / 2 + 10);
            const scanWidth = 30;
            
            points.forEach((p) => {
                let { x, y, z } = p;
                
                // Apply 3D rotation
                [x, z] = [x * Math.cos(rotY) - z * Math.sin(rotY), x * Math.sin(rotY) + z * Math.cos(rotY)];
                [y, z] = [y * Math.cos(rotX) - z * Math.sin(rotX), y * Math.sin(rotX) + z * Math.cos(rotX)];
                
                // Scanning effect
                const distToScan = Math.abs(y - scanLine);
                let scanInfluence = 0;
                let displacement = 1;
                
                if (distToScan < scanWidth) {
                    scanInfluence = Math.cos((distToScan / scanWidth) * (Math.PI / 2));
                    displacement = 1 + scanInfluence * 0.4;
                }
                
                // Perspective scaling and drawing
                const scale = (z + 100) / 200;
                const pX = centerX + x * displacement;
                const pY = centerY + y * displacement;
                const size = Math.max(0, scale * 3 + scanInfluence * 3);
                const opacity = Math.max(0.1, scale * 0.7 + scanInfluence * 0.3);
                
                ctx.beginPath();
                ctx.arc(pX, pY, size, 0, Math.PI * 2);
                ctx.fillStyle = CONFIG.monochromeFill(opacity);
                ctx.fill();
            });
            
            requestAnimationFrame(animate);
        }
        
        requestAnimationFrame(animate);
    }
    
    // Return public methods
    return {
        init: function() {
            window.addEventListener("load", () => {
                addCornerDecorations(); // Make sure this is called
                setupVoxelMatrixMorph();
            });
        }
    };
})();

// ============================================
// EXPERIENCE SECTION - CAROUSEL
// ============================================

const ExperienceCarousel = {
    currentSlides: {},
    
    init: function() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeCarousels();
            this.setupResizeHandler();
        });
    },
    
    initializeCarousels: function() {
        // Initialize carousel2
        this.currentSlides['carousel2'] = 0;
        this.update('carousel2');
        
        // Add more carousels as needed by uncommenting:
        // this.currentSlides['carousel1'] = 0;
        // this.update('carousel1');
    },
    
    move: function(carouselId, direction) {
        const track = document.getElementById(carouselId);
        if (!track) return;
        
        const totalSlides = track.children.length;
        if (!this.currentSlides[carouselId]) this.currentSlides[carouselId] = 0;
        
        this.currentSlides[carouselId] = (this.currentSlides[carouselId] + direction + totalSlides) % totalSlides;
        this.update(carouselId);
    },
    
    jumpToSlide: function(carouselId, slideIndex) {
        const track = document.getElementById(carouselId);
        if (!track || slideIndex < 0 || slideIndex >= track.children.length) return;
        
        this.currentSlides[carouselId] = slideIndex;
        this.update(carouselId);
    },
    
    update: function(carouselId) {
        const track = document.getElementById(carouselId);
        const indicators = document.getElementById(`indicators${carouselId.replace('carousel', '')}`);
        
        if (!track || !indicators) return;
        
        const slideWidth = track.children[0].offsetWidth;
        track.style.transform = `translateX(-${this.currentSlides[carouselId] * slideWidth}px)`;
        
        // Update indicators
        Array.from(indicators.children).forEach((indicator, i) => {
            indicator.classList.toggle('active', i === this.currentSlides[carouselId]);
        });
    },
    
    setupResizeHandler: function() {
        window.addEventListener('resize', () => {
            Object.keys(this.currentSlides).forEach(carouselId => {
                this.update(carouselId);
            });
        });
    }
};

// ============================================
// EXPERIENCE SECTION - DROPDOWN
// ============================================

const ExperienceDropdown = {
    toggleMedia: function(mediaId) {
        const mediaRow = document.getElementById(mediaId);
        const arrow = document.getElementById(`arrow${mediaId.replace('media', '')}`);
        
        if (mediaRow && arrow) {
            mediaRow.classList.toggle('open');
            arrow.classList.toggle('open');
            
            const textSpan = mediaRow.previousElementSibling.querySelector('.experience-dropdown-text');
            if (textSpan) {
                textSpan.textContent = mediaRow.classList.contains('open') ? 'Hide Media' : 'View Media';
            }
        }
    },
    
    toggleMediaWithData: function(element) {
        const mediaId = element.getAttribute('data-media');
        const mediaRow = document.getElementById(mediaId);
        const arrow = element.querySelector('.experience-dropdown-arrow');
        const textSpan = element.querySelector('.experience-dropdown-text');
        
        if (mediaRow && arrow && textSpan) {
            mediaRow.classList.toggle('open');
            arrow.classList.toggle('open');
            textSpan.textContent = mediaRow.classList.contains('open') ? 'Hide Media' : 'View Media';
        }
    }
};

// ============================================
// PROJECTS SECTION - MODALS
// ============================================

const ProjectModals = {
    init: function() {
        this.setupEventListeners();
    },
    
    setupEventListeners: function() {
        // Close modals when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('project-modal')) {
                this.close(event.target.id);
            }
        });
        
        // Close modals with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                Utils.closeAllModals('.project-modal.active');
                Utils.closeAllModals('.conference-modal.active');
            }
        });
    },
    
    open: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            Utils.lockScroll();
        }
    },
    
    close: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            Utils.unlockScroll();
        }
    }
};

// ============================================
// PROJECTS SECTION - GALLERY LIGHTBOX
// ============================================

const ProjectGallery = {
    init: function() {
        // Only initialize if gallery elements exist on the page
        if (!document.querySelector('.gallery-item')) return;
        
        this.galleryLightbox = document.getElementById('gallery-lightbox');
        this.galleryLightboxImg = document.getElementById('gallery-lightbox-img');
        this.galleryCaption = document.getElementById('gallery-caption');
        this.galleryCloseBtn = document.querySelector('.gallery-close-btn');
        
        // If lightbox elements don't exist, create them
        if (!this.galleryLightbox) {
            this.createLightboxElements();
        }
        
        this.setupEventListeners();
    },
    
    createLightboxElements: function() {
        // Create lightbox container
        const lightbox = document.createElement('div');
        lightbox.id = 'gallery-lightbox';
        lightbox.className = 'gallery-lightbox';
        lightbox.innerHTML = `
            <span class="gallery-close-btn">&times;</span>
            <img class="gallery-lightbox-content" id="gallery-lightbox-img">
            <div id="gallery-caption"></div>
        `;
        document.body.appendChild(lightbox);
        
        // Update references
        this.galleryLightbox = document.getElementById('gallery-lightbox');
        this.galleryLightboxImg = document.getElementById('gallery-lightbox-img');
        this.galleryCaption = document.getElementById('gallery-caption');
        this.galleryCloseBtn = document.querySelector('.gallery-close-btn');
    },
    
    setupEventListeners: function() {
        // Get all gallery images
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        // Open lightbox when image clicked
        galleryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.open(e.target.src, e.target.alt);
            });
        });
        
        // Close lightbox when X clicked
        if (this.galleryCloseBtn) {
            this.galleryCloseBtn.addEventListener('click', () => {
                this.close();
            });
        }
        
        // Close lightbox when clicking outside the image
        if (this.galleryLightbox) {
            this.galleryLightbox.addEventListener('click', (e) => {
                if (e.target === this.galleryLightbox) {
                    this.close();
                }
            });
        }
        
        // Close with Escape key - uses existing keydown listener pattern
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.galleryLightbox && 
                this.galleryLightbox.style.display === 'block') {
                this.close();
            }
        });
    },
    
    open: function(imgSrc, imgAlt) {
        if (!this.galleryLightbox || !this.galleryLightboxImg || !this.galleryCaption) return;
        
        this.galleryLightboxImg.src = imgSrc;
        this.galleryCaption.innerHTML = imgAlt || '';
        this.galleryLightbox.style.display = 'block';
        Utils.lockScroll(); // Reuse your existing lockScroll utility
    },
    
    close: function() {
        if (!this.galleryLightbox) return;
        
        this.galleryLightbox.style.display = 'none';
        Utils.unlockScroll(); // Reuse your existing unlockScroll utility
    }
};


// ============================================
// MISC PAGE - CONFERENCE SECTION
// ============================================

const ConferenceSection = {
    init: function() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeCarousels();
            this.setupResizeHandler();
        });
    },
    
    initializeCarousels: function() {
        document.querySelectorAll('.carousel-container').forEach(carousel => {
            const carouselId = carousel.id;
            const indicatorsId = 'indicators-' + carouselId.split('-').slice(1).join('-');
            this.initializeCarousel(carouselId, indicatorsId);
        });
    },
    
    initializeCarousel: function(carouselId, indicatorsId) {
        const carousel = document.getElementById(carouselId);
        const indicators = document.getElementById(indicatorsId);
        if (!carousel || !indicators) return;
        
        const slides = carousel.querySelector('.carousel-track').children;
        
        // Clear and create indicators
        indicators.innerHTML = '';
        Array.from(slides).forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = i === 0 ? 'indicator active' : 'indicator';
            dot.setAttribute('onclick', `ConferenceSection.jumpToSlide('${carouselId}', ${i})`);
            indicators.appendChild(dot);
        });
    },
    
    moveSlide: function(carouselId, direction) {
        const carousel = document.getElementById(carouselId);
        const track = carousel.querySelector('.carousel-track');
        const slides = track.children;
        const slideWidth = slides[0].offsetWidth;
        
        // Get current index from transform
        const currentTransform = track.style.transform;
        let currentIndex = 0;
        
        if (currentTransform) {
            const match = currentTransform.match(/-?\d+\.?\d*/);
            if (match) {
                currentIndex = Math.round(Math.abs(parseFloat(match[0])) / slideWidth);
            }
        }
        
        // Calculate new index with wrap-around
        let newIndex = (currentIndex + direction + slides.length) % slides.length;
        
        track.style.transform = `translateX(-${newIndex * slideWidth}px)`;
        this.updateIndicators(carouselId, newIndex);
    },
    
    jumpToSlide: function(carouselId, slideIndex) {
        const carousel = document.getElementById(carouselId);
        const track = carousel.querySelector('.carousel-track');
        const slideWidth = track.children[0].offsetWidth;
        
        track.style.transform = `translateX(-${slideIndex * slideWidth}px)`;
        this.updateIndicators(carouselId, slideIndex);
    },
    
    updateIndicators: function(carouselId, activeIndex) {
        const container = document.getElementById(carouselId).closest('.conference-carousel');
        container.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === activeIndex);
        });
    },
    
    setupResizeHandler: function() {
        window.addEventListener('resize', () => {
            document.querySelectorAll('.carousel-track').forEach(track => {
                const carousel = track.closest('.carousel-container');
                if (carousel) {
                    track.style.transform = 'translateX(0px)';
                    this.updateIndicators(carousel.id, 0);
                }
            });
        });
    }
};

// ============================================
// MISC PAGE - CONFERENCE MODALS
// ============================================

const ConferenceModals = {
    init: function() {
        this.setupEventListeners();
    },
    
    setupEventListeners: function() {
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('conference-modal')) {
                this.close(event.target.id);
            }
        });
    },
    
    open: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            Utils.lockScroll();
        }
    },
    
    close: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            Utils.unlockScroll();
        }
    }
};

// ============================================
// GLOBAL INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    MobileNav.init();
    ExperienceCarousel.init();
    ProjectModals.init();
    ConferenceSection.init();
    ConferenceModals.init();
    ProjectGallery.init();
});

MatrixAnimation.init();

// ============================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// (for onclick attributes in HTML)
// ============================================

// Experience Carousel
window.moveCarousel = (id, dir) => ExperienceCarousel.move(id, dir);
window.jumpToSlide = (id, index) => ExperienceCarousel.jumpToSlide(id, index);

// Experience Dropdown
window.toggleMedia = (id) => ExperienceDropdown.toggleMedia(id);
window.toggleMediaWithData = (element) => ExperienceDropdown.toggleMediaWithData(element);

// Project Modals
window.openModal = (id) => ProjectModals.open(id);
window.closeModal = (id) => ProjectModals.close(id);

// Conference Section
window.moveConferenceCarousel = (id, dir) => ConferenceSection.moveSlide(id, dir);
window.jumpConferenceSlide = (id, index) => ConferenceSection.jumpToSlide(id, index);

// Conference Modals
window.openConferenceModal = (id) => ConferenceModals.open(id);
window.closeConferenceModal = (id) => ConferenceModals.close(id);

