import { Events, MessageFlags } from "discord.js";
import type { Interaction } from "discord.js";
import { buttonActions } from "../utilities/buttons";

export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction): Promise<void> {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  } else if (interaction.isButton()) {
    try {
      await buttonActions(interaction);
    } catch (error) {
      console.error(error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "There was an error while handling that button.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }
}
