"use client";

import Image from "next/image";
import { Separator } from "../ui/separator";
import { useRouter } from "next/navigation";

export interface MessageCardProps {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
    sentMessages: {
      id: string;
      content: string;
      sentAt: Date;
    }[];
    receivedMessages: {
      id: string;
      content: string;
      sentAt: Date;
    }[];
  };
}

const MessageCard = ({ user }: MessageCardProps) => {
  const router = useRouter();
  return (
    <>
      <div
        className="flex w-full gap-3 items-center md:items-start hover:bg-slate-100 p-1 md:p-4 rounded-lg cursor-pointer"
        onClick={() => {
          router.push(`/messages/${user.id}`);
        }}
      >
        <Image
          src={user.image || "/placeholder.jpg"}
          alt={user.name || "User"}
          className="rounded-full md:w-12 h-8 md:h-12 w-8 md:object-fill"
          width={40}
          height={40}
        />
        <div className="md:flex flex-col hidden">
          <h3>{user.name || "Anonymous"}</h3>
          <p className="truncate">{user.email}</p>
        </div>
      </div>
      <Separator className="hidden md:block" />
    </>
  );
};

export default MessageCard;
