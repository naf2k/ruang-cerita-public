# Product Requirements Document (PRD)

## Free Counseling & Safe Space Platform

| Metadata | Detail |
|---|---|
| **Version** | 1.0 |
| **Status** | Ready for Development |
| **Platform** | Web Application |
| **Primary Stack** | Next.js + Supabase + Vercel |
| **Target** | Public / Free-to-use Counseling Platform |

---
## 1. Product Overview

### 1.1 Product Summary

Produk ini adalah platform web counseling gratis yang memungkinkan pengguna untuk:

- menceritakan masalah atau kondisi yang sedang dihadapi;
- memilih kategori masalah;
- mendapatkan akses ke konsultan/konselor yang tersedia;
- melakukan counseling melalui chat;
- melakukan mood check sederhana;
- menulis private journal;
- membaca konten edukatif dan supportive;
- melihat riwayat counseling.

Platform dirancang bukan sebagai aplikasi medis yang kompleks, melainkan sebagai **friendly digital safe space** yang membuat seseorang merasa nyaman untuk memulai cerita dan mencari bantuan.

Core philosophy:

**Simple interface. Meaningful support.**

Produk harus terasa seperti tempat yang aman dan hangat untuk bercerita, bukan seperti rumah sakit, aplikasi medis, atau platform corporate.

---

## 2. Product Vision

### Vision

Membangun tempat digital yang mudah diakses siapa saja ketika mereka membutuhkan seseorang untuk mendengarkan, membantu memahami situasi, dan menemani mereka melalui masalah yang sedang dihadapi.

### Product Statement

**“A little place to feel heard.”**

Versi Bahasa Indonesia:

**“Tempat kecil untuk cerita.”**

---

## 3. Product Goals

### Primary Goals

1. Membuat counseling lebih mudah diakses.
2. Menyediakan layanan counseling gratis bagi pengguna.
3. Mengurangi rasa takut atau canggung ketika seseorang ingin mencari bantuan.
4. Membuat proses memulai counseling sesederhana mungkin.
5. Menyediakan pengalaman counseling yang friendly dan human.
6. Menyediakan ruang pribadi untuk refleksi dan journaling.
7. Menjaga privacy dan keamanan data pengguna.
8. Menyediakan sistem yang mudah dikelola oleh konsultan dan administrator.

### Secondary Goals

- Membantu pengguna memahami apa yang sedang mereka rasakan.
- Membantu pengguna menemukan konsultan yang sesuai.
- Membantu pengguna melanjutkan counseling tanpa harus selalu mengulang cerita dari awal.
- Menyediakan educational resources yang mudah dipahami.

---

## 4. Non-Goals

Produk V1 TIDAK bertujuan untuk:

- melakukan diagnosis kesehatan mental otomatis;
- menggantikan psikolog, psikiater, dokter, atau tenaga profesional;
- memberikan resep atau rekomendasi obat;
- melakukan AI therapy;
- membuat mental-health score;
- melakukan personality diagnosis;
- membuat sistem gamification kompleks;
- membuat marketplace konsultan;
- menyediakan sistem pembayaran;
- menyediakan video conference pada V1;
- membuat analytics kesehatan mental yang kompleks untuk pengguna.

---

## 5. Target Users

### 5.1 Primary User — Client

Orang yang:

- sedang mengalami masalah pribadi;
- membutuhkan tempat untuk bercerita;
- ingin mendapatkan counseling;
- membutuhkan seseorang yang dapat mendengarkan;
- ingin memahami perasaannya;
- mengalami masalah relationship;
- mengalami masalah keluarga;
- mengalami masalah pertemanan;
- mengalami tekanan sekolah/kuliah;
- mengalami masalah personal;
- membutuhkan dukungan dalam menghadapi situasi tertentu.

### 5.2 Counselor

Konselor/profesional yang menyediakan layanan counseling secara gratis melalui platform.

Counselor dapat:

- menerima sesi;
- melakukan chat;
- melihat informasi intake pengguna;
- membuat catatan internal;
- memberikan arahan/action point;
- melihat riwayat sesi yang relevan.

### 5.3 Administrator

Admin bertanggung jawab terhadap:

- user management;
- counselor management;
- session management;
- content management;
- moderation;
- reports;
- platform configuration.

---

## 6. Core Product Principles

