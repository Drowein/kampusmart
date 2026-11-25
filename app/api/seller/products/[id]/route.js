
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

// AMBIL DETAIL PRODUK
export async function GET(request, { params }) {
  try {
    const user = await requireRole(["seller"]);

    if (!user || user.sellerStatus !== "approved") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const storeResult = await pool.query(
      "SELECT id FROM stores WHERE user_id = $1",
      [user.userId]
    );

    if (storeResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Toko tidak ditemukan." },
        { status: 404 }
      );
    }

    const storeId = storeResult.rows[0].id;

    const result = await pool.query(
      `SELECT
         p.id,
         p.name,
         p.description,
         p.price,
         p.stock,
         p.category_id,
         p.image_url,
         p.status,
         c.name AS category_name
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1 AND p.store_id = $2`,
      [id, storeId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("GET PRODUCT DETAIL ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// EDIT PRODUK
export async function PATCH(request, { params }) {
  try {
    const user = await requireRole(["seller"]);

    if (!user || user.sellerStatus !== "approved") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const {
      name,
      description,
      price,
      stock,
      category_id,
      image_url,
    } = await request.json();

    if (
      !name?.trim() ||
      !description?.trim() ||
      !category_id ||
      !image_url?.trim() ||
      price === "" ||
      stock === ""
    ) {
      return NextResponse.json(
        { success: false, message: "Semua kolom wajib diisi." },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return NextResponse.json(
        { success: false, message: "Harga harus lebih dari 0." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      return NextResponse.json(
        { success: false, message: "Stok harus berupa bilangan bulat dan tidak boleh negatif." },
        { status: 400 }
      );
    }

    // Mengambil toko milik seller yang sedang login
    const storeResult = await pool.query(
      "SELECT id FROM stores WHERE user_id = $1",
      [user.userId]
    );

    if (storeResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Toko tidak ditemukan." },
        { status: 404 }
      );
    }

    const storeId = storeResult.rows[0].id;

    // Memastikan kategori tersedia
    const categoryResult = await pool.query(
      "SELECT id FROM categories WHERE id = $1",
      [category_id]
    );

    if (categoryResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan." },
        { status: 404 }
      );
    }

    // Memperbarui produk hanya jika produk milik toko seller
    const result = await pool.query(
      `UPDATE products
       SET name = $1,
           description = $2,
           price = $3,
           stock = $4,
           category_id = $5,
           image_url = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND store_id = $8
       RETURNING *`,
      [
        name.trim(),
        description.trim(),
        numericPrice,
        numericStock,
        category_id,
        image_url.trim(),
        id,
        storeId,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Produk berhasil diperbarui.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("EDIT PRODUCT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// HAPUS PRODUK
export async function DELETE(request, { params }) {
  try {
    const user = await requireRole(["seller"]);

    if (!user || user.sellerStatus !== "approved") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak." },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Mengambil toko milik seller
    const storeResult = await pool.query(
      "SELECT id FROM stores WHERE user_id = $1",
      [user.userId]
    );

    if (storeResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Toko tidak ditemukan." },
        { status: 404 }
      );
    }

    const storeId = storeResult.rows[0].id;

    // Menghapus produk hanya jika produk milik toko seller
    const result = await pool.query(
      `DELETE FROM products
       WHERE id = $1 AND store_id = $2
       RETURNING id`,
      [id, storeId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
