// Data presentasi yang sama dengan prototipe HTML.
// Nantinya diganti query Supabase (profiles, counselor_profiles, articles, sessions).

export type Availability = "available" | "busy" | "offline";

export interface Counselor {
  id: string;
  name: string;
  initial: string;
  avatarClass: string;
  status: Availability;
  statusLabel: string;
  statusNote: string;
  role: string;
  tags: string[];
  topics: string;
  quote: string;
  lang: string;
  queueNote?: string;
}

export const counselors: Counselor[] = [
  {
    id: "naya",
    name: "🌷 Kak Naya",
    initial: "N",
    avatarClass: "avatar avatar-pink xl",
    status: "available",
    statusLabel: "Tersedia",
    statusNote: "🇮🇩 Bahasa Indonesia • Daring",
    role: "Counselor • Terverifikasi ✓",
    tags: ["❤️ Relationship", "🏠 Family", "🌱 Self Growth"],
    topics: "relationship family self growth",
    quote: "“Aku percaya setiap orang punya cerita yang layak didengarkan.”",
    lang: "🇮🇩 Bahasa Indonesia • Daring",
  },
  {
    id: "bimo",
    name: "🍃 Kak Bimo",
    initial: "B",
    avatarClass: "avatar avatar-sky xl",
    status: "busy",
    statusLabel: "Sibuk",
    statusNote: "Sedang sesi • ±15 mnt",
    role: "Counselor • Terverifikasi ✓",
    tags: ["🎓 Student", "🧭 Future", "🌱 Self Growth"],
    topics: "student future self growth",
    quote: "“Bingung itu wajar. Kita urai pelan-pelan bareng.”",
    lang: "🇮🇩 🇬🇧 Indonesia / Inggris • Sedang sesi • ±15 mnt",
    queueNote: "Lagi sesi ±15 mnt. Atau mulai duluan dengan Kak Dimas untuk topik sama.",
  },
  {
    id: "sasa",
    name: "🌻 Kak Sasa",
    initial: "S",
    avatarClass: "avatar avatar-mint xl",
    status: "available",
    statusLabel: "Tersedia",
    statusNote: "🇮🇩 Bahasa Indonesia • Daring",
    role: "Counselor • Terverifikasi ✓",
    tags: ["🌧️ Emosi", "🫂 Friendship", "🏠 Family"],
    topics: "emosi friendship family",
    quote: "“Nggak apa-apa nangis dulu. Aku temenin.”",
    lang: "🇮🇩 Bahasa Indonesia • Daring",
  },
  {
    id: "rara",
    name: "🌸 Kak Rara",
    initial: "R",
    avatarClass: "avatar avatar-sky xl",
    status: "available",
    statusLabel: "Tersedia",
    statusNote: "🇮🇩 🇬🇧 Indonesia / Inggris • Daring",
    role: "Counselor • Terverifikasi ✓",
    tags: ["❤️ Relationship", "🫂 Friendship", "🌧️ Emosi"],
    topics: "relationship friendship emosi",
    quote: "“Ceritamu penting, meski kamu ngerasa itu hal kecil.”",
    lang: "🇮🇩 🇬🇧 Indonesia / Inggris • Daring",
  },
  {
    id: "dimas",
    name: "🌊 Kak Dimas",
    initial: "D",
    avatarClass: "avatar avatar-mint xl",
    status: "busy",
    statusLabel: "Sibuk",
    statusNote: "Sedang sesi • ±20 mnt",
    role: "Counselor • Terverifikasi ✓",
    tags: ["🎓 Student", "🧭 Future", "🏠 Family"],
    topics: "student future family",
    quote: "“Tekanan itu berat. Kita cari langkah kecil yang realistis.”",
    lang: "🇮🇩 Bahasa Indonesia • Sedang sesi • ±20 mnt",
    queueNote: "Lagi sesi ±20 mnt. Atau mulai duluan dengan Kak Bimo untuk topik sama.",
  },
  {
    id: "lulu",
    name: "🌙 Kak Lulu",
    initial: "L",
    avatarClass: "avatar avatar-pink xl",
    status: "offline",
    statusLabel: "Offline",
    statusNote: "Kembali besok pagi",
    role: "Counselor • Terverifikasi ✓",
    tags: ["🌱 Self Growth", "🌧️ Emosi", "🧭 Future"],
    topics: "self growth emosi future",
    quote: "“Menerima diri itu proses. Pelan-pelan, aku temenin.”",
    lang: "🇮🇩 Bahasa Indonesia • Kembali besok pagi",
  },
];

