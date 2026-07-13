require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { initDB } = require('./database');
const { startAPI } = require('./api');

// Initialisation du client avec les intents nécessaires
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ] 
});

// Collection pour stocker les commandes
client.commands = new Collection();

// --- Chargement des commandes ---
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    // Vérifier si la commande possède 'data' et 'execute'
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[AVERTISSEMENT] La commande ${filePath} n'a pas les propriétés requises "data" ou "execute".`);
    }
}

// --- Chargement des événements ---
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Connexion du bot à Discord
(async () => {
    try {
        await initDB();
        startAPI();
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.error("Erreur au démarrage :", error);
    }
})();