### 6.1 Simple

Pengguna harus dapat memahami apa yang harus dilakukan tanpa tutorial panjang.

### 6.2 Friendly

Gunakan bahasa yang manusiawi dan tidak terlalu formal.

Contoh:

❌ “Silakan masukkan permasalahan psikologis Anda.”

✅ “Ada yang lagi kepikiran?”

---

### 6.3 Non-judgmental

Platform tidak boleh memberikan kesan menghakimi pengguna.

---

### 6.4 Privacy First

Informasi counseling adalah data sensitif dan harus diperlakukan secara serius.

---

### 6.5 Human First

Teknologi membantu proses counseling, tetapi counselor tetap menjadi manusia yang melakukan counseling.

---

### 6.6 Minimal Complexity

Setiap fitur harus menjawab pertanyaan:

“Apakah fitur ini benar-benar membantu pengguna?”

Jika tidak, jangan dimasukkan ke V1.

---

## 7. Core User Journey

**Journey A — First Visit**

Landing Page
↓
Explore
↓
Click “Aku Mau Cerita”
↓
Select Topic
↓
Tell Your Story
↓
Select Counseling Preference
↓
View Available Counselors
↓
Choose Counselor
↓
Start Counseling
↓
Chat
↓
End Session
↓
Simple Reflection

---

## 8. Main Features

### 8.1 Homepage

Homepage harus menjadi entry point yang sangat sederhana.

**Hero**

Headline:

**Ada yang lagi berat di pikiran?** 💭

Supporting copy:

Kamu nggak harus menghadapi semuanya sendirian. Ceritakan apa yang sedang kamu rasakan.

Primary CTA:

**Aku Mau Cerita**

Secondary CTA:

**Cari Tahu Dulu**

---

**Topic Cards**

User dapat memilih:

- ❤️ Percintaan
- 🏠 Keluarga
- 🫂 Pertemanan
- 🎓 Sekolah / Kuliah
- 🌱 Diri Sendiri
- 🌧️ Perasaan & Emosi
- 🧭 Masa Depan
- 🤷 Aku Nggak Tahu

Kategori terakhir sangat penting.

User tidak wajib mengetahui masalahnya.

---

### 8.2 Counseling Intake

Intake harus sederhana.

**Step 1 — Topic**

**Kamu mau cerita tentang apa?**

User memilih satu atau lebih kategori.

---

**Step 2 — Story**

**Ceritakan sedikit apa yang terjadi.**

Textarea.

Placeholder:

“Nggak perlu rapi atau lengkap. Cerita aja seperti kamu sedang ngobrol.”

---

**Step 3 — What Do You Need?**

User memilih:

🫂 **Aku ingin didengarkan**

💡 **Aku ingin mencari solusi**

🤝 **Aku ingin keduanya**

---

**Step 4 — Optional Mood**

**Sekarang kamu merasa bagaimana?**

😄
🙂
😐
😔
😭
😡
😰

Mood tidak wajib diisi.

---

**Step 5 — Confirmation**

**Cerita kamu sudah siap.** 🌱

Kami akan membantu mencarikan counselor yang sesuai.

CTA:

**Lihat Counselor**

---

### 8.3 Counselor Directory

Halaman daftar counselor.

Setiap counselor memiliki:

- profile photo;
- display name;
- role;
- verified status;
- specialties;
- short introduction;
- availability;
- counseling language;
- current status.

Example:

🌷 **Kak Naya**

### Counselor

❤️ Relationship
🏠 Family
🌱 Self Growth

“Aku percaya setiap orang punya cerita yang layak didengarkan.”

🟢 Available

**[Mulai Chat]**

---

### Counselor Status

🟢 **Available**

Dapat menerima counseling.

🟡 **Busy**

Sedang menangani sesi.

⚪ **Offline**

Tidak tersedia.

---

### 8.4 Counseling Chat

Core feature platform.

Chat harus terasa seperti aplikasi messaging biasa.

**Features**

- send message;
- receive message;
- timestamps;
- online status;
- typing indicator;
- unread messages;
- message history;
- basic attachment support;
- session status.

Tidak perlu voice/video untuk V1.

---

### Chat Header

Contoh:

🌷 Kak Naya
Counselor
🟢 Available

---

### First Message

Counselor dapat menggunakan template:

