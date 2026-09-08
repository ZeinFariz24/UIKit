# Panduan Penggunaan — UI KIT Admin Proyek Lapangan

Dokumen ini memandu **cara memakai project UI KIT dari nol**: persyaratan, instalasi, build, sampai penggunaan library (komponen, tema, dan API programatik) di halaman Anda sendiri.

> Rujukan lain: [`README.md`](README.md) (ringkas) · [`uikit.md`](uikit.md) (spesifikasi) · [`ModulUIKit.md`](ModulUIKit.md) (peta modul) · [`CommandUIKit.md`](CommandUIKit.md) (fase pengerjaan) · [`REVIEW.md`](REVIEW.md) (hasil review).

---

## 1. Persyaratan Sistem

| Kebutuhan | Versi | Catatan |
|---|---|---|
| **Node.js** | **≥ 22** | Dicek `package.json` (`engines.node`) — wajib untuk script build & QA |
| **npm** | apa pun (ikut Node) | Manajer paket |
| **Chrome** | terbaru | *Opsional* — hanya untuk smoke test & audit visual (headless, port 9223) |
| **Browser target** | modern (Chrome, Edge, Firefox, Safari) | Kit memakai CSS modern (`color-mix()`, `backdrop-filter`, `100dvh`); browser lama tetap berfungsi dengan degradasi halus |

Cek versi Anda:

```bash
node -v && npm -v
```

---

## 2. Instalasi

```bash
# 1. Masuk ke folder project
cd uikit_

# 2. Pasang dependensi (Bootstrap 5.3.8, FontAwesome 7, AOS, + tooling build)
npm install
```

Yang terpasang (dari `package.json`):

- **Dependencies** (resource override): `bootstrap@5.3.8`, `@fortawesome/fontawesome-free`, `aos`
- **DevDependencies** (tooling): `sass`, `terser`, `eslint`, `prettier`, `stylelint`

```bash
# 3. (Opsional) Bangkitkan aset demo audio bila belum ada
npm run assets
```

Setelah instalasi, struktur folder:

```
uikit_/
├─ *.html (10 halaman)          ← halaman demo & output M5
├─ scss/                        ← sumber SCSS (uikit.scss entry + _tokens/_components/_utilities)
├─ js/uikit.js                  ← sumber JS (tema + API window.Uikit.* + auto-init)
├─ dist/                        ← HASIL BUILD (yang dipakai di halaman) — MANDIRI 100%
│   ├─ css/uikit.css, uikit.min.css (+ .map)
│   ├─ js/uikit.js, uikit.min.js, uikit.bundle.min.js (+ .map)
│   ├─ webfonts/                ← font FontAwesome
│   └─ fonts/                   ← font Montserrat (disalin build dari assets/fonts)
├─ assets/                      ← aset sumber (SVG, video, audio, font Montserrat)
├─ scripts/                     ← build + skrip QA
├─ node_modules/                ← dependensi (jangan diedit)
└─ *.md                         ← dokumentasi
```

> **Penting:** folder `node_modules/` adalah *resource override* — ketiga library di-import langsung dari sana saat build. Jangan mengubah/menyalin isinya.

---

## 3. Build — Menghasilkan 8 Artefak (M4)

Semua kompilasi lewat script npm (jalur output sudah sesuai Point 5 `uikit.md`):

```bash
npm run build:css     # SCSS → dist/css/uikit.css & uikit.min.css (+ source map) + salin dist/webfonts/
npm run build:js      # js/uikit.js → dist/js/uikit.js, uikit.min.js, uikit.bundle.min.js (+ source map)
npm run assets        # bangkitkan aset demo (audio WAV) bila belum ada
```

| Perintah | Menghasilkan | Aturan M4 |
|---|---|---|
| `build:css` | `dist/css/uikit.css` + `uikit.min.css` + `.map` + `dist/webfonts/` + `dist/fonts/` | aturan 2–4 |
| `build:js` | `dist/js/uikit.js` + `uikit.min.js` + `uikit.bundle.min.js` + `.map` | aturan 5–8 |

