
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image_url: "",
  });

  // Mengambil kategori dari database
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil kategori");
        }

        setCategories(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingCategories(false);
      }
    }

    fetchCategories();
  }, []);

  // Mengubah nilai input
  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Mengirim data produk ke API
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.price ||
      !formData.stock ||
      !formData.category_id ||
      !formData.image_url.trim()
    ) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/seller/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menambahkan produk");
      }

      alert("Produk berhasil ditambahkan!");

      router.push("/seller/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">

        {/* HEADER */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/seller/products")}
            className="font-medium text-blue-600 hover:underline"
          >
            ← Kembali ke Produk Saya
          </button>

          <h1 className="mt-6 text-3xl font-bold text-gray-800">
            Tambah Produk
          </h1>

          <p className="mt-2 text-gray-500">
            Lengkapi informasi produk yang ingin Anda jual.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm md:p-8"
        >

          {/* NAMA PRODUK */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nama Produk
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Kalkulator Scientific"
              maxLength={150}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* DESKRIPSI */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Deskripsi Produk
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Jelaskan informasi produk..."
              rows={4}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* KATEGORI */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Kategori
            </label>

            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              disabled={loadingCategories || categories.length === 0}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">
                {loadingCategories
                  ? "Memuat kategori..."
                  : categories.length === 0
                    ? "Kategori tidak tersedia"
                    : "Pilih kategori"}
              </option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* HARGA */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Harga Produk (Rupiah)
            </label>

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Contoh: 150000"
              min="1"
              step="0.01"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* STOK */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Jumlah Stok
            </label>

            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Contoh: 10"
              min="0"
              step="1"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* GAMBAR */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              URL Gambar Produk
            </label>

            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://contoh.com/gambar.jpg"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <p className="mt-2 text-xs text-gray-500">
              Masukkan alamat gambar yang dapat diakses melalui internet.
            </p>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* BUTTON */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/seller/products")}
              className="w-full rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving || loadingCategories || categories.length === 0}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Tambah Produk"}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}