“Hai 👋 Terima kasih sudah mau cerita. Kamu boleh mulai dari mana aja. Nggak harus runtut.”

---

### 8.5 Session Management

Setiap counseling session memiliki status.

**Status:**

- Pending
- Active
- Waiting
- Completed
- Cancelled

---

### Session Data

- client;
- counselor;
- topic;
- intake summary;
- start time;
- end time;
- session status;
- counselor notes;
- client reflection.

---

### 8.6 Mood Check

Fitur sederhana.

Homepage:

**Gimana keadaanmu hari ini?** 🌤️

Pilihan:

😄 Great
🙂 Good
😐 Okay
😔 Not good
😭 Very difficult

Setelah memilih:

**Mau cerita sedikit?**

Optional textarea.

---

### Mood History

User dapat melihat history sederhana.

Contoh:

**September**

20 Sep — 😔
19 Sep — 🙂
18 Sep — 😐
17 Sep — 😔

Tidak menggunakan scoring atau diagnosis.

---

### 8.7 Private Journal

User memiliki private journal.

### Create Entry

**Apa yang ada di pikiranmu?**

Textarea.

Mood:

😄 🙂 😐 😔 😭

Button:

**Simpan**

---

### Journal List

Example:

## 20 September

“Hari ini akhirnya aku berani cerita tentang masalahku.”

## 18 September

“Aku masih merasa sedikit bingung…”

---

### Privacy

Journal hanya dapat diakses oleh user.

Counselor tidak dapat melihat journal kecuali user secara eksplisit membagikannya.

---

### 8.8 Counseling Reflection

Setelah session selesai:

**Sebelum kamu pergi…** 🫶

**Bagaimana perasaanmu sekarang?**

😌 Lebih lega
🙂 Lumayan
😐 Biasa saja
😔 Masih berat

Optional:

**Ada sesuatu yang ingin kamu bicarakan lagi nanti?**

Textarea.

---

### 8.9 Counseling History

User dapat melihat:

**My Counseling**

Contoh:

## 20 September 2026

🌷 Kak Naya

Topic:
Relationship

Status:
Completed

---

User dapat membuka session history.

History hanya menampilkan informasi yang memang diperlukan.

---

### 8.10 Resource Center

Nama halaman:

**Ruang Baca** 🌱

Konten pendek.

Contoh:

**Relationship**

- Ketika hubungan terasa melelahkan
- Cara berkomunikasi ketika sedang marah
- Setelah putus: apa yang bisa dilakukan?

**Family**

- Ketika sulit berbicara dengan orang tua
- Mengenal personal boundaries

**Student**

- Ketika tugas terasa terlalu banyak
- Menghadapi tekanan akademik

**Self**

- Ketika kehilangan motivasi
- Belajar menerima diri sendiri

---

### Content Format

- title;
- illustration;
- category;
- estimated reading time;
- article;
- related resources.

Konten tidak boleh memberikan diagnosis.

---

### 8.11 Emergency / Help Now

Accessible dari seluruh website.

CTA:

🆘 **Butuh bantuan sekarang?**

Halaman khusus untuk situasi ketika pengguna merasa tidak aman atau membutuhkan bantuan segera.

Informasi harus:

- jelas;
- singkat;
- mudah ditemukan;
- tidak menghakimi.

Halaman dapat mengarahkan pengguna ke:

- layanan darurat setempat;
- layanan krisis yang relevan;
- orang terpercaya;
- fasilitas kesehatan;
- bantuan profesional.

Counseling chat biasa tidak boleh diposisikan sebagai pengganti bantuan darurat.

---

## 9. User Account

Account tidak perlu kompleks.

### Profile

- display name;
- email;
- profile picture optional;
- preferred language;
- basic preferences.

---

### Account Menu

- My Counseling
- Journal
- Mood History
- Privacy
- Settings
- Help
- Logout

---

## 10. Counselor Dashboard

Counselor dashboard harus jauh lebih sederhana dibanding admin.

### Dashboard

### Today

- Active Sessions
- Waiting Sessions
- Upcoming Sessions

---

### Client List

Counselor dapat melihat:

- client identifier;
- topic;
- session status;
- last session;
- unread message.

---

### Session Detail

Counselor dapat melihat:

### Client

Anonymous/Display Name

**Topic**

Relationship

**Intake**