**Isi `uikit.bundle.min.js`** (3 library → 1, urutan): Bootstrap `bootstrap.bundle.min.js` → AOS `aos.js` → `js/uikit.js` (tema + komponen). FontAwesome **tidak** ikut JS — ikon dimuat via webfont CSS (hemat ±1,6 MB).

Contoh hasil akhir (ukuran min, 8 Sep 2026): `uikit.min.css` ±440 KB · `uikit.bundle.min.js` ±146 KB · `uikit.min.js` ±54 KB.

---

## 4. Menggunakan Library di Halaman Anda

Prinsip inti: **HTML bersih** — tiap halaman hanya memuat **1 CSS + 1 JS**, tanpa inline style/script/handler. Semua interaksi lewat atribut `data-*` (auto-init) atau API `window.Uikit.*`.

### 4.1 Kerangka halaman minimal

```html
<!doctype html>
<html lang="id" data-bs-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Halaman Saya — UI KIT</title>
  <!-- 1 CSS saja (jalur sesuaikan lokasi file Anda) -->
  <link href="dist/css/uikit.min.css" rel="stylesheet">
</head>
<body>

  <!-- Konten Anda: komponen Bootstrap/uk-* + atribut data-* -->

  <!-- 1 JS saja (bundel berisi Bootstrap + AOS + tema + komponen) -->
  <script src="dist/js/uikit.bundle.min.js"></script>
</body>
</html>
```

> Pakai `dist/css/uikit.css` (expanded) untuk pengembangan/debug, `uikit.min.css` untuk produksi.

> **Distribusi:** folder `dist/` **mandiri 100%** — memuat CSS bundel, JS bundel, webfonts FontAwesome, dan font Montserrat (`dist/fonts/`). Untuk memakai di project lain, cukup salin folder `dist/` (tanpa `node_modules/`, `scss/`, `js/`, atau `assets/`); aset `assets/` hanya diperlukan oleh halaman demo. Terverifikasi headless 8 Sep (font, ikon, JS, tema — semua termuat).

### 4.2 Mode tema — Dark / Light / Auto

**Auto-init**: tambahkan tombol/dropdown dengan `data-bs-theme-value="light|dark|auto"`. Klik akan menyimpan ke `localStorage("theme")`, mengubah `<html data-bs-theme>`, dan memperbarui ikon `.theme-icon-active`.

```html
<div class="dropdown uk-theme-switcher">
  <button class="dropdown-toggle" type="button" data-bs-toggle="dropdown"
          aria-expanded="false" aria-label="Mode tampilan">
    <i class="fa-solid fa-sun theme-icon-active"></i>
  </button>
  <ul class="dropdown-menu dropdown-menu-end shadow-sm">
    <li><h6 class="dropdown-header">Pilih Mode</h6></li>
    <li><a class="dropdown-item" href="#" data-bs-theme-value="light"><i class="fa-solid fa-sun me-2"></i>Light</a></li>
    <li><a class="dropdown-item" href="#" data-bs-theme-value="dark"><i class="fa-solid fa-moon me-2"></i>Dark</a></li>
    <li><a class="dropdown-item" href="#" data-bs-theme-value="auto"><i class="fa-solid fa-cloud-sun me-2"></i>Auto (Sistem)</a></li>
  </ul>
</div>
```

**API imperatif:**

```js
Uikit.theme.get();               // nilai tersimpan: "light" | "dark" | "auto" | null
Uikit.theme.active();            // mode aktif di <html>: "light" | "dark"
Uikit.theme.system();            // preferensi sistem saat ini
Uikit.theme.set("dark");         // set mode + simpan + perbarui ikon → "dark"
```

