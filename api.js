const express = require('express');
const cors = require('cors');
const path = require('path');
const { getConfig, updateConfig } = require('./database');

module.exports = (client) => {
    const app = express();
    const port = 3000;

    app.use(cors());
    app.use(express.json());

    // Servir les fichiers statiques du dashboard (HTML, CSS, JS) à la racine du site
    app.use('/', express.static(path.join(__dirname, 'dashboard')));

    // Route pour récupérer les salons textuels d'un serveur via Discord
    app.get('/api/channels/:guildId', async (req, res) => {
        const guildId = req.params.guildId;
        try {
            console.log(`[API] Récupération des salons demandée pour le serveur: ${guildId}`);
            // Le bot doit être sur le serveur pour récupérer les salons
            const guild = await client.guilds.fetch(guildId);
            if (!guild) {
                console.log(`[API] Serveur ${guildId} introuvable par le bot.`);
                return res.status(404).json({ error: 'Serveur introuvable' });
            }

            // On filtre pour ne garder que les salons textuels (type 0 en v14)
            const textChannels = guild.channels.cache
                .filter(channel => channel.type === 0)
                .map(channel => ({ id: channel.id, name: channel.name }));

            console.log(`[API] ${textChannels.length} salons textuels trouvés pour ${guild.name}.`);
            res.json(textChannels);
        } catch (error) {
            console.error('[API] Erreur lors de la récupération des salons:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des salons' });
        }
    });

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
                    mod_antilink: !!config.mod_antilink,
                    mod_antiinsult: !!config.mod_antiinsult,
                    module_welcome: !!config.module_welcome,
                    module_logs: !!config.module_logs,
                    trap_channel_id: config.trap_channel_id || ''
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
        if (typeof body.mod_antilink !== 'undefined') updates.mod_antilink = body.mod_antilink ? 1 : 0;
        if (typeof body.mod_antiinsult !== 'undefined') updates.mod_antiinsult = body.mod_antiinsult ? 1 : 0;
        if (typeof body.module_welcome !== 'undefined') updates.module_welcome = body.module_welcome ? 1 : 0;
        if (typeof body.module_logs !== 'undefined') updates.module_logs = body.module_logs ? 1 : 0;
        if (body.prefix) updates.prefix = body.prefix;
        if (typeof body.trap_channel_id !== 'undefined') updates.trap_channel_id = body.trap_channel_id;

        try {
            const updatedConfig = await updateConfig(guildId, updates);
            res.json({
                ...updatedConfig,
                module_moderation: !!updatedConfig.module_moderation,
                mod_antilink: !!updatedConfig.mod_antilink,
                mod_antiinsult: !!updatedConfig.mod_antiinsult,
                module_welcome: !!updatedConfig.module_welcome,
                module_logs: !!updatedConfig.module_logs,
                trap_channel_id: updatedConfig.trap_channel_id || ''
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour' });
        }
    });

    app.listen(port, () => {
        console.log(`🌐 Dashboard et API disponibles sur http://localhost:${port}`);
    });
};
