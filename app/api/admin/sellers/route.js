
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET() {
  try {
    // 1. Memeriksa apakah pengguna adalah Admin
    const user = await requireRole(["admin"]);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses hanya untuk Admin.",
        },
        { status: 403 }
      );
    }

    // 2. Mengambil semua Seller yang menunggu persetujuan
    const result = await pool.query(
      `SELECT id, name, email, role, seller_status
       FROM users
       WHERE role = 'seller'
       AND seller_status = 'pending'
       ORDER BY name ASC`
    );

    // 3. Mengirim data Seller
    return NextResponse.json(
      {
        success: true,
        message: "Berhasil mengambil daftar Seller.",
        data: result.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get pending sellers error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil data Seller.",
      },
      { status: 500 }
    );
  }
}
