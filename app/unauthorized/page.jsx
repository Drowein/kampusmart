
export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-lg text-center">

        <div className="text-5xl mb-4">
          🔒
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Akses Ditolak
        </h1>

        <p className="text-gray-600 mt-4">
          Kamu tidak memiliki izin untuk mengakses halaman ini.
        </p>

        <a
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Kembali ke Beranda
        </a>

      </div>
    </main>
  );
}