Ringkasan cerita awal.

### Chat

Conversation.

**Private Counselor Notes**

Catatan internal counselor.

**Action Points**

Hal yang disarankan untuk sesi berikutnya.

---

## 11. Admin Dashboard

Admin dashboard:

### Overview

- total users;
- active counselors;
- active sessions;
- completed sessions;
- reported content;
- system status.

---

### User Management

Admin dapat:

- melihat user;
- suspend user;
- deactivate account;
- melihat basic activity;
- menangani report.

---

### Counselor Management

Admin dapat:

- add counselor;
- edit counselor;
- verify counselor;
- deactivate counselor;
- set availability;
- manage specialties.

---

### Content Management

Admin dapat:

- create article;
- edit article;
- publish;
- unpublish;
- delete.

---

### Report Management

User dapat melaporkan:

- inappropriate behavior;
- harassment;
- unsafe content;
- counselor issue;
- technical issue.

Admin dapat review report.

---

## 12. Authentication

Authentication menggunakan:

**Supabase Auth**

Supported:

- Email/password
- Magic link
- Google OAuth (optional)

Untuk V1, email authentication sudah cukup.

---

## 13. Privacy & Security

Karena platform menangani data counseling, security adalah prioritas tinggi.

### Requirements

- HTTPS;
- Supabase Row Level Security;
- secure authentication;
- role-based access;
- encrypted transport;
- secure file storage;
- private journal access;
- counselor-client data isolation;
- admin permission control;
- session authorization.

---

## 14. Role-Based Access Control

Roles:

**CLIENT**

Dapat:

- manage own profile;
- create intake;
- chat;
- manage own journal;
- manage mood;
- view own counseling history.

**COUNSELOR**

Dapat:

- manage assigned sessions;
- chat with assigned clients;
- create counselor notes;
- manage availability.

Tidak dapat:

- melihat journal private client;
- melihat client yang tidak ditugaskan.

**ADMIN**

Dapat:

- manage users;
- manage counselors;
- manage sessions;
- manage content;
- manage reports.

---

## 15. Database Architecture

Database:

**Supabase PostgreSQL**

Suggested tables:

**users / profiles**

```text
id
email
display_name
avatar_url
role
created_at
updated_at
```

---

**counselor_profiles**

```text
id
user_id
bio
specialties
languages
is_verified
availability_status
created_at
updated_at
```

---

**counseling_requests**

```text
id
client_id
topic
description
support_type
mood
status
created_at
updated_at
```

---

**counseling_sessions**

```text
id
request_id
client_id
counselor_id
status
started_at
ended_at
created_at
updated_at
```

---

**messages**

```text
id
session_id
sender_id
message
attachment_url
created_at
```

---

**counselor_notes**

```text
id
session_id
counselor_id
notes
created_at
updated_at
```

---

**session_reflections**

```text
id
session_id
client_id
mood_after
reflection
created_at
```

---

**mood_entries**

```text
id
user_id
mood
note
created_at
```

---

**journal_entries**

```text
id
user_id
content
mood
created_at
updated_at
```

---

**articles**

```text
id
title
slug
category
excerpt
content
cover_image
status
created_at
updated_at
```

---

**reports**

```text
id
reporter_id
target_type
target_id
reason
description
status
created_at
resolved_at
```

---

## 16. Realtime Architecture

Counseling chat menggunakan:

**Supabase Realtime**

Flow:

Client sends message
↓
Next.js Server / Supabase
↓
Message stored in PostgreSQL
↓
Supabase Realtime event
↓
Counselor receives message instantly

---

## 17. File Storage

Menggunakan:

**Supabase Storage**

Untuk:

- counselor avatar;
- optional chat attachment;
- article images.

Storage bucket harus menggunakan permission yang sesuai.

Private user files tidak boleh menggunakan public bucket.

---

## 18. Recommended Tech Stack

### Frontend

**Next.js**

- App Router
- TypeScript
- Server Components
- Client Components only when necessary

---

### Styling

**Tailwind CSS**

---

### UI Components

**shadcn/ui**

Digunakan sebagai foundation component, kemudian diberikan custom styling agar tidak terlihat seperti default shadcn.

---

### Icons

**Lucide React**

---

### Forms

**React Hook Form**

---

### Validation

**Zod**

---

### Backend

**Supabase**

