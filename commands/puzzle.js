const { publisherButtons } = require('../utilities/buttons');
const { sendPuzzle } = require('../utilities/puzzle-utils');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('puzzle')
		.setDescription('start a puzzle with crosswithfriends')
		.addStringOption((publisher) => 
			publisher
				.setName('publisher')
				.setDescription('the publisher that puzzle came from')
				.addChoices(
					{ name: 'nyt', value: 'nyt' },
					{ name: 'lat', value: 'lat' },
					{ name: 'usa', value: 'usa' },
					{ name: 'wsj', value: 'wsj' },
					{ name: 'newsday', value: 'newsday' },
					{ name: 'universal', value: 'universal' },
					{ name: 'new yorker', value: 'new yorker' },
				)
		),

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