// Konstanta domain (dipakai client + server actions).
export const REPORT_REASONS = [
  "Perilaku tidak pantas",
  "Pelecehan",
  "Konten tidak aman",
  "Masalah counselor",
  "Masalah teknis",
  "Lainnya",
] as const;

export const REPORT_TARGETS = ["user", "counselor", "session", "message", "article", "other"] as const;
export const SUPPORT_TYPES = ["listened", "solution", "both"] as const;
