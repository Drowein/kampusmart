
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SellerOrdersPage() {
  const router = useRouter();

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

      const response = await fetch("/api/seller/orders");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal mengambil pesanan."
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

  async function handleUpdateStatus(orderId, newStatus) {
    const action =
      newStatus === "processing"
        ? "menerima pesanan ini"
        : "menyelesaikan pesanan ini";

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin ${action}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/seller/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: orderId,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal memperbarui status pesanan."
        );
      }

      alert(result.message);

      await fetchOrders();
    } catch (error) {
      console.error("Error mengubah status pesanan:", error);
      alert(error.message);
    }
  }


  useEffect(() => {
    fetchOrders();
  }, []);

  function handleLogout() {
    window.location.href = "/api/logout";
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              KampusMart
            </h1>

            <p className="text-sm text-gray-500">
              Seller Dashboard
            </p>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => router.push("/seller")}
              className="text-gray-600 hover:text-blue-600"
            >
              Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Pesanan Masuk
            </h2>

            <p className="text-gray-600 mt-2">
              Lihat pesanan yang dibuat oleh pembeli di toko Anda.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold disabled:bg-gray-300"
          >
            {loading ? "Memuat..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-10 text-center">
            Memuat pesanan...
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
            <h3 className="text-xl font-semibold text-gray-800">
              Belum Ada Pesanan
            </h3>

            <p className="text-gray-500 mt-2">
              Pesanan dari pembeli akan muncul di halaman ini.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
              >
                {/* Informasi Pesanan */}
                <div className="flex flex-wrap justify-between gap-4 border-b border-gray-100 pb-5">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Pesanan #{String(order.id).slice(0, 8)}
                    </h3>

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

                {/* Produk */}
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

                {/* Informasi Pembeli */}
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="font-semibold text-gray-800">
                    Informasi Pengiriman
                  </h4>

                  <p className="text-sm text-gray-600 mt-2">
                    {order.recipient_name}
                  </p>

                  <p className="text-sm text-gray-600">
                    {order.phone}
                  </p>

                  <p className="text-sm text-gray-600">
                    {order.shipping_address}
                  </p>
                </div>

                
                <div className="flex justify-between items-center border-t border-gray-100 mt-5 pt-5">
                <span className="font-semibold text-gray-700">
                    Total Pesanan
                </span>

                <span className="text-xl font-bold text-blue-700">
                    {formatRupiah(order.total_amount)}
                </span>
                </div>

                {/* Tombol Aksi Pesanan */}
                {order.status === "pending" && (
                <div className="mt-5 flex justify-end">
                    <button
                    onClick={() =>
                        handleUpdateStatus(order.id, "processing")
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold"
                    >
                    Terima Pesanan
                    </button>
                </div>
                )}

                {order.status === "processing" && (
                <div className="mt-5 flex justify-end">
                    <button
                    onClick={() =>
                        handleUpdateStatus(order.id, "completed")
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold"
                    >
                    Selesaikan Pesanan
                    </button>
                </div>
                )}

              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
