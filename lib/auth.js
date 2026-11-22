
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kampusmart_token")?.value;

    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(
      process.env.AUTH_SECRET
    );

    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.userId,
      role: payload.role,
      sellerStatus: payload.sellerStatus,
    };
  } catch (error) {
    return null;
  }
}

export async function requireRole(allowedRoles) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  return user;
}
