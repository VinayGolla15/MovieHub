import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters long" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(or(eq(users.username, username), eq(users.email, email)));

    if (existingUsers.length > 0) {
      const exists = existingUsers[0];
      if (exists.email.toLowerCase() === email.toLowerCase()) {
        return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
      }
      return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
    }

    // Create user
    const hashed = hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        passwordHash: hashed,
        role: "user",
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
      })
      .returning();

    // Create token
    const token = signToken({
      userId: newUser.id,
      username: newUser.username,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl,
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
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "An error occurred during registration" }, { status: 500 });
  }
}
