"use server";

import prisma from "@/lib/db";
import * as z from "zod";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  ChangeImageSchema,
  rateBusinessSchema,
  reviewFormSchema,
  updateBusinessSchema,
} from "@/schema/zodSchema";
import { BusinessFilters } from "@/types/types";

export async function getBusinessById(id: string) {
  try {
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        products: true,
        ratings: true,
        reviews: true,
      },
    });
    return business;
  } catch (error) {
    console.error("Error getting business:", error);
    return { error: "Something went wrong" };
  }
}

export async function getBusinessByUserId() {
  try {
    const user = await currentUser();
    const business = await prisma.business.findFirst({
      where: { userId: user?.id },
    });

    return business?.id;
  } catch (error) {
    console.error("Error getting user business:", error);
    return { error: "Something went wrong" };
  }
}

export async function getBusiness(
  query: string = "",
  filters: BusinessFilters = {}
) {
  try {
    const { category, address } = filters; // Destructure filters

    const business = await prisma.business.findMany({
      include: {
        products: {
          orderBy: {
            createdAt: "desc",
          },
        },
        category: true,
      },
      orderBy: {
        products: {
          _count: "desc",
        },
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
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
        ...(category && {
          category: {
            name: {
              equals: category, // Use category name for filtering
            },
          },
        }),
        ...(address && {
          address: {
            contains: address,
            mode: "insensitive",
          },
        }),
      },
    });

    return business;
  } catch (error) {
    console.error("Error getting business:", error);
    return { error: "Something went wrong" };
  }
}

export async function updateBusiness(
  values: z.infer<typeof updateBusinessSchema>
) {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    const updaterId = await prisma.business.findUnique({
      where: { id: values.businessId },
      select: { userId: true },
    });

    if (user.id !== updaterId?.userId) {
      return { error: "You are not authorized to update this business" };
    }

    const parsedValues = updateBusinessSchema.safeParse(values);
    if (!parsedValues.success) {
      return { error: parsedValues.error.errors };
    }

    const {
      businessId,
      name,
      tagline,
      description,
      address,
      hours,
      location,
      phone,
      website,
    } = parsedValues.data;

    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        name,
        tagline,
        description,
        address,
        hours,
        location,
        phone,
        website,
      },
    });

    revalidatePath("/dashboard/business");
    return { success: "Business updated successfully", business };
  } catch (error) {
    console.error("Error updating business:", error);
    return { error: "Something went wrong" };
  }
}

export async function rateBusiness(
  values: z.infer<typeof rateBusinessSchema>,
  businessId: string
) {
  try {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    const parsedValues = rateBusinessSchema.safeParse(values);
    if (!parsedValues.success) {
      return { error: parsedValues.error.errors };
    }

    const { rating } = parsedValues.data;

    const ratingArray = await prisma.rating.upsert({
      where: {
        userId_businessId: {
          userId: user.id,
          businessId: businessId,
        },
      },
      create: {
        rating,
        userId: user.id,
        businessId: businessId,
      },
      update: {
        rating,
      },
    });

    revalidatePath(`/dashboard/business/${businessId}`);

    return { success: "Rating updated", ratingArray };
  } catch (error) {
    console.error("Error rating business:", error);
    return { error: "Failed to rate business" };
  }
}

export async function reviewBusiness(
  values: z.infer<typeof reviewFormSchema>,
  businessId: string,
  senderImg: string | undefined,
  senderName: string
) {
  try {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    const parsedValues = reviewFormSchema.safeParse(values);
    if (!parsedValues.success) {
      return { error: parsedValues.error.errors };
    }

    if (!businessId) return { error: "No business" };
    if (!senderImg) return { error: "No sender image" };

    const { review } = parsedValues.data;

    const reviewArray = await prisma.review.create({
      data: {
        comment: review,
        userId: user.id,
        businessId: businessId,
        senderImg,
        senderName,
      },
    });

    revalidatePath(`/dashboard/business/${businessId}`);

    return { success: "Review updated", reviewArray };
  } catch (error) {
    console.error("Error rating business:", error);
    return { error: "Failed to rate business" };
  }
}

export async function changeImage(
  values: z.infer<typeof ChangeImageSchema>,
  businessId: string
) {
  try {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };
    if (!businessId) return { error: "No business" };

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) return { error: "No business" };

    if (user.id !== business.userId) return { error: "Unauthorized" };

    const parsedValues = ChangeImageSchema.safeParse(values);
    if (!parsedValues.success) {
      return { error: parsedValues.error.errors };
    }

    const { imageUrl } = parsedValues.data;

    await prisma.business.update({
      where: { id: businessId },
      data: { imageUrl },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { image: imageUrl },
    });

    revalidatePath(`/dashboard/business/${businessId}`); // Revalidate the business page to reflect the updated image

    return { success: "Profile updated" };
  } catch (error) {
    console.error("Error rating business:", error);
    return { error: "Failed to rate business" };
  }
}
