import fs from "node:fs";
import path from "node:path";
import type { Config } from "../types/config";

/**
 * Load config from config.json (in cwd or next to dist/) with optional env override for token.
 * DISCORD_TOKEN takes precedence over config.json token.
 */
export function loadConfig(): Config {
  const fromCwd = path.join(process.cwd(), "config.json");
  const fromDist = path.join(__dirname, "..", "config.json");
  const pathToLoad = fs.existsSync(fromCwd) ? fromCwd : fromDist;
  if (!fs.existsSync(pathToLoad)) {
    throw new Error(
      `config.json not found. Tried: ${fromCwd}, ${fromDist}. Or set DISCORD_TOKEN and ensure clientId/guildId are configured.`
    );
  }
  const raw = fs.readFileSync(pathToLoad, "utf-8");
  const file = JSON.parse(raw) as Config;
  const token = process.env.DISCORD_TOKEN ?? file.token;
  const missing: string[] = [];
  if (token === undefined || token === "") missing.push("token");
  if (file.clientId === undefined || file.clientId === "")
    missing.push("clientId");
  if (file.guildId === undefined || file.guildId === "")
    missing.push("guildId");
  if (missing.length > 0) {
    throw new Error(
      `Config missing required fields: ${missing.join(", ")}. Set DISCORD_TOKEN or config.json token; set clientId and guildId in config.json.`
    );
  }
  return {
    token,
    clientId: file.clientId,
    guildId: file.guildId,
  };
}
