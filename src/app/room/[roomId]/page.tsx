"use client";

import { socket } from "@/app/socket";
import { Button } from "@/components/ui/button";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Room() {
  const { roomId } = useParams();
  const [room, setRoom] = useState<any>({});

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onRoomDetail(room: any) {
      setRoom(room);
    }

    function onConnect() {
      socket.emit("get-room-detail", roomId);
      socket.on("room-detail", onRoomDetail);
    }

    socket.on("connect", onConnect);
    socket.on("game-started", ({ word }) => {
      console.log("Game started with word:", word);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("player-joined", () => {});
      socket.off("game-started", () => {});
    };
  }, [roomId]);

  useEffect(() => {
    return () => {};
  }, [roomId]);

  return (
    <div>
      <p>Room ID: {roomId}</p>
      <p>Room Name: {room.name}</p>
      <p>Users:</p>
      <ul>
        {room.users?.map((user: any) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      {room.users && room.users.length == 2 && (
        <Button
          onClick={() => {
            socket.emit("start-game", roomId);
          }}
        >
          Start game
        </Button>
      )}
    </div>
  );
}
