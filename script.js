// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Demo button interactions (only for non-anchor demo buttons)
document.querySelectorAll('.demo-btn').forEach(btn => {
    if (btn.tagName.toLowerCase() === 'a') return; // anchors should navigate

    btn.addEventListener('click', function(e) {
        // Add loading state
        this.style.opacity = '0.7';
        this.style.pointerEvents = 'none';

        // Simulate demo loading
        setTimeout(() => {
            this.style.opacity = '1';
            this.style.pointerEvents = 'auto';

            // Show success feedback
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Demo Active';
            this.style.background = '#00ff00';
            this.style.color = '#000';

            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.background = '';
                this.style.color = '';
            }, 2000);
        }, 1500);
    });
});

// Slideshow functionality
class FeatureSlideshow {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.playPauseBtn = document.querySelector('.play-pause-btn');
        this.progressFill = document.querySelector('.progress-fill');
        
        this.isPlaying = true;
        this.autoPlayInterval = null;
        this.progressInterval = null;
        this.slideDuration = 5000; // 5 seconds
        
        this.init();
    }
    
    init() {
        if (!this.slides.length) return;
        
        // Add event listeners
        this.prevBtn?.addEventListener('click', () => this.prevSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());
        this.playPauseBtn?.addEventListener('click', () => this.togglePlayPause());
        
        // Add indicator click listeners
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Start auto-play
        this.startAutoPlay();
        
        // Initialize first slide
        this.updateSlideshow();
    }
    
    goToSlide(slideIndex) {
        if (slideIndex < 0 || slideIndex >= this.slides.length) return;
        
        this.currentSlide = slideIndex;
        this.updateSlideshow();
        this.resetAutoPlay();
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.updateSlideshow();
        this.resetAutoPlay();
    }
    
    prevSlide() {
        this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
        this.updateSlideshow();
        this.resetAutoPlay();
    }
    
    updateSlideshow() {
        // Update slides
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev');
            if (index === this.currentSlide) {
                slide.classList.add('active');
            } else if (index < this.currentSlide) {
                slide.classList.add('prev');
            }
        });
        
        // Update indicators
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
        
        // Update navigation buttons
        if (this.prevBtn) this.prevBtn.disabled = false;
        if (this.nextBtn) this.nextBtn.disabled = false;
    }
    
    startAutoPlay() {
        if (!this.isPlaying) return;
        
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.slideDuration);
        
        this.startProgress();
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        this.stopProgress();
    }
    
    resetAutoPlay() {
        this.stopAutoPlay();
        if (this.isPlaying) {
            this.startAutoPlay();
        }
    }
    
    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            this.startAutoPlay();
            this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            this.stopAutoPlay();
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }
    
    startProgress() {
        if (this.progressFill) {
            this.progressFill.style.width = '0%';
            
            let progress = 0;
            const increment = 100 / (this.slideDuration / 100);
            
            this.progressInterval = setInterval(() => {
                progress += increment;
                if (progress >= 100) {
                    progress = 0;
                }
                this.progressFill.style.width = progress + '%';
            }, 100);
        }
    }
    
    stopProgress() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        if (this.progressFill) {
            this.progressFill.style.width = '0%';
        }
    }
}

// Initialize slideshow when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FeatureSlideshow();
});

// Add keyboard navigation for slideshow
document.addEventListener('keydown', (e) => {
    const slideshow = document.querySelector('.features-slideshow');
    if (!slideshow) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            document.querySelector('.prev-btn')?.click();
            break;
        case 'ArrowRight':
            document.querySelector('.next-btn')?.click();
            break;
        case ' ':
            e.preventDefault();
            document.querySelector('.play-pause-btn')?.click();
            break;
    }
});

// Pause slideshow when user hovers over it
document.addEventListener('DOMContentLoaded', () => {
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (slideshowContainer) {
        let wasPlaying = false;
        
        slideshowContainer.addEventListener('mouseenter', () => {
            const playPauseBtn = document.querySelector('.play-pause-btn');
            if (playPauseBtn && playPauseBtn.innerHTML.includes('pause')) {
                wasPlaying = true;
                playPauseBtn.click();
            }
        });
        
        slideshowContainer.addEventListener('mouseleave', () => {
            if (wasPlaying) {
                const playPauseBtn = document.querySelector('.play-pause-btn');
                if (playPauseBtn && playPauseBtn.innerHTML.includes('play')) {
                    playPauseBtn.click();
                }
                wasPlaying = false;
            }
        });
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .stat-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Counter animation for stats
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50; // 50 steps
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (target % 1 === 0) {
            element.textContent = Math.floor(current);
        } else {
            element.textContent = current.toFixed(1);
        }
        
        if (element.textContent.includes('%')) {
            element.textContent = Math.floor(current) + '%';
        }
    }, 50);
}

// Initialize counter animations when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                if (text.includes('%')) {
                    animateCounter(stat, parseFloat(text));
                } else if (text.includes('K')) {
                    const num = parseFloat(text) * 1000;
                    animateCounter(stat, num);
                    stat.textContent = (num / 1000) + 'K+';
                } else if (!isNaN(parseFloat(text))) {
                    animateCounter(stat, parseFloat(text));
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
});

const statsSection = document.querySelector('.stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero');
    const speed = scrolled * 0.5;
    
    if (parallax) {
        parallax.style.transform = `translateY(${speed}px)`;
    }
});

// Add typing effect to hero title
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 30);
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add CSS for loading animation
const style = document.createElement('style');
style.textContent = `
    body:not(.loaded) {
        overflow: hidden;
    }
    
    body:not(.loaded)::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #1a1a1a;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    body:not(.loaded)::after {
        content: 'Loading Divyaang...';
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #00d4ff;
        font-size: 1.5rem;
        font-weight: 600;
        z-index: 10000;
        animation: pulse 1.5s ease-in-out infinite;
    }
`;
document.head.appendChild(style);
