const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

let db;

async function initDB() {
    db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS guild_configs (
            guild_id TEXT PRIMARY KEY,
            prefix TEXT DEFAULT '!',
            module_moderation BOOLEAN DEFAULT 1,
            module_welcome BOOLEAN DEFAULT 1,
            module_logs BOOLEAN DEFAULT 0
        )
    `);

    // Insérer une configuration par défaut pour le serveur de test (ID: 1526188327563296819)
    await db.run(`
        INSERT OR IGNORE INTO guild_configs (guild_id) VALUES ('1526188327563296819')
    `);

    console.log('📦 Base de données SQLite initialisée.');
}

async function getConfig(guildId) {
    if (!db) return null;
    return await db.get('SELECT * FROM guild_configs WHERE guild_id = ?', [guildId]);
}

async function updateConfig(guildId, config) {
    if (!db) return null;
    const { prefix, module_moderation, module_welcome, module_logs } = config;
    
    await db.run(`
        UPDATE guild_configs 
        SET prefix = COALESCE(?, prefix),
            module_moderation = COALESCE(?, module_moderation),
            module_welcome = COALESCE(?, module_welcome),
            module_logs = COALESCE(?, module_logs)
        WHERE guild_id = ?
    `, [prefix, module_moderation, module_welcome, module_logs, guildId]);
    
    return await getConfig(guildId);
}

module.exports = {
    initDB,
    getConfig,
    updateConfig
};
