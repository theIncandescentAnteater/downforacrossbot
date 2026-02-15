const { publisherButtons } = require("../utilities/buttons");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("puzzle")
    .setDescription("select a puzzle to play"),

  async execute(interaction) {
    try {
      const puzzleEmbed = new EmbedBuilder()
        .setColor(0x91a774)
        .setDescription("play one of today's puzzles?");

      await interaction
        .reply({
          embeds: [puzzleEmbed],
          components: [publisherButtons],
        })
        .then((message) => {
          setTimeout(async () => {
            try {
              await message.delete();
            } catch (error) {
              // ignore 404 errors from when message has already been deleted (aka if button has been pressed to send puzzle)
              if (error.status != 404) {
                console.log(error);
                return;
              }
            }
          }, 15000);
        });
    } catch (error) {
      console.error(error.message);
    }
  },
};
