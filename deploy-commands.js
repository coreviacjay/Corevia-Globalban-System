const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
const config = require("./config.json");

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
        console.log(`Registered command: ${command.data.name}`);
    } else {
        console.log(`⚠️ Command at ${filePath} is missing "data" or "execute".`);
    }
}

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
    try {
        console.log("🔄 Refreshing slash commands...");

        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands }
        );

        console.log("✅ Slash commands deployed successfully!");
    } catch (err) {
        console.error(err);
    }
})();