Mode `auto` mengikuti `prefers-color-scheme` sistem secara real-time. Grafik canvas (`.uk-chart`) otomatis ikut redraw saat tema berganti.

### 4.3 Komponen — auto-init via atribut `data-*`

Semua modul terdaftar otomatis saat `DOMContentLoaded`. **Tidak perlu JavaScript apa pun** — cukup pasang atribut di markup. Modul tanpa elemen yang cocok di halaman dilewati (tanpa error).

| # | Modul | Hook utama (atribut) | Contoh markup |
|---|---|---|---|
| 1 | **Sidebar** | `[data-sidebar]` `[data-sidebar-toggle]` `[data-sidebar-overlay]` `[data-main]` `[data-submenu-toggle]` | `<aside class="uk-sidebar" data-sidebar>…` |
| 2 | **Navbar scroll** | `[data-navbar]` | tambah kelas `.is-scrolled` saat scroll > 24px |
| 3 | **Navbar mobile** | `.uk-navbar .navbar-collapse` | tutup panel otomatis setelah pilih menu |
| 4 | **Back to top** | `[data-back-to-top]` | muncul setelah scroll > 400px; hormati reduced-motion |
| 5 | **Salin kode** | `[data-code-block]` | tombol salin otomatis dibuat untuk blok kode |
| 6 | **Cari dokumentasi** | `[data-docs-search]` `[data-doc-link]` `[data-doc-group]` `[data-docs-empty]` | filter sidebar dokumentasi |
| 7 | **Lightbox** | `[data-lightbox]` | klik item galeri → dialog gambar (a11y: focus trap + restore) |
| 8 | **Counter angka** | `[data-counter]` (+ `[data-suffix]`) | animasi angka saat terlihat |
| 9 | **Kanban** | `[data-kanban-column]` `[data-kanban-count]` `[data-kanban-status="todo\|doing\|done"]` | drag antar kolom + keyboard `Ctrl+Shift+←/→` / `Alt+↑/↓` + live region SR |
| 10 | **Filter galeri** | `[data-filter]` `[data-category]` | filter item (`data-filter="all"` = semua) |
| 11 | **Toggle password** | `[data-password-toggle]` (+ `data-target`) | tampil/sembunyi password |
| 12 | **Dropzone upload** | `[data-dropzone]` `[data-file-name]` | drag & drop file, label nama file |
| 13 | **Progress on view** | `[data-progress]` | animasi lebar saat elemen terlihat |
| 14 | **Scrollspy** | `[data-scrollspy]` | aktifkan tautan sesuai posisi scroll |
| 15 | **Tilt 3D** | `[data-tilt]` | efek miring saat hover (nonaktif di sentuh/reduced-motion) |
| 16 | **AOS** | `[data-aos]` (atribut AOS standar) | animasi saat scroll; otomatis dinonaktifkan saat reduced-motion |
| 17 | **Plugin Bootstrap** | `data-bs-*` (semua) | collapse, dropdown, modal, offcanvas, toast, tooltip, popover, carousel, tab, scrollspy, accordion |
| 18 | **DataTable** | `[data-dt-search]` `[data-dt-count]` `[data-dt-table]` | pencarian real-time + hitung hasil |
| 19 | **Sortir tabel** | `[data-sort]` | klik header untuk urut (angka vs teks dibedakan) |
| 20 | **Tree table** | `[data-tree-body]` `[data-tree-toggle]` `[data-tree-level]` `[data-tree-open]` | expand/collapse baris |
| 21 | **Whiteboard** | `[data-whiteboard]` `[data-wb-tool]` `[data-wb-color]` | kanvas gambar manual (toolbar) |
| 22 | **Kalender** | `[data-calendar]` (+ `[data-cal-nav="prev\|next"]`) | navigasi bulan, pilih tanggal, tambah acara |
| 23 | **Widget catatan** | `[data-widget]` `[data-widget-add]` `[data-widget-remove]` | tambah/hapus kartu catatan |
| 24 | **Task card** | `.uk-task-card .form-check-input` | centang tugas → coret + ubah status kolom |
| 25 | **FAB cepat** | `[data-fab-menu]` `[data-fab-action]` | menu aksi melayang (theme/notify/note) |
| 26 | **Stepper** | `[data-stepper]` `[data-step-next]` `[data-step-prev]` | navigasi langkah |
| 27 | **Pagination** | `[data-paginate]` | navigasi halaman |
| 28 | **Notification** | `[data-notify]` `[data-notify-stack]` (+ `data-notify-title/text/type/duration/no-hide/initial`) | tumpukan notifikasi + animasi keluar + live region SR |
| 29 | **Skeleton** | `[data-skeleton-toggle]` `[data-skeleton-demo]` | simulasi muat |
| 30 | **Loading** | `[data-loading-toggle]` `[data-loading-demo]` | simulasi proses |
| 31 | **Charts** | `[data-chart]` `[data-chart-type]` | grafik canvas tanpa pustaka; redraw saat ganti tema |
| 32 | **Scheduler** | `[data-scheduler]` | jadwal; drag mouse + keyboard `Ctrl+Shift+panah` |
| 33 | **Datepicker** | `[data-datepicker]` | popup kalender Indonesia `dd/mm/yyyy` |
| 34 | **Timepicker** | `[data-timepicker]` | popup waktu Indonesia `HH:MM` |
| 35 | **Media player** | `[data-video-player]` `[data-audio-player]` (+ `data-media-toggle/seek/time/bar`) | player video/audio kustom |

