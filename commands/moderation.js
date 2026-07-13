const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getConfig } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('moderation')
        .setDescription('Commandes de modération (kick, ban, clear)')
        // On définit les permissions requises par défaut pour que la commande apparaisse (Gérer les messages, Kick, Ban)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages | PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers)
        // Sous-commande : /moderation kick
        .addSubcommand(subcommand =>
            subcommand
                .setName('kick')
                .setDescription('Exclure un membre du serveur.')
                .addUserOption(option => option.setName('cible').setDescription('Le membre à exclure').setRequired(true))
                .addStringOption(option => option.setName('raison').setDescription('La raison de l\'exclusion').setRequired(false))
        )
        // Sous-commande : /moderation ban
        .addSubcommand(subcommand =>
            subcommand
                .setName('ban')
                .setDescription('Bannir un membre du serveur.')
                .addUserOption(option => option.setName('cible').setDescription('Le membre à bannir').setRequired(true))
                .addStringOption(option => option.setName('raison').setDescription('La raison du bannissement').setRequired(false))
        )
        // Sous-commande : /moderation clear
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Supprimer un certain nombre de messages.')
                .addIntegerOption(option => 
                    option.setName('montant')
                    .setDescription('Nombre de messages à supprimer (1-100)')
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(100)
                )
        ),
    async execute(interaction) {
        // --- 1. Vérification du module dans la base de données ---
        const guildId = interaction.guildId || '1526188327563296819';
        const config = await getConfig(guildId);

        // Si le module est désactivé (0 ou false) ou inexistant
        if (!config || !config.module_moderation) {
            return interaction.reply({ 
                content: '❌ Le module de modération est actuellement désactivé sur le dashboard web.', 
                ephemeral: true 
            });
        }

        // --- 2. Exécution si le module est activé ---
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'kick') {
            // Revérification interne de la permission exacte
            if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
                return interaction.reply({ content: '❌ Vous n\'avez pas la permission d\'exclure des membres.', ephemeral: true });
            }
            
            const target = interaction.options.getMember('cible');
            const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

            if (!target) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
            
            // Sécurité : on ne peut pas kick un membre plus haut gradé
            if (!target.kickable) {
                return interaction.reply({ content: '❌ Je ne peux pas exclure cet utilisateur (rôle supérieur au mien).', ephemeral: true });
            }

            try {
                await target.kick(reason);
                await interaction.reply({ content: `✅ **${target.user.tag}** a été exclu avec succès. \nRaison: *${reason}*` });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: '❌ Une erreur est survenue lors de l\'exclusion.', ephemeral: true });
            }
        } 
        else if (subcommand === 'ban') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return interaction.reply({ content: '❌ Vous n\'avez pas la permission de bannir des membres.', ephemeral: true });
            }

            const target = interaction.options.getMember('cible');
            const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

            if (!target) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });

            if (!target.bannable) {
                return interaction.reply({ content: '❌ Je ne peux pas bannir cet utilisateur (rôle supérieur au mien).', ephemeral: true });
            }

            try {
                await target.ban({ reason });
                await interaction.reply({ content: `✅ **${target.user.tag}** a été banni avec succès. \nRaison: *${reason}*` });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: '❌ Une erreur est survenue lors du bannissement.', ephemeral: true });
            }
        } 
        else if (subcommand === 'clear') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                return interaction.reply({ content: '❌ Vous n\'avez pas la permission de gérer les messages.', ephemeral: true });
            }

            const amount = interaction.options.getInteger('montant');

            try {
                // true = filtre les messages de plus de 14 jours (Discord limite cela pour le bulkDelete)
                const deleted = await interaction.channel.bulkDelete(amount, true);
                await interaction.reply({ content: `✅ **${deleted.size}** messages ont été supprimés avec succès.`, ephemeral: true });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: '❌ Une erreur est survenue lors de la suppression des messages.', ephemeral: true });
            }
        }
    },
};
