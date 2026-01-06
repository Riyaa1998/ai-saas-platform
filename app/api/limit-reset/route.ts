import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { resetApiLimit } from "@/lib/api-limit";

export async function GET(req: Request) {
  try {
    const session = getAuthSession(req as any);
    const userId = session?.userId;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Reset the API limit for the user
    await resetApiLimit();

    return NextResponse.json({ success: true, message: "API limit reset successfully" });
  } catch (error) {
    console.log("[LIMIT_RESET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 