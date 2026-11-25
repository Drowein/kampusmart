
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();

  const productId = params.id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Mengambil kategori dan data produk
  useEffect(() => {
    async function fetchData() {
      try {
        const [categoryResponse, productResponse] =
          await Promise.all([
            fetch("/api/categories"),
            fetch(`/api/seller/products/${productId}`),
          ]);

        const categoryResult = await categoryResponse.json();
        const productResult = await productResponse.json();

        if (!categoryResponse.ok || !categoryResult.success) {
          throw new Error("Gagal mengambil kategori.");
        }

        if (!productResponse.ok || !productResult.success) {
          throw new Error(
            productResult.message || "Gagal mengambil data produk."
          );
        }

        setCategories(categoryResult.data);

        const product = productResult.data;

        setFormData({
          name: product.name,
          description: product.description,
          price: String(product.price),
          stock: String(product.stock),
          category_id: product.category_id,
          image_url: product.image_url,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchData();
    }
  }, [productId]);

  // Mengubah isi form
  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Menyimpan perubahan produk
  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/seller/products/${productId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memperbarui produk.");
      }

      alert("Produk berhasil diperbarui!");

      router.push("/seller/products");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Memuat data produk...
      </main>
    );
  }

  if (error && !formData.name) {
    return (
      <main className="min-h-screen p-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.push("/seller/products")}
          className="mt-4 bg-gray-800 text-white px-4 py-2 rounded-lg"
        >
          Kembali
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-2">
          Edit Produk
        </h1>

        <p className="text-gray-500 mb-6">
          Ubah informasi produk yang ingin diperbarui.
        </p>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium mb-2">
              Nama Produk
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Kategori
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="w-full border p-3 rounded-lg"
            >
              <option value="">Pilih kategori</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Harga (Rp)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Stok
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              step="1"
              required
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              URL Gambar
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              required
              className="w-full border p-3 rounded-lg"
            />
          </div>

          {formData.image_url && (
            <div>
              <p className="font-medium mb-2">Preview Gambar</p>
              <img
                src={formData.image_url}
                alt="Preview produk"
                className="w-40 h-40 object-cover rounded-lg border"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/seller/products")}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
