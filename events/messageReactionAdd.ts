import { Events, EmbedBuilder } from "discord.js";
import type { MessageReaction } from "discord.js";
import type { User } from "discord.js";
import { EMBED_COLOR_SOLVED } from "../constants/embed-colors";
import { publisherButtons } from "../utilities/buttons";

export const name = Events.MessageReactionAdd;

export async function execute(
  reaction: MessageReaction,
  _user: User
): Promise<void> {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error("Something went wrong when fetching the message:", error);
      return;
    }
  }

  const author = reaction.message.author;
  if (
    reaction.emoji.name === "✅" &&
    author?.bot &&
    reaction.message.embeds[0]
  ) {
    const completedEmbed = EmbedBuilder.from(reaction.message.embeds[0])
      .setColor(EMBED_COLOR_SOLVED)
      .setFooter({
        text: "🎉 Solved! Play another?",
      });

    await reaction.message.edit({
      embeds: [completedEmbed],
      components: [publisherButtons],
    });
  }
}
