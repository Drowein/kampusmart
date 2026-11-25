
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSellersPage() {
  const router = useRouter();

  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Mengambil daftar Seller pending
  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/sellers");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal mengambil data Seller."
        );
      }

      setSellers(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mengambil data ketika halaman pertama kali dibuka
  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  // Menyetujui atau menolak Seller
  async function handleUpdateStatus(id, status) {
    const action = status === "approved" ? "menyetujui" : "menolak";

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin ${action} Seller ini?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(id);
      setError("");
      setMessage("");

      const response = await fetch(`/api/admin/sellers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seller_status: status,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal memperbarui status Seller."
        );
      }

      setMessage(result.message);

      // Memperbarui daftar setelah tindakan berhasil
      await fetchSellers();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin")}
            className="text-blue-600 font-semibold hover:underline mb-5"
          >
            ← Kembali ke Dashboard
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            Verifikasi Seller
          </h1>

          <p className="text-gray-600 mt-2">
            Periksa dan kelola permohonan pendaftaran Seller KampusMart.
          </p>
        </div>

        {/* Jumlah Seller */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <p className="text-sm text-gray-500">
            Permohonan menunggu persetujuan
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-2">
            {sellers.length}
          </h2>
        </div>

        {/* Pesan berhasil */}
        {message && (
          <div className="mb-5 rounded-lg bg-green-100 p-4 text-green-700">
            {message}
          </div>
        )}

        {/* Pesan error */}
        {error && (
          <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Daftar Seller */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Daftar Permohonan Seller
            </h2>

            <button
              onClick={fetchSellers}
              disabled={loading}
              className="text-blue-600 font-semibold hover:underline disabled:text-gray-400"
            >
              Muat Ulang
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Memuat data Seller...
            </div>
          ) : sellers.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Belum Ada Permohonan
              </h3>

              <p className="text-gray-500 mt-2">
                Saat ini tidak ada Seller yang menunggu persetujuan.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Nama
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Email
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Tindakan
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sellers.map((seller) => (
                    <tr
                      key={seller.id}
                      className="border-b border-gray-100"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {seller.name}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {seller.email}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                          Pending
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">

                          <button
                            onClick={() =>
                              handleUpdateStatus(seller.id, "approved")
                            }
                            disabled={updatingId !== null}
                            className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-gray-400"
                          >
                            {updatingId === seller.id
                              ? "Memproses..."
                              : "Setujui"}
                          </button>

                          <button
                            onClick={() =>
                              handleUpdateStatus(seller.id, "rejected")
                            }
                            disabled={updatingId !== null}
                            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-gray-400"
                          >
                            Tolak
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}
