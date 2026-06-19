"""Publishing Processor — delivers completed images to downstream systems."""

from src.orchestration.rail_bus.tasks import celery_app
from src.observability.logging.logger import get_logger

log = get_logger(__name__)


@celery_app.task(bind=True, name="publishing.publish", max_retries=3)
def publish_output(self, job_id: str, output_url: str, destinations: list[str]):
    """
    Distribute a completed render to configured downstream systems.

    Supported destinations: 'nikon_dam', 'rlm', 'webhook'
    """
    log.info("Publishing output", job_id=job_id, destinations=destinations)
    results = {}
    for dest in destinations:
        try:
            # TODO: dispatch to each downstream connector
            results[dest] = "delivered"
        except Exception as exc:
            log.warning("Delivery failed", dest=dest, error=str(exc))
            results[dest] = f"failed: {exc}"
    return {"job_id": job_id, "results": results}
