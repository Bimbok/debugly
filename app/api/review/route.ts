import type { NextRequest } from "next/server"
import { z } from "zod"

const issueSchema = z.object({
  title: z.string(),
  description: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  type: z.enum(["bug", "performance", "security", "style", "maintainability"]).optional(),
  lineStart: z.number().int().gte(1).optional(),
  lineEnd: z.number().int().gte(1).optional(),
  suggestion: z.string().optional(),
})

const reviewSchema = z.object({
  issues: z.array(issueSchema).default([]),
  fixedCode: z.string().default(""),
})

const DEFAULT_MODEL = "gemini-2.5-flash"
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
const makeGeminiUrl = (model: string) => `${GEMINI_BASE_URL}/${encodeURIComponent(model)}:generateContent`

function extractJson(text: string) {
  try {
    // strip code fences if present
    const cleaned = text
      .replace(/```(?:json)?/gi, "")
      .replace(/```/g, "")
      .trim()
    return JSON.parse(cleaned)
  } catch {
    // last resort: try to find a JSON block
    const match = text.match(/{[\s\S]*}/)
    if (match) {
      return JSON.parse(match[0])
    }
    throw new Error("Model did not return valid JSON")
  }
}

export async function POST(req: NextRequest) {
  const { code, language, apiKey, model } = await req.json()
  if (!code || typeof code !== "string") {
    return new Response("Missing code", { status: 400 })
  }

  const key = (apiKey && String(apiKey)) || process.env.GEMINI_API_KEY
  if (!key) {
    return new Response("Missing Gemini API key. Provide one in the UI or set GEMINI_API_KEY in Project Settings.", {
      status: 400,
    })
  }

  const modelId = typeof model === "string" && model.trim().length > 0 ? model.trim() : DEFAULT_MODEL

  const prompt =
    "You are an expert code reviewer. Analyze the provided code for bugs, performance issues, security risks, and maintainability.\n" +
    "Return strictly a JSON object matching this schema: {\n" +
    '  "issues": [{\n' +
    '    "title": string,\n' +
    '    "description": string,\n' +
    '    "severity": "low" | "medium" | "high" | "critical",\n' +
    '    "type"?: "bug" | "performance" | "security" | "style" | "maintainability",\n' +
    '    "lineStart"?: number,\n' +
    '    "lineEnd"?: number,\n' +
    '    "suggestion"?: string\n' +
    "  }],\n" +
    '  "fixedCode": string\n' +
    "}\n" +
    "If line numbers are unknown, omit them. Provide a safe, minimal-diff fixed version of the code in fixedCode.\n\n" +
    `Language: ${language || "auto"}\n` +
    "Code:\n```" +
    `${language || ""}\n` +
    code +
    "\n```"

  try {
    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2000,
        response_mime_type: "application/json",
      },
    }

    const res = await fetch(`${makeGeminiUrl(modelId)}?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errTxt = await res.text().catch(() => "")
      console.error("[review] gemini error", modelId, res.status, errTxt)
      return new Response(
        `Gemini request failed (${res.status}) for model "${modelId}". ${errTxt || "Please verify your API key and try again."}`,
        { status: 502 },
      )
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text || typeof text !== "string") {
      console.error("[review] invalid gemini response", JSON.stringify(data).slice(0, 500))
      return new Response("Invalid response from Gemini", { status: 502 })
    }

    const raw = extractJson(text)
    const parsed = reviewSchema.safeParse(raw)
    if (!parsed.success) {
      console.error("[review] schema validation failed", parsed.error.flatten())
      return new Response("Model output failed validation", { status: 502 })
    }

    return Response.json(parsed.data, { status: 200 })
  } catch (err: any) {
    console.error("[review] error", err?.message || err)
    return new Response(`AI review failed: ${err?.message || "Unknown error"}`, { status: 500 })
  }
}
