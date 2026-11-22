
const categories = [
  { name: "Elektronik", icon: "💻", color: "bg-blue-100" },
  { name: "Fashion", icon: "👕", color: "bg-pink-100" },
  { name: "Buku", icon: "📚", color: "bg-amber-100" },
  { name: "Kebutuhan Kuliah", icon: "🎒", color: "bg-green-100" },
];

const products = [
  {
    name: "Wireless Headphone",
    category: "Elektronik",
    price: "Rp125.000",
    icon: "🎧",
    color: "bg-blue-100",
  },
  {
    name: "Tas Kuliah Minimalis",
    category: "Fashion",
    price: "Rp89.000",
    icon: "🎒",
    color: "bg-orange-100",
  },
  {
    name: "Buku Pemrograman",
    category: "Buku",
    price: "Rp65.000",
    icon: "📖",
    color: "bg-green-100",
  },
  {
    name: "Keyboard Mechanical",
    category: "Elektronik",
    price: "Rp210.000",
    icon: "⌨️",
    color: "bg-purple-100",
  },
];

export default function Home()  {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* NAVBAR */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <a href="/" className="text-2xl font-bold text-blue-600">
            KampusMart
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a href="/" className="text-sm font-medium text-blue-600">
              Beranda
            </a>
            <a href="#kategori" className="text-sm text-gray-600 hover:text-blue-600">
              Kategori
            </a>
            <a href="#produk" className="text-sm text-gray-600 hover:text-blue-600">
              Produk
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Login
            </a>

            <a
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Daftar
            </a>
          </div>

        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">

          <div>
            <p className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
              Marketplace untuk mahasiswa
            </p>

            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Belanja kebutuhan kampus,
              <span className="text-blue-600"> lebih mudah.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600">
              Temukan berbagai kebutuhan mahasiswa mulai dari buku, elektronik,
              fashion, hingga perlengkapan kuliah dalam satu platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#produk"
                className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
              >
                Mulai Belanja
              </a>

              <a
                href="#kategori"
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-100"
              >
                Jelajahi Kategori
              </a>
            </div>
          </div>

          <div className="flex min-h-72 items-center justify-center rounded-3xl bg-blue-100 p-10">
            <div className="text-center">
              <div className="text-9xl">🛍️</div>
              <p className="mt-4 text-xl font-bold text-blue-800">
                Your Campus Marketplace
              </p>
              <p className="mt-2 text-blue-600">
                Semua kebutuhan dalam satu tempat
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* CATEGORY SECTION */}
      <section id="kategori" className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Kategori Produk</h2>
          <p className="mt-2 text-gray-500">
            Temukan produk sesuai kebutuhanmu
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <div
              key={category.name}
              className="rounded-2xl border border-gray-100 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl ${category.color} text-4xl`}
              >
                {category.icon}
              </div>

              <h3 className="mt-4 font-semibold">{category.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT SECTION */}
      <section id="produk" className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Produk Unggulan</h2>
            <p className="mt-2 text-gray-500">
              Beberapa produk pilihan untuk kebutuhanmu
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.name}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:shadow-lg"
            >
              <div
                className={`flex h-52 items-center justify-center ${product.color} text-7xl`}
              >
                {product.icon}
              </div>

              <div className="p-5">
                <p className="text-sm text-gray-500">{product.category}</p>

                <h3 className="mt-2 font-semibold">{product.name}</h3>

                <p className="mt-3 text-lg font-bold text-blue-600">
                  {product.price}
                </p>

                <a
                  href="/login"
                  className="mt-4 block rounded-lg border border-blue-600 py-2 text-center text-sm font-medium text-blue-600 transition hover:bg-blue-600 hover:text-white"
                >
                  Lihat Produk
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="mx-6 my-16 rounded-3xl bg-blue-600 px-8 py-14 text-center text-white md:mx-auto md:max-w-7xl">
        <h2 className="text-3xl font-bold">
          Mulai jual dan beli kebutuhan kampusmu
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-blue-100">
          KampusMart hadir untuk mempermudah mahasiswa mendapatkan kebutuhan
          kuliah dan membuka peluang berjualan.
        </p>

        <a
          href="/register"
          className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
        >
          Bergabung Sekarang
        </a>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row">
          <div>
            <h2 className="text-xl font-bold text-blue-600">KampusMart</h2>
            <p className="mt-2 text-sm text-gray-500">
              Marketplace kebutuhan mahasiswa.
            </p>
          </div>

          <p className="text-sm text-gray-500">
            © 2026 KampusMart. All rights reserved.
          </p>
        </div>
      </footer>

    </main>
  );
}
