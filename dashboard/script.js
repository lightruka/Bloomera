document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const overlay = document.getElementById('overlay');

    // 1. Gestion de la Sidebar (Mobile)
    menuBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    });

    const closeSidebar = () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; 
    };

    closeBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    // 2. Gestion de l'accordéon "Configuration"
    const configParent = document.getElementById('config-parent');
    const configSubgroup = document.getElementById('config-subgroup');

    configParent.addEventListener('click', () => {
        configParent.classList.toggle('active');
        configSubgroup.classList.toggle('expanded');
    });

    // 3. Navigation entre les modules (Single Page App style)
    const subItems = document.querySelectorAll('.nav-sub-item');
    const sections = document.querySelectorAll('.content-section');

    subItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Retirer l'état actif de tous les liens
            subItems.forEach(link => link.classList.remove('active'));
            
            // Ajouter l'état actif sur le lien cliqué
            item.classList.add('active');

            // Cacher toutes les sections
            sections.forEach(section => section.classList.remove('active'));

            // Afficher la section correspondante
            const targetId = item.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Sur mobile, on ferme la sidebar après avoir cliqué sur un lien
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });

    // 4. Gestion API et Base de données
    const guildId = '1526188327563296819';

    const modToggle = document.getElementById('mod-toggle');
    const welcomeToggle = document.getElementById('welcome-toggle');
    const logsToggle = document.getElementById('logs-toggle');

    // Charger la config initiale
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

    // Mettre à jour la config
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

    // Gérer les clics sur les switchs
    const toggles = document.querySelectorAll('.toggle-switch input');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            let moduleName = '';
            if (e.target.id === 'mod-toggle') moduleName = 'module_moderation';
            if (e.target.id === 'welcome-toggle') moduleName = 'module_welcome';
            if (e.target.id === 'logs-toggle') moduleName = 'module_logs';

            if (moduleName) {
                updateConfig(moduleName, e.target.checked);
            }
        });
    });

    // Chargement de l'API
    loadConfig();
});
