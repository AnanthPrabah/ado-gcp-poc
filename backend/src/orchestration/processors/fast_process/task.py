"""Fast Process — lightweight synchronous pipeline for low-latency preview images."""

from src.orchestration.rail_bus.tasks import celery_app
from src.observability.logging.logger import get_logger

log = get_logger(__name__)


@celery_app.task(bind=True, name="fast_process.run", max_retries=1)
def fast_process(self, job_id: str, prompt: str, config: dict):
    """
    Generate a fast, lower-quality preview image.
    Uses fewer diffusion steps for near-instant feedback.
    """
    log.info("Fast process started", job_id=job_id)
    # TODO: call StableDiffusionClient with num_inference_steps=10
    return {"job_id": job_id, "status": "preview_ready"}
