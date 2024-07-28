"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";
import { socket } from "./socket";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";

const placeholderWord = "apple";

interface GuessInputProps {
  guess: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isFocused: boolean;
  setIsFocused: (isFocused: boolean) => void;
  register: any;
  shake?: boolean;
}

const GuessInput = ({
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

interface GuessFeedbackProps {
  feedback: string;
  placeholderWord: string;
}

const GuessFeedback = ({ feedback, placeholderWord }: GuessFeedbackProps) => (
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

interface Feedback {
  guess: string;
  socketId: string;
}

export default function Page() {
  const { register, handleSubmit, setValue } = useForm();
  const [isFocused, setIsFocused] = useState(false);
  const [guess, setGuess] = useState("");
  const [guessesRemaining, setGuessesRemaining] = useState(5);
  const [guessed, setGuessed] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [invalidGuess, setInvalidGuess] = useState(false);
  const [guessedMessage, setGuessedMessage] = useState<string>("");
  const socketId = useRef<string>();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (/^[A-Za-z]*$/.test(value)) {
        setGuess(value);
        setValue("guess", value);
        setInvalidGuess(false);
      }
    },
    [setValue]
  );

  const onSubmit = useCallback(() => {
    if (guess.length < 5) {
      setInvalidGuess(true);
      return;
    }

    socket.emit("guess", {
      guess,
      word: placeholderWord,
      socketId: socketId.current,
    });

    setGuess("");
    setIsFocused(true);
    setGuessesRemaining((prev) => prev - 1);
  }, [guess]);

  useEffect(() => {
    if (socket.connected) {
      socketId.current = socket.id;
    } else {
      socket.connect();
    }

    socket.on("connect", () => {
      socketId.current = socket.id;

      socket.on("guessed", (player) => {
        if (!socketId.current) return;
        if (player === socketId.current) {
          setGuessedMessage("You guessed the word!");
        } else {
          setGuessedMessage(`${player} guessed the word!`);
        }

        setGuessed(true);
      });

      socket.on("joined", ({ socketFeedbacks }) => {
        if (!socketId.current) return;
        const ownedFeedbacks = socketFeedbacks[socketId.current];
        console.log("joined", ownedFeedbacks);
        setFeedbacks(ownedFeedbacks || []);
      });

      socket.on("word-guess", (socketFeedbacks, tries) => {
        if (!socketId.current) return;
        const ownedFeedbacks = socketFeedbacks[socketId.current];
        console.log("guess", socketId.current, ownedFeedbacks, socketFeedbacks);
        setFeedbacks(ownedFeedbacks || []);
      });

      socket.on("reseted", () => {
        setGuessed(false);
        setGuessesRemaining(5);
        setFeedbacks([]);
        setGuessedMessage("");
      });
    });

    socket.emit("join");

    return () => {
      socket.off("connect");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    setValue("guess", guess);
  }, [guess, setValue]);

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-background relative">
      <span></span>

      <div className="max-w-md w-full px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <header className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              Guess the Word
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Guess the random word and learn its definition.
            </p>
          </header>

          <div className="bg-card rounded-lg border p-6 space-y-6">
            <form
              className="relative flex flex-col gap-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              {feedbacks.length > 0 &&
                feedbacks.map((feedback, index) => (
                  <GuessFeedback
                    key={index}
                    feedback={feedback.guess}
                    placeholderWord={placeholderWord}
                  />
                ))}

              {guessesRemaining > 0 && !guessed && (
                <GuessInput
                  guess={guess}
                  handleChange={handleChange}
                  isFocused={isFocused}
                  setIsFocused={setIsFocused}
                  register={register}
                  shake={invalidGuess}
                />
              )}

              {guessesRemaining > 0 && !guessed && (
                <div className="flex items-center justify-between">
                  <Button
                    type="submit"
                    className="disabled:cursor-not-allowed"
                    disabled={guessesRemaining === 0 || guessed}
                  >
                    Submit Guess
                  </Button>
                  <div className="text-muted-foreground">
                    Guesses remaining:{" "}
                    <span className="font-bold">{guessesRemaining}</span>
                  </div>
                </div>
              )}

              {guessed && (
                <div className="flex items-center justify-center text-center text-emerald-800 font-bold">
                  {guessedMessage}
                </div>
              )}

              {guessesRemaining === 0 && !guessed && (
                <div className="flex flex-col items-center justify-center text-red-800 font-bold">
                  <span>You ran out of guesses :&lt;</span>
                </div>
              )}
            </form>
          </div>
          {guessed && (
            <Button className="w-full" onClick={() => socket.emit("reset")}>
              Restart
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
