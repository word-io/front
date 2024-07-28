import { socket } from "@/app/socket";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

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
          disabled={!socket.connected}
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
