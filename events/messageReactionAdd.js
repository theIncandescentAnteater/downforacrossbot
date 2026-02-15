const { Events, EmbedBuilder } = require("discord.js");
const { publisherButtons } = require("../utilities/buttons");

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction) {
    // When a reaction is received, if the structure is partial, cache it
    if (reaction.partial) {
      // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
      try {
        await reaction.fetch();
      } catch (error) {
        console.error("Something went wrong when fetching the message:", error);
        // Return as `reaction.message.author` may be undefined/null
        return;
      }
    }

    if (reaction.emoji.name === "✅" && reaction.message.author.bot) {
      const completedEmbed = EmbedBuilder.from(reaction.message.embeds[0])
        .setColor("6ca24d")
        .setFooter({
          text: "🎉 Solved! Play another?",
        });

      reaction.message.edit({
        embeds: [completedEmbed],
        components: [publisherButtons],
      });
    }
  },
};
