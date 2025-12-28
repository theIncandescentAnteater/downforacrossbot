const { publisherButtons } = require('../utilities/buttons');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('puzzle')
		.setDescription('start a puzzle with crosswithfriends'),

	async execute(interaction) {

		try {
			const puzzleEmbed = new EmbedBuilder()
				.setColor(0x91a774)
				.setDescription('play one of today\'s puzzles?');

			await interaction.reply({ 
				embeds: [puzzleEmbed],
				components: [publisherButtons],
			 });

		} catch (error) {
			console.error(error.message);
		}
	},
};