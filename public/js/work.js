// Add to the existing script.js file

document.addEventListener('DOMContentLoaded', function() {
    // Existing code...

    // Portfolio Filter Functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            projectCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    const cardCategory = card.getAttribute('data-category');
                    if (cardCategory === filterValue) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 100);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                }
            });
        });
    });

    // Initialize portfolio cards with animation
    projectCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Animate stats on scroll
    const statNumbers = document.querySelectorAll('.stat-number');
    const animateStats = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = target.textContent;
                const numericValue = parseInt(finalValue.replace(/\D/g, ''));
                
                if (!isNaN(numericValue)) {
                    let currentValue = 0;
                    const increment = numericValue / 50;
                    const timer = setInterval(() => {
                        currentValue += increment;
                        if (currentValue >= numericValue) {
                            target.textContent = finalValue;
                            clearInterval(timer);
                        } else {
                            target.textContent = Math.floor(currentValue) + (finalValue.includes('%') ? '%' : finalValue.includes('+') ? '+' : '');
                        }
                    }, 40);
                }
                observer.unobserve(target);
            }
        });
    };

    const statsObserver = new IntersectionObserver(animateStats, {
        threshold: 0.5
    });

    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });
});