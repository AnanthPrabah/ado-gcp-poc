import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
// Hot reload trigger: read new adc.json credentials
import fs from "fs";
import path from "path";

// ADC Support
const possiblePaths = [
  path.resolve("adc.json"),
  path.resolve("frontend", "adc.json")
];

for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = p;
    break;
  }
}

let projectId = process.env.GCP_PROJECT_ID;

if (!projectId && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const creds = JSON.parse(
      fs.readFileSync(
        process.env.GOOGLE_APPLICATION_CREDENTIALS,
        "utf8"
      )
    );

    projectId = creds.project_id || creds.quota_project_id;
  } catch (err) {
    console.error("Failed to read credentials file:", err);
  }
}

// Initialize Gemini
const aiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  })
  : new GoogleGenAI({
    vertexai: true,
    project: projectId || "centered-planet-491518-v9",
    location: process.env.GCP_LOCATION || "us-central1",
  });

// Dedicated Vertex Client for Imagen 3
const vertexClient = new GoogleGenAI({
  vertexai: true,
  project: projectId || "centered-planet-491518-v9",
  location: process.env.GCP_LOCATION || "us-central1",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      action,
      model,
      contents,
      config,
      name
    } = body;

    switch (action) {
      case "generateContent": {
        if (model.includes("imagen")) {
          let promptText = "";
          if (typeof contents === "string") {
            promptText = contents;
          } else if (contents) {
            const contentsArr = Array.isArray(contents) ? contents : [contents];
            const parts = contentsArr.flatMap((item: any) => {
              if (item.parts) return item.parts;
              if (item.text) return [item];
              return [];
            });
            promptText = parts.map((p: any) => p.text || "").filter(Boolean).join("\n");
          }

          if (!promptText) {
            promptText = "baseball cap product photo";
          }

          const response = await vertexClient.models.generateImages({
            model: "imagen-3.0-generate-002",
            prompt: promptText,
            config: {
              numberOfImages: 1,
              aspectRatio: config?.imageConfig?.aspectRatio || "1:1",
              outputMimeType: "image/png"
            }
          });

          const base64Data = response.generatedImages?.[0]?.image?.imageBytes;
          if (!base64Data) {
            throw new Error("No image data returned from Vertex Imagen 3");
          }

          return NextResponse.json({
            candidates: [{
              content: {
                parts: [{
                  inlineData: {
                    mimeType: "image/png",
                    data: base64Data
                  }
                }]
              }
            }]
          });
        }

        const response = await aiClient.models.generateContent({
          model,
          contents,
          config,
        });

        return NextResponse.json(response);
      }

      case "createCache": {
        const cache = await aiClient.caches.create({
          model,
          config,
        });

        return NextResponse.json(cache);
      }

      case "deleteCache": {
        await aiClient.caches.delete({
          name,
        });

        return NextResponse.json({
          success: true,
        });
      }

      default:
        return NextResponse.json(
          {
            error: `Unknown action: ${action}`,
          },
          {
            status: 400,
          }
        );
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);

    return NextResponse.json(
      {
        error: error.message || "Internal Server Error",
        details: error.details || null,
      },
      {
        status: error.status || 500,
      }
    );
  }
}