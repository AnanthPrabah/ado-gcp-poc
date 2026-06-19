"""Text Post-Processor — enriches / sanitises prompts before image generation."""

from src.orchestration.rail_bus.tasks import celery_app
from src.orchestration.ai_services.gemini.gemini_client import GeminiClient
from src.observability.logging.logger import get_logger

log = get_logger(__name__)


@celery_app.task(bind=True, name="text_post_processor.process", max_retries=2)
def post_process_text(self, job_id: str, text: str) -> dict:
    """Enhance a raw prompt using the Gemini API."""
    log.info("Post-processing text", job_id=job_id)
    try:
        client = GeminiClient()
        enhanced = client.enhance_prompt(text)
        return {"job_id": job_id, "original": text, "enhanced": enhanced}
    except Exception as exc:
        log.error("Text post-processing failed", job_id=job_id, error=str(exc))
        raise self.retry(exc=exc, countdown=10)
