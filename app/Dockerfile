# =======================================
# 🐍 FastAPI Backend Dockerfile
# Ensures the `app` package is installed so Python can import `app`.
# Uses Python 3.12 to match `pyproject.toml` requires-python >=3.12.
# =======================================

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Upgrade pip and install an optional 'uv' helper if you explicitly want it available.
# We won't depend on it for installing the package to avoid subtle runtime issues.
RUN pip install --no-cache-dir --upgrade pip || true
RUN pip install --no-cache-dir uv || true

# Copy project metadata first to leverage Docker cache when dependencies don't change.
COPY pyproject.toml .
COPY requirements.txt .
COPY README.md .

# Copy source into the image. Project uses a `src/` layout so we copy that folder.
COPY src ./src

# Ensure the package is installed into the environment so `import app` works.
# This uses the pyproject.toml build backend (hatchling) to build/install the package.
RUN pip install --no-cache-dir .

# Also add src to PYTHONPATH as a fallback (helps when running from source during development).
ENV PYTHONPATH=/app/src

EXPOSE 8000

# Use uvicorn to run the FastAPI app (module path: app.main:app)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
