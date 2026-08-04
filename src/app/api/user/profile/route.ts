import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { getCurrentUser, hashPassword, signToken } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username, email, avatarUrl, password } = body;

    if (!username || !email) {
      return NextResponse.json({ error: "Username and email are required" }, { status: 400 });
    }

    // Verify uniqueness for other users
    const existingUsername = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), ne(users.id, user.id)));

    if (existingUsername.length > 0) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
    }

    const existingEmail = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), ne(users.id, user.id)));

    if (existingEmail.length > 0) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    // Build update object
    const updateData: any = {
      username,
      email,
      avatarUrl: avatarUrl || user.avatarUrl,
    };

    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }
      updateData.passwordHash = hashPassword(password);
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning();

    // Re-sign cookie with updated details
    const token = signToken({
      userId: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
      },
    });

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
