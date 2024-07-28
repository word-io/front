import { cn } from "@/lib/utils";

interface GuessInputProps {
  guess: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isFocused: boolean;
  setIsFocused: (isFocused: boolean) => void;
  register: any;
  shake?: boolean;
}

export const GuessInput = ({
  guess,
  handleChange,
  isFocused,
  setIsFocused,
  register,
  shake,
}: GuessInputProps) => (
  <div className="relative flex gap-2 w-full cursor-text">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className={cn([
          "flex items-end pb-3 justify-center flex-1 h-16 bg-muted rounded-lg",
          isFocused && "ring-1 ring-primary",
          shake && "animate-shake-x ring-1 ring-destructive",
        ])}
      >
        {guess[index] ? (
          <span className="uppercase text-2xl font-bold">{guess[index]}</span>
        ) : (
          <span className="text-lg font-bold">__</span>
        )}
      </div>
    ))}
    <input
      autoComplete="off"
      id="guess"
      {...register("guess", { onChange: handleChange, required: true })}
      value={guess}
      autoFocus
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      maxLength={5}
      className="absolute w-full h-16 opacity-0"
    />
  </div>
);
