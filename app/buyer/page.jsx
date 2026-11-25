
"use client";

import { useEffect, useState } from "react";

export default function BuyerPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [productResponse, categoryResponse, wishlistResponse] =
        await Promise.all([
            fetch("/api/products"),
            fetch("/api/categories"),
            fetch("/api/buyer/wishlist"),
        ]);

        const productResult = await productResponse.json();
        const categoryResult = await categoryResponse.json();
        const wishlistResult = await wishlistResponse.json();

        if (!productResponse.ok || !productResult.success) {
            throw new Error("Gagal mengambil data produk.");
        }

        if (!categoryResponse.ok || !categoryResult.success) {
            throw new Error("Gagal mengambil data kategori.");
        }

        if (!wishlistResponse.ok || !wishlistResult.success) {
            throw new Error("Gagal mengambil data Wishlist.");
        }

        setProducts(productResult.data);
        setCategories(categoryResult.data);
        setWishlistIds(wishlistResult.data.map((item) => item.id));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "Semua" ||
      product.category_name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  
    async function handleWishlist(productId) {
        const isWishlisted = wishlistIds.includes(productId);

        try {
            const response = await fetch("/api/buyer/wishlist", {
            method: isWishlisted ? "DELETE" : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                product_id: productId,
            }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
            throw new Error(result.message || "Gagal memperbarui Wishlist.");
            }

            if (isWishlisted) {
            setWishlistIds((previous) =>
                previous.filter((id) => id !== productId)
            );
            } else {
            setWishlistIds((previous) => [...previous, productId]);
            }
        } catch (error) {
            alert(error.message);
        }
    }


    async function handleAddToCart(productId) {
        try {
            const response = await fetch("/api/buyer/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                product_id: productId,
            }),
            });

            const result = await response.json();

            if (!response.ok) {
            alert(result.message || "Gagal menambahkan produk ke keranjang.");
            return;
            }

            alert("Produk berhasil ditambahkan ke keranjang!");
        } catch (error) {
            console.error("Error menambahkan ke keranjang:", error);
            alert("Terjadi kesalahan saat menambahkan produk ke keranjang.");
        }
    }

    function handleLogout() {
        window.location.href = "/api/logout";
    }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">

          <a href="/buyer" className="text-2xl font-bold text-blue-700">
            KampusMart
          </a>

          <div className="hidden items-center gap-6 md:flex">
            <a href="/buyer" className="font-medium text-blue-700">
              Beranda
            </a>
            <a href="/buyer/wishlist" className="text-gray-600 hover:text-blue-700">
              Wishlist
            </a>
            <a href="/buyer/cart" className="text-gray-600 hover:text-blue-700">
              Keranjang
            </a>
            <a href="/buyer/orders" className="text-gray-600 hover:text-blue-700">
              Pesanan
            </a>
            <a href="/buyer/settings" className="text-gray-600 hover:text-blue-700">
              Pengaturan
            </a>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Logout
          </button>

        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Sambutan */}
        <section className="mb-8 rounded-2xl bg-blue-700 p-8 text-white">
          <h1 className="text-3xl font-bold">
            Selamat Datang di KampusMart!
          </h1>
          <p className="mt-2 text-blue-100">
            Temukan berbagai kebutuhan kuliahmu dengan mudah.
          </p>
        </section>

        {/* Pencarian */}
        <section className="mb-6">
          <div className="flex items-center rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <span className="mr-3 text-xl text-gray-400">⌕</span>
            <input
              type="text"
              placeholder="Cari produk yang kamu butuhkan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-gray-800 outline-none placeholder:text-gray-400"
            />
          </div>
        </section>

        {/* Kategori */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Kategori Produk
          </h2>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory("Semua")}
              className={`rounded-full px-5 py-2 text-sm font-medium ${
                selectedCategory === "Semua"
                  ? "bg-blue-700 text-white"
                  : "bg-white text-gray-700 hover:bg-blue-50"
              }`}
            >
              Semua
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`rounded-full px-5 py-2 text-sm font-medium ${
                  selectedCategory === category.name
                    ? "bg-blue-700 text-white"
                    : "bg-white text-gray-700 hover:bg-blue-50"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        {/* Daftar Produk */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              Rekomendasi Produk
            </h2>
            <span className="text-sm text-gray-500">
              {filteredProducts.length} produk
            </span>
          </div>

          {loading ? (
            <p className="py-10 text-center text-gray-500">
              Memuat produk...
            </p>
          ) : error ? (
            <p className="py-10 text-center text-red-500">{error}</p>
          ) : filteredProducts.length === 0 ? (
            <p className="rounded-xl bg-white py-10 text-center text-gray-500">
              Produk tidak ditemukan.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Gambar Produk */}
                  <a href={`/products/${product.id}`}>
                    <div className="h-48 bg-gray-100">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </a>

                  {/* Informasi Produk */}
                  <div className="p-4">
                    <p className="mb-1 text-xs text-blue-600">
                      {product.category_name}
                    </p>

                    <a href={`/products/${product.id}`}>
                      <h3 className="line-clamp-2 min-h-12 font-semibold text-gray-800 hover:text-blue-700">
                        {product.name}
                      </h3>
                    </a>

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

                    {/* Tombol Wishlist dan Keranjang */}
                    <div className="mt-4 flex items-center justify-between border-t pt-3">

                      
                    <button
                    onClick={() => handleWishlist(product.id)}
                    title={
                        wishlistIds.includes(product.id)
                        ? "Hapus dari Wishlist"
                        : "Tambahkan ke Wishlist"
                    }
                    aria-label="Wishlist"
                    className={`flex h-10 w-10 items-center justify-center rounded-full border text-2xl transition ${
                        wishlistIds.includes(product.id)
                        ? "border-pink-500 bg-pink-50 text-pink-600"
                        : "border-pink-200 text-pink-500 hover:bg-pink-50"
                    }`}>
                    {wishlistIds.includes(product.id) ? "♥" : "♡"}
                    </button>


                      <button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={product.stock <= 0}
                        title="Tambahkan ke Keranjang"
                        aria-label="Tambahkan ke Keranjang"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        🛒
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
