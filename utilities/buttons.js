const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { sendPuzzle } = require("./puzzle-utils");

const nyt_button = new ButtonBuilder()
  .setCustomId("nyt")
  .setLabel("nyt")
  .setStyle(ButtonStyle.Secondary);
const lat_button = new ButtonBuilder()
  .setCustomId("lat")
  .setLabel("lat")
  .setStyle(ButtonStyle.Secondary);
const usa_button = new ButtonBuilder()
  .setCustomId("usa")
  .setLabel("usa")
  .setStyle(ButtonStyle.Secondary);
const pg2_button = new ButtonBuilder()
  .setCustomId("pg2")
  .setLabel("other")
  .setStyle(ButtonStyle.Secondary);
const publisherButtons = new ActionRowBuilder().addComponents(
  nyt_button,
  lat_button,
  usa_button,
  pg2_button,
);

const wsj_button = new ButtonBuilder()
  .setCustomId("wsj")
  .setLabel("wsj")
  .setStyle(ButtonStyle.Secondary);
const newsday_button = new ButtonBuilder()
  .setCustomId("newsday")
  .setLabel("newsday")
  .setStyle(ButtonStyle.Secondary);
const universal_button = new ButtonBuilder()
  .setCustomId("universal")
  .setLabel("universal")
  .setStyle(ButtonStyle.Secondary);
const new_yorker_button = new ButtonBuilder()
  .setCustomId("new yorker")
  .setLabel("new yorker")
  .setStyle(ButtonStyle.Secondary);
const pg1_button = new ButtonBuilder()
  .setCustomId("pg1")
  .setLabel("back")
  .setStyle(ButtonStyle.Secondary);
const publisherButtons2 = new ActionRowBuilder().addComponents(
  wsj_button,
  newsday_button,
  universal_button,
  new_yorker_button,
  pg1_button,
);

async function buttonActions(interaction) {
  try {
    const buttonID = await interaction.customId;
    if (buttonID == "pg2") {
      await interaction.update({ components: [publisherButtons2] });
    } else if (buttonID == "pg1") {
      await interaction.update({ components: [publisherButtons] });
    } else {
      await sendPuzzle(interaction, interaction.customId);
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = { publisherButtons, publisherButtons2, buttonActions };
