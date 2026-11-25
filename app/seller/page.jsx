
"use client";

import { useRouter } from "next/navigation";

export default function SellerDashboard() {
  const router = useRouter();

  function handleLogout() {
    window.location.href = "/api/logout";
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              KampusMart
            </h1>

            <p className="text-sm text-gray-500">
              Seller Dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>

        </div>
      </nav>

      {/* Konten */}
      <div className="max-w-7xl mx-auto px-8 py-10">

        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            Dashboard Seller
          </h2>

          <p className="text-gray-600 mt-2">
            Selamat datang di halaman pengelolaan toko KampusMart.
          </p>
        </div>

        {/* Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Produk */}
          <div className="bg-white p-7 rounded-xl border border-gray-200 shadow-sm">

            <div className="text-3xl mb-4">
              📦
            </div>

            <h3 className="text-xl font-bold text-gray-900">
              Produk Saya
            </h3>

            <p className="text-gray-600 mt-2">
              Lihat daftar produk yang dijual di toko Anda,
              serta tambahkan produk baru.
            </p>

            <button
              onClick={() => router.push("/seller/products")}
              className="mt-6 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Kelola Produk
            </button>

          </div>

          {/* Informasi Toko */}
          <div className="bg-white p-7 rounded-xl border border-gray-200 shadow-sm">

            <div className="text-3xl mb-4">
              🏪
            </div>

            <h3 className="text-xl font-bold text-gray-900">
              Informasi Toko
            </h3>

            <p className="text-gray-600 mt-2">
              Kelola informasi dan identitas toko Anda
              di KampusMart.
            </p>

            <p className="mt-6 text-sm text-yellow-700 bg-yellow-50 rounded-lg p-3">
              Fitur pengelolaan toko akan tersedia pada tahap berikutnya.
            </p>

          </div>

        </div>

      </div>
    </main>
  );
}