**Contoh pemakaian komponen:**

```html
<!-- Kanban: kolom ber-status eksplisit -->
<div class="uk-kanban-column" data-kanban-column data-kanban-status="todo">
  <h5 class="uk-kanban-title">Antrian <span class="badge" data-kanban-count>2</span></h5>
  <div class="uk-kanban-dropzone">
    <label class="uk-task-card">
      <input type="checkbox" class="form-check-input"> Pengecekan alat berat
    </label>
  </div>
</div>
```

```html
<!-- Kalender + navigasi -->
<div class="uk-calendar" data-calendar></div>
<button data-cal-nav="prev">‹</button>
<button data-cal-nav="next">›</button>
```

```html
<!-- Notifikasi: tombol pemicu + tumpukan -->
<button class="btn btn-primary" data-notify data-notify-title="Berhasil"
        data-notify-text="Data proyek tersimpan." data-notify-type="success">
  Tampilkan notifikasi
</button>
<div class="uk-notify-stack" data-notify-stack></div>
```

```html
<!-- Datepicker & Timepicker -->
<input class="form-control" data-datepicker placeholder="dd/mm/yyyy">
<input class="form-control" data-timepicker placeholder="HH:MM">
```

### 4.4 API programatik — `window.Uikit.*`

Setiap modul mengembalikan objek API imperatif (auto-init tetap berjalan; `Uikit.*` adalah lapisan pemanggilan langsung). **Tersedia setelah `DOMContentLoaded`** — cek `Uikit.isReady` bila perlu, atau panggil di dalam event `DOMContentLoaded`/`Uikit.isReady`.

```js
// Eksplorasi: namespace apa saja yang aktif di halaman ini?
console.log(Object.keys(Uikit));
```

