const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const bansPath = path.join(__dirname, "../data/globalbans.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("globalban-list")
        .setDescription("View all globally banned users."),

    async execute(interaction) {
        const bans = JSON.parse(fs.readFileSync(bansPath, "utf8"));
        const entries = Object.values(bans);

        if (!entries.length) {
            return interaction.reply({ content: "✅ No globally banned users.", ephemeral: true });
        }

        const list = entries
            .map(b => `• **${b.userId}** — ${b.reason} (by ${b.moderatorTag})`)
            .join("\n");

        const embed = new EmbedBuilder()
            .setColor("#00AEEF")
            .setTitle("🌐 Global Ban List")
            .setDescription(list)
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
