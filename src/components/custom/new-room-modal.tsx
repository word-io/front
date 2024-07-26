"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { useEffect } from "react";
import { socket } from "@/app/socket";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

interface NewRoomModalProps {
  children: React.ReactNode;
}

interface FormData {
  roomName: string;
}

export function NewRoomModal({ children }: NewRoomModalProps) {
  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm<FormData>();
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (data.roomName) {
      if (!socket.connected) {
        socket.connect();
      }

      socket.emit("join-room", { roomId: data.roomName });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Room</DialogTitle>
          <DialogDescription>
            Choose a name for your room and the number of players.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              placeholder="Enter room name"
              className="col-span-3"
              {...register("roomName", { required: true })}
            />
          </div>
          <Button type="submit">Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
