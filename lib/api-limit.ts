import prisma from "./prismadb";
import { getAuth } from "@clerk/nextjs/server";
import { MAX_FREE_COUNTS } from "@/constants";

// Store the userId for API limit checks
let cachedUserId: string | null = null;

// Development bypass flag - set to true to bypass API limits in development
const BYPASS_API_LIMIT = true;

export async function getApiLimitCount(providedUserId?: string) {
  try {
    // Get userId from auth if not provided
    let userId = providedUserId;
    
    if (!userId) {
      if (cachedUserId) {
        userId = cachedUserId;
      } else {
        return 0; // Return 0 count if no user is authenticated
      }
    }

    const userApiLimit = await prisma.userApiLimit.findFirst({
      where: { userId: userId as string },
    });

    if (!userApiLimit) {
      return 0;
    }

    return userApiLimit.count;
  } catch (error) {
    console.error("[API_LIMIT_ERROR]", error);
    return 0; // Safely return 0 in case of errors
  }
}

export async function incrementApiLimit() {
  // Skip incrementing if in development bypass mode
  if (BYPASS_API_LIMIT) {
    console.log("DEVELOPMENT MODE: Skipping API limit increment");
    return;
  }

  if (!cachedUserId) {
    return;
  }

  const userApiLimit = await prisma.userApiLimit.findFirst({
    where: { userId: cachedUserId },
  });

  if (userApiLimit) {
    await prisma.userApiLimit.update({
      where: { id: userApiLimit.id },
      data: { count: userApiLimit.count + 1 },
    });
  } else {
    await prisma.userApiLimit.create({
      data: { 
        userId: cachedUserId,
        count: 1,
        id: cachedUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}

export async function checkApiLimit() {
  // Always return true in development bypass mode
  if (BYPASS_API_LIMIT) {
    console.log("DEVELOPMENT MODE: Bypassing API limit check");
    return true;
  }

  if (!cachedUserId) {
    return false;
  }

  const userApiLimit = await prisma.userApiLimit.findFirst({
    where: { userId: cachedUserId },
  });

  if (!userApiLimit) {
    return true;
  }

  return userApiLimit.count < MAX_FREE_COUNTS;
}

export async function resetApiLimit() {
  if (!cachedUserId) {
    return;
  }

  const userApiLimit = await prisma.userApiLimit.findFirst({
    where: { userId: cachedUserId },
  });

  if (userApiLimit) {
    await prisma.userApiLimit.update({
      where: { id: userApiLimit.id },
      data: { count: 0 },
    });
  }
}

// Function to set the cached userId for use in API limit functions
export function setUserId(userId: string) {
  cachedUserId = userId;
}
