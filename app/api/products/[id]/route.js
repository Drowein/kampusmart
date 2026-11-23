
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
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
      WHERE p.id = $1
        AND p.status = 'active'
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Produk tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Detail produk berhasil diambil",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error mengambil detail produk:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail produk",
      },
      { status: 500 }
    );
  }
}
