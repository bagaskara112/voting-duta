import { NextRequest, NextResponse } from "next/server";
import { getMaintenanceConfig } from "@/lib/maintenance";

const BYPASS_COOKIE_NAME = "maintenance_bypass";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get("key");
  const action = searchParams.get("action");

  // Handle logout / revoke bypass
  if (action === "revoke") {
    const response = NextResponse.redirect(new URL("/maintenance", request.url));
    response.cookies.delete(BYPASS_COOKIE_NAME);
    return response;
  }

  if (!key) {
    return NextResponse.redirect(new URL("/maintenance?error=empty_key", request.url));
  }

  const config = await getMaintenanceConfig();

  if (config.maintenanceSecret && key.trim() === config.maintenanceSecret.trim()) {
    // Valid key! Set bypass cookie and redirect to home
    const response = NextResponse.redirect(new URL("/?access=granted", request.url));
    response.cookies.set(BYPASS_COOKIE_NAME, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return response;
  }

  return NextResponse.redirect(new URL("/maintenance?error=invalid_key", request.url));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const key = body?.key;

    if (!key || typeof key !== "string") {
      return NextResponse.json({ success: false, message: "Kode rahasia wajib diisi." }, { status: 400 });
    }

    const config = await getMaintenanceConfig();

    if (config.maintenanceSecret && key.trim() === config.maintenanceSecret.trim()) {
      const response = NextResponse.json({
        success: true,
        message: "Akses khusus berhasil diverifikasi. Mengalihkan...",
      });

      response.cookies.set(BYPASS_COOKIE_NAME, "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: "Kode rahasia yang dimasukkan salah." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error in bypass route:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Akses khusus berhasil dinonaktifkan.",
  });
  response.cookies.delete(BYPASS_COOKIE_NAME);
  return response;
}

