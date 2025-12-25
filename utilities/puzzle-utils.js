const puzzle = require("../commands/puzzle");

const API_URL = "downforacross-com.onrender.com"
const SITE_URL = "crosswithfriends.com"

/**
 * @returns {json} json results of list of puzzles from cwf given search criteria
 */
async function getMatchingPuzzles(resultsPage = 0, pageSize = 2, searchTerm = "", standardSize = "true", miniSize = "true") {
  
  const url = `https://${API_URL}/api/puzzle_list?page=${resultsPage}&pageSize=${pageSize}&filter%5BnameOrTitleFilter%5D=${searchTerm}&filter%5BsizeFilter%5D%5BMini%5D=${miniSize}&filter%5BsizeFilter%5D%5BStandard%5D=${standardSize}`;
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

      return puzzles

		} catch (error) {
			console.error(error.message);
		}
}

/**
 * 
 * @param {json} puzzles 
 * @returns {json} json for just the first puzzle
 */
function getFirstPuzzle(puzzles) {
    console.log("36")
    console.log(puzzles)
    // console.log(data.puzzles[0])
    return puzzles[0]
}

/**
 * 
 * @param {json} puzzle cwf style puzzle json 
 * @returns {number} the puzzleid
 */
function getPuzzleID(puzzle) {
    return puzzle.pid
}


module.exports = { getMatchingPuzzles, getFirstPuzzle, getPuzzleID }
