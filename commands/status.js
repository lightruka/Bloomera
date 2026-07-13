const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// Importation de la fonction pour lire la configuration depuis notre base de données SQLite
const { getConfig } = require('../database'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Affiche le statut actuel de la configuration du serveur (modules activés/désactivés).'),
    async execute(interaction) {
        // En cas de temps de traitement un peu long avec la BDD, on met la réponse en attente
        await interaction.deferReply();

        // On récupère l'ID du serveur (Guild ID)
        // Note: pour tester en local avec le dashboard, on peut utiliser '123456789' 
        // si le bot n'est pas encore sur un vrai serveur qui a cet ID.
        const guildId = interaction.guildId || '123456789';

        // Lecture de la configuration depuis la base de données
        let config = await getConfig(guildId);

        // Si aucune configuration n'est trouvée pour ce serveur (nouveau serveur), 
        // on définit les valeurs par défaut
        if (!config) {
            config = {
                module_moderation: 1,
                module_welcome: 1,
                module_logs: 0,
                prefix: '!'
            };
        }

        // Petites fonctions utilitaires pour afficher un emoji joli en fonction de l'état (1 = true, 0 = false)
        const getStateEmoji = (state) => state ? '🟢 Activé' : '🔴 Désactivé';

        // Création de l'Embed
        const statusEmbed = new EmbedBuilder()
            .setColor(0xFFA5D8) // Rose Bloomera
            .setTitle('🌸 Statut de la Configuration')
            .setDescription(`Voici l'état actuel des modules pour le serveur **${interaction.guild?.name || 'Test'}** :`)
            .addFields(
                { 
                    name: '🛡️ Modération', 
                    value: `> ${getStateEmoji(config.module_moderation)}`, 
                    inline: false 
                },
                { 
                    name: '👋 Accueil & Départs', 
                    value: `> ${getStateEmoji(config.module_welcome)}`, 
                    inline: false 
                },
                { 
                    name: '📜 Logs Serveur', 
                    value: `> ${getStateEmoji(config.module_logs)}`, 
                    inline: false 
                },
                {
                    name: '⚙️ Préfixe Classique',
                    value: `> \`${config.prefix}\``,
                    inline: false
                }
            )
            .setTimestamp()
            .setFooter({ text: 'Bloomera', iconURL: interaction.client.user.displayAvatarURL() });

        // Envoi de la réponse avec l'Embed
        await interaction.editReply({ embeds: [statusEmbed] });
    },
};
