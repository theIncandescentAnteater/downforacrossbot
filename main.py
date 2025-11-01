import discord
from discord.ext import commands
from discord import app_commands
import logging
import logging.handlers
import sys

import webserver  # for hosting

import datetime  # for puzzles by date
from typing import Literal  # for autocomplete
import re  # for date format checking

import puzzle_utils
from settings import settings


DATE_FORMAT_PATTERN = re.compile(r"^[0-1]?\d\/[0-3]?\d(\/[1-2]\d\d\d)?$")


def parse_date(date_str: str) -> datetime.date:
    """Parse date string in m/d or m/d/yyyy format and return date object."""
    if not DATE_FORMAT_PATTERN.match(date_str):
        raise ValueError(f"Invalid date format: {date_str}. Expected m/d or m/d/yyyy")

    date_parts = date_str.split("/")
    year = datetime.date.today().year if len(date_parts) == 2 else int(date_parts[2])

    return datetime.date(year, int(date_parts[0]), int(date_parts[1]))


def setup_logging():
    """Configure logging with both file and console handlers."""
    log_level = settings.log_level.upper()
    level = getattr(logging, log_level, logging.INFO)

    # Create logger
    logger = logging.getLogger()
    logger.setLevel(level)

    # Clear existing handlers
    logger.handlers.clear()

    # Create formatters
    file_formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    console_formatter = logging.Formatter("%(levelname)s - %(message)s")

    # File handler with rotation
    file_handler = logging.handlers.RotatingFileHandler(
        filename="discord.log",
        encoding="utf-8",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(file_formatter)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(console_formatter)

    # Add handlers
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger


# Setup logging first
logger = setup_logging()


class Client(commands.Bot):
    async def on_ready(self):
        if self.user is not None:
            logger.info(f"Ready to puzzle with {self.user.name}")
        else:
            logger.info("Ready to puzzle")

        try:
            await self.tree.sync()
            logger.info("Synced commands to guilds")
        except Exception as e:
            logger.error(f"Error syncing commands: {e}", exc_info=True)


# Setup intents
intents = discord.Intents.default()
intents.message_content = True
intents.members = True
client = Client(
    command_prefix="!", intents=intents
)  # prefix required by discord.py but not used for slash commands


# Get Discord token from settings
token = settings.discord_token


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
        if date:
            try:
                puzzle_date = parse_date(date)
                puzzle_name = puzzle_utils.getPuzzleName(publisher, puzzle_date)
            except ValueError as e:
                await interaction.response.send_message(
                    f"Invalid date format. Please use m/d or m/d/yyyy format. Error: {e}",
                    ephemeral=True,
                )
                return
        else:
            puzzle_name = puzzle_utils.getPuzzleName(publisher)

        game = await puzzle_utils.makeGame(searchTerm=puzzle_name)
        if game is None:
            await interaction.response.send_message(
                f"No puzzles found for {puzzle_name}", ephemeral=True
            )
        else:
            await interaction.response.send_message(game)

    except (ValueError, KeyError, IndexError) as e:
        logger.error(f"Error processing puzzle request: {e}", exc_info=True)
        try:
            await interaction.response.send_message(
                "An error occurred while processing your request.", ephemeral=True
            )
        except discord.InteractionResponded:
            # Interaction may have already been responded to
            pass
    except Exception as e:
        logger.error(f"Unexpected error getting puzzle results: {e}", exc_info=True)
        try:
            await interaction.response.send_message(
                "An unexpected error occurred. Please try again later.", ephemeral=True
            )
        except discord.InteractionResponded:
            # Interaction may have already been responded to
            pass


if __name__ == "__main__":
    # Start the FastAPI server in background
    logger.info("Starting FastAPI webserver...")
    webserver.keep_alive()

    # Run the Discord bot
    try:
        logger.info("Starting Discord bot...")
        client.run(token)  # Use our own logging setup
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    except Exception as e:
        logger.critical(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)
