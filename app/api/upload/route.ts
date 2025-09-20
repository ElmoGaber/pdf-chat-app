import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads")
    const filePath = join(uploadsDir, file.name)

    try {
      await writeFile(filePath, buffer)
    } catch (error) {
      // If uploads directory doesn't exist, create it and try again
      const { mkdir } = await import("fs/promises")
      await mkdir(uploadsDir, { recursive: true })
      await writeFile(filePath, buffer)
    }

    // Extract text from PDF (simplified - in production you'd use pdf-parse or similar)
    const extractedText = `This is extracted text from ${file.name}. In a real implementation, this would contain the actual PDF content extracted using libraries like pdf-parse or pdf2pic.`

    return NextResponse.json({
      message: "File uploaded successfully",
      filename: file.name,
      size: file.size,
      extractedText,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
