
"use client";

import { useEffect, useState } from "react";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchWishlist() {
    try {
      setLoading(true);

      const response = await fetch("/api/buyer/wishlist");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil Wishlist.");
      }

      setWishlist(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWishlist();
  }, []);

  async function handleRemove(productId) {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus produk ini dari Wishlist?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/buyer/wishlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus Wishlist.");
      }

      setWishlist((previous) =>
        previous.filter((product) => product.id !== productId)
      );
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">

          <a
            href="/buyer"
            className="text-2xl font-bold text-blue-700"
          >
            KampusMart
          </a>

          <div className="flex items-center gap-6">
            <a
              href="/buyer"
              className="text-gray-600 hover:text-blue-700"
            >
              Beranda
            </a>

            <a
              href="/buyer/wishlist"
              className="font-semibold text-blue-700"
            >
              Wishlist
            </a>

            <a
              href="/buyer/cart"
              className="text-gray-600 hover:text-blue-700"
            >
              Keranjang
            </a>

            <a
              href="/buyer/orders"
              className="text-gray-600 hover:text-blue-700"
            >
              Pesanan
            </a>
          </div>

          <button
            onClick={() => {
              window.location.href = "/api/logout";
            }}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Logout
          </button>

        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Judul */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Wishlist Saya
          </h1>

          <p className="mt-2 text-gray-500">
            Produk yang kamu simpan sebagai favorit.
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl bg-white py-16 text-center text-gray-500">
            Memuat Wishlist...
          </div>

        ) : error ? (
          <div className="rounded-xl bg-white py-16 text-center text-red-500">
            {error}
          </div>

        ) : wishlist.length === 0 ? (

          /* Wishlist Kosong */
          <div className="rounded-xl bg-white px-6 py-16 text-center shadow-sm">
            <div className="mb-4 text-6xl text-pink-400">
              ♡
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              Wishlist Kamu Masih Kosong
            </h2>

            <p className="mt-2 text-gray-500">
              Yuk, temukan produk yang kamu sukai dan simpan di sini.
            </p>

            <a
              href="/buyer"
              className="mt-6 inline-block rounded-lg bg-blue-700 px-6 py-3 font-medium text-white hover:bg-blue-800"
            >
              Jelajahi Produk
            </a>
          </div>

        ) : (

          /* Daftar Wishlist */
          <>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Produk Favorit
              </h2>

              <span className="text-sm text-gray-500">
                {wishlist.length} produk tersimpan
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

              {wishlist.map((product) => (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* Gambar Produk */}
                  <div className="h-48 bg-gray-100">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Informasi Produk */}
                  <div className="p-4">

                    <p className="mb-1 text-xs text-blue-600">
                      {product.category_name}
                    </p>

                    <h3 className="min-h-12 font-semibold text-gray-800">
                      {product.name}
                    </h3>

                    <p className="mt-2 text-lg font-bold text-blue-700">
                      Rp{Number(product.price).toLocaleString("id-ID")}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {product.store_name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {product.stock > 0
                        ? `Stok: ${product.stock}`
                        : "Stok Habis"}
                    </p>

                    {/* Tombol Hapus Wishlist */}
                    <div className="mt-4 flex items-center justify-between border-t pt-3">

                      <span className="text-sm text-gray-500">
                        Tersimpan
                      </span>

                      <button
                        onClick={() => handleRemove(product.id)}
                        title="Hapus dari Wishlist"
                        aria-label="Hapus dari Wishlist"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-pink-200 text-2xl text-pink-600 transition hover:bg-pink-50"
                      >
                        ♥
                      </button>

                    </div>

                  </div>
                </div>
              ))}

            </div>
          </>
        )}

      </div>
    </main>
  );
}
