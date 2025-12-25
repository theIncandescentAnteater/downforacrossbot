const { getMatchingPuzzles, getFirstPuzzle, getPuzzleID } = require('../utilities/puzzle-utils');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('puzzle')
		.setDescription('start a puzzle with crosswithfriends'),
		// .addStringOption((option) => option.setName('command').setDescription('The command to reload.').setRequired(true)),

	async execute(interaction) {

		try {
			puzzles = await getMatchingPuzzles();
			console.log(getFirstPuzzle(puzzles));

		}catch (error) {
			console.error(error.message);
		}
	},
};