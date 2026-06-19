"""OpenTelemetry tracing setup."""

import os
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import Resource


def configure_tracing(service_name: str | None = None) -> None:
    name = service_name or os.getenv("OTEL_SERVICE_NAME", "photo-real-ai")
    resource = Resource.create({"service.name": name})
    provider = TracerProvider(resource=resource)

    endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
    if endpoint:
        from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
        exporter = OTLPSpanExporter(endpoint=endpoint)
        provider.add_span_processor(BatchSpanProcessor(exporter))

    trace.set_tracer_provider(provider)


def get_tracer(name: str):
    return trace.get_tracer(name)
