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
        .setName("globalban-remove")
        .setDescription("Remove a user from the global ban list and unban them across all servers.")
        .addStringOption(o =>
            o.setName("userid")
                .setDescription("User ID to remove from global ban list")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const userId = interaction.options.getString("userid");
        const bans = loadBans();

        if (!bans[userId]) {
            return interaction.reply({ content: "❌ That user is not globally banned.", flags: 64 });
        }

        // Remove from global ban list
        delete bans[userId];
        saveBans(bans);

        // Sync unban across all servers
        let success = 0;
        let failed = 0;

        for (const guild of client.guilds.cache.values()) {
            try {
                await guild.bans.remove(userId, `[GLOBAL UNBAN] Removed from global ban list`);
                success++;
            } catch {
                failed++;
            }
        }

        const embed = new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle("🌐 Global Ban Removed & Unbanned")
            .addFields(
                { name: "User ID", value: userId },
                { name: "Moderator", value: interaction.user.tag },
                { name: "Servers Unbanned", value: `${success}` },
                { name: "Servers Failed", value: `${failed}` }
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
