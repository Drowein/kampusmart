
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BuyerCheckoutPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value));
  }

  async function fetchCheckoutData() {
    try {
      setLoading(true);

      const [cartResponse, addressResponse] = await Promise.all([
        fetch("/api/buyer/cart"),
        fetch("/api/buyer/addresses"),
      ]);

      const cartResult = await cartResponse.json();
      const addressResult = await addressResponse.json();

      if (!cartResponse.ok || !cartResult.success) {
        throw new Error(
          cartResult.message || "Gagal mengambil keranjang."
        );
      }

      if (!addressResponse.ok || !addressResult.success) {
        throw new Error(
          addressResult.message || "Gagal mengambil alamat."
        );
      }

      const items = cartResult.data || [];
      const addressList = addressResult.data || [];

      setCartItems(items);
      setAddresses(addressList);

      const defaultAddress = addressList.find(
        (address) => address.is_default
      );

      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      } else if (addressList.length > 0) {
        setSelectedAddress(addressList[0].id);
      }

      setError("");
    } catch (error) {
      console.error("Error memuat checkout:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const totalBelanja = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  async function handleCheckout() {
    if (!selectedAddress) {
      alert("Silakan pilih alamat pengiriman terlebih dahulu.");
      return;
    }

    if (cartItems.length === 0) {
      alert("Keranjang Anda masih kosong.");
      return;
    }

    const confirmed = window.confirm(
      "Apakah Anda yakin ingin membuat pesanan ini?"
    );

    if (!confirmed) return;

    setProcessing(true);

    try {
      const response = await fetch("/api/buyer/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address_id: selectedAddress,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || "Gagal membuat pesanan.");
        return;
      }

      alert(result.message);

      router.push("/buyer/orders");
    } catch (error) {
      console.error("Error checkout:", error);
      alert("Terjadi kesalahan saat membuat pesanan.");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Memuat data checkout...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-10">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl text-center">
          <p className="text-red-600">{error}</p>

          <button
            onClick={fetchCheckoutData}
            className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            Coba Lagi
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/buyer" className="text-2xl font-bold text-blue-700">
            KampusMart
          </Link>

          <div className="flex gap-6 text-sm font-medium text-gray-600">
            <Link href="/buyer" className="hover:text-blue-600">
              Beranda
            </Link>

            <Link href="/buyer/cart" className="hover:text-blue-600">
              Keranjang
            </Link>

            <Link href="/buyer/orders" className="hover:text-blue-600">
              Pesanan
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Checkout
        </h1>

        <p className="text-gray-500 mb-8">
          Periksa alamat dan produk sebelum membuat pesanan.
        </p>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Keranjang Anda kosong
            </h2>

            <Link
              href="/buyer"
              className="inline-block mt-5 bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Alamat dan Produk */}
            <div className="lg:col-span-2 space-y-6">

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold text-gray-800">
                    Alamat Pengiriman
                  </h2>

                  <Link
                    href="/buyer/settings"
                    className="text-blue-600 text-sm font-medium"
                  >
                    Kelola Alamat
                  </Link>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">
                      Anda belum memiliki alamat pengiriman.
                    </p>

                    <Link
                      href="/buyer/settings"
                      className="inline-block mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg"
                    >
                      Tambah Alamat
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block border rounded-xl p-4 cursor-pointer ${
                          selectedAddress === address.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex gap-3">
                          <input
                            type="radio"
                            name="address"
                            value={address.id}
                            checked={selectedAddress === address.id}
                            onChange={() =>
                              setSelectedAddress(address.id)
                            }
                            className="mt-1"
                          />

                          <div>
                            <div className="flex flex-wrap gap-2 items-center">
                              <p className="font-semibold text-gray-800">
                                {address.recipient_name}
                              </p>

                              {address.is_default && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  Alamat Utama
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mt-1">
                              {address.phone}
                            </p>

                            <p className="text-sm text-gray-600 mt-1">
                              {address.full_address}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-5">
                  Produk yang Dipesan
                </h2>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.cart_item_id}
                      className="flex gap-4 border-b border-gray-100 pb-4 last:border-0"
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {item.name}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          Toko: {item.store_name}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          {formatRupiah(item.price)} × {item.quantity}
                        </p>
                      </div>

                      <p className="font-semibold text-gray-800">
                        {formatRupiah(
                          Number(item.price) * Number(item.quantity)
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Ringkasan Pesanan */}
            <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
              <h2 className="text-xl font-bold text-gray-800">
                Ringkasan Pesanan
              </h2>

              <div className="flex justify-between mt-6 text-gray-600">
                <span>Total produk</span>

                <span>
                  {cartItems.reduce(
                    (total, item) =>
                      total + Number(item.quantity),
                    0
                  )}
                </span>
              </div>

              <div className="border-t border-gray-200 my-5" />

              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">
                  Total Belanja
                </span>

                <span className="text-xl font-bold text-blue-700">
                  {formatRupiah(totalBelanja)}
                </span>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Total dihitung berdasarkan harga dan jumlah produk.
                Biaya pengiriman belum termasuk.
              </p>

              <button
                onClick={handleCheckout}
                disabled={
                  processing ||
                  !selectedAddress ||
                  addresses.length === 0 ||
                  cartItems.some(
                    (item) =>
                      item.status !== "active" ||
                      Number(item.stock) < Number(item.quantity)
                  )
                }
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {processing ? "Memproses Pesanan..." : "Konfirmasi Pesanan"}
              </button>

              <Link
                href="/buyer/cart"
                className="block text-center text-blue-600 hover:text-blue-800 mt-5 text-sm font-medium"
              >
                ← Kembali ke Keranjang
              </Link>
            </div>

          </div>
        )}
      </section>
    </main>
  );
}
