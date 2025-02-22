import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({
        status: 400,
        message: "Email is required.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json({
        status: 404,
        message: "User not found.",
      });
    }

    // Update the user's token balance
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: {
        tokenBalance: user.tokenBalance + 10,
      },
    });

    return NextResponse.json({
      status: 200,
      message: "Tokens updated successfully.",
      tokenBalance: updatedUser.tokenBalance,
    });
  } catch (e) {
    console.error("Token update failed:", e);
    return NextResponse.json({
      status: 500,
      message: "An unexpected error occurred. Please try again.",
    });
  }
}
