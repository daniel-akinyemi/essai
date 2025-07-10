import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName } = userSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return new NextResponse(JSON.stringify({ message: "User already exists" }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
      },
    });

    return new NextResponse(JSON.stringify({ message: "User created successfully" }), { status: 201 });
  } catch (error) {
    console.error('Registration error:', error); // Log the error for debugging
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({
          message: "Invalid request data",
          errors: error.errors // Return detailed Zod errors
        }),
        { status: 422 }
      );
    }
    return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
} 