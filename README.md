# CrossWithFriends Discord Bot
discord bot that sends crosswithfriends crossword puzzle links :)

## Commands
- puzzle
- start (publisher, date [optional])

## To Run Locally

### Install Dependencies
Install dependencies using `bun`:
```bash
bun install
```

### config.json file 
Containing:
- `token`, the bot token

### Run the Bot
```bash
bun .
```

## Running with Docker

### Build the Image
```bash
docker build -t downforacrossbot .
```

### Run the Container
Pass the Discord token as an environment variable:
```bash
docker run -p 8080:8080 -e DISCORD_TOKEN=your_token_here downforacrossbot
```


The container runs both the FastAPI web server (on port 8080) and the Discord bot. The FastAPI server provides:
- Root endpoint: `http://localhost:8080/` - Status check
- Health endpoint: `http://localhost:8080/health` - Health check for monitoring

### OAuth2 Settings
Scopes:
- bot
- applications.commands

Bot Permissions:
- Manage Roles
- Send Messages
- Embed Links
- Read Message History
- Use External Emojis
- Add Reactions
- Use Slash Commands
- Use Embedded Activities
