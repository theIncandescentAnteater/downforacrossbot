const { getFirstMatchingPuzzle, getPuzzleName } = require('../utilities/puzzle-utils');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('puzzle')
		.setDescription('start a puzzle with crosswithfriends'),
		// .addStringOption((option) => option.setName('command').setDescription('The command to reload.').setRequired(true)),

	async execute(interaction) {

		try {
			let puzzle = await getFirstMatchingPuzzle();
			// console.log(await getPuzzleName(interaction, "nyt"));
			// console.log(await getPuzzleName(interaction, "nyt", "nov 7"));
			// console.log(await getPuzzleName(interaction, "nyt", "wednesday"));
			console.log(await getPuzzleName(interaction, "nyt", "jan 7 2026"));

			const puzzleEmbed = new EmbedBuilder()
				.setColor(0x91a774)
				.setDescription('play one of today\'s puzzles?');

			// channel.send({ embeds: [puzzleEmbed] });

			await interaction.reply({ embeds: [puzzleEmbed] });

		} catch (error) {
			console.error(error.message);
		}
	},
};