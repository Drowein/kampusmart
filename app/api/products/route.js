
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.image_url,
        p.created_at,
        c.name AS category_name,
        s.name AS store_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN stores s ON p.store_id = s.id
      WHERE p.status = 'active'
      ORDER BY p.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      message: "Data produk berhasil diambil",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error mengambil produk:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data produk",
      },
      { status: 500 }
    );
  }
}
