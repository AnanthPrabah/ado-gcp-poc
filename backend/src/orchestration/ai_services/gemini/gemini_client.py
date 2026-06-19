"""Google Gemini client — prompt enhancement and text generation."""

import os
import google.generativeai as genai


class GeminiClient:
    def __init__(self, model: str | None = None) -> None:
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        self.model = genai.GenerativeModel(model or os.getenv("GEMINI_MODEL", "gemini-1.5-pro"))

    def enhance_prompt(self, raw_prompt: str) -> str:
        """Rewrite a short prompt into a detailed, photo-realistic description."""
        system = (
            "You are a professional photo-realistic image prompt engineer. "
            "Expand the user's prompt into a highly detailed, visually rich description "
            "suitable for Stable Diffusion XL. Keep it under 200 words."
        )
        response = self.model.generate_content(f"{system}\n\nPrompt: {raw_prompt}")
        return response.text.strip()

    def classify_content(self, prompt: str) -> dict:
        """Return safety classification for a given prompt."""
        # TODO: implement content moderation call
        return {"safe": True, "categories": []}
