const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dataFolder = path.join(__dirname, "../data");
const bansPath = path.join(dataFolder, "globalbans.json");

// Ensure folder + file exist
if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);
if (!fs.existsSync(bansPath)) fs.writeFileSync(bansPath, JSON.stringify({}, null, 4));

function loadBans() {
    return JSON.parse(fs.readFileSync(bansPath, "utf8"));
}

function saveBans(data) {
    fs.writeFileSync(bansPath, JSON.stringify(data, null, 4));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("globalban-add")
        .setDescription("Globally ban a user and sync the ban across all servers.")
        .addUserOption(o =>
            o.setName("user")
                .setDescription("User to globally ban")
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("reason")
                .setDescription("Reason for the global ban")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason");

        const bans = loadBans();

        if (bans[user.id]) {
            return interaction.reply({ content: "❌ That user is already globally banned.", flags: 64 });
        }

        // Save to global ban list
        bans[user.id] = {
            userId: user.id,
            tag: user.tag,
            reason,
            moderatorId: interaction.user.id,
            moderatorTag: interaction.user.tag,
            timestamp: Date.now()
        };

        saveBans(bans);

        // Sync ban across all servers
        let success = 0;
        let failed = 0;

        for (const guild of client.guilds.cache.values()) {
            try {
                await guild.bans.create(user.id, {
                    reason: `[GLOBAL BAN] ${reason}`
                });
                success++;
            } catch {
                failed++;
            }
        }

        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("🌐 Global Ban Added & Synced")
            .addFields(
                { name: "User", value: `${user.tag} (${user.id})` },
                { name: "Reason", value: reason },
                { name: "Moderator", value: interaction.user.tag },
                { name: "Servers Banned", value: `${success}` },
                { name: "Servers Failed", value: `${failed}` }
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
