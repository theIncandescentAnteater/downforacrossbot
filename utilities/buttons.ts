import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import type { ButtonInteraction } from "discord.js";
import {
  PAGE1_IDS,
  PAGE2_IDS,
  type PublisherId,
} from "../constants/publishers";
import { sendPuzzle } from "./puzzle-utils";

function buildPublisherButton(id: string, label: string): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(id)
    .setLabel(label)
    .setStyle(ButtonStyle.Secondary);
}

const pg2Button = buildPublisherButton("pg2", "other");
const pg1Button = buildPublisherButton("pg1", "back");

const publisherButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
  ...PAGE1_IDS.map((id) => buildPublisherButton(id, id)),
  pg2Button
);

const publisherButtons2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
  ...PAGE2_IDS.map((id) => buildPublisherButton(id, id)),
  pg1Button
);

export async function buttonActions(
  interaction: ButtonInteraction
): Promise<void> {
  const buttonID = interaction.customId;
  if (buttonID === "pg2") {
    await interaction.update({ components: [publisherButtons2] });
  } else if (buttonID === "pg1") {
    await interaction.update({ components: [publisherButtons] });
  } else {
    await sendPuzzle(interaction, buttonID as PublisherId);
  }
}

export { publisherButtons, publisherButtons2 };
