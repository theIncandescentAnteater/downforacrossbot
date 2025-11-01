import datetime  # for puzzles by date
import httpx  # for async api calls
import logging
from typing import Optional


logger = logging.getLogger(__name__)

# Configuration constants
DEFAULT_PAGE_SIZE = 50
DEFAULT_RESULTS_PAGE = 0
REQUEST_TIMEOUT = 10.0  # seconds
API_BASE_URL = "https://api.foracross.com"


async def getResults(
    resultsPage: int = DEFAULT_RESULTS_PAGE,
    pageSize: int = DEFAULT_PAGE_SIZE,
    searchTerm: str = "",
    standardSize: str = "true",
    miniSize: str = "true",
) -> Optional[dict]:
    """Return json results of list of puzzles from d4a given search criteria."""
    params = {
        "page": resultsPage,
        "pageSize": pageSize,
        "filter[nameOrTitleFilter]": searchTerm,
        "filter[sizeFilter][Mini]": miniSize,
        "filter[sizeFilter][Standard]": standardSize,
    }

    url = f"{API_BASE_URL}/api/puzzle_list"

    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()  # Raise exception for bad status codes
            response_json = response.json()

            if not response_json.get("puzzles"):
                logger.warning(f"No results found for search term: {searchTerm}")
                return None
            return response_json
    except httpx.HTTPStatusError as e:
        logger.error(
            f"HTTP error getting puzzle results: {e.response.status_code} - {e.response.text}"
        )
        raise
    except httpx.RequestError as e:
        logger.error(f"Request error getting puzzle results: {e}")
        raise


async def getPuzzleID(results: dict, index: int = 0) -> str:
    """Return pid from puzzle in json results at given index."""
    try:
        if not results or "puzzles" not in results:
            raise ValueError("Invalid results structure: missing 'puzzles' key")
        if index >= len(results["puzzles"]):
            raise IndexError(f"Puzzle index {index} out of range")
        return results["puzzles"][index]["pid"]
    except (KeyError, IndexError, ValueError) as e:
        logger.error(f"Error getting puzzle ID: {e}", exc_info=True)
        raise


async def getGID() -> str:
    """Get gid from d4a api counter."""
    url = f"{API_BASE_URL}/api/counters/gid"

    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            response = await client.post(url)
            response.raise_for_status()
            gid_counter_json = response.json()
            return gid_counter_json["gid"]
    except httpx.HTTPStatusError as e:
        logger.error(
            f"HTTP error getting GID: {e.response.status_code} - {e.response.text}"
        )
        raise
    except httpx.RequestError as e:
        logger.error(f"Request error getting GID: {e}")
        raise
    except KeyError as e:
        logger.error(f"Invalid response format from GID endpoint: {e}")
        raise ValueError("Response missing 'gid' field") from e


async def createGame(pid: str, gid: str) -> None:
    """Create game instance in d4a database."""
    url = f"{API_BASE_URL}/api/game"
    data = {"gid": gid, "pid": pid}

    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            response = await client.post(url, json=data)
            response.raise_for_status()
            logger.debug(f"Created game with gid={gid}, pid={pid}")
    except httpx.HTTPStatusError as e:
        logger.error(
            f"HTTP error creating game: {e.response.status_code} - {e.response.text}"
        )
        raise
    except httpx.RequestError as e:
        logger.error(f"Request error creating game: {e}")
        raise


def getGameURL(gid: str) -> str:
    """Return game instance URL for given gid."""
    return f"https://downforacross.com/beta/game/{gid}"


async def makeGame(
    resultsPage: int = DEFAULT_RESULTS_PAGE,
    pageSize: int = DEFAULT_PAGE_SIZE,
    searchTerm: str = "",
    standardSize: str = "true",
    miniSize: str = "true",
) -> Optional[str]:
    """Return URL of a new game instance for a d4a puzzle given search criteria."""
    results = await getResults(
        resultsPage, pageSize, searchTerm, standardSize, miniSize
    )
    if results is None:
        return None

    puzzle_id = await getPuzzleID(results)
    game_id = await getGID()
    await createGame(puzzle_id, game_id)
    return getGameURL(game_id)


def getPuzzleName(publisher: str, date: Optional[datetime.date] = None) -> str:
    """Return standard name format of puzzles by a publisher on a given day."""
    if date is None:
        date = datetime.date.today()

    match publisher:
        case "nyt":
            return date.strftime(f"NY Times, %A, %B {date.day}, %Y")
        case "lat":
            return date.strftime(f"LA Times, %a, %b {date.day}, %Y")
        case "usa":
            return date.strftime("USA Today %A, %b %d, %Y")
        case "wsj":
            return date.strftime("WSJ %A, %b %d, %Y")
        case "newsday":
            return date.strftime("Newsday %A, %b %d, %Y")
        case "universal":
            return date.strftime("Universal Crossword %A")
        case "atlantic":
            return date.strftime("Atlantic %A, %b %d, %Y")
        case _:
            logger.error(f"Unknown publisher: {publisher}")
            raise ValueError(f"Unknown publisher: {publisher}")
