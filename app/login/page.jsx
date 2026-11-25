"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            email,
            password,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            setMessage(result.message);
            return;
        }

        const role = result.data.role;
        const sellerStatus = result.data.seller_status;

        let destination = "/";

        if (role === "admin") {
        destination = "/admin";
        } else if (role === "buyer") {
        destination = "/buyer";
        } else if (role === "seller") {
        if (sellerStatus === "approved") {
            destination = "/seller";
        } else if (sellerStatus === "pending") {
            destination = "/seller-pending";
        } else if (sellerStatus === "rejected") {
            destination = "/seller-rejected";
        }
        }

        router.replace(destination);
        router.refresh();

    } catch (error) {
      setMessage("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold text-center text-gray-900">
          KampusMart
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Login ke akun kamu
        </p>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? "Sedang login..." : "Login"}
          </button>

        </form>

        {message && (
          <div className="mt-5 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
            {message}
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Belum punya akun?{" "}
          <a
            href="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Register
          </a>
        </p>

      </div>
    </main>
  );
}
