
"use client";

import { useEffect, useState } from "react";

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/seller/products");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil produk");
      }

      setProducts(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);
  // MENGHAPUS PRODUK
  async function handleDelete(id, name) {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus produk "${name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/seller/products/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus produk.");
      }

      alert("Produk berhasil dihapus!");

      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  }

  const formatPrice = (price) => {
    return Number(price).toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8">
            <a href="/seller" className="font-bold text-blue-600">
                ← Dashboard Seller
            </a>

            <h1 className="mt-6 text-3xl font-bold text-gray-800">
                Produk Saya
            </h1>

            <p className="mt-2 text-gray-500">
                Kelola produk yang dijual di toko Anda.
            </p>

            <a
                href="/seller/products/new"
                className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
                + Tambah Produk
            </a>
        </div>

        {/* TOTAL PRODUK */}
        {!loading && !error && (
          <div className="mb-6 rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              Total produk saya
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-800">
              {products.length} produk
            </p>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="py-20 text-center">
            <p className="text-gray-500">
              Memuat produk Anda...
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-red-600">{error}</p>

            <button
              onClick={fetchProducts}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* EMPTY DATA */}
        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border bg-white px-6 py-20 text-center">
            <div className="text-6xl">📦</div>

            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              Anda belum memiliki produk
            </h2>

            <p className="mt-2 text-gray-500">
              Produk yang Anda tambahkan nantinya akan ditampilkan di sini.
            </p>
          </div>
        )}

        {/* PRODUCT LIST */}
        {!loading && !error && products.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border bg-white">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-100 text-sm text-gray-600">
                <tr>
                  <th className="px-5 py-4">Produk</th>
                  <th className="px-5 py-4">Kategori</th>
                  <th className="px-5 py-4">Harga</th>
                  <th className="px-5 py-4">Stok</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-2xl">
                              📦
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-medium text-gray-800">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            ID: {product.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {product.category_name}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-800">
                      {formatPrice(product.price)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {product.stock}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          product.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.status === "active"
                          ? "Aktif"
                          : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {/* TOMBOL EDIT */}
                        <a
                          href={`/seller/products/${product.id}/edit`}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                          Edit
                        </a>

                        {/* TOMBOL HAPUS */}
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* BACK BUTTON */}
        <div className="mt-8">
          <a
            href="/seller"
            className="inline-block rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-white"
          >
            Kembali ke Dashboard
          </a>
        </div>

      </div>
    </main>
  );
}
