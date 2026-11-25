
"use client";

import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  function handleLogout() {
    router.push("/api/logout");
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
              Admin Dashboard
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

      {/* Konten Dashboard */}
      <div className="max-w-7xl mx-auto px-8 py-10">

        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            Dashboard Admin
          </h2>

          <p className="text-gray-600 mt-2">
            Selamat datang di panel pengelolaan KampusMart.
          </p>
        </div>

        {/* Ringkasan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">
              Manajemen Pengguna
            </div>

            <h3 className="text-xl font-bold text-gray-900 mt-3">
              Pengguna
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Melihat dan mengelola akun pengguna KampusMart.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">
              Verifikasi Penjual
            </div>

            <h3 className="text-xl font-bold text-gray-900 mt-3">
              Seller
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Memeriksa dan menyetujui pendaftaran penjual.
            </p>

            <button
              onClick={() => router.push("/admin/sellers")}
              className="mt-5 text-blue-600 font-semibold hover:underline"
            >
              Kelola Seller →
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">
              Manajemen Kategori
            </div>

            <h3 className="text-xl font-bold text-gray-900 mt-3">
              Kategori Produk
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Mengelola kategori produk yang tersedia.
            </p>
          </div>

        </div>

        {/* Informasi Admin */}
        <div className="mt-10 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">

          <h3 className="text-lg font-bold text-gray-900">
            Informasi Dashboard
          </h3>

          <p className="text-gray-600 mt-3">
            Anda sedang menggunakan panel administrator
            KampusMart. Gunakan menu pengelolaan untuk
            mengatur aktivitas platform.
          </p>

        </div>

      </div>
    </main>
  );
}
