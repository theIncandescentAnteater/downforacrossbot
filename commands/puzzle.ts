import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import { publisherButtons } from "../utilities/buttons";
import {
  EMBED_COLOR_SELECT,
  PUZZLE_MESSAGE_DELETE_MS,
} from "../constants/embed-colors";

function isDiscordApiError(error: unknown): error is { code: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: number }).code === "number"
  );
}

export const data = new SlashCommandBuilder()
  .setName("puzzle")
  .setDescription("select a puzzle to play");

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const puzzleEmbed = new EmbedBuilder()
    .setColor(EMBED_COLOR_SELECT)
    .setDescription("play one of today's puzzles?");

  await interaction.reply({
    embeds: [puzzleEmbed],
    components: [publisherButtons],
  });
  const message = await interaction.fetchReply();

  setTimeout(async () => {
    try {
      await message.delete();
    } catch (error: unknown) {
      if (isDiscordApiError(error) && error.code === 10008) {
        return;
      }
      console.error("Failed to delete puzzle prompt message:", error);
    }
  }, PUZZLE_MESSAGE_DELETE_MS);
}
