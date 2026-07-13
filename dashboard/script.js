document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const overlay = document.getElementById('overlay');

    // Open Sidebar
    menuBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling on mobile
    });

    // Close Sidebar
    const closeSidebar = () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; 
    };

    closeBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    // Module Toggles (Micro-interaction example)
    const toggles = document.querySelectorAll('.toggle-switch input');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const moduleCard = e.target.closest('.module-card');
            
            if (e.target.checked) {
                // Activated animation effect
                moduleCard.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    moduleCard.style.transform = '';
                }, 200);
            }
        });
    });
});
