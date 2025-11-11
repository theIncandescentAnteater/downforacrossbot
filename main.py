import discord
from discord.ext import commands
from discord import app_commands
import logging
from dotenv import load_dotenv
import os

import webserver  # for hosting

from dateutil import parser  # for puzzles by date
from datetime import datetime, timedelta
from typing import Literal  # for autocomplete

import puzzle_utils


class Client(commands.Bot):
    async def on_ready(self):
        if self.user is not None:
            print(f"Ready to puzzle with {self.user.name}")
        else:
            print("Ready to puzzle")

        try:
            await self.tree.sync()
            print("Synced commands to guilds")
        except Exception as e:
            print(f"Error syncing commands: {e}")


# setup logger and intents
handler = logging.FileHandler(filename="discord.log", encoding="utf-8", mode="w")
intents = discord.Intents.default()
intents.message_content = True
intents.members = True
client = Client(
    command_prefix="!", intents=intents
)  # prefix sorta irrelevant, not used


# pull values from .env
load_dotenv()
token = os.getenv("DISCORD_TOKEN")

if token is None:
    raise ValueError("DISCORD_TOKEN environment variable is not set")


@client.tree.command(name="puzzle", description="start a puzzle")
@app_commands.describe(
    publisher="where the puzzle came from",
    date="date on which the puzzle was published (m/d or day of the week)",
)
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

            # send the puzzle!
            await interaction.response.send_message(
                embed=discord.Embed(
                    title=puzzleName,
                    url=game,
                    color=discord.Color.from_str("#78a6ee"),
                    # description="Will Shortz, probably"\
                )
            )

    except Exception as e:
        print(f"Error getting results: {e}")


webserver.keep_alive()
client.run(token, log_handler=handler, log_level=logging.DEBUG)
