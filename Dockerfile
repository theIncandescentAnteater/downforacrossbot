FROM ghcr.io/astral-sh/uv:python3.14-alpine AS builder

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Install build dependencies for compiling Python packages
RUN apk add --no-cache --no-scripts \
    gcc \
    musl-dev \
    libffi-dev

# Set work directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies using uv
RUN uv sync --frozen --no-dev

# Final runtime stage
FROM ghcr.io/astral-sh/uv:python3.14-alpine

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH"

# Create non-root user for security
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser && \
    mkdir -p /app && \
    chown -R appuser:appuser /app

# Set work directory
WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /app/.venv /app/.venv

# Copy application code
COPY --chown=appuser:appuser main.py puzzle_utils.py webserver.py ./

# Switch to non-root user
USER appuser

# Expose port for FastAPI webserver
EXPOSE 8080

# Health check using FastAPI /health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health', timeout=5)" || exit 1

# Run the application using uv
# This starts both the FastAPI server (in background) and Discord bot
CMD ["uv", "run", "python", "main.py"]
