import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const secondPersonPrompt = `You are a reflective assistant designed to help users make sense of journal entries. Given a raw journal entry, summarize it in a neutral, validating tone. Generate a summary of the journal entry from a second-person perspective.

The summary should be 2 - 3 sentences long and highlight key emotional states, sources of stress or tension, and any strategies or attempts at self-understanding.
`;

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: secondPersonPrompt,
        },
        {
          role: "user",
          content: `Journal entry:\n\n${content}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const summary = response.choices[0]?.message?.content || "Unable to generate summary.";
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
