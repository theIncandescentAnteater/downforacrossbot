const { MessageFlags, EmbedBuilder } = require("discord.js");
const { getFirstMatchingPuzzle, makeGame } = require("./api-utils");

/**
 *
 * @param {string} publisher
 * @param {Date} date
 * @returns {string} standard name format of puzzles by a publisher on a given day
 */
function getPuzzleNameFormat(publisher, date) {
	const d = "" + date.getDate();
	const dd = d.padStart(2, "0");
	const month = date.toLocaleString("default", { month: "long" });
	const monthShort = date.toLocaleString("default", { month: "short" });
	const yyyy = date.getFullYear();

	const weekdays = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	const weekdaysShort = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];

	let weekday = weekdays[date.getDay()];
	let weekdayShort = weekdaysShort[date.getDay()];

	switch (publisher) {
		case "nyt":
			return `NY Times, ${weekday}, ${month} ${d}, ${yyyy}`;
		case "lat":
			return `LA Times, ${weekdayShort}, ${monthShort} ${d}, ${yyyy}`;
		// return f"L. A. Times, %a, %b {date.day}, %Y")
		case "usa":
			return `USA Today ${weekday}, ${monthShort} ${dd}, ${yyyy}`;
		case "wsj":
			return `WSJ ${weekday}, ${monthShort} ${dd}, ${yyyy}`;
		case "newsday":
			return `Newsday ${weekday}, ${monthShort} ${dd}, ${yyyy}`;
		case "universal":
			return `Universal Crossword ${weekday}`;
		case "atlantic":
			return `Atlantic ${weekday}, ${monthShort} ${dd}, ${yyyy}`;
		case "new yorker":
			return `New Yorker ${weekday}, ${monthShort} ${dd}, ${yyyy}`;
		case _:
			console.error(`error for publisher ${publisher}`);
			return "";
	}
}

/**
 *
 * @param {string} datestring
 * @returns {Date} parsed date, or current date if none
 */
function getPuzzleDate(datestring) {
	try {
		let date;

		if (datestring) {
			// if the date is in the future, subtract a week
			date = new Date(Date.parse(datestring));
			if (isNaN(date)) {
				throw new Error(`date ${datestring} not parsable`);
			}
		} else {
			date = new Date(); // gets current date
		}
		// parser defaults to 2001. if defaulted, reset to latest instance of that date
		if (date.getFullYear() == 2001 && !datestring.includes("2001")) {
			date.setFullYear(new Date().getFullYear());
			if (date > new Date()) {
				date.setFullYear(new Date().getFullYear() - 1);
			}
		}
		return date;
	} catch (error) {
		console.log(`Error getting results: ${error}`);
		return null;
	}
}

/**
 *
 * @param {*} interaction
 * @param {string} publisher
 * @param {Date} date defaults to current day
 * @returns {string} name of puzzle based on given publisher and datestring. also send ephemeral message if date not parsable
 */
async function getPuzzleName(interaction, publisher, date = new Date()) {
	try {
		if (!date) {
			await interaction.reply({
				content: `i don't know how to intepret ${datestring}. try m/d or m/d/yy`,
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
		return (puzzleName = getPuzzleNameFormat(publisher, date));
	} catch (error) {
		console.log(`Error getting results: ${error}`);
		return;
	}
}

/**
 *
 * @param {*} interaction
 * @param {*} puzzleInfo
 * @param {*} puzzleName
 * @param {*} date
 * @returns
 */
async function createPuzzleEmbed(interaction, puzzleInfo, puzzleName, date) {
	if (!puzzleInfo) {
		if (date && date > new Date()) {
			await interaction.reply({
				content: "no puzzles found for the future!",
				flags: MessageFlags.Ephemeral,
			});
		} else {
			await interaction.reply({
				content: `no puzzles found for ${puzzleName}`,
				flags: MessageFlags.Ephemeral,
			});
			return null;
		}
	} else {
		const gameLink = await makeGame(puzzleInfo);

		// create embed

		const puzzleEmbed = new EmbedBuilder()
			.setColor(0x78a6ee)
			.setTitle(puzzleInfo["content"]["info"]["title"])
			.setURL(gameLink)
			.setDescription(puzzleInfo["content"]["info"]["author"]);

		if (puzzleInfo["content"]["info"]["description"]) {
			puzzleEmbed.setFooter({
				text: puzzleInfo["content"]["info"]["description"],
			});
		}
		return puzzleEmbed;
	}
}

/**
 *
 * @param {*} interaction
 * @param {*} publisher
 * @param {*} datestring
 * @returns
 */
async function sendPuzzle(interaction, publisher, datestring = null) {
	const date = getPuzzleDate(datestring);

	const puzzleName = await getPuzzleName(interaction, publisher, date);

	const puzzleInfo = await getFirstMatchingPuzzle((searchTerm = puzzleName));

	const puzzleEmbed = await createPuzzleEmbed(
		interaction,
		puzzleInfo,
		puzzleName,
		date
	);

	if (!puzzleEmbed) {
		return;
	}

	// delete button messages, reply to non-button interactions
	if (interaction.message) {
		await interaction.channel.send({
			embeds: [puzzleEmbed],
		});

		await interaction.message.delete();
	} else {
		await interaction.reply({
			embeds: [puzzleEmbed],
		});
	}
}

module.exports = { getPuzzleName, sendPuzzle, getPuzzleDate };
