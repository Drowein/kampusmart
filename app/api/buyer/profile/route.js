
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

// Mengambil informasi profil Buyer
export async function GET() {
  try {
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

    const result = await pool.query(
      `
      SELECT id, name, email
      FROM users
      WHERE id = $1 AND role = 'buyer'
      `,
      [user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Profil Buyer tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diambil.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error mengambil profil:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil profil.",
      },
      { status: 500 }
    );
  }
}

// Mengubah nama Buyer
export async function PATCH(request) {
  try {
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
    const { name } = body;

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama tidak boleh kosong.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      UPDATE users
      SET name = $1
      WHERE id = $2 AND role = 'buyer'
      RETURNING id, name, email
      `,
      [name.trim(), user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Profil Buyer tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Nama profil berhasil diperbarui.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error mengubah profil:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengubah profil.",
      },
      { status: 500 }
    );
  }
}
