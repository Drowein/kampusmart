
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

// Mengambil semua alamat milik Buyer
export async function GET() {
  try {
    const user = await requireRole(["buyer"]);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak.",
        },
        { status: 403 }
      );
    }

    const result = await pool.query(
      `
      SELECT
        id,
        recipient_name,
        phone,
        full_address,
        is_default,
        created_at
      FROM addresses
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC
      `,
      [user.userId]
    );

    return NextResponse.json({
      success: true,
      message: "Alamat berhasil diambil.",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error mengambil alamat:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil alamat.",
      },
      { status: 500 }
    );
  }
}

// Menambahkan alamat baru
export async function POST(request) {
  const client = await pool.connect();

  try {
    const user = await requireRole(["buyer"]);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      recipient_name,
      phone,
      full_address,
      is_default,
    } = body;

    if (
      !recipient_name?.trim() ||
      !phone?.trim() ||
      !full_address?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Semua informasi alamat wajib diisi.",
        },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const existingAddress = await client.query(
      `
      SELECT id
      FROM addresses
      WHERE user_id = $1
      `,
      [user.userId]
    );

    const shouldBeDefault =
      is_default === true || existingAddress.rows.length === 0;

    if (shouldBeDefault) {
      await client.query(
        `
        UPDATE addresses
        SET is_default = FALSE
        WHERE user_id = $1
        `,
        [user.userId]
      );
    }

    const result = await client.query(
      `
      INSERT INTO addresses (
        user_id,
        recipient_name,
        phone,
        full_address,
        is_default
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        user.userId,
        recipient_name.trim(),
        phone.trim(),
        full_address.trim(),
        shouldBeDefault,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Alamat berhasil ditambahkan.",
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error menambahkan alamat:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menambahkan alamat.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}


// Mengedit alamat atau menjadikannya alamat utama
export async function PATCH(request) {
  const client = await pool.connect();

  try {
    const user = await requireRole(["buyer"]);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      id,
      recipient_name,
      phone,
      full_address,
      is_default,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID alamat wajib diisi.",
        },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const existing = await client.query(
      `
      SELECT *
      FROM addresses
      WHERE id = $1 AND user_id = $2
      FOR UPDATE
      `,
      [id, user.userId]
    );

    if (existing.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Alamat tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const oldAddress = existing.rows[0];

    const newRecipientName =
      recipient_name !== undefined
        ? recipient_name.trim()
        : oldAddress.recipient_name;

    const newPhone =
      phone !== undefined
        ? phone.trim()
        : oldAddress.phone;

    const newFullAddress =
      full_address !== undefined
        ? full_address.trim()
        : oldAddress.full_address;

    if (!newRecipientName || !newPhone || !newFullAddress) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Informasi alamat tidak boleh kosong.",
        },
        { status: 400 }
      );
    }

    if (is_default === true) {
      await client.query(
        `
        UPDATE addresses
        SET is_default = FALSE
        WHERE user_id = $1
        `,
        [user.userId]
      );
    }

    const result = await client.query(
      `
      UPDATE addresses
      SET
        recipient_name = $1,
        phone = $2,
        full_address = $3,
        is_default = $4
      WHERE id = $5 AND user_id = $6
      RETURNING *
      `,
      [
        newRecipientName,
        newPhone,
        newFullAddress,
        is_default === true ? true : oldAddress.is_default,
        id,
        user.userId,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Alamat berhasil diperbarui.",
      data: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error mengedit alamat:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengedit alamat.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// Menghapus alamat
export async function DELETE(request) {
  const client = await pool.connect();

  try {
    const user = await requireRole(["buyer"]);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID alamat wajib diisi.",
        },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const existing = await client.query(
      `
      SELECT *
      FROM addresses
      WHERE id = $1 AND user_id = $2
      FOR UPDATE
      `,
      [id, user.userId]
    );

    if (existing.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Alamat tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const wasDefault = existing.rows[0].is_default;

    await client.query(
      `
      DELETE FROM addresses
      WHERE id = $1 AND user_id = $2
      `,
      [id, user.userId]
    );

    // Jika alamat utama dihapus, pilih alamat terbaru sebagai penggantinya
    if (wasDefault) {
      await client.query(
        `
        UPDATE addresses
        SET is_default = TRUE
        WHERE id = (
          SELECT id
          FROM addresses
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 1
        )
        `,
        [user.userId]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Alamat berhasil dihapus.",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error menghapus alamat:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menghapus alamat.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
