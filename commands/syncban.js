const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("syncban")
        .setDescription("Ban a user across all servers the bot is in.")
        .addUserOption(o =>
            o.setName("user")
                .setDescription("User to sync-ban")
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("reason")
                .setDescription("Reason for the sync ban")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason");

        let success = 0;
        let failed = 0;

        for (const guild of client.guilds.cache.values()) {
            try {
                const member = await guild.members.fetch(user.id).catch(() => null);
                if (member) {
                    await member.ban({ reason: `[SYNC BAN] ${reason}` });
                    success++;
                }
            } catch {
                failed++;
            }
        }

        const embed = new EmbedBuilder()
            .setColor("#FF8800")
            .setTitle("🔄 Sync Ban Complete")
            .addFields(
                { name: "User", value: `${user.tag} (${user.id})` },
                { name: "Reason", value: reason },
                { name: "Servers Banned", value: `${success}` },
                { name: "Servers Failed", value: `${failed}` }
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
