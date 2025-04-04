import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const trendsPrompt = `You are a CBT-focused assistant designed to help users reflect on their journal entries through a cognitive behavioral therapy lens. Given multiple raw journal entries, generate a 3 - 4 sentance summary of the trends across the entries. Reflect on these prompts:

- are their any recurring thought patterns? recurring topics?
- is there any growth that could be noted across the entries?

Your response should be:
- Specific to the content of the journal entries
- Open-ended and non-judgmental
- Focused on promoting self-reflection and growth
- Written in a supportive, therapeutic tone`;

export async function POST(request: Request) {
  try {
    const { entries } = await request.json();

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: "Entries array is required" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: trendsPrompt,
        },
        {
          role: "user",
          content: `Journal entries:\n\n${entries.join("\n\n---\n\n")}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const summary = response.choices[0]?.message?.content || "";
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error generating trends summary:", error);
    return NextResponse.json({ error: "Failed to generate trends summary" }, { status: 500 });
  }
}
