const { MessageFlags } = require("discord.js");
const { getFirstMatchingPuzzle } = require("./api-utils")

const SITE_URL = "crosswithfriends.com"


/**
 * 
 * @param {json} puzzle cwf style puzzle json 
 * @returns {number} the puzzleid
 */
function getPuzzleID(puzzle) {
    return puzzle.pid
}

/**
 * 
 * @param {string} publisher 
 * @param {Date} date 
 * @returns {string} standard name format of puzzles by a publisher on a given day
 */
function getPuzzleNameFormat(publisher, date){

	const d = "" + date.getDate();
	const dd = d.padStart(2, '0');
	const month = date.toLocaleString('default', { month: 'long' });
	const monthShort = date.toLocaleString('default', { month: 'short' });
	const yyyy = date.getFullYear();

	const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	const weekdaysShort = ["Sun","Mon","Tues","Wed","Thu","Fri","Sat"];

	let weekday = weekdays[date.getDay()];
	let weekdayShort = weekdaysShort[date.getDay()];

    switch(publisher) {
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
            console.error(`error for publisher ${publisher}`)
            return ""
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

        if (datestring){
            // if the date is in the future, subtract a week
			date = new Date(Date.parse(datestring));
			if (isNaN(date)){
				throw new Error(`date ${datestring} not parsable`);
			}
		} else {
			date = new Date(); // gets current date
		} 
        // parser defaults to 2001. if defaulted, reset to current year
        if (date.getFullYear() == 2001 && !datestring.includes("2001")) {
            date.setFullYear(new Date().getFullYear());
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
 * @param {string} datestring 
 * @returns {string} name of puzzle based on given publisher and datestring. also send ephemeral message if date not parsable 
 */
async function getPuzzleName(interaction, publisher, datestring=null){
    try {
        const date = getPuzzleDate(datestring);

        if (!date){
				await interaction.reply({
					content: `i don't know how to intepret ${datestring}. try m/d or m/d/yy`,
					flags: MessageFlags.Ephemeral
				});
            return;
        }
		return puzzleName = getPuzzleNameFormat(publisher, date)
	} catch (error) {
        console.log(`Error getting results: ${error}`)
        return
	}
    return puzzleName
}

async function sendPuzzle(channel, publisher, datestring=null) {
	
}

module.exports = { getFirstMatchingPuzzle, getPuzzleID, getPuzzleName, sendPuzzle}
