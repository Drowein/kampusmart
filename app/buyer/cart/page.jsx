
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BuyerCartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  }

  async function fetchCart() {
    try {
      setLoading(true);

      const response = await fetch("/api/buyer/cart");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil keranjang.");
      }

      setCartItems(result.data || []);
      setError("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCart();
  }, []);


  async function handleQuantityChange(productId, newQuantity) {
    const item = cartItems.find(
        (item) => item.product_id === productId
    );

    if (!item) return;

    if (newQuantity < 1) return;

    if (newQuantity > item.stock) {
        alert(`Stok produk hanya tersedia ${item.stock}.`);
        return;
    }

    try {
        const response = await fetch("/api/buyer/cart", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: newQuantity,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Gagal mengubah jumlah produk.");
            return;
        }

        setCartItems((currentItems) =>
            currentItems.map((item) =>
                item.product_id === productId
                ? {
                    ...item,
                    quantity: newQuantity,
                    subtotal: Number(item.price) * newQuantity,
                    }
                : item
            )
        );
    } catch (error) {
        console.error("Error mengubah jumlah produk:", error);
        alert("Terjadi kesalahan saat mengubah jumlah produk.");
    }
  }

  async function handleRemove(productId) {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus produk ini dari keranjang?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/buyer/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Gagal menghapus produk.");
        return;
      }

      setCartItems((currentItems) =>
        currentItems.filter((item) => item.product_id !== productId)
      );

      alert("Produk berhasil dihapus dari keranjang.");
    } catch (error) {
      console.error("Error menghapus produk:", error);
      alert("Terjadi kesalahan saat menghapus produk.");
    }
  }

  const totalBelanja = cartItems.reduce(
    (total, item) => total + Number(item.subtotal),
    0
  );

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/buyer" className="text-2xl font-bold text-blue-700">
            KampusMart
          </Link>

          <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/buyer" className="hover:text-blue-600">
              Beranda
            </Link>

            <Link href="/buyer/wishlist" className="hover:text-blue-600">
              Wishlist
            </Link>

            <Link href="/buyer/cart" className="text-blue-700">
              Keranjang
            </Link>

            <Link href="/buyer/orders" className="hover:text-blue-600">
              Pesanan
            </Link>

            <Link href="/buyer/settings" className="hover:text-blue-600">
              Pengaturan
            </Link>
          </div>
        </div>
      </nav>

      {/* Konten */}
      <section className="max-w-7xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Keranjang Belanja
          </h1>

          <p className="text-gray-500 mt-2">
            Periksa produk yang ingin Anda beli.
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-500">
            Memuat keranjang...
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl p-10 text-center">
            <p className="text-red-600">{error}</p>

            <button
              onClick={fetchCart}
              className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              Coba Lagi
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">🛒</div>

            <h2 className="text-xl font-semibold text-gray-800">
              Keranjang Anda masih kosong
            </h2>

            <p className="text-gray-500 mt-2">
              Silakan pilih produk yang ingin Anda beli.
            </p>

            <Link
              href="/buyer"
              className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Daftar Produk */}
            <div className="lg:col-span-2 space-y-4">

              {cartItems.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="bg-white rounded-xl shadow-sm p-5 flex flex-col sm:flex-row gap-5"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full sm:w-32 h-32 object-cover rounded-lg bg-gray-100"
                  />

                  <div className="flex-1">
                    <p className="text-sm text-blue-600">
                      {item.category_name}
                    </p>

                    <h2 className="text-lg font-semibold text-gray-800 mt-1">
                      {item.name}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Toko: {item.store_name}
                    </p>

                    <p className="text-blue-700 font-semibold mt-3">
                      {formatRupiah(item.price)}
                    </p>

                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">
                            Jumlah Produk
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                            onClick={() =>
                                handleQuantityChange(
                                item.product_id,
                                Number(item.quantity) - 1
                                )
                            }
                            disabled={Number(item.quantity) <= 1}
                            className="w-8 h-8 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                            −
                            </button>

                            <span className="font-semibold text-gray-800 min-w-6 text-center">
                            {item.quantity}
                            </span>

                            <button
                            onClick={() =>
                                handleQuantityChange(
                                item.product_id,
                                Number(item.quantity) + 1
                                )
                            }
                            disabled={
                                Number(item.quantity) >= Number(item.stock) ||
                                item.status !== "active"
                            }
                            className="w-8 h-8 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                            +
                            </button>
                        </div>

                        <p className="text-sm font-semibold text-gray-800 mt-1">
                          Subtotal: {formatRupiah(item.subtotal)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemove(item.product_id)}
                        className="text-red-600 text-sm font-medium hover:text-red-800"
                      >
                        Hapus
                      </button>
                    </div>

                    {item.status !== "active" || item.stock <= 0 ? (
                      <p className="text-red-600 text-sm mt-3">
                        Produk sedang tidak tersedia.
                      </p>
                    ) : item.quantity > item.stock ? (
                      <p className="text-red-600 text-sm mt-3">
                        Jumlah produk melebihi stok yang tersedia.
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}

            </div>

            {/* Ringkasan Belanja */}
            <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
              <h2 className="text-xl font-bold text-gray-800">
                Ringkasan Belanja
              </h2>

              <div className="flex justify-between mt-6 text-gray-600">
                <span>Total produk</span>
                <span>{cartItems.reduce((total, item) => total + Number(item.quantity), 0)}</span>
              </div>

              <div className="border-t border-gray-200 my-5"></div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">
                  Total Belanja
                </span>

                <span className="text-xl font-bold text-blue-700">
                  {formatRupiah(totalBelanja)}
                </span>
              </div>

              <button
                disabled
                className="w-full mt-6 bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed"
              >
                Lanjut ke Pembayaran
              </button>

              <button
                onClick={() => {
                  window.location.href = "/buyer/checkout";
                }}
                disabled={cartItems.length === 0}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Lanjut ke Checkout
              </button>

              <Link
                href="/buyer"
                className="block text-center text-blue-600 hover:text-blue-800 mt-5 text-sm font-medium"
              >
                ← Lanjut Belanja
              </Link>
            </div>

          </div>
        )}
      </section>
    </main>
  );
}
