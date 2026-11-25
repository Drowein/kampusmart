
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function POST(request) {
  let client;
  let transactionStarted = false;

  try {
    // 1. Memastikan pengguna adalah Buyer
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

    // 2. Mengambil alamat pengiriman dari request
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

    const { address_id } = body;

    if (!address_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Alamat pengiriman wajib dipilih.",
        },
        { status: 400 }
      );
    }

    client = await pool.connect();

    // 3. Memulai transaksi
    await client.query("BEGIN");
    transactionStarted = true;

    // 4. Memastikan alamat milik Buyer yang sedang login
    const addressResult = await client.query(
      `
      SELECT
        id,
        recipient_name,
        phone,
        full_address
      FROM addresses
      WHERE id = $1
        AND user_id = $2
      FOR UPDATE
      `,
      [address_id, user.userId]
    );

    if (addressResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message: "Alamat pengiriman tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const address = addressResult.rows[0];

    // 5. Mengunci keranjang Buyer
    const cartResult = await client.query(
      `
      SELECT id
      FROM carts
      WHERE user_id = $1
      FOR UPDATE
      `,
      [user.userId]
    );

    if (cartResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message: "Keranjang Buyer tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const cartId = cartResult.rows[0].id;

    // 6. Mengambil produk dan mengunci barisnya
    const cartItemsResult = await client.query(
      `
      SELECT
        ci.id AS cart_item_id,
        ci.quantity,
        p.id AS product_id,
        p.store_id,
        p.name,
        p.price,
        p.stock,
        p.status
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      ORDER BY p.id
      FOR UPDATE OF ci, p
      `,
      [cartId]
    );

    const cartItems = cartItemsResult.rows;

    if (cartItems.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message: "Keranjang Anda masih kosong.",
        },
        { status: 400 }
      );
    }

    // 7. Memvalidasi stok dan status semua produk
    for (const item of cartItems) {
      if (item.status !== "active") {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return NextResponse.json(
          {
            success: false,
            message: `Produk ${item.name} sudah tidak tersedia.`,
          },
          { status: 400 }
        );
      }

      if (Number(item.stock) < Number(item.quantity)) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return NextResponse.json(
          {
            success: false,
            message: `Stok produk ${item.name} tidak mencukupi. Stok tersedia: ${item.stock}.`,
          },
          { status: 400 }
        );
      }
    }

    // 8. Mengelompokkan produk berdasarkan toko
    const storeGroups = {};

    for (const item of cartItems) {
      if (!storeGroups[item.store_id]) {
        storeGroups[item.store_id] = [];
      }

      storeGroups[item.store_id].push(item);
    }

    const createdOrders = [];

    // 9. Membuat pesanan untuk setiap toko
    for (const [storeId, items] of Object.entries(storeGroups)) {
      const orderResult = await client.query(
        `
        INSERT INTO orders (
          buyer_id,
          store_id,
          address_id,
          recipient_name,
          phone,
          shipping_address,
          total_amount,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 0, 'pending')
        RETURNING id, status
        `,
        [
          user.userId,
          storeId,
          address.id,
          address.recipient_name,
          address.phone,
          address.full_address,
        ]
      );

      const order = orderResult.rows[0];

      // 10. Menyimpan detail produk pesanan
      for (const item of items) {
        await client.query(
          `
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            price,
            quantity,
            subtotal
          )
          VALUES ($1, $2, $3, $4, $5, $4::numeric * $5::integer)
          `,
          [
            order.id,
            item.product_id,
            item.name,
            item.price,
            item.quantity,
          ]
        );

        // 11. Mengurangi stok produk
        await client.query(
          `
          UPDATE products
          SET stock = stock - $1
          WHERE id = $2
          `,
          [item.quantity, item.product_id]
        );
      }

      // 12. Menghitung total pesanan dari detailnya
      const totalResult = await client.query(
        `
        UPDATE orders
        SET total_amount = (
          SELECT COALESCE(SUM(subtotal), 0)
          FROM order_items
          WHERE order_id = $1
        )
        WHERE id = $1
        RETURNING total_amount
        `,
        [order.id]
      );

      createdOrders.push({
        order_id: order.id,
        store_id: storeId,
        total_amount: totalResult.rows[0].total_amount,
        status: order.status,
      });
    }

    // 13. Mengosongkan keranjang setelah semua pesanan berhasil
    await client.query(
      `
      DELETE FROM cart_items
      WHERE cart_id = $1
      `,
      [cartId]
    );

    // 14. Menyelesaikan transaksi
    await client.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json(
      {
        success: true,
        message: "Pesanan berhasil dibuat.",
        data: {
          total_orders: createdOrders.length,
          orders: createdOrders,
        },
      },
      { status: 201 }
    );

  
  } catch (error) {
    if (transactionStarted && client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Error rollback:", rollbackError);
      }
    }

    console.error("Error checkout:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat membuat pesanan.",
        debug:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
        code:
          process.env.NODE_ENV === "development"
            ? error.code
            : undefined,
      },
      { status: 500 }
    );

  } finally {
    if (client) {
      client.release();
    }
  }
}
