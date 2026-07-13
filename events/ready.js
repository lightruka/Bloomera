const { Events } = require('discord.js');
const startAPI = require('../api');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`🌸 Prêt! Connecté en tant que ${client.user.tag}`);
        // Lancer l'API seulement après la connexion du bot
        startAPI(client);
    },
};
