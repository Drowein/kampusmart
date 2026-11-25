
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

// GET: Mengambil riwayat pesanan Buyer
export async function GET() {
  try {
    const user = await requireRole(["buyer"]);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak. Silakan login sebagai Buyer.",
        },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `
      SELECT
        o.id,
        o.store_id,
        s.name AS store_name,
        o.recipient_name,
        o.phone,
        o.shipping_address,
        o.total_amount,
        o.status,
        o.created_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'product_id', oi.product_id,
              'product_name', oi.product_name,
              'price', oi.price,
              'quantity', oi.quantity,
              'subtotal', oi.subtotal
            )
            ORDER BY oi.product_name
          ) FILTER (WHERE oi.order_id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM orders o
      JOIN stores s ON o.store_id = s.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.buyer_id = $1
      GROUP BY o.id, s.name
      ORDER BY o.created_at DESC
      `,
      [user.userId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error mengambil riwayat pesanan:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil riwayat pesanan.",
      },
      { status: 500 }
    );
  }
}
