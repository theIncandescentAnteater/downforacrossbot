const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('puzzle')
		.setDescription('start a puzzle with crosswithfriends'),
		// .addStringOption((option) => option.setName('command').setDescription('The command to reload.').setRequired(true)),

	async execute(interaction) {
		// interaction.guild is the object representing the Guild in which the command was run
		await interaction.reply(
			`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`,
		);
	},
};

// @app_commands.describe(
//     publisher="where the puzzle came from",
//     date="date on which the puzzle was published (m/d or day of the week)",
// )
//     publisher: Literal["nyt", "lat", "usa", "wsj", "newsday", "universal", "atlantic"],
//     date: str = "",
// ):
//     await puzzle_utils.startPuzzle(interaction, publisher, date)