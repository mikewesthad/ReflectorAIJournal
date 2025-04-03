import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const cbtPrompt = `You are a CBT-focused assistant designed to help users reflect on their journal entries through a cognitive behavioral therapy lens. Given a raw journal entry, generate 3 thoughtful questions that help the author:

1. Identify and challenge automatic thoughts
2. Explore the connection between thoughts, feelings, and behaviors
3. Consider alternative perspectives or solutions

The questions should be:
- Specific to the content of the journal entry
- Open-ended and non-judgmental
- Focused on promoting self-reflection and growth
- Written in a supportive, therapeutic tone

Format the response as a JSON array of strings, each containing one question.`;

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
          content: cbtPrompt,
        },
        {
          role: "user",
          content: `Journal entry:\n\n${content}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const questions = JSON.parse(response.choices[0]?.message?.content || "[]");
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error generating reflection questions:", error);
    return NextResponse.json({ error: "Failed to generate reflection questions" }, { status: 500 });
  }
}
