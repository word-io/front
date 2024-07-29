// components/custom/scoreboard.tsx

export interface ScoreboardProps {
  tries: Record<string, number>;
  currentAttemptIndex: number;
  isCorrect: boolean;
}

export const Scoreboard = ({
  tries,
  currentAttemptIndex,
  isCorrect,
}: ScoreboardProps) => {
  const maxAttempts = 5;
  return (
    <div className="fixed top-4 right-4 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-primary">Placar</h2>
      <div className="flex flex-col gap-2">
        {Object.entries(tries).map(([playerId, attemptCount]) => {
          const attempts = Array.from({ length: maxAttempts }, (_, index) => {
            let type: "correct" | "incorrect" | "neutral" = "neutral";

            if (index < attemptCount) {
              type =
                index === currentAttemptIndex
                  ? isCorrect
                    ? "correct"
                    : "incorrect"
                  : "incorrect";
            }

            return { type };
          });

          return (
            <div
              key={playerId}
              className="flex justify-between items-center gap-8"
            >
              <span className="text-muted-foreground">{playerId}</span>
              <div className="flex">
                {attempts.map((attempt, index) => (
                  <span
                    key={index}
                    className={`inline-block w-4 h-4 rounded-full ${
                      attempt.type === "correct"
                        ? "bg-green-500"
                        : attempt.type === "incorrect"
                        ? "bg-red-500"
                        : "bg-gray-300"
                    } mx-1`}
                  ></span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
