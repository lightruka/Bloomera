const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Liste de toutes les commandes disponibles.'),
    async execute(interaction) {
        const commands = interaction.client.commands;
        
        const helpEmbed = new EmbedBuilder()
            .setColor(0xFFA5D8) // Couleur rosée adaptée à 'Bloomera'
            .setTitle('🌸 Commandes Bloomera')
            .setDescription('Voici la liste des commandes disponibles :')
            .setTimestamp()
            .setFooter({ text: 'Bloomera', iconURL: interaction.client.user.displayAvatarURL() });

        // On parcourt dynamiquement la liste des commandes chargées en mémoire
        commands.forEach(command => {
            helpEmbed.addFields({ 
                name: `/${command.data.name}`, 
                value: command.data.description || 'Aucune description.',
                inline: false 
            });
        });

        await interaction.reply({ embeds: [helpEmbed] });
    },
};
