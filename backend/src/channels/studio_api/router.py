"""Route registration for the Studio API."""

from fastapi import APIRouter

router = APIRouter(prefix="/api/v1")


@router.post("/render")
async def submit_render_job(payload: dict):
    """Submit a new render job to the Rail-Bus."""
    # TODO: validate payload, enqueue via rail_bus
    return {"job_id": "placeholder", "status": "queued"}


@router.get("/render/{job_id}")
async def get_render_status(job_id: str):
    """Poll status of a submitted render job."""
    # TODO: look up job from storage layer
    return {"job_id": job_id, "status": "pending"}
