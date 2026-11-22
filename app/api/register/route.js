
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(request) {
  const client = await pool.connect();

  try {
    const body = await request.json();

    const { name, email, password, role } = body;

    // 1. Validasi input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "Semua field wajib diisi.",
        },
        { status: 400 }
      );
    }

    // 2. Validasi role
    if (!["buyer", "seller"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Role hanya boleh Buyer atau Seller.",
        },
        { status: 400 }
      );
    }

    // 3. Validasi format email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format email tidak valid.",
        },
        { status: 400 }
      );
    }

    // 4. Validasi panjang password
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password minimal 8 karakter.",
        },
        { status: 400 }
      );
    }

    // 5. Cek email yang sudah terdaftar
    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Email sudah terdaftar.",
        },
        { status: 409 }
      );
    }

    // 6. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 7. Memulai transaksi database
    await client.query("BEGIN");

    // 8. Menyimpan user
    const sellerStatus = role === "seller" ? "pending" : null;

    const userResult = await client.query(
      `INSERT INTO users
        (name, email, password_hash, role, seller_status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, seller_status`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        passwordHash,
        role,
        sellerStatus,
      ]
    );

    const user = userResult.rows[0];

    // 9. Buyer mendapatkan cart kosong otomatis
    if (role === "buyer") {
      await client.query(
        "INSERT INTO carts (user_id) VALUES ($1)",
        [user.id]
      );
    }

    // 10. Menyelesaikan transaksi
    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message:
          role === "seller"
            ? "Registrasi berhasil. Akun Seller menunggu persetujuan Admin."
            : "Registrasi Buyer berhasil.",
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    // Membatalkan transaksi jika terjadi kesalahan
    await client.query("ROLLBACK");

    console.error("Register error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat registrasi.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
