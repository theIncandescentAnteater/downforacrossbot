const { getFirstMatchingPuzzle } = require('../utilities/puzzle-utils');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('puzzle')
		.setDescription('start a puzzle with crosswithfriends'),
		// .addStringOption((option) => option.setName('command').setDescription('The command to reload.').setRequired(true)),

	async execute(interaction) {

		try {
			let puzzle = await getFirstMatchingPuzzle();
			await interaction.reply(puzzle);

		} catch (error) {
			console.error(error.message);
		}
	},
};