import { JournalEntry } from "@/utils/db";
import Link from "next/link";
import { formatTimestamp } from "@/utils/date";

interface EntryListProps {
  entries: JournalEntry[];
  onDelete: (id: string) => void;
  onRegenerateSummary: (entry: JournalEntry) => void;
  onGenerateReflections: (entry: JournalEntry) => void;
}

const truncateContent = (content: string, maxLength: number = 300) => {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength) + "...";
};

export default function EntryList({
  entries,
  onDelete,
  onRegenerateSummary,
  onGenerateReflections,
}: EntryListProps) {
  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm text-gray-500">{formatTimestamp(entry.createdAt)}</span>
            <div className="space-x-2">
              <Link
                href={`/entry/${entry.id}`}
                className="text-sm text-blue-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 cursor-pointer"
              >
                Edit
              </Link>
              <button
                onClick={() => onDelete(entry.id)}
                className="text-sm text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">{truncateContent(entry.content)}</p>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium text-gray-500">Summary</h3>
                <button
                  onClick={() => onRegenerateSummary(entry)}
                  className="text-sm text-blue-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 cursor-pointer"
                >
                  Regenerate
                </button>
              </div>
              <p className="text-sm text-gray-600">{entry.summary}</p>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium text-gray-500">Reflection Questions</h3>
                <button
                  onClick={() => onGenerateReflections(entry)}
                  className="text-sm text-blue-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 cursor-pointer"
                >
                  {entry.reflectionQuestions ? "Regenerate" : "Generate"}
                </button>
              </div>
              {entry.reflectionQuestions ? (
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {entry.reflectionQuestions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
