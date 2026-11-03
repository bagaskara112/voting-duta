import { prisma } from "@/lib/prisma";

export interface MaintenanceConfig {
  isMaintenance: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceSecret: string;
}

const DEFAULT_MAINTENANCE_CONFIG: MaintenanceConfig = {
  isMaintenance: false,
  maintenanceTitle: "Akses Ditutup",
  maintenanceMessage: "Terima kasih atas partisipasi Anda. Sesi aplikasi telah berakhir dan sistem saat ini ditutup untuk mencegah penyalahgunaan data.",
  maintenanceSecret: "panitia2026",
};

// In-memory cache for fast lookup in proxy / middleware (TTL 5 seconds)
let cachedConfig: (MaintenanceConfig & { timestamp: number }) | null = null;
const CACHE_TTL_MS = 5000;

export async function getMaintenanceConfig(forceRefresh = false): Promise<MaintenanceConfig> {
  const now = Date.now();
  if (!forceRefresh && cachedConfig && now - cachedConfig.timestamp < CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const setting = await prisma.votingSetting.findFirst({
      select: {
        isMaintenance: true,
        maintenanceTitle: true,
        maintenanceMessage: true,
        maintenanceSecret: true,
      },
    });

    if (!setting) {
      return DEFAULT_MAINTENANCE_CONFIG;
    }

    const config: MaintenanceConfig = {
      isMaintenance: setting.isMaintenance ?? false,
      maintenanceTitle: setting.maintenanceTitle || DEFAULT_MAINTENANCE_CONFIG.maintenanceTitle,
      maintenanceMessage: setting.maintenanceMessage || DEFAULT_MAINTENANCE_CONFIG.maintenanceMessage,
      maintenanceSecret: setting.maintenanceSecret || DEFAULT_MAINTENANCE_CONFIG.maintenanceSecret,
    };

    cachedConfig = {
      ...config,
      timestamp: now,
    };

    return config;
  } catch (error) {
    console.error("Gagal mengambil pengaturan maintenance:", error);
    return cachedConfig || DEFAULT_MAINTENANCE_CONFIG;
  }
}

export function invalidateMaintenanceCache() {
  cachedConfig = null;
}