| Namespace | Metode (terverifikasi) | Contoh |
|---|---|---|
| `Uikit.version` | `"1.0.0"` | `Uikit.version` |
| `Uikit.theme` | `get() active() system() set(mode)` | `Uikit.theme.set("dark")` |
| `Uikit.sidebar` | `toggle() collapse() expand() openDrawer() closeDrawer() isCollapsed() isDrawerOpen() toggleSubmenu()` | `Uikit.sidebar.toggle()` |
| `Uikit.navbar` | `isScrolled() check()` | `Uikit.navbar.check()` |
| `Uikit.mobileNav` | `close()` | `Uikit.mobileNav.close()` |
| `Uikit.backToTop` | `show() hide() isVisible() scrollToTop()` | `Uikit.backToTop.scrollToTop()` |
| `Uikit.lightbox` | `open(target)` — elemen `[data-lightbox]`, selector, atau URL | `Uikit.lightbox.open("#galeri img:first-child")` |
| `Uikit.counter` | `run(element?)` | `Uikit.counter.run()` |
| `Uikit.galleryFilter` | `apply(value)` | `Uikit.galleryFilter.apply("proyek")` |
| `Uikit.passwordToggle` | `toggle(button?)` | `Uikit.passwordToggle.toggle()` |
| `Uikit.progress` | `set(target?, width)` | `Uikit.progress.set("#bar", 75)` |
| `Uikit.calendar` | `list() get() next() prev() goTo(y,mo) today() select(date) addEvent(date,title) clearEvents()` | `Uikit.calendar.next()` · `Uikit.calendar.addEvent("2026-09-20", "Rapat lapangan")` |
| `Uikit.charts` | `list() get() render(target,cfg) refresh() destroy()` | `Uikit.charts.refresh()` — redraw semua grafik |
| `Uikit.notification` | `push(cfg, stack?) close(item) clear(stack?) stacks()` | `Uikit.notification.push({ title: "Sukses", text: "Tersimpan", type: "success" })` |
| `Uikit.fab` | `run("theme"\|"notify"\|"note") toast(msg, icon?) list()` | `Uikit.fab.run("theme")` — putar tema |
| `Uikit.datepicker` | `open() close() isOpen() get() set(value) value()` | `Uikit.datepicker.set("20/09/2026")` |
| `Uikit.timepicker` | `open() close() isOpen() get() set(value) value()` | `Uikit.timepicker.set("13:30")` |
| `Uikit.video` / `Uikit.audio` | `list() get() toggle() seekTo(t) getState() mute(on?)` | `Uikit.video.toggle()` · `Uikit.video.seekTo(30)` |
| `Uikit.isReady` | `true` setelah init selesai | `if (Uikit.isReady) …` |

**Contoh lengkap — inisialisasi setelah DOM siap:**

```js
document.addEventListener("DOMContentLoaded", () => {
  Uikit.theme.set("auto");                     // ikuti sistem
  Uikit.calendar.next();                        // maju sebulan
  Uikit.notification.push({                    // notifikasi programatik
    title: "Proyek diperbarui",
    text: "Progress mingguan sudah masuk.",
    type: "info",
  });
  Uikit.sidebar.collapse();                     // ciutkan sidebar desktop
});
```

### 4.5 Bootstrap, FontAwesome, AOS — langsung tersedia

- **Bootstrap 5.3.8** — semua kelas & plugin tersedia via bundel: `data-bs-toggle="collapse|dropdown|modal|offcanvas|tooltip|popover|tab|toast"`, dll. Tooltip/popover perlu inisialisasi (`new bootstrap.Tooltip(...)` — namespace `bootstrap` global tersedia) atau ikuti pola demo.
- **FontAwesome 7** — kelas ikon biasa: `<i class="fa-solid fa-check"></i>`, `<i class="fa-brands fa-whatsapp"></i>`, `<i class="fa-regular fa-square"></i>`. Font dimuat dari `dist/webfonts/` (CSS lokal).
- **AOS** — `[data-aos="fade-up"]` (+ `data-aos-delay`, `data-aos-duration`, dst.) diinisialisasi otomatis dari bundel; dinonaktifkan saat `prefers-reduced-motion: reduce`.

---

## 5. QA & Verifikasi

### 5.1 Cek cepat (tanpa browser)

```bash
npm test               # audit statis (yatim/mati/hook) + build CSS + build JS
npm run lint           # ESLint (js, scripts) + stylelint (scss) — harus 0 temuan
npm run format:check   # Prettier — semua file harus bersih
```

