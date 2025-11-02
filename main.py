import discord
from discord.ext import commands
from discord import app_commands
import logging
from dotenv import load_dotenv
import os

import webserver  # for hosting

import datetime  # for puzzles by date
from typing import Literal  # for autocomplete
import re  # for date format checking

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
    date="date on which the puzzle was published (m/d or m/d/yyyy)",
)
async def startPuzzle(
    interaction: discord.Interaction,
    publisher: Literal["nyt", "lat", "usa", "wsj", "newsday", "universal", "atlantic"],
    date: str = "",
):
    try:
        dateFormat = re.compile(r"^[0-1]?\d\/[0-3]?\d(\/[1-2]\d\d\d)?$")

        if dateFormat.match(date):
            dateParts = date.split("/")
            year = (
                datetime.date.today().year if len(dateParts) == 2 else int(dateParts[2])
            )

            puzzleDate = datetime.date(year, int(dateParts[0]), int(dateParts[1]))
            puzzleName = puzzle_utils.getPuzzleName(publisher, puzzleDate)
        else:
            puzzleName = puzzle_utils.getPuzzleName(publisher)

        game = await puzzle_utils.makeGame(searchTerm=puzzleName)
        if game is None:
            await interaction.response.send_message(
                f"no puzzles found for {puzzleName}", ephemeral=True
            )
        else:
            await interaction.response.send_message(game)

    except Exception as e:
        print(f"Error getting results: {e}")


webserver.keep_alive()
client.run(token, log_handler=handler, log_level=logging.DEBUG)
