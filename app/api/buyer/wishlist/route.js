
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

// GET: Mengambil Wishlist milik Buyer
export async function GET() {
  try {
    const user = await requireRole(["buyer"]);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak. Silakan login sebagai Buyer.",
        },
        { status: 403 }
      );
    }

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.image_url,
        c.name AS category_name,
        s.name AS store_name,
        w.created_at AS wishlist_date
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN stores s ON p.store_id = s.id
      WHERE w.user_id = $1
        AND p.status = 'active'
      ORDER BY w.created_at DESC
      `,
      [user.userId]
    );

    return NextResponse.json({
      success: true,
      message: "Wishlist berhasil diambil.",
      data: result.rows,
    });

  } catch (error) {
    console.error("Error mengambil Wishlist:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil Wishlist.",
      },
      { status: 500 }
    );
  }
}

// POST: Menambahkan produk ke Wishlist
export async function POST(request) {
  try {
    const user = await requireRole(["buyer"]);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak. Silakan login sebagai Buyer.",
        },
        { status: 403 }
      );
    }

    const { product_id } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID produk wajib diisi.",
        },
        { status: 400 }
      );
    }

    const product = await pool.query(
      `
      SELECT id
      FROM products
      WHERE id = $1
        AND status = 'active'
      `,
      [product_id]
    );

    if (product.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Produk tidak ditemukan atau sudah tidak tersedia.",
        },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `
      INSERT INTO wishlists (user_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, product_id) DO NOTHING
      RETURNING user_id, product_id
      `,
      [user.userId, product_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Produk sudah ada di Wishlist.",
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil ditambahkan ke Wishlist.",
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error menambahkan Wishlist:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan produk ke Wishlist.",
      },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus produk dari Wishlist
export async function DELETE(request) {
  try {
    const user = await requireRole(["buyer"]);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak. Silakan login sebagai Buyer.",
        },
        { status: 403 }
      );
    }

    const { product_id } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID produk wajib diisi.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      DELETE FROM wishlists
      WHERE user_id = $1
        AND product_id = $2
      RETURNING product_id
      `,
      [user.userId, product_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Produk tidak ditemukan di Wishlist.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus dari Wishlist.",
    });

  } catch (error) {
    console.error("Error menghapus Wishlist:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus produk dari Wishlist.",
      },
      { status: 500 }
    );
  }
}
