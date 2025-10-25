document.addEventListener('DOMContentLoaded', function () {
    // Mobile navigation toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    navToggle.addEventListener('click', function () {
        navMenu.classList.toggle('active');

        // Animate hamburger menu
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                });
            }
        });
    });

    // Add scroll effect to navbar
    window.addEventListener('scroll', function () {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = '#ffffff';
            navbar.style.backdropFilter = 'none';
        }
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe service cards and other elements
    document.querySelectorAll('.service-card, .service-detail, .stat').forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Newsletter subscription handler
    function handleNewsletterSubmit(formId, messageId, source) {
        const form = document.getElementById(formId);
        const messageDiv = document.getElementById(messageId);

        if (!form) return;

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = form.querySelector('input[name="email"]').value;
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;

            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            try {
                const response = await fetch('/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        source: source,
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    messageDiv.textContent = '✓ ' + data.message;
                    messageDiv.className = 'newsletter-message success';
                    form.reset();
                } else {
                    messageDiv.textContent = '✗ ' + data.message;
                    messageDiv.className = 'newsletter-message error';
                }
            } catch (error) {
                messageDiv.textContent = '✗ Something went wrong. Please try again.';
                messageDiv.className = 'newsletter-message error';
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;

                // Clear message after 5 seconds
                setTimeout(() => {
                    messageDiv.textContent = '';
                    messageDiv.className = 'newsletter-message';
                }, 5000);
            }
        });
    }

    // Initialize newsletter forms
    handleNewsletterSubmit('newsletterForm', 'newsletterMessage', 'footer');
    handleNewsletterSubmit('newsletterFormHome', 'newsletterMessageHome', 'homepage');
    handleNewsletterSubmit('newsletterFormMain', 'newsletterMessageMain', 'newsletter-page');
});
