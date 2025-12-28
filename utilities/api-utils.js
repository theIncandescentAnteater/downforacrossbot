
const API_URL = "downforacross-com.onrender.com"

/**
 * 
 * @param {*} searchTerm 
 * @param {*} standardSize 
 * @param {*} miniSize 
 * @returns {json} json of first puzzle from cwf search given search criteria
 */
async function getFirstMatchingPuzzle(searchTerm = "", standardSize = "true", miniSize = "true") {
  
    const url = `https://${API_URL}/api/puzzle_list?page=0&pageSize=1&filter[nameOrTitleFilter]=${searchTerm}&filter[sizeFilter][Mini]=${miniSize}&filter[sizeFilter][Standard]=${standardSize}`;

    try {
        // get the response from api
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();

        let puzzles = null;

        // get puzzles from response
        if (json.puzzles.length != 0){ 
            puzzles = json.puzzles;
        }

    return puzzles[0];

    } catch (error) {
        console.error(error.message);
    }
}

module.exports = { getFirstMatchingPuzzle }
