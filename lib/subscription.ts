import { currentUser } from "@clerk/nextjs/server";
import { cachedUserId } from "@/lib/auth";

import prismadb from "@/lib/prismadb";

const DAY_IN_MS = 86_400_000;

// Development bypass flag - set to true to allow all features without subscription
const BYPASS_SUBSCRIPTION_CHECK = true;

export const checkSubscription = async () => {
  try {
    // If bypass is enabled, always return true (as if user has subscription)
    if (BYPASS_SUBSCRIPTION_CHECK) {
      console.log("DEVELOPMENT MODE: Bypassing subscription check");
      return true;
    }

    // Try to get userId from cache first
    let userId = cachedUserId.get();
    
    // If not in cache, get it from auth
    if (!userId) {
      const user = await currentUser();
      userId = user?.id || null;
    }

    if (!userId) {
      console.log("checkSubscription: No userId, returning false");
      return false;
    }

    console.log("checkSubscription: userId", userId);

    // Ensure userId is a string for Prisma query
    if (typeof userId !== 'string') {
      console.log("checkSubscription: userId is not a string", typeof userId);
      return false;
    }

    try {
      const userSubscription = await prismadb.userSubscription.findUnique({
        where: {
          userId: userId,
        },
        select: {
          stripe_subscription_id: true,
          stripe_current_period_end: true,
          stripe_customer_id: true,
          stripe_price_id: true,
        },
      });

      if (!userSubscription) {
        console.log("checkSubscription: No subscription, returning false");
        return false;
      }

      console.log("checkSubscription: Subscription found", userSubscription);

      const isValid =
        userSubscription.stripe_price_id &&
        userSubscription.stripe_current_period_end &&
        userSubscription.stripe_current_period_end instanceof Date &&
        userSubscription.stripe_current_period_end.getTime() + DAY_IN_MS > Date.now();
      
      console.log("IsValid: ", isValid);

      return !!isValid;
    } catch (dbError) {
      console.error("Database error in checkSubscription:", dbError);
      return false;
    }
  } catch (error) {
    console.error("Error in checkSubscription:", error);
    return false;
  }
};
