const { sendPuzzle } = require('../utilities/puzzle-utils');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('start a puzzle with crosswithfriends')
        .addStringOption((publisher) => 
            publisher
                .setName('publisher')
                .setDescription('the publisher that puzzle came from')
                .setRequired(true)
                .addChoices(
                    { name: 'nyt', value: 'nyt' },
                    { name: 'lat', value: 'lat' },
                    { name: 'usa', value: 'usa' },
                    { name: 'wsj', value: 'wsj' },
                    { name: 'newsday', value: 'newsday' },
                    { name: 'universal', value: 'universal' },
                    { name: 'new yorker', value: 'new yorker' },
                )
        )
        .addStringOption((date) =>
            date
                .setName('date')
                .setDescription('the date the puzzle was published')	
		),

	async execute(interaction) {

		try {
			const publisher = interaction.options.getString('publisher');
			const date = interaction.options.getString('date');
			
			await sendPuzzle(interaction, publisher, date);
		} catch (error) {
			console.error(error.message);
		}
	},
};