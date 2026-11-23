
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${id}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Produk tidak ditemukan");
        }

        setProduct(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat detail produk...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">
            Produk tidak ditemukan
          </h1>

          <p className="text-gray-500 mt-3">{error}</p>

          <button
            onClick={() => router.push("/products")}
            className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            Kembali ke katalog
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.push("/products")}
          className="text-blue-600 hover:underline mb-6"
        >
          ← Kembali ke katalog
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Gambar Produk */}
          <div className="bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center min-h-[300px]">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-8xl">📦</div>
            )}
          </div>

          {/* Informasi Produk */}
          <div>
            <p className="text-sm text-blue-600 font-medium">
              {product.category_name}
            </p>

            <h1 className="text-3xl font-bold text-gray-800 mt-2">
              {product.name}
            </h1>

            <p className="text-3xl font-bold text-blue-600 mt-6">
              {Number(product.price).toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              })}
            </p>

            <div className="mt-6 border-t border-b py-4">
              <p className="text-gray-600">
                Stok tersedia:{" "}
                <span className="font-semibold text-gray-800">
                  {product.stock}
            </span>
              </p>

              <p className="text-gray-600 mt-2">
                Toko:{" "}
                <span className="font-semibold text-gray-800">
                  {product.store_name}
                </span>
              </p>
            </div>

            <div className="mt-6">
              <h2 className="font-semibold text-lg text-gray-800">
                Deskripsi Produk
              </h2>

              <p className="text-gray-600 mt-2 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <button
              onClick={() => router.push("/login")}
              className="w-full mt-8 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Login untuk membeli
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
