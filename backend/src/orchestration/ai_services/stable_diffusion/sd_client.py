"""Stable Diffusion client — local or cloud-hosted SDXL inference."""

import os
from pathlib import Path


class StableDiffusionClient:
    def __init__(self) -> None:
        self.model_id = os.getenv("SD_MODEL_ID", "stabilityai/stable-diffusion-xl-base-1.0")
        self.device = os.getenv("SD_DEVICE", "cpu")
        self._pipe = None

    def _load_pipeline(self):
        if self._pipe is None:
            from diffusers import StableDiffusionXLPipeline
            import torch
            self._pipe = StableDiffusionXLPipeline.from_pretrained(
                self.model_id,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
            ).to(self.device)
        return self._pipe

    def generate(
        self,
        prompt: str,
        negative_prompt: str = "",
        width: int = 1024,
        height: int = 1024,
        num_inference_steps: int = 50,
        guidance_scale: float = 7.5,
        output_name: str = "output",
        output_dir: str = "/tmp/renders",
    ) -> Path:
        """Run inference and save the image; return the output path."""
        pipe = self._load_pipeline()
        result = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
        )
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        out_path = Path(output_dir) / f"{output_name}.png"
        result.images[0].save(str(out_path))
        return out_path
