FROM python:3.11-slim AS base
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# ── API ──────────────────────────────────────────────────────────────
FROM base AS api
EXPOSE 8000
CMD ["uvicorn", "src.channels.studio_api.main:app", "--host", "0.0.0.0", "--port", "8000"]

# ── Celery Worker ────────────────────────────────────────────────────
FROM base AS worker
CMD ["celery", "-A", "src.orchestration.rail_bus.tasks.celery_app", "worker", "--loglevel=info"]
