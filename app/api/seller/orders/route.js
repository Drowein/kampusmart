
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

// GET: Mengambil pesanan yang masuk ke toko Seller
export async function GET() {
  try {
    const user = await requireRole(["seller"]);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda harus login sebagai Seller.",
        },
        { status: 401 }
      );
    }

    if (user.sellerStatus !== "approved") {
      return NextResponse.json(
        {
          success: false,
          message: "Akun Seller belum disetujui.",
        },
        { status: 403 }
      );
    }

    // Mengambil toko milik Seller
    const storeResult = await pool.query(
      "SELECT id FROM stores WHERE user_id = $1",
      [user.userId]
    );

    if (storeResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Toko Anda belum tersedia.",
        },
        { status: 404 }
      );
    }

    const storeId = storeResult.rows[0].id;

    // Mengambil pesanan beserta detail produknya
    const result = await pool.query(
      `
      SELECT
        o.id,
        o.buyer_id,
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
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.store_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
      `,
      [storeId]
    );

    return NextResponse.json({
      success: true,
      message: "Pesanan Seller berhasil diambil.",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error mengambil pesanan Seller:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil pesanan.",
      },
      { status: 500 }
    );
  }
}

// PATCH: Mengubah status pesanan Seller
export async function PATCH(request) {
  try {
    const user = await requireRole(["seller"]);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda harus login sebagai Seller.",
        },
        { status: 401 }
      );
    }

    if (user.sellerStatus !== "approved") {
      return NextResponse.json(
        {
          success: false,
          message: "Akun Seller belum disetujui.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { order_id, status } = body;

    if (!order_id || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "ID pesanan dan status wajib diisi.",
        },
        { status: 400 }
      );
    }

    // Mengambil toko milik Seller
    const storeResult = await pool.query(
      "SELECT id FROM stores WHERE user_id = $1",
      [user.userId]
    );

    if (storeResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Toko Anda belum tersedia.",
        },
        { status: 404 }
      );
    }

    const storeId = storeResult.rows[0].id;

    // Mengambil status pesanan saat ini
    const orderResult = await pool.query(
      `
      SELECT id, status
      FROM orders
      WHERE id = $1 AND store_id = $2
      `,
      [order_id, storeId]
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Pesanan tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const currentStatus = orderResult.rows[0].status;

    // Menentukan perubahan status yang diperbolehkan
    const allowedTransitions = {
      pending: "processing",
      processing: "completed",
    };

    if (allowedTransitions[currentStatus] !== status) {
      return NextResponse.json(
        {
          success: false,
          message: "Perubahan status pesanan tidak diperbolehkan.",
        },
        { status: 400 }
      );
    }

    // Memperbarui status hanya jika status sebelumnya masih sesuai
    const updateResult = await pool.query(
      `
      UPDATE orders
      SET status = $1
      WHERE id = $2
        AND store_id = $3
        AND status = $4
      RETURNING id, status
      `,
      [status, order_id, storeId, currentStatus]
    );

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Status pesanan sudah berubah. Silakan muat ulang.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Status pesanan berhasil diperbarui.",
      data: updateResult.rows[0],
    });
  } catch (error) {
    console.error("Error mengubah status pesanan:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengubah status pesanan.",
      },
      { status: 500 }
    );
  }
}
