import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = userSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    });

    return new NextResponse("User created successfully", { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 