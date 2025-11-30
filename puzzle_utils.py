import datetime  # for puzzles by date
import requests  # for api calls
import discord

from dateutil import parser  # for puzzles by date
from datetime import datetime, timedelta
from typing import Literal  # for autocomplete

import puzzle_utils

API_URL = "downforacross-com.onrender.com"
SITE_URL = "crosswithfriends.com"

async def startPuzzle(
    interaction: discord.Interaction,
    publisher: Literal["nyt", "lat", "usa", "wsj", "newsday", "universal", "atlantic"],
    date: str = "",
):
    try:
        try:
            # if you don't input a date, get today's puzzle
            if not date:
                puzzleName = puzzle_utils.getPuzzleName(publisher)
            else:
                # if the date is in the future, subtract a week
                # when a day of the week is entered, the parser chooses the next instance, rather than the last. this undoes that.
                date = parser.parse(date)
                if date > datetime.today():
                    date = date - timedelta(days=7)
                puzzleName = puzzle_utils.getPuzzleName(publisher, date)
        # something went wrong with the date parsing
        except Exception as e:
            await interaction.response.send_message(
                f"i don't know how to intepret `{date}`. try m/d, m/d/yy, or typing out the month or the day of the week that you want",
                ephemeral=True,
            )
            print(f"Error getting results: {e}")
            return

        puzzleInfo = await puzzle_utils.getPuzzleInfo(searchTerm=puzzleName)

        # no games found
        if puzzleInfo is None:
            if date and date > datetime.today():
                await interaction.response.send_message(
                    "no puzzles found for the future!", ephemeral=True
                )
            else:
                await interaction.response.send_message(
                    f"no puzzles found for {puzzleName}", ephemeral=True
                )
        else:
            game = await puzzle_utils.makeGame(puzzleInfo)

            # create embed
            puzzleEmbed = discord.Embed(
                title=puzzleInfo["content"]["info"]["title"],
                url=game,
                color=discord.Color.from_str("#78a6ee"),
                description=puzzleInfo["content"]["info"]["author"],
            )
            if puzzleInfo["content"]["info"]["description"]:
                puzzleEmbed.set_footer(
                    text=puzzleInfo["content"]["info"]["description"]
                )

            # send embed
            await interaction.response.send_message(embed=puzzleEmbed)

    except Exception as e:
        print(f"Error getting results: {e}")


async def getResults(
    resultsPage=0, pageSize=50, searchTerm="", standardSize="true", miniSize="true"
):
    """return json results of list of puzzles from cwf given search criteria"""

    response = requests.get(
        f"https://{API_URL}/api/puzzle_list?"
        f"page={resultsPage}&"
        f"pageSize={pageSize}&"
        f"filter%5BnameOrTitleFilter%5D={searchTerm}&"
        f"filter%5BsizeFilter%5D%5BMini%5D={miniSize}&"
        f"filter%5BsizeFilter%5D%5BStandard%5D={standardSize}"
    )
    responseJson = response.json()
    if len(responseJson["puzzles"]) == 0:
        print(f"oops, no results found for {searchTerm}")
        return None
    return responseJson


async def getPuzzleID(results, index=0):
    """returns pid from first puzzle in json results"""
    try:
        return results["pid"]

    except Exception as e:
        print(f"Error getting results: {e}")


async def getGID():
    """get gid from cwf api counter"""
    gidCounter = requests.post(f"https://{API_URL}/api/counters/gid")
    gidCounterJson = gidCounter.json()
    return gidCounterJson["gid"]


async def createGame(pid, gid):
    """create game instance in cwf database"""
    data = {"gid": gid, "pid": pid}
    requests.post(f"https://{API_URL}/api/game", json=data)


def getGameURL(gid):
    """append gid to url template for game instance url"""
    return f"https://{SITE_URL}/beta/game/{gid}"


async def getPuzzleInfo(
    resultsPage=0, pageSize=50, searchTerm="", standardSize="true", miniSize="true"
):
    """returns json results for search criteria"""
    results = await getResults(
        resultsPage, pageSize, searchTerm, standardSize, miniSize
    )
    if results is None:
        return None
    return results["puzzles"][0]


async def makeGame(jsonPuzzles: dict):
    """returns url of a new game instance for a cwf puzzle given json of puzzles"""
    puzzleID = await getPuzzleID(jsonPuzzles)
    gameID = await getGID()
    await createGame(puzzleID, gameID)
    return getGameURL(gameID)


def getPuzzleName(publisher, date=None):
    """returns standard name format of puzzles by a publisher on a given day"""
    if date is None:
        date = datetime.today()
    match publisher:
        case "nyt":
            return date.strftime(f"NY Times, %A, %B {date.day}, %Y")
        case "lat":
            return date.strftime(f"LA Times, %a, %b {date.day}, %Y")
            # return date.strftime(f"L. A. Times, %a, %b {date.day}, %Y")
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
            print(f"error for publisher {publisher}")
            return ""
