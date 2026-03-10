const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const config = require("./config.json");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        console.log(`Loaded command: ${command.data.name}`);
    } else {
        console.log(`⚠️ Command at ${filePath} is missing "data" or "execute".`);
    }
}

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Staff role lock
    const staffRole = config.staffRoleId;
    if (!interaction.member.roles.cache.has(staffRole)) {
        return interaction.reply({
            content: "❌ You do not have permission to use this command.",
            ephemeral: true
        });
    }

    try {
        await command.execute(interaction, client);
    } catch (err) {
        console.error(err);
        if (interaction.replied || interaction.deferred) {
            interaction.followUp({ content: "❌ An error occurred while executing this command.", ephemeral: true });
        } else {
            interaction.reply({ content: "❌ An error occurred while executing this command.", ephemeral: true });
        }
    }
});

client.once("ready", () => {
    console.log(`🔥 Logged in as ${client.user.tag}`);
});

client.login(config.token);