- PostgreSQL
- Auth
- Realtime
- Storage
- Row Level Security

---

### Deployment

### Vercel

Next.js application di-deploy melalui Vercel.

---

### Optional Libraries

- date-fns
- Zustand jika state management benar-benar diperlukan
- Sonner untuk toast notification
- Framer Motion untuk micro-interactions ringan

Jangan menambahkan library jika native Next.js/React sudah cukup.

---

## 19. UI/UX Direction

### Design Personality

Keywords:

**Friendly**

**Warm**

**Colorful**

**Soft**

**Human**

**Safe**

**Simple**

---

### Avoid

- corporate look;
- hospital look;
- excessive blue;
- excessive gradients;
- complex dashboard;
- excessive cards;
- overly technical terminology;
- excessive animations.

---

## 20. Color Direction

Suggested base:

### Background

Warm White / Cream

### Primary

Soft Pink

### Secondary

Lavender

### Accent

Sky Blue

### Accent 2

Mint

### Highlight

Warm Yellow

Color harus digunakan secara konsisten dan tidak membuat accessibility buruk.

---

## 21. Typography

Gunakan font modern dan friendly.

Recommended:

**Plus Jakarta Sans**

atau

**Inter**

Untuk heading dapat menggunakan font yang sedikit lebih expressive jika tetap readable.

---

## 22. Responsive Design

Website wajib responsive.

Priority:

1. Mobile
2. Tablet
3. Desktop

Karena mayoritas user kemungkinan mengakses melalui smartphone.

---

## 23. Navigation

Mobile:

Home

Chat

Journal

Profile

Desktop:

Logo

Home

Counseling

Journal

Ruang Baca

Profile

---

## 24. Notifications

V1 menggunakan notification sederhana:

- new counseling message;
- counseling request update;
- counselor response;
- session completed.

Notification dapat menggunakan:

- in-app notification;
- browser notification jika diizinkan.

Email notification dapat menjadi tahap berikutnya.

---

## 25. Search

Search hanya diperlukan untuk:

- counselor;
- resource/article.

Tidak perlu global search kompleks.

---

## 26. Accessibility

Website harus mengikuti accessibility best practices.

Requirements:

- semantic HTML;
- keyboard navigation;
- visible focus state;
- sufficient color contrast;
- alt text;
- accessible buttons;
- readable font sizes;
- screen reader-friendly labels.

---

## 27. Error Handling

Friendly error messages.

❌

Error 500 Internal Server Error

✅

**Hmm, sepertinya ada sedikit masalah.** 🥲
Coba lagi dalam beberapa saat.

---

## 28. Empty States

Empty state harus tetap friendly.

**No Journal**

**Belum ada cerita di sini** 🌱

Kalau ada sesuatu yang ingin kamu tulis, kamu bisa mulai kapan saja.

**[ Tulis Journal ]**

---

**No Counseling**

**Belum ada sesi counseling.**

Kalau kamu ingin cerita, kami ada di sini. 🫂

**[ Mulai Cerita ]**

---

## 29. Safety Requirements

Platform harus memiliki safety mechanism.

### Prohibited

Counseling platform tidak boleh mengklaim:

- diagnosis;
- treatment;
- medical cure;
- guaranteed recovery.

---

### Crisis Handling

Jika sistem intake mendeteksi indikasi situasi berbahaya, user diarahkan ke:

**Help Now**

dan informasi bantuan darurat.

AI, jika digunakan di masa depan, tidak boleh mengambil keputusan klinis atau menjadi pengganti counselor.

---

## 30. Data Privacy Principles

User harus mendapatkan informasi yang jelas mengenai:

- data yang dikumpulkan;
- alasan data digunakan;
- siapa yang dapat mengakses data;
- bagaimana data disimpan;
- bagaimana menghapus akun.

---

## 31. Core Pages

### Public

- `/`
- `/about`
- `/counselors`
- `/resources`
- `/resources/[slug]`
- `/help-now`
- `/login`
- `/register`

### Client

- `/dashboard`
- `/counseling`
- `/counseling/new`
- `/counseling/[id]`
- `/journal`
- `/journal/[id]`
- `/mood`
- `/profile`
- `/settings`
- `/privacy`

### Counselor

- `/counselor`
- `/counselor/sessions`
- `/counselor/sessions/[id]`
- `/counselor/clients`
- `/counselor/profile`

