document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    // Toggle main menu
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    // Toggle submenu
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor behavior
            const parentLi = toggle.parentElement;
            parentLi.classList.toggle('open');
        });
    });
});
