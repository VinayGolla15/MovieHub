import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { loginId, password } = await request.json(); // loginId can be email or username

    if (!loginId || !password) {
      return NextResponse.json(
        { error: "Username/Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const foundUsers = await db
      .select()
      .from(users)
      .where(or(eq(users.username, loginId), eq(users.email, loginId)));

    if (foundUsers.length === 0) {
      return NextResponse.json({ error: "Invalid username, email or password" }, { status: 401 });
    }

    const user = foundUsers[0];

    // Verify password
    const isPasswordMatch = comparePassword(password, user.passwordHash);
    if (!isPasswordMatch) {
      return NextResponse.json({ error: "Invalid username, email or password" }, { status: 401 });
    }

    // Sign JWT
    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });

    // Set cookie
    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message || "An error occurred during login" }, { status: 500 });
  }
}
