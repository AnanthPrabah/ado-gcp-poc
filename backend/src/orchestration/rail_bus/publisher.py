"""Rail-Bus Publisher — sends messages to the Celery task queue."""

from celery import Celery
from src.orchestration.rail_bus.tasks import celery_app


class Publisher:
    """Routes render events to the correct Celery task."""

    def publish_render_job(self, job_id: str, prompt: str, metadata: dict) -> str:
        """Enqueue an image generation job; return the Celery task ID."""
        from src.orchestration.processors.image_generation.task import generate_image
        result = generate_image.apply_async(
            kwargs={"job_id": job_id, "prompt": prompt, "metadata": metadata},
            task_id=job_id,
        )
        return result.id

    def publish_text_post_process(self, job_id: str, text: str) -> str:
        from src.orchestration.processors.text_post_processor.task import post_process_text
        result = post_process_text.apply_async(kwargs={"job_id": job_id, "text": text})
        return result.id
