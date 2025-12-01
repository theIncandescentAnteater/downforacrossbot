import discord

from dateutil import parser  # for puzzles by date
from datetime import datetime, timedelta
from typing import Literal  # for autocomplete

import cwf_utils

SITE_URL = "crosswithfriends.com"


async def startPuzzle(
    interaction: discord.Interaction,
    publisher: Literal["nyt", "lat", "usa", "wsj", "newsday", "universal", "atlantic"],
    date: str = "",
    edit: bool = False,
):
    """sends embed with link to puzzle matching publisher and date"""
    try:
        puzzleName = await getPuzzleName(interaction, publisher, date)

        puzzleInfo = await getPuzzleInfo(searchTerm=puzzleName)

        puzzleEmbed = await createPuzzleEmbed(interaction, puzzleInfo, puzzleName, date)

        if not puzzleEmbed:
            return

        if edit:
            await interaction.response.edit_message(embed=puzzleEmbed, view=None)
        else:
            await interaction.response.send_message(embed=puzzleEmbed)

    except Exception as e:
        print(f"Error getting results: {e}")


async def getPuzzleID(results, index=0):
    """returns pid from first puzzle in json results"""
    try:
        return results["pid"]

    except Exception as e:
        print(f"Error getting results: {e}")


def getGameURL(gid):
    """append gid to url template for game instance url"""
    return f"https://{SITE_URL}/beta/game/{gid}"


async def getPuzzleInfo(
    resultsPage=0, pageSize=50, searchTerm="", standardSize="true", miniSize="true"
):
    """returns json results for search criteria"""
    results = await cwf_utils.getResults(
        resultsPage, pageSize, searchTerm, standardSize, miniSize
    )
    if results is None:
        return None
    return results["puzzles"][0]


async def makeGame(jsonPuzzles: dict):
    """returns url of a new game instance for a cwf puzzle given json of puzzles"""
    puzzleID = await getPuzzleID(jsonPuzzles)
    gameID = await cwf_utils.getGID()
    await cwf_utils.createGame(puzzleID, gameID)
    return getGameURL(gameID)


async def getPuzzleName(interaction, publisher, date=None):
    """get name of puzzle from publisher, including date parsing if provided"""
    try:
        # if you don't input a date, get today's puzzle
        if not date:
            puzzleName = getPuzzleNameFormat(publisher)
        else:
            # if the date is in the future, subtract a week
            # when a day of the week is entered, the parser chooses the next instance, rather than the last. this undoes that.
            date = parser.parse(date)
            if date > datetime.today():
                date = date - timedelta(days=7)
            puzzleName = getPuzzleNameFormat(publisher, date)
    # something went wrong with the date parsing
    except Exception as e:
        await interaction.response.send_message(
            f"i don't know how to intepret `{date}`. try m/d, m/d/yy, or typing out the month or the day of the week that you want",
            ephemeral=True,
        )
        print(f"Error getting results: {e}")
        return
    return puzzleName


def getPuzzleNameFormat(publisher, date=None):
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


async def createPuzzleEmbed(interaction, puzzleInfo, puzzleName, date):
    """creates discord embed containing puzzle information if available. otherwise, send response message to user"""
    # TODO error response messages don't belong in here. separate
    if puzzleInfo is None:
        if date and date > datetime.today():
            await interaction.response.send_message(
                "no puzzles found for the future!", ephemeral=True
            )
        else:
            await interaction.response.send_message(
                f"no puzzles found for {puzzleName}", ephemeral=True
            )
        return None
    else:
        game = await makeGame(puzzleInfo)

        # create embed
        puzzleEmbed = discord.Embed(
            title=puzzleInfo["content"]["info"]["title"],
            url=game,
            color=discord.Color.from_str("#78a6ee"),
            description=puzzleInfo["content"]["info"]["author"],
        )
        if puzzleInfo["content"]["info"]["description"]:
            puzzleEmbed.set_footer(text=puzzleInfo["content"]["info"]["description"])
    return puzzleEmbed
