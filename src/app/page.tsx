"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";
import { socket } from "./socket";
import { useForm } from "react-hook-form";
import { GuessFeedback } from "@/components/custom/guess-feedback";
import { GuessInput } from "@/components/custom/guess-input";
import { cn } from "@/lib/utils";

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
  const [isReadyModalOpen, setIsReadyModalOpen] = useState(true);
  const [playersWaiting, setPlayersWaiting] = useState(0);
  const [roomSize, setRoomSize] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [word, setWord] = useState<string>("");
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

  const handleGetReady = useCallback(() => {
    setIsReady((prev) => !prev);
    socket.emit("ready", socket.id);
  }, []);

  const onSubmit = useCallback(() => {
    if (guess.length < 5) {
      setInvalidGuess(true);
      return;
    }

    socket.emit("guess", {
      guess,
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
          setGuessedMessage("Você adivinhou! 🎉");
        } else {
          setGuessedMessage(`Adivinharam a palavra antes de você! 😢`);
        }

        setGuessed(true);
      });

      socket.on(
        "joined",
        (
          socketFeedbacks,
          socketGuessed,
          socketPlayersReady,
          socketRoomSize
        ) => {
          if (!socketId.current) return;
          const ownedFeedbacks = socketFeedbacks[socketId.current];

          if (socketGuessed) {
            setGuessed(true);
            setGuessedMessage(`Adivinharam a palavra antes de você! 😢`);
          }

          setFeedbacks(ownedFeedbacks || []);
          setPlayersWaiting(socketPlayersReady);
          setRoomSize(socketRoomSize);
        }
      );

      socket.on("word-guess", (socketFeedbacks) => {
        if (!socketId.current) return;
        const ownedFeedbacks = socketFeedbacks[socketId.current];

        setFeedbacks(ownedFeedbacks || []);
      });

      socket.on("start", (socketWord) => {
        setWord(socketWord);
        setIsReadyModalOpen(false);
      });

      socket.on("ready", (socketPlayersReady) => {
        setPlayersWaiting(socketPlayersReady);
      });

      socket.on("reseted", () => {
        setGuessed(false);
        setGuessesRemaining(5);
        setFeedbacks([]);
        setGuessedMessage("");
      });

      socket.emit("join");
    });

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
      {isReadyModalOpen && (
        <ReadyModal
          playersWaiting={roomSize}
          playersReady={playersWaiting}
          handleGetReady={handleGetReady}
          isReady={isReady}
        />
      )}

      <div className="max-w-md w-full px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <header className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              AlphaBattle
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Seja o primeiro a adivinhar a palavra!
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
                    placeholderWord={word}
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
                  <div className="text-muted-foreground">
                    Tentativas restantes:{" "}
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
                  <span>Acabaram suas tentativas :&lt;</span>
                </div>
              )}
            </form>
          </div>
          {guessed && (
            <Button className="w-full" onClick={() => socket.emit("reset")}>
              Reiniciar
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}

interface ReadyModalProps {
  playersWaiting?: number;
  playersReady?: number;
  isReady: boolean;
  handleGetReady: () => void;
}

export const ReadyModal = ({
  playersWaiting,
  playersReady,
  handleGetReady,
  isReady,
}: ReadyModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 h-screen w-full flex items-center justify-center">
      <div className="bg-card rounded-lg p-6 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          Está pronto para jogar?
        </h1>

        <p className="text-muted-foreground">
          {playersReady}/{playersWaiting} - jogadores esperando para jogar
        </p>
        <Button
          onClick={handleGetReady}
          className={cn([
            "w-full",
            isReady
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600",
          ])}
        >
          {isReady ? "Cancelar" : "Estou pronto"}
        </Button>
      </div>
    </div>
  );
};
