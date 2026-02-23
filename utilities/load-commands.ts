import fs from "node:fs";
import path from "node:path";
import type { Command } from "../types/command";

/**
 * Loads all command modules from the given directory (expects compiled .js).
 * Returns array of commands that have both "data" and "execute".
 */
export function loadCommandModules(dir: string): Command[] {
  const commands: Command[] = [];
  if (!fs.existsSync(dir)) {
    throw new Error(`Commands directory does not exist: ${dir}`);
  }
  const files = fs.readdirSync(dir).filter((file) => file.endsWith(".js"));

  for (const file of files) {
    const filePath = path.join(dir, file);
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- dynamic load at runtime
    const mod = require(filePath) as Partial<Command>;
    if ("data" in mod && "execute" in mod && mod.data && mod.execute) {
      commands.push(mod as Command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
  return commands;
}
