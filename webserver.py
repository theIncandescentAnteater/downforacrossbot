from fastapi import FastAPI
import uvicorn
import asyncio
from threading import Thread
import logging

from settings import settings

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="DownForAcross Discord Bot",
    description="Web server for Discord bot keep-alive",
    version="0.1.0",
)


@app.get("/")
async def root():
    """Root endpoint for health checks."""
    return {"status": "ok", "message": "DownForAcross Discord Bot is running"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


def run_server(host: str | None = None, port: int | None = None):
    """Run the FastAPI server using uvicorn."""
    host = host or settings.webserver_host
    port = port or settings.webserver_port
    config = uvicorn.Config(
        app,
        host=host,
        port=port,
        log_level="info",
        access_log=True,
    )
    server = uvicorn.Server(config)
    # Create new event loop for this thread
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(server.serve())


def keep_alive():
    """Start the FastAPI server in a background thread."""
    logger.info(
        f"Starting FastAPI server on {settings.webserver_host}:{settings.webserver_port}"
    )
    t = Thread(target=run_server, daemon=True)
    t.start()
    return t