### Admin

- `/admin`
- `/admin/users`
- `/admin/counselors`
- `/admin/sessions`
- `/admin/content`
- `/admin/reports`
- `/admin/settings`

---

## 32. API / Server Architecture

Next.js digunakan sebagai application layer.

Structure:

Client

   ↓

Next.js

   ↓

Supabase

   ├── Auth

   ├── PostgreSQL

   ├── Realtime

   └── Storage

Vercel:

Next.js Application

        ↓

      Vercel

        ↓

   Production App

---

## 33. Security Architecture

Implement:

- Supabase RLS;
- server-side authorization;
- role validation;
- protected routes;
- session validation;
- input validation;
- file validation;
- rate limiting;
- secure environment variables;
- no secret keys in client-side code.

Supabase service role key hanya boleh digunakan pada server-side environment.

---

## 34. Environment Variables

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Sensitive keys tidak boleh di-commit ke repository.

---

## 35. SEO

Public pages harus SEO-friendly.

Implement:

- metadata;
- Open Graph;
- sitemap;
- robots.txt;
- semantic HTML;
- proper heading hierarchy.

Resource articles harus dapat di-index oleh search engine jika memang diinginkan.

Private counseling pages tidak boleh di-index.

---

## 36. Performance

Target:

- fast first load;
- optimized images;
- lazy loading;
- minimal client-side JavaScript;
- Server Components wherever possible;
- avoid unnecessary dependencies.

Target UX:

User dapat mulai memahami website dalam beberapa detik tanpa loading yang mengganggu.

---

## 37. Analytics

Analytics harus sederhana.

Admin dapat mengetahui:

- number of registered users;
- counseling requests;
- completed sessions;
- active counselors;
- resource views.

Jangan membuat analytics kesehatan mental individual sebagai scoring.

---

## 38. MVP Scope

### MUST HAVE

### Client

- authentication;
- homepage;
- counseling intake;
- counselor list;
- counseling chat;
- session history;
- mood check;
- journal;
- resource center;
- help now;
- profile.

### Counselor

- authentication;
- dashboard;
- session list;
- client intake;
- chat;
- private notes;
- session completion;
- availability.

### Admin

- dashboard;
- user management;
- counselor management;
- content management;
- report management.

---

## 39. V1 Excluded Features

Untuk menjaga development tetap sederhana:

- video call;
- voice call;
- payment;
- subscription;
- AI therapist;
- AI diagnosis;
- AI personality analysis;
- advanced matching;
- complex recommendation engine;
- gamification;
- reward system;
- community/forum;
- group counseling;
- advanced mood analytics.

---

## 40. Development Strategy

Development harus dilakukan dengan urutan:

### Phase 1 — Frontend Foundation

Fokus utama:

- design system;
- responsive layout;
- homepage;
- navigation;
- counseling flow;
- counselor cards;
- chat UI;
- journal UI;
- mood UI;
- resource UI.

**Frontend harus terasa polished sebelum backend integration.**

---

### Phase 2 — Backend

Implement:

- Supabase project;
- database;
- authentication;
- RLS;
- storage;
- counselor management;
- sessions;
- messages;
- journal;
- mood;
- articles.

---

### Phase 3 — Integration

Integrasikan:

Frontend

   ↓

Next.js

   ↓

Supabase

Implement:

- authentication;
- counseling requests;
- counselor assignment;
- realtime chat;
- journal persistence;
- mood persistence;
- resource CMS;
- counselor dashboard.

---

### Phase 4 — Security & Validation

Test:

- authentication;
- authorization;
- RLS;
- client data isolation;
- counselor access;
- admin access;
- chat security;
- journal privacy;
- storage permissions.

---

### Phase 5 — Testing

Gunakan automated testing untuk critical flows.

Testing tools yang dapat digunakan:

- Playwright
- Vitest
- Testing Library
- TestSprite

Critical E2E:

Register

→ Login

→ Start Counseling

→ Submit Intake

→ Select Counselor

→ Open Session

→ Send Message

→ Receive Message

→ Complete Session

→ Submit Reflection

Journal:

Login

→ Create Journal

→ Save

→ Logout

→ Login

→ Verify Journal

Privacy:

Client A

→ Create Journal

Client B

