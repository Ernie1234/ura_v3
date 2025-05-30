"use server";

import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export const getAllUsers = async (query: string = "") => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    const userMsg = await prisma.user.findMany({
      include: {
        sentMessages: true,
        receivedMessages: true,
      },
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    return userMsg;
  } catch (error) {
    console.log(error);
    return { error: "Something went wrong" };
  }
};
