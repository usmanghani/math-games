/**
 * Client-side transcription service
 * Handles communication with the /api/transcribe endpoint
 */

export interface TranscriptionResult {
  transcription: string;
}

export interface TranscriptionError {
  error: string;
  message?: string;
}

/**
 * Transcribes an audio blob using the OpenAI Whisper API via our API route
 *
 * @param audioBlob - The audio blob to transcribe (typically from MediaRecorder)
 * @returns Promise resolving to the transcription text
 * @throws Error if transcription fails
 */
export async function transcribeAudio(
  audioBlob: Blob
): Promise<string> {
  try {
    // Create form data with the audio file
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    // Call our API endpoint
    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });

    // Parse response
    const data = await response.json();

    if (!response.ok) {
      const error = data as TranscriptionError;
      throw new Error(error.message || error.error || "Transcription failed");
    }

    const result = data as TranscriptionResult;
    return result.transcription.trim();
  } catch (error) {
    console.error("Transcription service error:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to transcribe audio");
  }
}

/**
 * Checks if transcription is available (API key configured)
 * This can be used to conditionally enable/disable features
 */
export async function isTranscriptionAvailable(): Promise<boolean> {
  try {
    const response = await fetch("/api/transcribe", {
      method: "OPTIONS",
    });
    return response.ok;
  } catch {
    return false;
  }
}
