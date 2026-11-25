
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

// GET: Mengambil produk milik seller yang login
export async function GET() {
  try {
    const user = await requireRole(["seller"]);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Anda harus login sebagai seller" },
        { status: 401 }
      );
    }

    if (user.sellerStatus !== "approved") {
      return NextResponse.json(
        { success: false, message: "Akun seller belum disetujui" },
        { status: 403 }
      );
    }

    const storeResult = await pool.query(
      "SELECT id FROM stores WHERE user_id = $1",
      [user.userId]
    );

    if (storeResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Toko Anda belum tersedia" },
        { status: 404 }
      );
    }

    const storeId = storeResult.rows[0].id;

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.image_url,
        p.status,
        p.created_at,
        c.name AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.store_id = $1
      ORDER BY p.created_at DESC
      `,
      [storeId]
    );

    return NextResponse.json({
      success: true,
      message: "Produk seller berhasil diambil",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error mengambil produk seller:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// POST: Menambahkan produk baru
export async function POST(request) {
  try {
    const user = await requireRole(["seller"]);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Anda harus login sebagai seller" },
        { status: 401 }
      );
    }

    if (user.sellerStatus !== "approved") {
      return NextResponse.json(
        { success: false, message: "Akun seller belum disetujui" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      name,
      description,
      price,
      stock,
      category_id,
      image_url,
    } = body;

    if (
      !name?.trim() ||
      !description?.trim() ||
      price === undefined ||
      stock === undefined ||
      !category_id ||
      !image_url?.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Semua field produk wajib diisi" },
        { status: 400 }
      );
    }

    const productPrice = Number(price);
    const productStock = Number(stock);

    if (!Number.isFinite(productPrice) || productPrice <= 0) {
      return NextResponse.json(
        { success: false, message: "Harga harus lebih dari 0" },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(productStock) ||
      productStock < 0
    ) {
      return NextResponse.json(
        { success: false, message: "Stok harus berupa bilangan bulat minimal 0" },
        { status: 400 }
      );
    }

    const storeResult = await pool.query(
      "SELECT id FROM stores WHERE user_id = $1",
      [user.userId]
    );

    if (storeResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Toko Anda belum tersedia" },
        { status: 404 }
      );
    }

    const storeId = storeResult.rows[0].id;

    const categoryResult = await pool.query(
      "SELECT id FROM categories WHERE id = $1",
      [category_id]
    );

    if (categoryResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      INSERT INTO products (
        store_id,
        category_id,
        name,
        description,
        price,
        stock,
        image_url,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
      RETURNING id, store_id, category_id, name, description, price, stock, image_url, status, created_at
      `,
      [
        storeId,
        category_id,
        name.trim(),
        description.trim(),
        productPrice,
        productStock,
        image_url.trim(),
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil ditambahkan",
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error menambahkan produk:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
