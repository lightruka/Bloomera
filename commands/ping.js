const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Répond avec Pong! (utile pour tester la latence)'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Calcul du ping...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        
        await interaction.editReply(`Pong! 🏓\nLatence du bot : \`${latency}ms\`\nLatence de l'API : \`${Math.round(interaction.client.ws.ping)}ms\``);
    },
};
