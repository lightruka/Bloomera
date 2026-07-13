const { Events, PermissionFlagsBits } = require('discord.js');
const { getConfig } = require('../database');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignorer les messages provenant des bots
        if (message.author.bot) return;
        // S'assurer qu'on est bien sur un serveur (pas en DM)
        if (!message.guild) return;

        try {
            // Récupération de la configuration pour ce serveur
            const config = await getConfig(message.guild.id);
            
            // On vérifie si : la config existe, le module modération est activé, et le salon piège est défini
            if (!config || !config.module_moderation || !config.trap_channel_id) return;

            // Si le message a été envoyé dans le fameux salon piège (Honeypot)
            if (message.channel.id === config.trap_channel_id) {
                
                // Immunité pour les administrateurs (ou le propriétaire)
                if (message.member && message.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    return; // On ne sanctionne pas un admin
                }

                // 1. Suppression immédiate du message
                if (message.deletable) {
                    await message.delete();
                }

                // 2. Sanction (Timeout de 1 heure)
                if (message.member && message.member.moderatable) {
                    // 1 heure = 60 minutes * 60 secondes * 1000 millisecondes
                    const timeoutDuration = 60 * 60 * 1000; 
                    
                    await message.member.timeout(timeoutDuration, "Anti-Raid : A parlé dans le salon Honeypot (Salon Piège)");
                    
                    // Facultatif : Log dans la console (ou dans un salon log plus tard)
                    console.log(`[HONEYPOT] ${message.author.tag} a été timeout pour avoir parlé dans ${message.channel.name}`);
                }
            }
        } catch (error) {
            console.error("Erreur dans l'événement messageCreate (Honeypot) :", error);
        }
    },
};