export interface Article {
  slug: string;
  title: string;
  category: "relationship" | "family" | "student" | "self";
  categoryLabel: string;
  minutes: number;
  emoji: string;
  coverClass: string;
  excerpt: string;
  featured?: boolean;
}

export const articles: Article[] = [
  {
    slug: "ketika-hubungan-terasa-melelahkan",
    title: "Ketika hubungan terasa melelahkan",
    category: "relationship",
    categoryLabel: "Relationship",
    minutes: 3,
    emoji: "💛",
    coverClass: "a-cover c1",
    excerpt: "Capek sama hubungan bukan berarti kamu gagal. Yuk pahami pelan-pelan.",
    featured: true,
  },
  {
    slug: "ngomong-baik-baik-saat-lagi-marah",
    title: "Ngomong baik-baik saat lagi marah",
    category: "relationship",
    categoryLabel: "Relationship",
    minutes: 4,
    emoji: "💬",
    coverClass: "a-cover c2",
    excerpt: "Obrolan paling susah biasanya paling perlu. Mulai dengan kalimat lembut.",
  },
  {
    slug: "setelah-putus-pelan-pelan-ya",
    title: "Setelah putus: pelan-pelan ya",
    category: "relationship",
    categoryLabel: "Relationship",
    minutes: 5,
    emoji: "🌧️",
    coverClass: "a-cover c3",
    excerpt: "Nggak harus pulih hari ini. Satu langkah kecil tiap hari cukup.",
  },
  {
    slug: "ketika-sulit-bicara-dengan-orang-tua",
    title: "Ketika sulit bicara dengan orang tua",
    category: "family",
    categoryLabel: "Family",
    minutes: 4,
    emoji: "🏠",
    coverClass: "a-cover c2",
    excerpt: "Susah ngomong di rumah itu wajar. Cari waktu dan cara yang aman.",
  },
  {
    slug: "bilang-nggak-tanpa-rasa-bersalah",
    title: "Bilang “nggak” tanpa rasa bersalah",
    category: "self",
    categoryLabel: "Self",
    minutes: 3,
    emoji: "🧱",
    coverClass: "a-cover c1",
    excerpt: "Batasan kecil menjaga tenagamu. Mulai dari satu kalimat berani.",
  },
  {
    slug: "ketika-tugas-terasa-terlalu-banyak",
    title: "Ketika tugas terasa terlalu banyak",
    category: "student",
    categoryLabel: "Student",
    minutes: 3,
    emoji: "🎓",
    coverClass: "a-cover c3",
    excerpt: "Urai jadi potongan kecil. Satu tugas selesai lebih baik dari semua dipikirin.",
  },
  {
    slug: "tekanan-nilai-dan-ekspektasi",
    title: "Tekanan nilai dan ekspektasi",
    category: "student",
    categoryLabel: "Student",
    minutes: 4,
    emoji: "📚",
    coverClass: "a-cover c1",
    excerpt: "Nilaimu bukan seluruh ceritamu. Pisahkan usaha dan hasil.",
  },
  {
    slug: "kehilangan-motivasi-belajar",
    title: "Kehilangan motivasi belajar",
    category: "student",
    categoryLabel: "Student",
    minutes: 3,
    emoji: "🔋",
    coverClass: "a-cover c2",
    excerpt: "Motivasi naik turun itu normal. Cari pemantik kecil yang realistis.",
  },
  {
    slug: "menerima-diri-pelan-pelan",
    title: "Menerima diri pelan-pelan",
    category: "self",
    categoryLabel: "Self",
    minutes: 4,
    emoji: "🌱",
    coverClass: "a-cover c3",
    excerpt: "Menerima diri itu proses. Pelan-pelan, satu hal baik tiap hari.",
  },
];

export const topics = [
  { emoji: "❤️", label: "Percintaan", desc: "Hubungan yang melelahkan", cls: "t-love" },
  { emoji: "🏠", label: "Keluarga", desc: "Susah ngomong di rumah", cls: "t-home" },
  { emoji: "🫂", label: "Pertemanan", desc: "Berasa dijauhi", cls: "t-friend" },
  { emoji: "🎓", label: "Sekolah / Kuliah", desc: "Tugas & tekanan", cls: "t-school" },
  { emoji: "🌱", label: "Diri Sendiri", desc: "Kenali dirimu", cls: "t-self" },
  { emoji: "🌧️", label: "Perasaan & Emosi", desc: "Sedih, marah, cemas", cls: "t-feel" },
  { emoji: "🧭", label: "Masa Depan", desc: "Bingung mau ke mana", cls: "t-future" },
];
