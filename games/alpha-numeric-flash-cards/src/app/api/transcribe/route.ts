import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "nodejs";
export const maxDuration = 30; // 30 second timeout for API route

/**
 * POST /api/transcribe
 *
 * Accepts audio file and transcribes it using OpenAI Whisper API
 *
 * Request body: FormData with 'audio' file field
 * Response: JSON with { transcription: string } or error
 */
export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Convert Blob to File for OpenAI API
    // Whisper supports various formats: mp3, mp4, mpeg, mpga, m4a, wav, webm
    const file = new File([audioFile], "recording.webm", {
      type: audioFile.type || "audio/webm",
    });

    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "en", // Optimize for English
      response_format: "text", // Get plain text response
      // Provide prompt to improve accuracy for numbers and letters
      prompt: "This is a child learning numbers from 0 to 20 and letters from A to Z.",
    });

    // Return the transcription (response_format: "text" returns a string directly)
    return NextResponse.json({
      transcription: transcription as string,
    });
  } catch (error) {
    console.error("Transcription error:", error);

    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          error: "OpenAI API error",
          message: error.message,
        },
        { status: error.status || 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "Failed to transcribe audio",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/transcribe
 *
 * Checks if the transcription service is available (i.e., API key is configured).
 * Used by the client to conditionally enable transcription features.
 */
export async function OPTIONS() {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  // Return 204 No Content to indicate success
  return new NextResponse(null, { status: 204 });
}
