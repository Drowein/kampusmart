
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

// GET: Mengambil isi keranjang Buyer
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
        ci.id AS cart_item_id,
        p.id AS product_id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.image_url,
        p.status,
        c.name AS category_name,
        s.name AS store_name,
        ci.quantity,
        (p.price * ci.quantity) AS subtotal
      FROM carts ca
      JOIN cart_items ci ON ca.id = ci.cart_id
      JOIN products p ON ci.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN stores s ON p.store_id = s.id
      WHERE ca.user_id = $1
      ORDER BY ci.id DESC
      `,
      [user.userId]
    );

    return NextResponse.json({
      success: true,
      message: "Keranjang berhasil diambil.",
      data: result.rows,
    });

  } catch (error) {
    console.error("Error mengambil keranjang:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data keranjang.",
      },
      { status: 500 }
    );
  }
}

// POST: Menambahkan produk ke keranjang
export async function POST(request) {
  const client = await pool.connect();

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

    await client.query("BEGIN");

    // Memeriksa produk dan mengunci baris selama transaksi
    const productResult = await client.query(
      `
      SELECT id, stock
      FROM products
      WHERE id = $1
        AND status = 'active'
      FOR UPDATE
      `,
      [product_id]
    );

    if (productResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Produk tidak ditemukan atau sudah tidak aktif.",
        },
        { status: 404 }
      );
    }

    const product = productResult.rows[0];

    if (product.stock <= 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Stok produk sedang habis.",
        },
        { status: 400 }
      );
    }

    // Mengambil keranjang milik Buyer
    const cartResult = await client.query(
      `
      SELECT id
      FROM carts
      WHERE user_id = $1
      `,
      [user.userId]
    );

    if (cartResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Keranjang Buyer tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const cartId = cartResult.rows[0].id;

    // Menambahkan produk atau menambah jumlah produk yang sudah ada
    const result = await client.query(
      `
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES ($1, $2, 1)
      ON CONFLICT (cart_id, product_id)
      DO UPDATE SET
        quantity = cart_items.quantity + 1
      WHERE cart_items.quantity < $3
      RETURNING id, quantity
      `,
      [cartId, product_id, product.stock]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Jumlah produk di keranjang sudah mencapai batas stok.",
        },
        { status: 400 }
      );
    }

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil ditambahkan ke keranjang.",
        data: result.rows[0],
      },
      { status: 201 }
    );

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error menambahkan ke keranjang:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan produk ke keranjang.",
      },
      { status: 500 }
    );

  } finally {
    client.release();
  }
}


export async function PATCH(request) {
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

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Format data tidak valid.",
      },
      { status: 400 }
    );
  }

  const { product_id, quantity } = body;

  if (!product_id || !Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json(
      {
        success: false,
        message: "ID produk atau jumlah produk tidak valid.",
      },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    const itemResult = await client.query(
      `
      SELECT
        ci.id,
        p.stock,
        p.status
      FROM cart_items ci
      JOIN carts ca ON ci.cart_id = ca.id
      JOIN products p ON ci.product_id = p.id
      WHERE ca.user_id = $1
        AND ci.product_id = $2
      FOR UPDATE OF ci, p
      `,
      [user.userId, product_id]
    );

    if (itemResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message: "Produk tidak ditemukan dalam keranjang.",
        },
        { status: 404 }
      );
    }

    const item = itemResult.rows[0];

    if (item.status !== "active" || item.stock <= 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message: "Produk sedang tidak tersedia.",
        },
        { status: 400 }
      );
    }

    if (quantity > item.stock) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message: `Jumlah melebihi stok yang tersedia (${item.stock}).`,
        },
        { status: 400 }
      );
    }

    await client.query(
      `
      UPDATE cart_items
      SET quantity = $1
      WHERE id = $2
      `,
      [quantity, item.id]
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json({
      success: true,
      message: "Jumlah produk berhasil diperbarui.",
    });
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }

    console.error("Error memperbarui keranjang:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memperbarui keranjang.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}


// DELETE: Menghapus produk dari keranjang
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
      DELETE FROM cart_items ci
      USING carts ca
      WHERE ci.cart_id = ca.id
        AND ca.user_id = $1
        AND ci.product_id = $2
      RETURNING ci.id
      `,
      [user.userId, product_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Produk tidak ditemukan di keranjang.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus dari keranjang.",
    });

  } catch (error) {
    console.error("Error menghapus produk dari keranjang:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus produk dari keranjang.",
      },
      { status: 500 }
    );
  }
}
