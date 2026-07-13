require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    }
}

// Initialisation du module REST
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Début du rafraîchissement de ${commands.length} commandes (/).`);

        // La route applicationCommands permet de déployer globalement. 
        // Si tu veux tester sur un serveur spécifique rapidement, utilise applicationGuildCommands(CLIENT_ID, GUILD_ID)
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`Succès du rechargement de ${data.length} commandes (/).`);
    } catch (error) {
        console.error(error);
    }
})();
