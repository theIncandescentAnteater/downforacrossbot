import { MessageFlags, EmbedBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import type { ButtonInteraction } from "discord.js";
import type { TextChannel } from "discord.js";
import { getFirstMatchingPuzzle, makeGame } from "./api-utils";
import type { PuzzleInfo } from "./api-utils";
import type { PublisherId } from "../constants/publishers";
import { EMBED_COLOR_PUZZLE } from "../constants/embed-colors";

type PuzzleInteraction = ChatInputCommandInteraction | ButtonInteraction;

const MAX_DATE_STRING_LENGTH = 100;

export function getPuzzleNameFormat(
  publisherId: PublisherId,
  date: Date
): string {
  const d = String(date.getDate());
  const dd = d.padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "long" });
  const monthShort = date.toLocaleString("en-US", { month: "short" });
  const yyyy = date.getFullYear();
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const weekdaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekday = weekdays[date.getDay()];
  const weekdayShort = weekdaysShort[date.getDay()];

  switch (publisherId) {
    case "nyt":
      return `NY Times, ${weekday}, ${month} ${d}, ${yyyy}`;
    case "lat":
      return `LA Times, ${weekdayShort}, ${monthShort} ${d}, ${yyyy}`;
    case "usa":
      return `USA Today ${weekday}, ${monthShort} ${dd}, ${yyyy}`;
    case "wsj":
      return `WSJ ${weekday}, ${monthShort} ${dd}, ${yyyy}`;
    case "newsday":
      return `Newsday ${weekday}, ${monthShort} ${dd}, ${yyyy}`;
    case "universal":
      return `Universal Crossword ${weekday}`;
    case "new yorker":
      return `New Yorker ${weekday}, ${monthShort} ${dd}, ${yyyy}`;
    default:
      return "";
  }
}

export function getPuzzleDate(datestring: string | null): Date | null {
  try {
    if (
      datestring &&
      (datestring.length > MAX_DATE_STRING_LENGTH || !datestring.trim())
    ) {
      return null;
    }
    let date: Date;
    if (datestring) {
      date = new Date(Date.parse(datestring));
      if (Number.isNaN(date.getTime())) {
        throw new Error(`date ${datestring} not parsable`);
      }
    } else {
      date = new Date();
    }
    if (
      date.getFullYear() === 2001 &&
      datestring &&
      !datestring.includes("2001")
    ) {
      date.setFullYear(new Date().getFullYear());
      if (date > new Date()) {
        date.setFullYear(new Date().getFullYear() - 1);
      }
    }
    return date;
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
}

export async function getPuzzleName(
  interaction: PuzzleInteraction,
  publisherId: PublisherId,
  date: Date | null = new Date()
): Promise<string | undefined> {
  try {
    if (!date) {
      await interaction.reply({
        content: "i don't know how to interpret that date. try m/d or m/d/yy",
        flags: MessageFlags.Ephemeral,
      });
      return undefined;
    }
    return getPuzzleNameFormat(publisherId, date);
  } catch (error) {
    console.error("Error getting puzzle name:", error);
    return undefined;
  }
}

function buildPuzzleEmbed(
  puzzleInfo: PuzzleInfo,
  gameLink: string
): InstanceType<typeof EmbedBuilder> {
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR_PUZZLE)
    .setTitle(puzzleInfo.content.info.title)
    .setURL(gameLink)
    .setDescription(puzzleInfo.content.info.author);

  if (puzzleInfo.content.info.description) {
    embed.setFooter({
      text: puzzleInfo.content.info.description,
    });
  }
  return embed;
}

export async function sendPuzzle(
  interaction: PuzzleInteraction,
  publisherId: PublisherId,
  datestring: string | null = null
): Promise<void> {
  const date = getPuzzleDate(datestring);
  const puzzleName = await getPuzzleName(interaction, publisherId, date);
  if (puzzleName === undefined) {
    return;
  }

  let puzzleInfo: PuzzleInfo | null;
  try {
    puzzleInfo = await getFirstMatchingPuzzle(puzzleName);
  } catch (error) {
    console.error("API error:", error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "Something went wrong fetching the puzzle. Try again later.",
        flags: MessageFlags.Ephemeral,
      });
    }
    return;
  }

  if (!puzzleInfo) {
    if (date && date > new Date()) {
      await interaction.reply({
        content: "no puzzles found for the future!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: `no puzzles found for ${puzzleName ?? "that puzzle"}`,
        flags: MessageFlags.Ephemeral,
      });
    }
    return;
  }

  let gameLink: string;
  try {
    gameLink = await makeGame(puzzleInfo);
  } catch (error) {
    console.error("makeGame failed:", error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "Something went wrong creating the game. Try again later.",
        flags: MessageFlags.Ephemeral,
      });
    }
    return;
  }
  const puzzleEmbed = buildPuzzleEmbed(puzzleInfo, gameLink);

  const msg = "message" in interaction ? interaction.message : null;
  const firstEmbed = msg?.embeds[0];
  if (msg && !firstEmbed?.title) {
    const ch = interaction.channel;
    if (ch && "send" in ch && typeof (ch as TextChannel).send === "function") {
      await (ch as TextChannel).send({ embeds: [puzzleEmbed] });
    }
    await msg.delete();
  } else {
    await interaction.reply({
      embeds: [puzzleEmbed],
    });
    if (msg) {
      await msg
        .edit({ components: [] })
        .catch((error: unknown) =>
          console.error("Failed to edit message:", error)
        );
      await msg.reactions
        .removeAll()
        .catch((error: unknown) =>
          console.error("Failed to clear reactions:", error)
        );
    }
  }
}
