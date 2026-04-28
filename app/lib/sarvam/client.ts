const SARVAM_BASE = "https://api.sarvam.ai";

export async function transcribeAudio(
  apiKey: string,
  audioBlob: Blob,
  languageCode: string = "unknown",
) {
  const formData = new FormData();
  // Re-wrap blob with clean MIME type (Sarvam rejects "audio/webm;codecs=opus")
  const cleanBlob = new Blob([audioBlob], { type: "audio/webm" });
  formData.append("file", cleanBlob, "audio.webm");
  formData.append("language_code", languageCode);
  formData.append("model", "saaras:v3");

  const response = await fetch(`${SARVAM_BASE}/speech-to-text`, {
    method: "POST",
    headers: { "API-Subscription-Key": apiKey },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Sarvam STT error: ${response.status} - ${error}`);
  }
  return response.json();
}
