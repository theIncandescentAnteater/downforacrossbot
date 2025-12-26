const { getMatchingPuzzles, getFirstPuzzle, getPuzzleID, getPuzzleNameFormat } = require('../utilities/puzzle-utils');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('puzzle')
		.setDescription('start a puzzle with crosswithfriends'),
		// .addStringOption((option) => option.setName('command').setDescription('The command to reload.').setRequired(true)),

	async execute(interaction) {

		try {
			let puzzles = await getMatchingPuzzles();
			let puzzle = getFirstPuzzle(puzzles);
			await interaction.reply(puzzle);

		} catch (error) {
			console.error(error.message);
		}
	},
};