document.addEventListener('DOMContentLoaded', function () {
    // Animate product cards on scroll
    const productCards = document.querySelectorAll('.product-card');

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

    // Apply initial styles and observe
    productCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });

    // Animate coming soon cards
    const comingSoonCards = document.querySelectorAll('.coming-soon-card');
    comingSoonCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        card.style.transitionDelay = `${index * 0.15}s`;
        observer.observe(card);
    });

    // Add hover effect enhancement for product cards
    productCards.forEach((card) => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Smooth scroll for CTA buttons
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
    ctaButtons.forEach((button) => {
        button.addEventListener('click', function (e) {
            // Only apply to internal links
            if (this.getAttribute('href') && this.getAttribute('href').startsWith('/')) {
                const href = this.getAttribute('href');
                if (href.startsWith('/#')) {
                    e.preventDefault();
                    const targetId = href.substring(2);
                    const target = document.getElementById(targetId);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                        });
                    }
                }
            }
        });
    });

    // Add loading state for external links
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach((link) => {
        link.addEventListener('click', function () {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening...';
            setTimeout(() => {
                this.innerHTML = originalText;
            }, 2000);
        });
    });
});