→ Attempt Access Client A Journal

Expected:

ACCESS DENIED

---

## 41. Development Quality Rules

### TypeScript

Strict mode harus digunakan.

---

### Components

Gunakan reusable components.

Contoh:

- `Button`
- `Card`
- `Avatar`
- `Badge`
- `Modal`
- `Input`
- `Textarea`
- `MoodPicker`
- `CounselorCard`
- `ChatBubble`
- `SessionCard`
- `ArticleCard`
- `EmptyState`

---

### Feature Organization

Contoh:

```text
src/
├── app/
├── components/
├── features/
│   ├── counseling/
│   ├── journal/
│   ├── mood/
│   ├── resources/
│   └── profile/
├── lib/
├── hooks/
├── types/
└── utils/
```

---

## 42. Recommended Repository Structure

```text
counseling-platform/
│
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── (client)/
│   ├── counselor/
│   └── admin/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── counseling/
│   ├── journal/
│   ├── mood/
│   └── resources/
│
├── lib/
│   ├── supabase/
│   ├── auth/
│   └── validations/
│
├── hooks/
├── types/
├── utils/
├── public/
└── tests/
```

---

## 43. Design System

Create reusable tokens for:

### Colors

- `background`
- `foreground`
- `primary`
- `secondary`
- `accent`
- `muted`
- `success`
- `warning`
- `danger`

### Radius

Gunakan rounded corners yang friendly tetapi tidak berlebihan.

### Shadows

Soft shadows.

### Spacing

Consistent spacing system.

### Buttons

Primary:

Mulai Cerita

Secondary:

Lihat Counselor

Tertiary:

Nanti Saja

---

## 44. UX Copy Guidelines

Bahasa harus:

- Bahasa Indonesia;
- friendly;
- conversational;
- tidak terlalu formal;
- tidak menghakimi;
- tidak menggunakan istilah medis jika tidak diperlukan.

Contoh:

❌ “Masukkan deskripsi masalah Anda.”

✅ “Ceritakan sedikit apa yang terjadi.”

❌ “Submit Counseling Request.”

✅ “Mulai Cerita.”

❌ “Counseling Session Completed.”

✅ “Sesi kamu sudah selesai. 🫶”

---

## 45. Success Metrics

Karena platform gratis, fokus metric bukan revenue.

### Primary Metrics

**Counseling Start Rate**

Berapa banyak visitor yang memulai intake.

**Counseling Completion Rate**

Berapa banyak intake yang berakhir menjadi sesi counseling.

**Session Completion**

Berapa banyak sesi yang berhasil diselesaikan.

**Returning Users**

Berapa banyak user yang kembali menggunakan platform.

**Counselor Response Rate**

Berapa banyak counseling request yang mendapatkan response.

---

## 46. Qualitative Success

Produk dianggap berhasil jika user merasa:

“Gampang banget buat mulai cerita.”

“Aku nggak merasa dihakimi.”

“Aku tahu harus mulai dari mana.”

“Aku merasa didengarkan.”

“Aku mau kembali kalau butuh cerita lagi.”

---

## 47. MVP Acceptance Criteria

### Homepage

- ☐ Homepage responsive.
- ☐ CTA “Aku Mau Cerita” berfungsi.
- ☐ Topic cards berfungsi.
- ☐ Help Now mudah ditemukan.
- ☐ Tidak terasa seperti website corporate.

### Counseling

- ☐ User dapat membuat counseling request.
- ☐ User dapat memilih topic.
- ☐ User dapat menulis cerita.
- ☐ User dapat memilih support type.
- ☐ User dapat melihat counselor.
- ☐ User dapat memulai session.

### Chat

- ☐ Messages dapat dikirim.
- ☐ Messages tersimpan.
- ☐ Realtime messages bekerja.
- ☐ User hanya dapat melihat session miliknya.
- ☐ Counselor hanya dapat melihat session yang ditugaskan.

### Journal

- ☐ User dapat membuat journal.
- ☐ User dapat melihat journal miliknya.
- ☐ User lain tidak dapat mengakses journal.
- ☐ Counselor tidak dapat mengakses journal private tanpa izin.

### Mood

- ☐ User dapat melakukan mood check.
- ☐ Mood tersimpan.
- ☐ User dapat melihat history sederhana.

### Counselor

