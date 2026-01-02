const { publisherButtons } = require('../utilities/buttons');
const { sendPuzzle } = require('../utilities/puzzle-utils');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('puzzle')
		.setDescription('select a puzzle to play'),

	async execute(interaction) {

		try {
			const publisher = interaction.options.getString('publisher');

			if (!publisher){
				const puzzleEmbed = new EmbedBuilder()
					.setColor(0x91a774)
					.setDescription('play one of today\'s puzzles?');

				await interaction.reply({ 
					embeds: [puzzleEmbed],
					components: [publisherButtons],
				});
			} else {
				await sendPuzzle(interaction, publisher);
			}
		} catch (error) {
			console.error(error.message);
		}
	},
};