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

    // Ajout des nouvelles colonnes si elles n'existent pas
    try { await db.exec("ALTER TABLE guild_configs ADD COLUMN mod_antilink BOOLEAN DEFAULT 0"); } catch(e) {}
    try { await db.exec("ALTER TABLE guild_configs ADD COLUMN mod_antiinsult BOOLEAN DEFAULT 0"); } catch(e) {}
    try { await db.exec("ALTER TABLE guild_configs ADD COLUMN trap_channel_id TEXT DEFAULT NULL"); } catch(e) {}

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
    const { prefix, module_moderation, mod_antilink, mod_antiinsult, module_welcome, module_logs, trap_channel_id } = config;
    
    await db.run(`
        UPDATE guild_configs 
        SET prefix = COALESCE(?, prefix),
            module_moderation = COALESCE(?, module_moderation),
            mod_antilink = COALESCE(?, mod_antilink),
            mod_antiinsult = COALESCE(?, mod_antiinsult),
            module_welcome = COALESCE(?, module_welcome),
            module_logs = COALESCE(?, module_logs),
            trap_channel_id = COALESCE(?, trap_channel_id)
        WHERE guild_id = ?
    `, [prefix, module_moderation, mod_antilink, mod_antiinsult, module_welcome, module_logs, trap_channel_id, guildId]);
    
    return await getConfig(guildId);
}

module.exports = {
    initDB,
    getConfig,
    updateConfig
};
