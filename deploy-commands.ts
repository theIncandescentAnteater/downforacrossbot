import { REST, Routes } from "discord.js";
import path from "node:path";
import { loadConfig } from "./utilities/config";
import { loadCommandModules } from "./utilities/load-commands";

const config = loadConfig();
const commandsPath = path.join(__dirname, "commands");
const commandModules = loadCommandModules(commandsPath);
const commands = commandModules.map((c) => c.data.toJSON());

const rest = new REST().setToken(config.token);

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) command(s).`
    );

    const data = (await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands }
    )) as unknown[];

    console.log(
      `Successfully reloaded ${data.length} application (/) command(s).`
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
