"""Image Generation Processor — Celery task wrapping Stable Diffusion."""

from src.orchestration.rail_bus.tasks import celery_app
from src.orchestration.ai_services.stable_diffusion.sd_client import StableDiffusionClient
from src.observability.logging.logger import get_logger

log = get_logger(__name__)


@celery_app.task(bind=True, name="image_generation.generate", max_retries=3)
def generate_image(self, job_id: str, prompt: str, metadata: dict):
    """
    Main image generation task.

    Steps:
    1. Optionally enhance prompt via Gemini (text_post_processor)
    2. Generate image via Stable Diffusion
    3. Persist result to Cloud Storage
    4. Update job status in Cloud SQL
    """
    log.info("Starting image generation", job_id=job_id)
    try:
        client = StableDiffusionClient()
        image_path = client.generate(prompt=prompt, output_name=job_id)
        # TODO: upload image_path via StorageClient
        # TODO: update job record in CloudSQL
        log.info("Image generation complete", job_id=job_id, path=str(image_path))
        return {"job_id": job_id, "status": "completed", "output": str(image_path)}
    except Exception as exc:
        log.error("Image generation failed", job_id=job_id, error=str(exc))
        raise self.retry(exc=exc, countdown=30)
