import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: NextRequest) {
  try {
    const { transcript, customPrompt } = await request.json()

    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 })
    }

    const prompt = customPrompt
      ? `${customPrompt}\n\nTranscript:\n${transcript}`
      : `Please analyze the following meeting transcript and provide a comprehensive summary with the following sections:

1. **Key Discussion Points**: Main topics covered
2. **Decisions Made**: Any concrete decisions or agreements
3. **Action Items**: Tasks assigned with responsible parties (if mentioned)
4. **Next Steps**: Follow-up actions or future meetings planned

Please format the response in clear, professional language suitable for sharing with team members.

Transcript:
${transcript}`

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      maxTokens: 1000,
    })

    return NextResponse.json({ summary: text })
  } catch (error) {
    console.error("Error generating summary:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
