// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav__link');

    // Toggle mobile menu
    function toggleMenu() {
        navMenu.classList.toggle('show-menu');
        navToggle.classList.toggle('active');
        
        // Update ARIA attributes for accessibility
        const isOpen = navMenu.classList.contains('show-menu');
        navToggle.setAttribute('aria-expanded', isOpen);
        
        // Prevent body scroll when menu is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    // Close mobile menu
    function closeMenu() {
        navMenu.classList.remove('show-menu');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    // Event listeners for mobile menu toggle
    navToggle.addEventListener('click', toggleMenu);
    
    // Handle keyboard navigation for mobile menu toggle
    navToggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });

    // Close menu when clicking navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only handle internal links (starting with #)
            if (href && href.startsWith('#')) {
                e.preventDefault();
                closeMenu();
                
                // Smooth scroll to target section
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update active navigation state
                    updateActiveNavLink(href);
                }
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        const isClickInsideNav = navMenu.contains(e.target) || navToggle.contains(e.target);
        
        if (!isClickInsideNav && navMenu.classList.contains('show-menu')) {
            closeMenu();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('show-menu')) {
            closeMenu();
        }
    });

    // Update active navigation link based on scroll position
    function updateActiveNavLink(activeHref = null) {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        if (activeHref) {
            // Remove active class from all links
            navLinks.forEach(link => {
                link.classList.remove('nav__link--active');
            });
            
            // Add active class to clicked link
            const activeLink = document.querySelector(`a[href="${activeHref}"]`);
            if (activeLink) {
                activeLink.classList.add('nav__link--active');
            }
        } else {
            // Determine active section based on scroll position
            let currentSection = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 150;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    currentSection = section.getAttribute('id');
                }
            });

            // Update active navigation link
            navLinks.forEach(link => {
                link.classList.remove('nav__link--active');
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('nav__link--active');
                }
            });
        }
    }

    // Header scroll effect
    function handleHeaderScroll() {
        const header = document.querySelector('.header');
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 50) {
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    }

    // Throttle function for performance
    function throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Scroll event listeners with throttling for performance
    window.addEventListener('scroll', throttle(() => {
        updateActiveNavLink();
        handleHeaderScroll();
    }, 100));

    // Handle window resize - close mobile menu if screen becomes large
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navMenu.classList.contains('show-menu')) {
            closeMenu();
        }
    });

    // Initialize active link on page load
    updateActiveNavLink();

    // Smooth scrolling fallback for older browsers
    if (!('scrollBehavior' in document.documentElement.style)) {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetSection = document.getElementById(targetId);
                    
                    if (targetSection) {
                        const headerHeight = document.querySelector('.header').offsetHeight;
                        const targetPosition = targetSection.offsetTop - headerHeight;
                        
                        // Smooth scroll polyfill
                        const startPosition = window.pageYOffset;
                        const distance = targetPosition - startPosition;
                        const duration = 800;
                        let start = null;

                        function animation(currentTime) {
                            if (start === null) start = currentTime;
                            const timeElapsed = currentTime - start;
                            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
                            window.scrollTo(0, run);
                            if (timeElapsed < duration) requestAnimationFrame(animation);
                        }

                        function easeInOutQuad(t, b, c, d) {
                            t /= d / 2;
                            if (t < 1) return c / 2 * t * t + b;
                            t--;
                            return -c / 2 * (t * (t - 2) - 1) + b;
                        }

                        requestAnimationFrame(animation);
                    }
                }
            });
        });
    }

    // Add CSS class for active navigation link
    const style = document.createElement('style');
    style.textContent = `
        .nav__link--active {
            color: var(--almonx-primary) !important;
        }
        .nav__link--active::after {
            width: 100% !important;
        }
    `;
    document.head.appendChild(style);

    // Initialize ARIA attributes
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-controls', 'nav-menu');
    navMenu.setAttribute('aria-labelledby', 'nav-toggle');
});

// Performance optimization - Intersection Observer for animations
if ('IntersectionObserver' in window) {
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

    // Observe service cards and solution cards for entrance animations
    document.addEventListener('DOMContentLoaded', () => {
        const animatedElements = document.querySelectorAll('.service-card, .solution-card');
        
        // Add initial animation styles
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });

        // Start observing
        animatedElements.forEach(el => observer.observe(el));
    });
}

// Error handling for any JavaScript errors
window.addEventListener('error', function(e) {
    console.warn('JavaScript error caught:', e.message);
    // Ensure basic functionality still works
    if (document.getElementById('nav-toggle') && document.getElementById('nav-menu')) {
        document.getElementById('nav-toggle').addEventListener('click', function() {
            document.getElementById('nav-menu').classList.toggle('show-menu');
        });
    }
});

// Ensure accessibility - prevent focus trap when mobile menu is closed
document.addEventListener('DOMContentLoaded', function() {
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    document.addEventListener('keydown', function(e) {
        const navMenu = document.getElementById('nav-menu');
        
        if (e.key === 'Tab' && navMenu.classList.contains('show-menu')) {
            const focusableContent = navMenu.querySelectorAll(focusableElements);
            const firstFocusableElement = focusableContent[0];
            const lastFocusableElement = focusableContent[focusableContent.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
});