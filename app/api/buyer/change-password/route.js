
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function PATCH(request) {
  try {
    // Memastikan pengguna adalah Buyer yang sudah login
    const user = await requireRole(["buyer"]);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      old_password,
      new_password,
      confirm_password,
    } = body;

    // Memeriksa semua input
    if (!old_password || !new_password || !confirm_password) {
      return NextResponse.json(
        {
          success: false,
          message: "Semua field password wajib diisi.",
        },
        { status: 400 }
      );
    }

    // Memeriksa panjang password baru
    if (new_password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password baru minimal 8 karakter.",
        },
        { status: 400 }
      );
    }

    // Memastikan konfirmasi password sesuai
    if (new_password !== confirm_password) {
      return NextResponse.json(
        {
          success: false,
          message: "Konfirmasi password tidak sesuai.",
        },
        { status: 400 }
      );
    }

    // Mengambil password lama dari database
    const result = await pool.query(
      `
      SELECT password_hash
      FROM users
      WHERE id = $1 AND role = 'buyer'
      `,
      [user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Akun Buyer tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // Memverifikasi password lama
    const passwordMatch = await bcrypt.compare(
      old_password,
      result.rows[0].password_hash
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Password lama yang dimasukkan salah.",
        },
        { status: 400 }
      );
    }

    // Menghindari penggunaan password lama sebagai password baru
    if (old_password === new_password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password baru harus berbeda dari password lama.",
        },
        { status: 400 }
      );
    }

    // Mengenkripsi password baru menggunakan bcrypt
    const newPasswordHash = await bcrypt.hash(new_password, 10);

    // Memperbarui password di database
    await pool.query(
      `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2 AND role = 'buyer'
      `,
      [newPasswordHash, user.userId]
    );

    return NextResponse.json({
      success: true,
      message: "Password berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Error mengubah password:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengubah password.",
      },
      { status: 500 }
    );
  }
}
