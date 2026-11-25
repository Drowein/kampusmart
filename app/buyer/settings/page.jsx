
"use client";

import { useEffect, useState } from "react";

export default function BuyerSettings() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [profile, setProfile] = useState(null);
    const [profileName, setProfileName] = useState("");
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);

    const [passwordForm, setPasswordForm] = useState({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [passwordSaving, setPasswordSaving] = useState(false);


    const [form, setForm] = useState({
        recipient_name: "",
        phone: "",
        full_address: "",
        is_default: false,
    });

    async function fetchAddresses() {
        try {
            const response = await fetch("/api/buyer/addresses");
            const result = await response.json();

        if (result.success) {
            setAddresses(result.data);
        } else {
            alert(result.message);
        }
        } catch (error) {
            console.error("Error mengambil alamat:", error);
            alert("Gagal mengambil data alamat.");
        } finally {
            setLoading(false);
        }
    }


    async function fetchProfile() {
        try {
            const response = await fetch("/api/buyer/profile");
            const result = await response.json();

            if (result.success) {
                setProfile(result.data);
                setProfileName(result.data.name);
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Error mengambil profil:", error);
            alert("Gagal mengambil informasi profil.");
        } finally {
            setProfileLoading(false);
        }
    }


    async function handleProfileSubmit(event) {
        event.preventDefault();

        setProfileSaving(true);

        try {
            const response = await fetch("/api/buyer/profile", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: profileName,
            }),
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Gagal memperbarui profil.");
            return;
            }

            setProfile(result.data);
            setProfileName(result.data.name);

            alert(result.message);
        } catch (error) {
            console.error("Error memperbarui profil:", error);
            alert("Terjadi kesalahan saat memperbarui profil.");
        } finally {
            setProfileSaving(false);
        }
    }


    function handlePasswordChange(event) {
        const { name, value } = event.target;

        setPasswordForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handlePasswordSubmit(event) {
        event.preventDefault();

        setPasswordSaving(true);

        try {
            const response = await fetch("/api/buyer/change-password", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(passwordForm),
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Gagal mengubah password.");
            return;
            }

            alert(result.message);

            setPasswordForm({
                old_password: "",
                new_password: "",
                confirm_password: "",
            });
        } catch (error) {
            console.error("Error mengubah password:", error);
            alert("Terjadi kesalahan saat mengubah password.");
        } finally {
            setPasswordSaving(false);
        }
    }


    useEffect(() => {
        fetchAddresses();
        fetchProfile();
    }, []);

    function handleChange(event) {
        const { name, value, checked, type } = event.target;

        setForm((previous) => ({
        ...previous,
        [name]: type === "checkbox" ? checked : value,
        }));
    }

    function resetForm() {
        setForm({
            recipient_name: "",
            phone: "",
            full_address: "",
            is_default: false,
        });

        setEditingId(null);
    }

    function handleEdit(address) {
        setEditingId(address.id);

        setForm({
            recipient_name: address.recipient_name,
            phone: address.phone,
            full_address: address.full_address,
            is_default: address.is_default,
        });

        window.scrollTo({
        top: 0,
        behavior: "smooth",
        });
    }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);

    try {
      const response = await fetch("/api/buyer/addresses", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingId
            ? { id: editingId, ...form }
            : form
        ),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Gagal menyimpan alamat.");
        return;
      }

      alert(result.message);
      resetForm();
      await fetchAddresses();
    } catch (error) {
      console.error("Error menyimpan alamat:", error);
      alert("Terjadi kesalahan saat menyimpan alamat.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSetDefault(id) {
    try {
      const response = await fetch("/api/buyer/addresses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          is_default: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Gagal mengubah alamat utama.");
        return;
      }

      await fetchAddresses();
    } catch (error) {
      console.error("Error mengubah alamat utama:", error);
      alert("Terjadi kesalahan.");
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus alamat ini?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/buyer/addresses?id=${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Gagal menghapus alamat.");
        return;
      }

      alert(result.message);
      await fetchAddresses();
    } catch (error) {
      console.error("Error menghapus alamat:", error);
      alert("Terjadi kesalahan saat menghapus alamat.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-700">
            KampusMart
          </h1>

          <div className="flex items-center gap-5 text-sm font-medium">
            <a href="/buyer" className="text-gray-600 hover:text-blue-700">
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

            <a href="/buyer/settings" className="text-blue-700 font-semibold">
              Pengaturan
            </a>

            <button
              onClick={() => {
                window.location.href = "/api/logout";
              }}
              className="text-red-600 hover:text-red-700"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>

      {/* Konten */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Pengaturan Akun
          </h2>

          <p className="text-gray-500 mt-2">
            Kelola informasi alamat pengiriman Anda.
          </p>
        </div>

        
        {/* Informasi Profil */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6">
                Informasi Profil
            </h3>

            {profileLoading ? (
                <p className="text-gray-500">Memuat profil...</p>
            ) : profile ? (
                <form onSubmit={handleProfileSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Lengkap
                        </label>

                        <input
                        type="text"
                        value={profileName}
                        onChange={(event) => setProfileName(event.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>

                        <input
                        type="email"
                        value={profile.email}
                        readOnly
                        className="w-full border border-gray-200 bg-gray-100 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                        />

                        <p className="text-xs text-gray-400 mt-2">
                            Email belum dapat diubah.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={profileSaving || profileName.trim() === profile.name}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {profileSaving ? "Menyimpan..." : "Simpan Profil"}
                    </button>
                </form>
            ) : (
                <p className="text-red-500">Profil tidak dapat dimuat.</p>
            )}
            </section>

            {/* Keamanan Akun */}
            <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
                Keamanan Akun
            </h3>

            <p className="text-sm text-gray-500 mb-6">
                Ubah password untuk menjaga keamanan akun Anda.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Lama
                    </label>

                    <input
                        type="password"
                        name="old_password"
                        value={passwordForm.old_password}
                        onChange={handlePasswordChange}
                        placeholder="Masukkan password lama"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Baru
                    </label>

                    <input
                        type="password"
                        name="new_password"
                        value={passwordForm.new_password}
                        onChange={handlePasswordChange}
                        placeholder="Minimal 8 karakter"
                        minLength={8}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konfirmasi Password Baru
                    </label>

                    <input
                        type="password"
                        name="confirm_password"
                        value={passwordForm.confirm_password}
                        onChange={handlePasswordChange}
                        placeholder="Masukkan ulang password baru"
                        minLength={8}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={passwordSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:bg-blue-300"
                    >
                    {passwordSaving ? "Memproses..." : "Ubah Password"}
                </button>
            </form>
        </section>

        {/* Form Alamat */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              {editingId ? "Edit Alamat" : "Tambah Alamat Baru"}
            </h3>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Penerima
              </label>

              <input
                type="text"
                name="recipient_name"
                value={form.recipient_name}
                onChange={handleChange}
                placeholder="Masukkan nama penerima"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Telepon
              </label>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Contoh: 081234567890"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat Lengkap
              </label>

              <textarea
                name="full_address"
                value={form.full_address}
                onChange={handleChange}
                placeholder="Masukkan alamat lengkap, termasuk nama jalan, nomor rumah, kelurahan, kecamatan, dan kota."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                name="is_default"
                checked={form.is_default}
                onChange={handleChange}
                className="w-4 h-4 accent-blue-600"
              />

              Jadikan sebagai alamat utama
            </label>

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:bg-blue-300"
            >
              {saving
                ? "Menyimpan..."
                : editingId
                  ? "Simpan Perubahan"
                  : "Tambah Alamat"}
            </button>
          </form>
        </section>

        {/* Daftar Alamat */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Daftar Alamat Pengiriman
          </h3>

          {loading ? (
            <p className="text-gray-500">Memuat alamat...</p>
          ) : addresses.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">
                Anda belum memiliki alamat pengiriman.
              </p>

              <p className="text-sm text-gray-400 mt-2">
                Tambahkan alamat melalui formulir di atas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="border border-gray-200 rounded-lg p-5"
                >
                  <div className="flex flex-col md:flex-row md:justify-between gap-4">

                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {address.recipient_name}
                        </h4>

                        {address.is_default && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                            Alamat Utama
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {address.phone}
                      </p>

                      <p className="text-sm text-gray-600 leading-relaxed">
                        {address.full_address}
                      </p>
                    </div>

                    <div className="flex flex-wrap md:flex-col gap-2 md:items-end">
                      {!address.is_default && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Jadikan Utama
                        </button>
                      )}

                      <button
                        onClick={() => handleEdit(address)}
                        className="text-sm text-amber-600 hover:text-amber-800"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(address.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Hapus
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
