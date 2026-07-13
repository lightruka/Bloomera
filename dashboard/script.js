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

    // ID du serveur de test
    const guildId = '1526188327563296819';

    // Variables pour les switchs
    const modToggle = document.getElementById('mod-toggle');
    const welcomeToggle = document.getElementById('welcome-toggle');
    const logsToggle = document.getElementById('logs-toggle');

    // Charger la configuration depuis l'API
    async function loadConfig() {
        try {
            const response = await fetch(`/api/config/${guildId}`);
            if (response.ok) {
                const config = await response.json();
                if (modToggle) modToggle.checked = config.module_moderation;
                if (welcomeToggle) welcomeToggle.checked = config.module_welcome;
                if (logsToggle) logsToggle.checked = config.module_logs;
            }
        } catch (error) {
            console.error('Erreur de chargement de la config:', error);
        }
    }

    // Mettre à jour un paramètre via l'API
    async function updateConfig(moduleName, isEnabled) {
        try {
            await fetch(`/api/config/${guildId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [moduleName]: isEnabled })
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
        }
    }

    // Module Toggles (Micro-interaction & API call)
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

            // Déterminer le nom du module
            let moduleName = '';
            if (e.target.id === 'mod-toggle') moduleName = 'module_moderation';
            if (e.target.id === 'welcome-toggle') moduleName = 'module_welcome';
            if (e.target.id === 'logs-toggle') moduleName = 'module_logs';

            if (moduleName) {
                updateConfig(moduleName, e.target.checked);
            }
        });
    });

    // Chargement initial
    loadConfig();
});
