import { useEffect, useState } from "react";
import Link from "next/link";
import { formatTimestamp } from "@/utils/date";

interface EntryEditorProps {
  initialContent: string;
  onContentChange: (content: string) => void;
  lastSaved: Date | null;
}

function useWordCount(content: string) {
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  return wordCount;
}

export default function EntryEditor({
  initialContent = "",
  onContentChange,
  lastSaved,
}: EntryEditorProps) {
  const [content, setContent] = useState(initialContent);
  const wordCount = useWordCount(content);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onContentChange(newContent);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </Link>
            <h1 className="text-2xl font-semibold text-gray-800">Edit Entry</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>
            {lastSaved ? (
              <span className="text-sm text-gray-500">Saved {formatTimestamp(lastSaved)}</span>
            ) : null}
          </div>
        </div>
        <textarea
          className="w-full h-[calc(100vh-8rem)] p-4 text-lg leading-relaxed bg-white rounded-lg shadow-sm focus:outline-none resize-none"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start writing your thoughts..."
          autoFocus
        />
      </div>
    </main>
  );
}