### 5.2 Smoke test & audit visual (butuh Chrome headless)

```bash
# 1. Jalankan Chrome headless dengan remote debugging (sekali):
#    chrome --headless=new --remote-debugging-port=9223 --user-data-dir=<abs path>

# 2. Jalankan suite QA:
node scripts/smoke-uikit.mjs           # 96 cek API window.Uikit.* (4 halaman + reduced-motion)
node scripts/smoke-mobile-nav.mjs      # navbar mobile (dropdown statis, tutup otomatis)
node scripts/smoke-nav-comp.mjs        # tabs/breadcrumb/pagination mobile
node scripts/smoke-mobile-interact.mjs # offcanvas/sidebar/tema
node scripts/audit-overflow.mjs        # 9 halaman × 3 viewport (0 luber, 0 error konsol)
node scripts/audit-visual.mjs          # kontras/ikon/kliping → screenshots/visual-audit/report.txt
node scripts/capture-review.mjs        # galeri PNG → screenshots/review/
```

Hasil terakhir (8 Sep 2026): smoke **96/96** · overflow **27/27** · audit visual **0 isu** · lint & format bersih.

---

## 6. Pemecahan Masalah Umum

| Gejala | Penyebab & solusi |
|---|---|
| Ikon tidak tampil | `dist/webfonts/` belum ada → jalankan `npm run build:css` (script menyalin webfonts). |
| Font Montserrat tidak termuat di project lain | Pastikan ikut menyalin `dist/fonts/` (atau salin seluruh folder `dist/` — sudah termasuk font). |
| Perubahan SCSS/JS tidak muncul di halaman | Halaman memakai `dist/` (hasil build), bukan sumber → jalankan ulang `npm run build:css` dan/atau `npm run build:js`. |
| Halaman terbuka polos (tanpa gaya) | Pastikan jalur `<link>` benar dan file `dist/css/uikit.min.css` ada. |
| Komponen tidak bereaksi (`data-*`) | Pastikan `dist/js/uikit.bundle.min.js` dimuat **setelah** konten, dan tidak ada error JS lain di konsol (cek Console DevTools). |
| `npm install` gagal / versi Node tua | Upgrade ke Node ≥ 22 (lihat `engines` di `package.json`). |
| Smoke test tidak menemukan Chrome | Chrome headless belum berjalan di port 9223 — mulai dulu dengan `--remote-debugging-port=9223`. |
| Tema tidak tersimpan | Pastikan `localStorage` aktif; mode `auto` mengikuti sistem, nilai tersimpan di key `theme`. |
| Warna grafik tidak berubah saat ganti tema | Seharusnya otomatis (MutationObserver pada `data-bs-theme`); jika tidak, panggil `Uikit.charts.refresh()` atau muat ulang halaman. |

---

## 7. Halaman Demo (referensi pemakaian nyata)

| Halaman | Isi |
|---|---|
| `_test-component.html` | **Dokumentasi semua komponen** (seksi A–L) — sumber contoh markup terbaik |
| `dashboard.html` | Dashboard Admin Proyek (sidebar + wrapper, stats, charts, kanban, calendar, scheduler) |
| `landing.html` / `index.html` | Landing page (hero, fitur, gallery, CTA) + AOS |
| `login.html` / `register.html` / `forgot-password.html` | Panel auth |
| `404.html` | Halaman tidak ditemukan |
| `privacy-policy.html` / `terms-conditions.html` | Halaman legal |

Cara tercepat belajar: buka `_test-component.html` di browser, lalu lihat markup-nya — setiap komponen punya contoh HTML siap salin (tombol **salin kode** tersedia di seksi dokumentasi).

---

*Dokumen disusun dari verifikasi langsung terhadap kode (`js/uikit.js`, `scripts/`, `package.json`) — 8 September 2026.*