
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value));
  }

  function formatTanggal(value) {
    return new Date(value).toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  }

  function statusLabel(status) {
    const labels = {
      pending: "Menunggu Konfirmasi",
      processing: "Sedang Diproses",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    };

    return labels[status] || status;
  }

  function statusStyle(status) {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      processing: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };

    return styles[status] || "bg-gray-100 text-gray-700";
  }

  async function fetchOrders() {
    try {
      setLoading(true);

      const response = await fetch("/api/buyer/orders");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal mengambil riwayat pesanan."
        );
      }

      setOrders(result.data || []);
      setError("");
    } catch (error) {
      console.error("Error mengambil pesanan:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/buyer"
            className="text-2xl font-bold text-blue-700"
          >
            KampusMart
          </Link>

          <div className="flex gap-6 text-sm font-medium text-gray-600">
            <Link href="/buyer" className="hover:text-blue-600">
              Beranda
            </Link>

            <Link href="/buyer/cart" className="hover:text-blue-600">
              Keranjang
            </Link>

            <Link href="/buyer/orders" className="text-blue-600">
              Pesanan
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Riwayat Pesanan
        </h1>

        <p className="text-gray-500 mb-8">
          Lihat daftar pesanan dan perkembangan status pembelian Anda.
        </p>

        {loading ? (
          <div className="bg-white rounded-xl p-10 text-center">
            <p className="text-gray-500">
              Memuat riwayat pesanan...
            </p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-red-600">{error}</p>

            <button
              onClick={fetchOrders}
              className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
              Coba Lagi
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">
              Belum Ada Pesanan
            </h2>

            <p className="text-gray-500 mt-2">
              Pesanan yang berhasil dibuat akan muncul di halaman ini.
            </p>

            <Link
              href="/buyer"
              className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                {/* Informasi Pesanan */}
                <div className="flex flex-wrap justify-between gap-4 border-b border-gray-100 pb-5">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {order.store_name}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      {formatTanggal(order.created_at)}
                    </p>
                  </div>

                  <span
                    className={`h-fit px-3 py-2 rounded-lg text-sm font-semibold ${statusStyle(
                      order.status
                    )}`}
                  >
                    {statusLabel(order.status)}
                  </span>
                </div>

                {/* Daftar Produk */}
                <div className="py-5 space-y-4">
                  {order.items?.map((item, index) => (
                    <div
                      key={`${order.id}-${item.product_id || index}`}
                      className="flex justify-between gap-4"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.product_name}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          {formatRupiah(item.price)} × {item.quantity}
                        </p>
                      </div>

                      <p className="font-semibold text-gray-800 whitespace-nowrap">
                        {formatRupiah(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Alamat dan Total */}
                <div className="border-t border-gray-100 pt-5">
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold text-gray-800">
                      Alamat Pengiriman
                    </p>

                    <p className="mt-1">{order.recipient_name}</p>
                    <p>{order.phone}</p>
                    <p>{order.shipping_address}</p>
                  </div>

                  <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-100">
                    <span className="font-semibold text-gray-700">
                      Total Pesanan
                    </span>

                    <span className="text-xl font-bold text-blue-700">
                      {formatRupiah(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
