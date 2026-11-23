
"use client";

import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
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

    fetchProducts();
  }, []);

  const formatPrice = (price) => {
    return Number(price).toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      {/* HEADER */}
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <a href="/" className="font-bold text-blue-600">
            ← KampusMart
          </a>

          <h1 className="mt-6 text-3xl font-bold">
            Katalog Produk
          </h1>

          <p className="mt-2 text-gray-500">
            Temukan berbagai kebutuhan kuliah dan mahasiswa.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="py-20 text-center">
            <p className="text-gray-500">Memuat produk...</p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
            {error}
          </div>
        )}

        {/* EMPTY DATA */}
        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border bg-white px-6 py-20 text-center">
            <div className="text-6xl">📦</div>

            <h2 className="mt-4 text-xl font-semibold">
              Belum ada produk
            </h2>

            <p className="mt-2 text-gray-500">
              Produk yang tersedia akan ditampilkan di sini.
            </p>
          </div>
        )}

        {/* PRODUCT LIST */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => window.location.href = `/products/${product.id}`}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-lg cursor-pointer"
              >
                {/* PRODUCT IMAGE */}
                <div className="flex h-52 items-center justify-center bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">📦</span>
                  )}
                </div>

                {/* PRODUCT INFO */}
                <div className="p-5">
                  <p className="text-sm text-blue-600">
                    {product.category_name}
                  </p>

                  <h2 className="mt-2 line-clamp-2 font-semibold">
                    {product.name}
                  </h2>

                  <p className="mt-3 text-lg font-bold">
                    {formatPrice(product.price)}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Toko: {product.store_name}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Stok: {product.stock}
                  </p>

                  <p className="mt-3 line-clamp-2 text-sm text-gray-500">
                    {product.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BACK TO HOME */}
        <div className="mt-12">
          <a
            href="/"
            className="inline-block rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-white"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    </main>
  );
}
