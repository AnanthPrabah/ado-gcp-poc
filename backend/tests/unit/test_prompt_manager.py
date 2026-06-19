"""Unit tests for PromptManager."""

import pytest
from src.channels.prompt_management.prompt_manager import PromptTemplate


def test_prompt_template_defaults():
    pt = PromptTemplate(template_id="t1", name="Test", body="A photo of a {{subject}}")
    assert pt.version == 1
    assert pt.tags == []


def test_prompt_template_tags():
    pt = PromptTemplate(
        template_id="t2", name="Landscape", body="...", tags=["nature", "outdoor"]
    )
    assert "nature" in pt.tags
