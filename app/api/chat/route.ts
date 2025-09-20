import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { message, pdfContent, fileName } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Create a system prompt that includes the PDF content
    const systemPrompt = `You are an AI assistant that helps users understand and analyze PDF documents. 
    
    ${
      pdfContent
        ? `The user has uploaded a PDF file named "${fileName}" with the following content:
    
    ${pdfContent}
    
    Please answer questions about this document based on its content. If the user asks about something not in the document, let them know that the information isn't available in the uploaded PDF.`
        : "The user has not uploaded any PDF content yet. Let them know they need to upload a PDF first."
    }
    
    Be helpful, accurate, and concise in your responses.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: message,
      maxTokens: 1000,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Error generating AI response:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
