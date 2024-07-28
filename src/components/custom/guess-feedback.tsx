import { cn } from "@/lib/utils";

interface GuessFeedbackProps {
  feedback: string;
  placeholderWord: string;
}

export const GuessFeedback = ({
  feedback,
  placeholderWord,
}: GuessFeedbackProps) => (
  <div className="flex gap-2 w-full">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className={cn([
          "flex items-end pb-3 justify-center flex-1 h-16 bg-zinc-400 rounded-lg disabled",
          feedback[index] === placeholderWord[index] && "bg-emerald-800",
        ])}
      >
        {feedback[index] ? (
          <span className="uppercase text-2xl font-bold text-muted">
            {feedback[index]}
          </span>
        ) : (
          <span className="text-lg font-bold">__</span>
        )}
      </div>
    ))}
  </div>
);
