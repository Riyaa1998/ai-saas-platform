import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

// A simple cache for userId to avoid auth() calls
export const cachedUserId = {
  _value: null as string | null,
  set: function(userId: string) {
    this._value = userId;
  },
  get: function() {
    return this._value;
  },
  clear: function() {
    this._value = null;
  }
};

export const getAuthSession = (req: NextRequest) => {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return null;
  }
  
  // Store userId in cache
  cachedUserId.set(userId);
  
  return { userId };
}; 