- ☐ Counselor dapat login.
- ☐ Counselor dapat melihat session.
- ☐ Counselor dapat chat.
- ☐ Counselor dapat membuat private notes.
- ☐ Counselor dapat menyelesaikan session.

### Admin

- ☐ Admin dapat mengelola counselor.
- ☐ Admin dapat mengelola user.
- ☐ Admin dapat mengelola artikel.
- ☐ Admin dapat melihat reports.

---

## 48. Deployment

Production deployment:

GitHub

   ↓

Vercel

   ↓

Next.js Production

   ↓

Supabase

Environment:

### Development

Local Next.js + Supabase project

### Staging

Vercel Preview + Supabase staging

### Production

Vercel Production + Supabase Production

---

## 49. Development Tools

Recommended:

### Code

- VS Code / Cursor / OpenCode
- Git
- GitHub

### Documentation / Research

**Context7** digunakan untuk mendapatkan dokumentasi terbaru dari:

- Next.js
- Supabase
- Tailwind
- shadcn/ui

Developer harus menghindari mengandalkan API/library knowledge yang sudah outdated ketika dokumentasi resmi tersedia.

### Testing

- Playwright
- Vitest
- Testing Library
- TestSprite

---

## 50. Final Product Definition

Produk V1 harus dapat memberikan pengalaman berikut:

User membuka website.
↓
**“Ada yang lagi berat di pikiran?”**
↓
Klik:

**“Aku Mau Cerita.”**
↓
Pilih:

❤️ Percintaan
↓
Cerita:

“Aku sedang punya masalah dengan pasangan…”
↓
Pilih:

🫂 Aku ingin didengarkan
↓
Melihat counselor:

🌷 Kak Naya
Relationship Counselor
🟢 Available
↓
Klik:

**Mulai Chat**
↓
Counseling berlangsung.
↓
Sesi selesai.
↓
**“Gimana perasaanmu sekarang?”**
↓
User memilih:

😌 Lebih lega.
↓
User dapat kembali kapan pun melalui:

**Chat / Journal / Mood / Ruang Baca**

---

## 51. Product Philosophy

Produk ini tidak perlu menjadi platform yang memiliki ratusan fitur.

Justru kekuatan produk adalah:

**Simple enough to use when you’re overwhelmed.**

Seseorang yang sedang memiliki masalah tidak membutuhkan dashboard yang rumit.

Mereka membutuhkan:

**tempat untuk mulai cerita,**

**seseorang yang mau mendengarkan,**

**dan ruang untuk kembali ketika mereka membutuhkannya.**

---

## 52. V1 Feature Priority

> **Catatan:** Konten untuk bagian ini tidak tersedia sebagai teks pada dokumen sumber.

---

## 53. Final Tech Stack

> **Catatan:** Konten untuk bagian ini tidak tersedia sebagai teks pada dokumen sumber.

---

## 54. Definition of Done

V1 dinyatakan selesai apabila:

1. Client dapat register/login.
2. Client dapat memulai counseling.
3. Client dapat mengisi intake.
4. Client dapat menemukan counselor.
5. Client dapat melakukan chat realtime.
6. Counselor dapat menerima dan membalas chat.
7. Session dapat dimulai dan diselesaikan.
8. Client dapat melakukan reflection.
9. Client dapat menggunakan journal.
10. Client dapat melakukan mood check.
11. Client dapat membaca resources.
12. Help Now tersedia.
13. RLS telah diuji.
14. Client tidak dapat mengakses data client lain.
15. Counselor tidak dapat mengakses data yang tidak menjadi haknya.
16. Admin dapat mengelola platform.
17. Responsive mobile dan desktop.
18. Critical user flows telah melewati automated testing.
19. Production deployment berhasil di Vercel.
20. Tidak terdapat credential/secrets yang terekspos pada client.
21. UX tetap sederhana, friendly, colorful, dan tidak terasa seperti aplikasi corporate/medical.

---

## 55. Core Message

**Website ini bukan tentang memiliki banyak fitur.**

Website ini tentang membuat seseorang yang sedang berkata:

**“Aku lagi nggak baik-baik aja.”**

bisa dengan mudah menemukan jalan untuk mengatakan:

**“Aku mau cerita.”**

Dan dari sana, mereka mendapatkan tempat yang aman untuk didengarkan. 🌱
