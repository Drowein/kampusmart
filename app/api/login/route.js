
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();

    const { email, password } = body;

    // 1. Validasi input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email dan password wajib diisi.",
        },
        { status: 400 }
      );
    }

    // 2. Cari user berdasarkan email
    const result = await pool.query(
      `SELECT id, name, email, password_hash, role, seller_status
       FROM users
       WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    // 3. Periksa apakah user ditemukan
    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau password salah.",
        },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // 4. Periksa password dengan bcrypt
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau password salah.",
        },
        { status: 401 }
      );
    }

    // 5. Membuat JWT
    const secret = new TextEncoder().encode(
      process.env.AUTH_SECRET
    );

    const token = await new SignJWT({
      userId: user.id,
      role: user.role,
      sellerStatus: user.seller_status,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(secret);

    // 6. Membuat response login berhasil
    const response = NextResponse.json(
      {
        success: true,
        message: "Login berhasil.",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          seller_status: user.seller_status,
        },
      },
      { status: 200 }
    );

    // 7. Menyimpan token di cookie
    response.cookies.set("kampusmart_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}
