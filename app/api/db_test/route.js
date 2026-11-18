import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT NOW() AS waktu_sekarang"
    );

    return NextResponse.json({
      success: true,
      message: "Database berhasil terhubung!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Database gagal terhubung",
      },
      { status: 500 }
    );
  }
}