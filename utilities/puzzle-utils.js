const { MessageFlags } = require("discord.js");
const puzzle = require("../commands/puzzle");

const API_URL = "downforacross-com.onrender.com"
const SITE_URL = "crosswithfriends.com"

/**
 * @returns {json} json of first puzzle from cwf search given search criteria
 */
async function getFirstMatchingPuzzle(resultsPage = 0, searchTerm = "", standardSize = "true", miniSize = "true") {
  
  const url = `https://${API_URL}/api/puzzle_list?page=${resultsPage}&pageSize=1&filter%5BnameOrTitleFilter%5D=${searchTerm}&filter%5BsizeFilter%5D%5BMini%5D=${miniSize}&filter%5BsizeFilter%5D%5BStandard%5D=${standardSize}`;
		try {
			// get the response from api
			const response = await fetch(url);
			if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
			}

			const json = await response.json();

			// get puzzles from response
			if (json.puzzles.length == 0){
				puzzles = null;
			}
			else { 
				puzzles = json.puzzles;
			}

      return puzzles[0]

		} catch (error) {
			console.error(error.message);
		}
}

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
 * @param {*} interaction 
 * @param {string} publisher 
 * @param {string} datestring 
 * @returns {string} name of puzzle based on given publisher and datestring. also send ephemeral message if date not parsable 
 */
async function getPuzzleName(interaction, publisher, datestring=null){
    try {
		let date;

        if (datestring){
            // if the date is in the future, subtract a week
            // when a day of the week is entered, the parser chooses the next instance, rather than the last. this undoes that.
			date = new Date(Date.parse(datestring));
			if (isNaN(date)){
				await interaction.reply({
					content: `i don't know how to intepret ${datestring}. try m/d or m/d/yy`,
					flags: MessageFlags.Ephemeral
				});
			}
            if (date > new Date()){
                date.setDate(date.getDate() - 7)
			}            
		} else {
			date = new Date(); // gets current date
		}

		puzzleName = getPuzzleNameFormat(publisher, date)
	} catch (error) {
    // // something went wrong with the date parsing
    //     await interaction.response.send_message(
    //         `i don't know how to intepret ${date}. try m/d, m/d/yy, or typing out the month or the day of the week that you want`,
    //         ephemeral=True,
    //     )
        console.log(`Error getting results: ${error}`)
        return
	}
    return puzzleName
}

async function sendPuzzle(channel, publisher, datestring=null) {
	
}

module.exports = { getFirstMatchingPuzzle, getPuzzleID, getPuzzleName, sendPuzzle}
