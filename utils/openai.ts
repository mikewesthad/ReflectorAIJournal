export async function generateEntrySummary(content: string): Promise<string> {
  try {
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate summary");
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Unable to generate summary.";
  }
}

export async function generateReflectionQuestions(content: string): Promise<string[] | null> {
  try {
    const response = await fetch("/api/reflect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate reflection questions");
    }

    const data = await response.json();
    return data.questions;
  } catch (error) {
    console.error("Error generating reflection questions:", error);
    return null;
  }
}
