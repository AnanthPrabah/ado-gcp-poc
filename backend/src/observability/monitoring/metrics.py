"""OpenTelemetry metrics — counters and histograms for key operations."""

import os
from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader


def configure_metrics(service_name: str | None = None) -> None:
    name = service_name or os.getenv("OTEL_SERVICE_NAME", "photo-real-ai")
    endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
    readers = []
    if endpoint:
        from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
        readers.append(PeriodicExportingMetricReader(OTLPMetricExporter(endpoint=endpoint)))

    provider = MeterProvider(metric_readers=readers)
    metrics.set_meter_provider(provider)


def get_meter(name: str):
    return metrics.get_meter(name)


# ── Pre-built meters ──────────────────────────────────────────────────
meter = get_meter("photo_real_ai")

render_jobs_total = meter.create_counter(
    "render_jobs_total",
    description="Total number of render jobs submitted",
)

render_duration_seconds = meter.create_histogram(
    "render_duration_seconds",
    description="Time taken to complete a render job",
    unit="s",
)
