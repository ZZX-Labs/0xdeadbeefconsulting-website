// Select relevant elements
const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');
const body = document.body;

// Toggle the nav menu for mobile devices
menuButton.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    
    // Update aria attributes for accessibility
    menuButton.setAttribute('aria-expanded', isOpen);
    navLinks.setAttribute('aria-hidden', !isOpen);

    // Prevent scrolling when menu is open (optional for UX)
    if (isOpen) {
        body.classList.add('no-scroll');
    } else {
        body.classList.remove('no-scroll');
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 60, // Adjust for fixed headers
                behavior: 'smooth'
            });

            // Close mobile nav if open
            if (navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                menuButton.setAttribute('aria-expanded', false);
                navLinks.setAttribute('aria-hidden', true);
                body.classList.remove('no-scroll');
            }
        }
    });
});

// Handle active state for navigation links
const navLinksList = document.querySelectorAll('.nav-links a');

navLinksList.forEach(link => {
    link.addEventListener('click', () => {
        // Remove active class from all links
        navLinksList.forEach(navLink => navLink.classList.remove('active'));
        // Add active class to the clicked link
        link.classList.add('active');
    });
});

// Button hover and scale effects
const buttons = document.querySelectorAll('button');
buttons.forEach(button => {
    button.addEventListener('mouseover', () => {
        button.style.transform = 'scale(1.05)';
    });

    button.addEventListener('mouseout', () => {
        button.style.transform = 'scale(1)';
    });

    button.addEventListener('mousedown', () => {
        button.style.transform = 'scale(1)';
    });
});

// Scroll animations for elements in view
const scrollElements = document.querySelectorAll('.scroll-animation');

const isInViewport = (el) => {
    const rect = el.getBoundingClientRect();
    return rect.top <= (window.innerHeight || document.documentElement.clientHeight) && rect.bottom >= 0;
};

const handleScrollAnimation = () => {
    scrollElements.forEach(el => {
        if (isInViewport(el)) {
            el.classList.add('in-view');
        } else {
            el.classList.remove('in-view');
        }
    });
};

window.addEventListener('scroll', handleScrollAnimation);
handleScrollAnimation();

document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger");
    const nav = document.querySelector(".nav");

    hamburger.addEventListener("click", () => {
        nav.classList.toggle("active");
    });

    console.log("Welcome to [0xdeadbeef] Consulting!");
});
