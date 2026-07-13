const express = require('express');
const cors = require('cors');
const path = require('path');
const { getConfig, updateConfig } = require('./database');

function startAPI() {
    const app = express();
    const port = 3000;

    app.use(cors());
    app.use(express.json());

    // Servir les fichiers statiques du dashboard (HTML, CSS, JS) à la racine du site
    app.use('/', express.static(path.join(__dirname, 'dashboard')));

    // Route pour récupérer la configuration d'un serveur
    app.get('/api/config/:guildId', async (req, res) => {
        const guildId = req.params.guildId;
        try {
            const config = await getConfig(guildId);
            if (config) {
                // SQLite retourne 1/0 pour les booléens, on les convertit en true/false
                res.json({
                    ...config,
                    module_moderation: !!config.module_moderation,
                    module_welcome: !!config.module_welcome,
                    module_logs: !!config.module_logs
                });
            } else {
                res.status(404).json({ error: 'Configuration non trouvée' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    });

    // Route pour mettre à jour la configuration
    app.post('/api/config/:guildId', async (req, res) => {
        const guildId = req.params.guildId;
        const body = req.body;
        
        // Convertir les booléens true/false en 1/0 pour SQLite
        const updates = {};
        if (typeof body.module_moderation !== 'undefined') updates.module_moderation = body.module_moderation ? 1 : 0;
        if (typeof body.module_welcome !== 'undefined') updates.module_welcome = body.module_welcome ? 1 : 0;
        if (typeof body.module_logs !== 'undefined') updates.module_logs = body.module_logs ? 1 : 0;
        if (body.prefix) updates.prefix = body.prefix;

        try {
            const updatedConfig = await updateConfig(guildId, updates);
            res.json({
                ...updatedConfig,
                module_moderation: !!updatedConfig.module_moderation,
                module_welcome: !!updatedConfig.module_welcome,
                module_logs: !!updatedConfig.module_logs
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour' });
        }
    });

    app.listen(port, () => {
        console.log(`🌐 Dashboard et API disponibles sur http://localhost:${port}`);
    });
}

module.exports = { startAPI };
