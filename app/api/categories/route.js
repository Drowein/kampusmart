import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT * FROM categories ORDER BY name ASC"
    );

    return NextResponse.json({
      success: true,
      message: "Data kategori berhasil diambil",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error mengambil kategori:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data kategori",
      },
      { status: 500 }
    );
  }
}