// pages/Page.js

"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { socket } from "./socket";
import { useForm } from "react-hook-form";
import { GuessFeedback } from "@/components/custom/guess-feedback";
import { GuessInput } from "@/components/custom/guess-input";
import { ReadyModal } from "@/components/custom/ready-modal";
import { Hint } from "@/components/custom/hint";
import Confetti from "react-confetti";

interface Feedback {
  guess: string;
  socketId: string;
}

export default function Page() {
  const { register, handleSubmit, setValue } = useForm();
  const [isFocused, setIsFocused] = useState(false);
  const [invalidGuess, setInvalidGuess] = useState(false);
  const [guess, setGuess] = useState("");
  const [guessesRemaining, setGuessesRemaining] = useState(5);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [guessedMessage, setGuessedMessage] = useState<string>("");
  const [isReadyModalOpen, setIsReadyModalOpen] = useState(true);
  const [playersReady, setPlayersReady] = useState(0);
  const [playersWaiting, setPlayersWaiting] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [word, setWord] = useState<string>("");
  const [hint, setHint] = useState<string>("");

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
      socketId: socket.id,
    });

    setGuess("");
    setIsFocused(true);
    setGuessesRemaining((prev) => prev - 1);
  }, [guess]);

  useEffect(() => {
    const handleGuessed = (playerId: string) => {
      if (playerId === socket.id) {
        setGuessedMessage("Você adivinhou! 🎉");
        setShowConfetti(true);
      } else {
        setGuessedMessage(`Adivinharam a palavra antes de você! 😢`);
      }
    };

    const handleJoined = (
      socketFeedbacks: Record<string, Feedback[]>,
      socketGuessed: boolean,
      socketPlayersReady: number,
      socketRoomSize: number
    ) => {
      if (!socket.id) return;
      const ownedFeedbacks = socketFeedbacks[socket.id];

      if (socketGuessed) {
        setGuessedMessage(`Adivinharam a palavra antes de você! 😢`);
      }

      setFeedbacks(ownedFeedbacks || []);
      setPlayersReady(socketPlayersReady);
      setPlayersWaiting(socketRoomSize);
    };

    const handleGuess = (socketFeedbacks: Record<string, Feedback[]>) => {
      if (!socket.id) return;
      const ownedFeedbacks = socketFeedbacks[socket.id];
      setFeedbacks(ownedFeedbacks || []);
    };

    const handleGameStart = (socketWord: string) => {
      setWord(socketWord);
      setIsReadyModalOpen(false);
    };

    const handleGameRestart = () => {
      setHint("");
      setGuessedMessage("");
      setGuessesRemaining(5);
      setFeedbacks([]);
      setGuessedMessage("");
    };

    const handleSetHint = (hint: string) => {
      setHint(hint);
    };

    const handlePlayersReady = (socketPlayersReady: number) => {
      setPlayersReady(socketPlayersReady);
    };

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      socket.on("guessed", handleGuessed);
      socket.on("joined", handleJoined);
      socket.on("word-guess", handleGuess);
      socket.on("start", handleGameStart);
      socket.on("hint", handleSetHint);
      socket.on("ready", handlePlayersReady);
      socket.on("reseted", handleGameRestart);
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
          playersWaiting={playersWaiting}
          playersReady={playersReady}
          handleGetReady={handleGetReady}
          isReady={isReady}
        />
      )}

      {showConfetti && <Confetti />}

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
            {hint && <Hint hint={hint} />}

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

              {guessesRemaining > 0 && !guessedMessage && (
                <GuessInput
                  guess={guess}
                  handleChange={handleChange}
                  isFocused={isFocused}
                  setIsFocused={setIsFocused}
                  register={register}
                  shake={invalidGuess}
                />
              )}

              {guessesRemaining > 0 && !guessedMessage && (
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground">
                    Tentativas restantes:{" "}
                    <span className="font-bold">{guessesRemaining}</span>
                  </div>
                </div>
              )}

              {guessedMessage && (
                <div className="flex items-center justify-center text-center text-emerald-800 font-bold">
                  {guessedMessage}
                </div>
              )}

              {guessesRemaining === 0 && !guessedMessage && (
                <div className="flex flex-col items-center justify-center text-red-800 font-bold">
                  <span>Acabaram suas tentativas :&lt;</span>
                </div>
              )}
            </form>
          </div>

          {guessedMessage && (
            <Button className="w-full" onClick={() => socket.emit("reset")}>
              Reiniciar
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
