import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import { PUBLISHERS, type PublisherId } from "../constants/publishers";
import { sendPuzzle } from "../utilities/puzzle-utils";

export const data = new SlashCommandBuilder()
  .setName("start")
  .setDescription("start a puzzle with crosswithfriends")
  .addStringOption((publisher) =>
    publisher
      .setName("publisher")
      .setDescription("the publisher that puzzle came from")
      .setRequired(true)
      .addChoices(...PUBLISHERS.map((p) => ({ name: p.label, value: p.id })))
  )
  .addStringOption((date) =>
    date.setName("date").setDescription("the date the puzzle was published")
  );

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const publisher = interaction.options.getString("publisher");
  const date = interaction.options.getString("date");
  if (!publisher) return;
  await sendPuzzle(interaction, publisher as PublisherId, date ?? null);
}
