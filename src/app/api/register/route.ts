import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const exist = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (exist) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: "SCHOLAR", // Defaults to Scholar on public registration
      },
    });

    return NextResponse.json({ id: user.id, email: user.email, role: user.role });
  } catch (error: any) {
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
