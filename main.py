import discord
from discord.ext import commands
from discord import app_commands
import logging
from dotenv import load_dotenv
import os
from typing import Literal  # for autocomplete

import webserver  # for hosting


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
    await puzzle_utils.startPuzzle(interaction, publisher, date)

@client.event
async def on_reaction_add(reaction, user):
    if str(reaction) == "✅":
        channel = reaction.message.channel

        # create embed
        puzzleEmbed = discord.Embed(description="congrats! 🎉 play one of today's puzzles?")

        await channel.send(embed=puzzleEmbed, view=publisherButtons(), delete_after=60)


class publisherButtons(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label='nyt', style=discord.ButtonStyle.grey)
    async def nyt_button(self, interaction, button):
        #TODO get date of original puzzle?
        await puzzle_utils.startPuzzle(interaction, "nyt", edit=True)

    @discord.ui.button(label='lat', style=discord.ButtonStyle.grey)
    async def lat_button(self, interaction, button):
        await puzzle_utils.startPuzzle(interaction, "lat", edit=True)

    @discord.ui.button(label='usa', style=discord.ButtonStyle.grey)
    async def usa_button(self, interaction, button):
        await puzzle_utils.startPuzzle(interaction, "usa", edit=True)

    @discord.ui.button(label='other', style=discord.ButtonStyle.grey)
    async def other_button(self, interaction, button):
        await interaction.response.edit_message(view=publisherButtons2())


class publisherButtons2(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label='wsj', style=discord.ButtonStyle.grey)
    async def wsj_button(self, interaction, button):
        await puzzle_utils.startPuzzle(interaction, "wsj", edit=True)

    @discord.ui.button(label='newsday', style=discord.ButtonStyle.grey)
    async def newsday_button(self, interaction, button):
        await puzzle_utils.startPuzzle(interaction, "newsday", edit=True)

    @discord.ui.button(label='universal', style=discord.ButtonStyle.grey)
    async def universal_button(self, interaction, button):
        await puzzle_utils.startPuzzle(interaction, "universal", edit=True)

    @discord.ui.button(label='atlantic', style=discord.ButtonStyle.grey)
    async def atlantic_button(self, interaction, button):
        await puzzle_utils.startPuzzle(interaction, "atlantic", edit=True)

    @discord.ui.button(label='back', style=discord.ButtonStyle.grey)
    async def back_button(self, interaction, button):
        await interaction.response.edit_message(view=publisherButtons())


webserver.keep_alive()
client.run(token, log_handler=handler, log_level=logging.DEBUG)
