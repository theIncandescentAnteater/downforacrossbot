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
            if not date:
                puzzleName = puzzle_utils.getPuzzleName(publisher)
            else:
                date = parser.parse(date)
                if date > datetime.today():
                    date = date - timedelta(days=7)
                puzzleName = puzzle_utils.getPuzzleName(publisher, date)
        except Exception as e:
            await interaction.response.send_message(
                f"i don't know how to intepret `{date}`. try m/d, m/d/yy, or typing out the month or the day of the week that you want",
                ephemeral=True,
            )
            print(f"Error getting results: {e}")
            return

        game = await puzzle_utils.makeGame(searchTerm=puzzleName)
        if game is None:
            if date and date > datetime.today():
                await interaction.response.send_message(
                    "no puzzles found for the future!", ephemeral=True
                )
            else:
                await interaction.response.send_message(
                    f"no puzzles found for {puzzleName}", ephemeral=True
                )
        else:
            await interaction.response.send_message(game)

    except Exception as e:
        print(f"Error getting results: {e}")


@client.tree.command(name="puzzleembed", description="start a puzzle")
async def startPuzzleEmbed(
    interaction: discord.Interaction,
    publisher: Literal["nyt", "lat", "usa", "wsj", "newsday", "universal", "atlantic"],
    date: str = "",
):
    try:
        dateFormat = re.compile(r"^[0-1]?\d/[0-3]?\d(/[1-2]\d\d\d)?$")

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
        if game == None:
            await interaction.response.send_message(
                f"no puzzles found for {puzzleName}", ephemeral=True
            )
        else:
            # puzzleRole = discord.utils.get(interaction.guild.roles, name=puzzleRoleName)
            await interaction.response.send_message(
                embed=discord.Embed(
                    title=puzzleName,
                    url=game,
                    color=discord.Color.from_str("#78a6ee"),
                    # , description=f"<@&{puzzleRole.id}>"\
                )
            )

    except Exception as e:
        print(f"Error getting results: {e}")


@client.tree.command(name="puzzleembed", description="start a puzzle")
async def startPuzzleEmbed(
    interaction: discord.Interaction,
    publisher: Literal["nyt", "lat", "usa", "wsj", "newsday", "universal", "atlantic"],
    date: str = "",
):
    try:
        dateFormat = re.compile(r"^[0-1]?\d/[0-3]?\d(/[1-2]\d\d\d)?$")

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
        if game == None:
            await interaction.response.send_message(
                f"no puzzles found for {puzzleName}", ephemeral=True
            )
        else:
            # puzzleRole = discord.utils.get(interaction.guild.roles, name=puzzleRoleName)
            await interaction.response.send_message(
                embed=discord.Embed(
                    title=puzzleName,
                    url=game,
                    color=discord.Color.from_str("#78a6ee"),
                    # , description=f"<@&{puzzleRole.id}>"\
                )
            )

    except Exception as e:
        print(f"Error getting results: {e}")


webserver.keep_alive()
client.run(token, log_handler=handler, log_level=logging.DEBUG)
