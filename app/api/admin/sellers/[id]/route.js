
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function PATCH(request, { params }) {
  let client;
  let transactionStarted = false;

  try {
    // 1. Memeriksa hak akses Admin
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

    // 2. Mengambil ID Seller dari URL
    const { id } = await params;

    // 3. Mengambil status baru dari request
    const body = await request.json();
    const { seller_status } = body;

    // 4. Memvalidasi status
    if (!["approved", "rejected"].includes(seller_status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status hanya boleh approved atau rejected.",
        },
        { status: 400 }
      );
    }

    // 5. Menghubungkan API ke database
    client = await pool.connect();

    // 6. Memulai transaksi
    await client.query("BEGIN");
    transactionStarted = true;

    // 7. Mengambil data Seller dan mengunci barisnya
    const sellerResult = await client.query(
      `SELECT id, name, role, seller_status
       FROM users
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    if (sellerResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message: "Seller tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const seller = sellerResult.rows[0];

    // 8. Memastikan pengguna adalah Seller pending
    if (
      seller.role !== "seller" ||
      seller.seller_status !== "pending"
    ) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message: "Pengguna bukan Seller yang menunggu persetujuan.",
        },
        { status: 400 }
      );
    }

    // 9. Memperbarui status Seller
    const updateResult = await client.query(
      `UPDATE users
       SET seller_status = $1
       WHERE id = $2
       RETURNING id, name, email, role, seller_status`,
      [seller_status, id]
    );

    // 10. Membuat toko otomatis jika Seller disetujui
    if (seller_status === "approved") {
      await client.query(
        `INSERT INTO stores (user_id, name)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO NOTHING`,
        [seller.id, `Toko ${seller.name}`]
      );
    }

    // 11. Menyelesaikan transaksi
    await client.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json(
      {
        success: true,
        message:
          seller_status === "approved"
            ? "Seller berhasil disetujui dan toko berhasil disiapkan."
            : "Seller berhasil ditolak.",
        data: updateResult.rows[0],
      },
      { status: 200 }
    );

  } catch (error) {
    // Membatalkan transaksi jika terjadi kesalahan
    if (client && transactionStarted) {
      await client.query("ROLLBACK");
    }

    console.error("Update seller status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memperbarui status Seller.",
      },
      { status: 500 }
    );

  } finally {
    if (client) {
      client.release();
    }
  }
}
