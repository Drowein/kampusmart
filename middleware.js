
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("kampusmart_token")?.value;

  let user = null;

  if (token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.AUTH_SECRET
      );

      const { payload } = await jwtVerify(token, secret);

      user = {
        role: payload.role,
        sellerStatus: payload.sellerStatus,
      };
    } catch {
      user = null;
    }
  }

  const protectedPaths = [
    "/admin",
    "/buyer",
    "/seller",
    "/seller-pending",
    "/seller-rejected",
  ];

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // 1. Wajib login
  if (isProtected && !user) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // 2. Halaman Seller Pending
  if (pathname.startsWith("/seller-pending")) {
    if (
      user?.role !== "seller" ||
      user?.sellerStatus !== "pending"
    ) {
      return NextResponse.redirect(
        new URL("/unauthorized", request.url)
      );
    }

    return NextResponse.next();
  }

  // 3. Halaman Seller Rejected
  if (pathname.startsWith("/seller-rejected")) {
    if (
      user?.role !== "seller" ||
      user?.sellerStatus !== "rejected"
    ) {
      return NextResponse.redirect(
        new URL("/unauthorized", request.url)
      );
    }

    return NextResponse.next();
  }

  // 4. Halaman Admin
  if (pathname.startsWith("/admin")) {
    if (user?.role !== "admin") {
      return NextResponse.redirect(
        new URL("/unauthorized", request.url)
      );
    }
  }

  // 5. Halaman Buyer
  if (pathname.startsWith("/buyer")) {
    if (user?.role !== "buyer") {
      return NextResponse.redirect(
        new URL("/unauthorized", request.url)
      );
    }
  }

  // 6. Halaman Seller
  if (pathname.startsWith("/seller")) {
    if (user?.role !== "seller") {
      return NextResponse.redirect(
        new URL("/unauthorized", request.url)
      );
    }

    if (user.sellerStatus === "pending") {
      return NextResponse.redirect(
        new URL("/seller-pending", request.url)
      );
    }

    if (user.sellerStatus === "rejected") {
      return NextResponse.redirect(
        new URL("/seller-rejected", request.url)
      );
    }

    if (user.sellerStatus !== "approved") {
      return NextResponse.redirect(
        new URL("/unauthorized", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/buyer/:path*",
    "/seller/:path*",
    "/seller-pending/:path*",
    "/seller-rejected/:path*",
  ],
};
