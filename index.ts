import fs from "node:fs";
import path from "node:path";
import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import type { Command } from "./types/command";
import type { Event } from "./types/events";
import { loadConfig } from "./utilities/config";
import { loadCommandModules } from "./utilities/load-commands";

const config = loadConfig();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const commandsPath = path.join(__dirname, "commands");
const commandModules = loadCommandModules(commandsPath);
client.commands = new Collection<string, Command>(
  commandModules.map((c) => [c.data.name, c])
);

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file: string) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- dynamic load
  const event = require(filePath) as Event;
  const hasName = typeof event.name === "string" && event.name.length > 0;
  const hasExecute = typeof event.execute === "function";
  const onceValid = event.once === undefined || typeof event.once === "boolean";
  if (!hasName || !hasExecute || !onceValid) {
    console.warn(
      `[events] Skipping ${filePath}: invalid event (name, execute, or once).`
    );
    continue;
  }
  if (event.once) {
    client.once(event.name, (...args: unknown[]) => event.execute(...args));
  } else {
    client.on(event.name, (...args: unknown[]) => event.execute(...args));
  }
}

client.login(config.token).catch((error: unknown) => {
  console.error("Login failed:", error);
  process.exit(1);
});
