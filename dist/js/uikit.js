// ============================================================
// UI KIT — CUSTOM JS  (uikit_)
// Modul M2 (color mode) + interaksi berbasis atribut data-*
// Dikenakan via bundle: tidak ada skrip inline di halaman output
// ============================================================
(() => {
  "use strict";

  /* ==========================================================
     1. COLOR MODE — Dark / Light / Auto  (Modul M2 uikit.md)
        Ikon auto: fa-cloud-sun (keputusan user, Gap G4)
     ========================================================== */
  const html = document.documentElement;
  const themeSwitcher = window.matchMedia("(prefers-color-scheme: dark)");

  const getStoredTheme = () => localStorage.getItem("theme");
  const setStoredTheme = (theme) => localStorage.setItem("theme", theme);

  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme();
    return storedTheme || (themeSwitcher.matches ? "dark" : "light");
  };

  const setTheme = (theme) => {
    const activeTheme = theme === "auto" ? (themeSwitcher.matches ? "dark" : "light") : theme;
    html.setAttribute("data-bs-theme", activeTheme);
  };

  const updateThemeIcon = (theme) => {
    document.querySelectorAll(".theme-icon-active").forEach((icon) => {
      icon.classList.remove("fa-sun", "fa-moon", "fa-cloud-sun");
      if (theme === "light") {
        icon.classList.add("fa-sun");
      } else if (theme === "dark") {
        icon.classList.add("fa-moon");
      } else {
        icon.classList.add("fa-cloud-sun");
      }
    });
  };

  const showActiveTheme = (theme) => {
    document.querySelectorAll("[data-bs-theme-value]").forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-pressed", "false");
    });
    const activeBtn = document.querySelector(`[data-bs-theme-value="${theme}"]`);
    if (activeBtn) {
      activeBtn.classList.add("active");
      activeBtn.setAttribute("aria-pressed", "true");
    }
    updateThemeIcon(theme);
  };

  // Init
  setTheme(getPreferredTheme());

  // Ikut perubahan sistem saat mode auto
  themeSwitcher.addEventListener("change", () => {
    const currentTheme = getStoredTheme();
    if (!currentTheme || currentTheme === "auto") {
      setTheme("auto");
      showActiveTheme("auto");
    }
  });

  /* ==========================================================
     1b. PROGRAMMATIC API — window.Uikit.*
         Namespace imperatif untuk semua interaksi core.
         Auto-init (data-*) tetap berjalan; Uikit.* hanyalah
         lapisan pemanggilan langsung (tidak wajib dipakai).
     ========================================================== */
  const Uikit = {
    version: "1.0.0",
    theme: {
      /** Nilai tersimpan: "light" | "dark" | "auto" | null */
      get: () => getStoredTheme(),
      /** Mode aktif ter-resolusi di <html data-bs-theme> */
      active: () => html.getAttribute("data-bs-theme"),
      /** Pilihan sistem saat ini (dark/light) */
      system: () => (themeSwitcher.matches ? "dark" : "light"),
      /** Set mode (light/dark/auto) + simpan + ikon */
      set: (mode) => {
        const next = ["light", "dark", "auto"].includes(mode) ? mode : "auto";
        setStoredTheme(next);
        setTheme(next);
        showActiveTheme(next);
        return next;
      },
    },
  };
  window.Uikit = Uikit;

  /* ==========================================================
     2. INTERAKSI — dipasang saat DOM ready
     ========================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    const theme = getStoredTheme() || "auto";
    showActiveTheme(theme);

    // Klik opsi tema: cegah navigasi href="#" agar halaman TIDAK melompat ke atas
    document.querySelectorAll("[data-bs-theme-value]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const theme = btn.getAttribute("data-bs-theme-value");
        setStoredTheme(theme);
        setTheme(theme);
        showActiveTheme(theme);
      });
    });

    // Link placeholder lain (menu/notifikasi) juga tidak boleh melompat ke atas
    document.addEventListener("click", (e) => {
      const anchor = e.target.closest('a[href="#"]');
      if (anchor) e.preventDefault();
    });

    // Form demo (newsletter dll.) dengan action="#" tidak boleh submit/lompat
    document.addEventListener(
      "submit",
      (e) => {
        if (e.target.matches('form[action="#"]')) e.preventDefault();
      },
      true,
    );

    // Setiap init mengembalikan objek API imperatif; auto-init tetap jalan.
    // Modul tanpa elemen di halaman mengembalikan undefined -> tidak diregistrasi.
    const apis = {
      sidebar: initSidebar(),
      navbar: initNavbarScroll(),
      mobileNav: initMobileNav(),
      backToTop: initBackToTop(),
      codeCopy: initCodeCopy(),
      docsSearch: initDocsSearch(),
      lightbox: initLightbox(),
      counter: initCounters(),
      kanban: initKanban(),
      galleryFilter: initGalleryFilter(),
      passwordToggle: initPasswordToggle(),
      dropzone: initDropzone(),
      progress: initProgressOnView(),
      scrollspy: initScrollSpy(),
      tilt: initTilt(),
      aos: initAOS(),
      bs: initBsPlugins(),
      dataTable: initDataTable(),
      table: initTableSort(),
      tree: initTreeTable(),
      whiteboard: initWhiteboard(),
      calendar: initCalendar(),
      widgets: initWidgets(),
      task: initTaskCheckboxes(),
      fab: initFab(),
      stepper: initStepper(),
      pagination: initPagination(),
      notification: initNotification(),
      skeleton: initSkeleton(),
      loading: initLoading(),
      charts: initCharts(),
      scheduler: initScheduler(),
      datepicker: initDatepicker(),
      timepicker: initTimepicker(),
    };
    Object.entries(apis).forEach(([name, api]) => {
      if (api) Uikit[name] = api;
    });
    // Media player: dua namespace dari satu inisialisasi
    const mediaPlayers = initMediaPlayers();
    if (mediaPlayers.video && mediaPlayers.video.list().length) Uikit.video = mediaPlayers.video;
    if (mediaPlayers.audio && mediaPlayers.audio.list().length) Uikit.audio = mediaPlayers.audio;
    Uikit.isReady = true;
  });

  /* ==========================================================
     SIDEBAR — toggle hide/show (desktop collapsed, mobile off-canvas)
     ========================================================== */
  function initSidebar() {
    const sidebars = document.querySelectorAll("[data-sidebar]");
    const toggleBtns = document.querySelectorAll("[data-sidebar-toggle]");
    const overlay = document.querySelector("[data-sidebar-overlay]");
    const mainContent = document.querySelector("[data-main]");

    if (!sidebars.length) return;

    const isDesktop = () => window.innerWidth >= 992;

    const setAll = (fn) => sidebars.forEach(fn);

    const syncMenuTitles = (collapsed) => {
      sidebars.forEach((sb) => {
        sb.querySelectorAll(".uk-menu-item").forEach((item) => {
          const label = item.querySelector("span");
          if (collapsed && label) {
            item.setAttribute("title", label.textContent.trim());
          } else {
            item.removeAttribute("title");
          }
        });
      });
    };

    const setCollapsed = (collapsed) => {
      setAll((s) => s.classList.toggle("collapsed", collapsed));
      mainContent?.classList.toggle("expanded", collapsed);
      syncMenuTitles(collapsed);
      if (collapsed) {
        localStorage.setItem("uk-sidebar", "collapsed");
      } else {
        localStorage.removeItem("uk-sidebar");
      }
    };

    const openMobile = () => {
      setAll((s) => s.classList.add("show-mobile"));
      overlay?.classList.add("show");
      document.body.style.overflow = "hidden";
    };

    const closeMobile = () => {
      setAll((s) => s.classList.remove("show-mobile"));
      overlay?.classList.remove("show");
      document.body.style.overflow = "";
    };

    toggleBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!isDesktop()) {
          const isOpen = sidebars[0]?.classList.contains("show-mobile");
          if (isOpen) {
            closeMobile();
          } else {
            openMobile();
          }
        } else {
          setCollapsed(!sidebars[0].classList.contains("collapsed"));
        }
      });
    });

    overlay?.addEventListener("click", closeMobile);

    // Mobile: mengetuk tautan menu di dalam drawer harus menutup drawer dulu —
    // body sedang dikunci (overflow hidden), jadi lompatan ke section / pindah
    // halaman tidak akan jalan selama drawer terbuka. Submenu (bukan tautan) & tombol tetap dibiarkan.
    sidebars.forEach((sb) => {
      sb.addEventListener("click", (e) => {
        if (isDesktop()) return;
        const link = e.target.closest("a[href]");
        if (!link) return;
        closeMobile();
      });
    });

    // Escape menutup drawer mobile (paritas off-canvas: backdrop/ESC = tutup)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !isDesktop() && sidebars[0]?.classList.contains("show-mobile")) {
        closeMobile();
      }
    });

    // Pulihkan state collapsed di desktop
    if (isDesktop() && localStorage.getItem("uk-sidebar") === "collapsed") {
      setCollapsed(true);
    }

    window.addEventListener("resize", () => {
      if (isDesktop()) {
        closeMobile();
        if (localStorage.getItem("uk-sidebar") === "collapsed") {
          setCollapsed(true);
        }
      } else {
        setAll((s) => s.classList.remove("collapsed"));
        mainContent?.classList.remove("expanded");
        syncMenuTitles(false);
      }
    });

    // Submenu accordion
    const toggleSubmenu = (item) => {
      if (typeof item === "string") item = document.querySelector(item);
      if (!item || !item.nextElementSibling) return;
      const submenu = item.nextElementSibling;
      const isOpen = submenu.classList.contains("show");
      submenu.classList.toggle("show");
      item.querySelector(".submenu-arrow")?.classList.toggle("rotate", !isOpen);
      item.setAttribute("aria-expanded", String(!isOpen));
    };
    document.querySelectorAll("[data-submenu-toggle]").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        toggleSubmenu(item);
      });
    });

    return {
      /** true saat viewport >= 992px (rail desktop) */
      isDesktop,
      isCollapsed: () => sidebars[0]?.classList.contains("collapsed") ?? false,
      isDrawerOpen: () => sidebars[0]?.classList.contains("show-mobile") ?? false,
      /** Perilaku sama dengan tombol [data-sidebar-toggle] */
      toggle: () => {
        if (isDesktop()) {
          setCollapsed(!sidebars[0].classList.contains("collapsed"));
        } else if (sidebars[0]?.classList.contains("show-mobile")) {
          closeMobile();
        } else {
          openMobile();
        }
      },
      /** Desktop: rail mengecil / Mobile: buka drawer */
      collapse: () => (isDesktop() ? setCollapsed(true) : openMobile()),
      /** Desktop: rail melebar / Mobile: tutup drawer */
      expand: () => (isDesktop() ? setCollapsed(false) : closeMobile()),
      /** Paksa state rail desktop */
      setCollapsed,
      openDrawer: openMobile,
      closeDrawer: closeMobile,
      toggleSubmenu,
    };
  }

  /* ==========================================================
     NAVBAR — shadow saat scroll
     ========================================================== */
  function initNavbarScroll() {
    const navbar = document.querySelector("[data-navbar]");
    if (!navbar) return;
    const onScroll = () => {
      navbar.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return {
      /** true bila navbar melewati 24px scroll */
      isScrolled: () => navbar.classList.contains("is-scrolled"),
      /** Periksa ulang state scroll */
      check: onScroll,
    };
  }

  /* ==========================================================
     NAVBAR MOBILE — tutup panel collapse setelah memilih menu
     ========================================================== */
  function initMobileNav() {
    const panels = document.querySelectorAll(".uk-navbar .navbar-collapse");
    panels.forEach((collapse) => {
      collapse.addEventListener("click", (e) => {
        // Pilihan tema (light/dark/auto) tidak menutup panel biar cepat berpindah
        const link = e.target.closest("a[href]");
        if (!link || link.hasAttribute("data-bs-theme-value")) return;
        if (window.innerWidth >= 992) return; // hanya berlaku di mode mobile
        const bs = bootstrap.Collapse.getInstance(collapse);
        if (bs && collapse.classList.contains("show")) bs.hide();
      });
    });
    return {
      /** Tutup semua panel collapse navbar yang sedang terbuka */
      close: () => {
        panels.forEach((collapse) => {
          const bs = bootstrap?.Collapse.getInstance(collapse);
          if (bs && collapse.classList.contains("show")) bs.hide();
        });
      },
    };
  }

  function initBackToTop() {
    const btn = document.querySelector("[data-back-to-top]");
    if (!btn) return;
    const onScroll = () => {
      btn.classList.toggle("show", window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const scrollToTop = () => {
      // Hormati prefers-reduced-motion: lompat langsung, tanpa scroll halus
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    };
    btn.addEventListener("click", scrollToTop);
    onScroll();
    return {
      show: () => btn.classList.add("show"),
      hide: () => btn.classList.remove("show"),
      isVisible: () => btn.classList.contains("show"),
      scrollToTop,
    };
  }

  /* ==========================================================
     CODE COPY — tombol salin kode (_test-component)
     ========================================================== */
  function initCodeCopy() {
    const blocks = document.querySelectorAll("[data-code-block]");
    if (!blocks.length) return;

    const writeClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        return true;
      }
    };

    const markCopied = (btn) => {
      btn.classList.add("copied");
      btn.innerHTML = '<i class="fa-solid fa-check me-1"></i>Copied!';
      setTimeout(() => {
        btn.classList.remove("copied");
        btn.innerHTML = '<i class="fa-solid fa-copy me-1"></i>Copy';
      }, 1800);
    };

    blocks.forEach((block) => {
      const btn = document.createElement("button");
      btn.className = "uk-code-copy";
      btn.type = "button";
      btn.innerHTML = '<i class="fa-solid fa-copy me-1"></i>Copy';
      btn.setAttribute("aria-label", "Copy code");
      block.appendChild(btn);
      btn.addEventListener("click", async () => {
        const code = block.querySelector("code, pre")?.innerText || "";
        if (code) {
          await writeClipboard(code);
          markCopied(btn);
        }
      });
    });

    return {
      /** Salin teks/elemen blok ke clipboard */
      copy: async (source) => {
        if (typeof source === "string") {
          return writeClipboard(source);
        }
        const block = typeof source === "object" && source ? source : blocks[0];
        const code = block?.querySelector("code, pre")?.innerText || "";
        if (code) await writeClipboard(code);
        return code;
      },
    };
  }

  /* ==========================================================
     DOCS SEARCH — filter menu sidebar dokumentasi
     ========================================================== */
  function initDocsSearch() {
    const inputs = document.querySelectorAll("[data-docs-search]");
    const items = document.querySelectorAll("[data-doc-link]");
    const groups = document.querySelectorAll("[data-doc-group]");
    if (!inputs.length || !items.length) return;

    const run = (query) => {
      const q = (query || "").toLowerCase().trim();
      inputs.forEach((inp) => {
        if (inp.value !== query) inp.value = query || "";
      });
      items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        const match = !q || text.includes(q);
        item.style.display = match ? "" : "none";
      });
      groups.forEach((group) => {
        const hasVisible = [...group.querySelectorAll("[data-doc-link]")].some(
          (i) => i.style.display !== "none",
        );
        group.classList.toggle("d-none", !hasVisible);
      });
      const empty = document.querySelector("[data-docs-empty]");
      if (empty) {
        const visible = [...items].some((i) => i.style.display !== "none");
        empty.classList.toggle("d-none", visible);
      }
    };

    inputs.forEach((inp) => inp.addEventListener("input", (e) => run(e.target.value)));

    return {
      /** Filter tautan dokumentasi dengan kata kunci */
      filter: (query) => run(query),
      /** Kosongkan pencarian & tampilkan semua */
      clear: () => run(""),
    };
  }

  /* ==========================================================
     LIGHTBOX — galeri / foto dokumentasi
     ========================================================== */
  function initLightbox() {
    const galleryItems = document.querySelectorAll("[data-lightbox]");
    if (!galleryItems.length) return;

    const lightbox = document.createElement("div");
    lightbox.className = "uk-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Pratinjau gambar");
    lightbox.innerHTML = `
      <button type="button" class="uk-lightbox-close" aria-label="Tutup">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <img src="" alt="Preview" />
    `;
    document.body.appendChild(lightbox);

    const img = lightbox.querySelector("img");
    const closeBtn = lightbox.querySelector(".uk-lightbox-close");
    let lastFocused = null;

    const close = () => {
      if (!lightbox.classList.contains("show")) return;
      lightbox.classList.remove("show");
      document.body.style.overflow = "";
      // Pulihkan fokus ke elemen pemicu (aksesibilitas keyboard)
      if (lastFocused && lastFocused.isConnected) lastFocused.focus();
      lastFocused = null;
    };
    closeBtn.addEventListener("click", close);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("show")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Tab") {
        // Focus trap: satu-satunya elemen fokusabel di dalam lightbox
        // adalah tombol tutup — jaga Tab agar tidak keluar dialog.
        e.preventDefault();
        closeBtn.focus();
      }
    });

    const open = (source) => {
      let src = source;
      if (typeof source === "string" && !/^https?:|^data:|^file:/.test(source)) {
        const el = document.querySelector(source);
        src = el?.getAttribute("data-lightbox") || el?.querySelector("img")?.src;
      } else if (typeof source === "object" && source) {
        src =
          source.getAttribute("data-lightbox") || source.querySelector("img")?.src || source.src;
      }
      if (!src) return false;
      img.src = src;
      lastFocused = document.activeElement;
      lightbox.classList.add("show");
      document.body.style.overflow = "hidden";
      // Fokus masuk ke dialog (tombol tutup) untuk navigasi keyboard
      closeBtn.focus();
      return true;
    };

    galleryItems.forEach((item) => {
      item.addEventListener("click", () => open(item));
    });

    return {
      /** Buka lightbox: terima elemen [data-lightbox], selector, atau URL gambar */
      open,
      /** Tutup lightbox */
      close,
      isOpen: () => lightbox.classList.contains("show"),
    };
  }

  /* ==========================================================
     COUNTER — angka animasi (stats card)
     ========================================================== */
  function initCounters() {
    const counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;

    const animate = (el) => {
      const target = parseFloat(el.getAttribute("data-counter"));
      const suffix = el.getAttribute("data-suffix") || "";
      // prefers-reduced-motion: langsung tampilkan nilai akhir (tanpa animasi)
      if (prefersReducedMotion()) {
        el.textContent = Math.round(target).toLocaleString("id-ID") + suffix;
        return;
      }
      const duration = 1600;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        el.textContent = value.toLocaleString("id-ID") + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 },
    );

    counters.forEach((el) => io.observe(el));

    return {
      /** Jalankan animasi angka pada elemen [data-counter] (atau elemen pertama) */
      run: (el) => {
        const target = typeof el === "string" ? document.querySelector(el) : el;
        if (target) {
          animate(target);
          return;
        }
        counters.forEach((c) => animate(c));
      },
      /** Animasi ulang semua counter (abaikan IntersectionObserver) */
      playAll: () => counters.forEach((c) => animate(c)),
    };
  }

  /* ==========================================================
     KANBAN — drag & drop sederhana
     ========================================================== */
  function initKanban() {
    const cards = document.querySelectorAll(".uk-task-card[draggable]");
    const columns = document.querySelectorAll("[data-kanban-column]");
    if (!cards.length) return;

    cards.forEach((card) => {
      card.addEventListener("dragstart", () => {
        card.classList.add("opacity-50");
        setTimeout(() => card.classList.add("dragging"), 0);
      });
      card.addEventListener("dragend", () => {
        card.classList.remove("opacity-50", "dragging");
        columns.forEach((col) => col.classList.remove("is-over"));
      });
    });

    const updateCounts = () => {
      columns.forEach((col) => {
        const count = col.querySelector("[data-kanban-count]");
        if (count) {
          count.textContent = col.querySelectorAll(".uk-task-card").length;
        }
      });
    };

    const moveTo = (card, column) => {
      if (typeof card === "string") card = document.querySelector(card);
      if (typeof column === "string") column = document.querySelector(column);
      if (!card || !column) return false;
      const dropzone = column.querySelector(".uk-kanban-dropzone");
      if (!dropzone) return false;
      const colTitle =
        (column.querySelector(".uk-kanban-title")?.textContent || "").trim() || "kolom";
      dropzone.appendChild(card);
      card.classList.remove("opacity-50", "dragging");
      updateCounts();
      announce(`Kartu dipindah ke kolom ${colTitle}`);
      return true;
    };

    columns.forEach((col) => {
      col.addEventListener("dragover", (e) => {
        e.preventDefault();
        col.classList.add("is-over");
      });
      col.addEventListener("dragleave", () => col.classList.remove("is-over"));
      col.addEventListener("drop", (e) => {
        e.preventDefault();
        col.classList.remove("is-over");
        const dragging = document.querySelector(".dragging");
        if (dragging && col) moveTo(dragging, col);
      });
    });

    /* --- Alternatif keyboard (a11y): tanpa mouse.
       Fokus kotak centang di dalam kartu, lalu Ctrl+Shift+← / →
       memindahkan kartu satu kolom ke kiri/kanan (kolom diurutkan
       sesuai urutan DOM board). Kolom tujuan diberi umpan balik
       visual .is-over yang sama seperti hover drag. Kartu selesai
       yang dipindah keluar kolom "Selesai" ikut dibuka ulang di
       tempat — paritas perilaku drop mouse (initTaskCheckboxes). */
    const isDoneColumn = (col) => {
      const explicit = col.getAttribute("data-kanban-status");
      if (explicit) return explicit === "done";
      const title = (col.querySelector(".uk-kanban-title")?.textContent || "").toLowerCase();
      return ["selesai", "done", "completed"].some((alias) => title.includes(alias));
    };
    /* --- Urut ulang dalam satu kolom (a11y): fokus kotak centang kartu,
       lalu Alt+↑ / Alt+↓ memindahkan kartu naik/turun di kolom yang sama.
       Tidak bertabrakan dengan Ctrl+Shift+←/→ (antar kolom). */
    document.addEventListener("keydown", (e) => {
      if (!e.altKey || e.ctrlKey || e.shiftKey) return;
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      const box =
        e.target && e.target.closest ? e.target.closest(".uk-task-card .form-check-input") : null;
      if (!box) return;
      const card = box.closest(".uk-task-card");
      const drop = card.closest("[data-kanban-column]")?.querySelector(".uk-kanban-dropzone");
      if (!drop) return;
      const siblings = [...drop.querySelectorAll(".uk-task-card")];
      const idx = siblings.indexOf(card);
      const neighbor = siblings[idx + (e.key === "ArrowDown" ? 1 : -1)];
      if (!neighbor) return;
      e.preventDefault();
      // Turun = sisipkan tetangga di atas kartu; naik = sisipkan kartu sebelum tetangga
      if (e.key === "ArrowDown") drop.insertBefore(neighbor, card);
      else drop.insertBefore(card, neighbor);
      const colTitle =
        (
          card.closest("[data-kanban-column]").querySelector(".uk-kanban-title")?.textContent || ""
        ).trim() || "kolom";
      announce(`Kartu diurutkan ulang dalam kolom ${colTitle}`);
      card.classList.add("uk-flash");
      setTimeout(() => card.classList.remove("uk-flash"), 1600);
    });

    let flashTimer = null;
    document.addEventListener("keydown", (e) => {
      if (!e.ctrlKey || !e.shiftKey) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const box =
        e.target && e.target.closest ? e.target.closest(".uk-task-card .form-check-input") : null;
      if (!box) return;
      const card = box.closest(".uk-task-card");
      const board = card.closest(".uk-kanban");
      const cols = board ? [...board.querySelectorAll("[data-kanban-column]")] : [...columns];
      const origin = card.closest("[data-kanban-column]");
      const idx = cols.indexOf(origin);
      const target = cols[e.key === "ArrowLeft" ? idx - 1 : idx + 1];
      if (!target || target === origin) return;
      e.preventDefault();

      const wasDone = card.classList.contains("uk-task-done");
      moveTo(card, target);
      // Umpan balik visual kolom tujuan (sama dgn outline saat drag)
      cols.forEach((col) => col.classList.remove("is-over"));
      target.classList.add("is-over");
      clearTimeout(flashTimer);
      flashTimer = setTimeout(() => {
        target.classList.remove("is-over");
        flashTimer = null;
      }, 400);
      card.scrollIntoView({ block: "nearest", inline: "nearest" });

      // Buka ulang kartu selesai yang mendarat di kolom belum selesai
      // (via API task runtime agar semantik status tetap satu sumber)
      if (wasDone && box.checked && !isDoneColumn(target) && Uikit.task?.setDone) {
        Uikit.task.setDone(card, false);
      }
    });

    return {
      /** Pindahkan kartu ke kolom lain (drop programatik) */
      move: moveTo,
      /** Sinkronkan angka [data-kanban-count] */
      refreshCounts: updateCounts,
      columns: () => [...columns],
    };
  }

  /* ==========================================================
     GALLERY FILTER — filter kategori (galeri / foto dokumentasi)
     ========================================================== */
  function initGalleryFilter() {
    const buttons = document.querySelectorAll("[data-filter]");
    const items = document.querySelectorAll("[data-category]");
    if (!buttons.length || !items.length) return;

    const apply = (category) => {
      const value = category == null ? "all" : String(category);
      buttons.forEach((b) => b.classList.toggle("active", b.getAttribute("data-filter") === value));
      items.forEach((item) => {
        const show = value === "all" || item.getAttribute("data-category") === value;
        item.classList.toggle("d-none", !show);
      });
    };

    buttons.forEach((btn) =>
      btn.addEventListener("click", () => apply(btn.getAttribute("data-filter"))),
    );

    return {
      /** Filter item: "all" atau kategori data-category */
      filter: apply,
    };
  }

  /* ==========================================================
     PASSWORD TOGGLE — tampil/sembunyi password
     ========================================================== */
  function initPasswordToggle() {
    const buttons = document.querySelectorAll("[data-password-toggle]");
    if (!buttons.length) return;

    const toggle = (btn) => {
      if (typeof btn === "string") btn = document.querySelector(btn);
      const input = btn?.querySelector
        ? document.querySelector(btn.getAttribute("data-target") || "")
        : null;
      if (!btn || !input) return false;
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      btn.querySelector("i")?.classList.toggle("fa-eye", !isPassword);
      btn.querySelector("i")?.classList.toggle("fa-eye-slash", isPassword);
      return !isPassword;
    };

    buttons.forEach((btn) => btn.addEventListener("click", () => toggle(btn)));

    return {
      /** Ubah visibilitas input; terima elemen tombol [data-password-toggle] */
      toggle,
    };
  }

  /* ==========================================================
     DROPZONE — drag & drop upload
     ========================================================== */
  function initDropzone() {
    document.querySelectorAll("[data-dropzone]").forEach((zone) => {
      const input = zone.querySelector('input[type="file"]');
      zone.addEventListener("click", () => input?.click());
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("is-dragover");
      });
      zone.addEventListener("dragleave", () => zone.classList.remove("is-dragover"));
      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("is-dragover");
        if (input && e.dataTransfer.files.length) {
          input.files = e.dataTransfer.files;
          const label = zone.querySelector("[data-file-name]");
          if (label) label.textContent = e.dataTransfer.files[0].name;
        }
      });
      input?.addEventListener("change", () => {
        const label = zone.querySelector("[data-file-name]");
        if (label && input.files.length) label.textContent = input.files[0].name;
      });
    });

    return {
      /** Buka dialog pilih file pada zone (atau zone pertama) */
      browse: (zone) => {
        const target = typeof zone === "string" ? document.querySelector(zone) : zone;
        const input = (target || document.querySelector("[data-dropzone]"))?.querySelector(
          'input[type="file"]',
        );
        input?.click();
        return !!input;
      },
      /** Setel nama file yang ditampilkan di label zone */
      setFileName: (name, zone) => {
        const target = typeof zone === "string" ? document.querySelector(zone) : zone;
        const label = (target || document.querySelector("[data-dropzone]"))?.querySelector(
          "[data-file-name]",
        );
        if (label) label.textContent = name || "atau klik untuk memilih";
        return !!label;
      },
    };
  }

  /* ==========================================================
     PROGRESS — animasi saat terlihat
     ========================================================== */
  function initProgressOnView() {
    const bars = document.querySelectorAll("[data-progress]");
    if (!bars.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const width = entry.target.getAttribute("data-progress");
            entry.target.style.width = width + "%";
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 },
    );
    const play = (bar) => {
      const target = typeof bar === "string" ? document.querySelector(bar) : bar;
      if (target) {
        const width = target.getAttribute("data-progress");
        if (width) target.style.width = width + "%";
        return;
      }
      bars.forEach((b) => {
        const width = b.getAttribute("data-progress");
        if (width) b.style.width = width + "%";
      });
    };

    bars.forEach((bar) => {
      bar.style.width = "0%";
      bar.style.transition = "width 1.2s cubic-bezier(0.25,1,0.5,1)";
      io.observe(bar);
    });

    return {
      /** Set lebar progress ke nilai data-progress (abaikan observer) */
      play,
      /** Reset semua bar ke 0% lalu amati ulang */
      reset: () => {
        bars.forEach((b) => {
          b.style.width = "0%";
          io.observe(b);
        });
      },
    };
  }

  /* ==========================================================
     SCROLLSPY — highlight menu sidebar dokumentasi
     ========================================================== */
  function initScrollSpy() {
    const links = [...document.querySelectorAll('[data-scrollspy] a[href^="#"]')].filter(
      (l) => (l.getAttribute("href") || "#").length > 1,
    );
    const sections = [...links]
      .map((l) => document.querySelector(l.getAttribute("href")))
      .filter(Boolean);
    if (!sections.length) return;

    let io = null;
    const observe = () => {
      io?.disconnect();
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              links.forEach((l) => {
                l.classList.toggle("active", l.getAttribute("href") === `#${entry.target.id}`);
              });
            }
          });
        },
        { rootMargin: "-20% 0px -70% 0px" },
      );
      sections.forEach((s) => io.observe(s));
    };
    observe();

    return {
      /** Perbarui pemantauan section (panggil setelah DOM berubah) */
      refresh: observe,
      /** Set link section aktif secara manual */
      activate: (id) => {
        links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${id}`));
      },
      destroy: () => io?.disconnect(),
    };
  }

  /* ==========================================================
     TILT — efek kartu 3D halus
     ========================================================== */
  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ==========================================================
     LIVE REGION — pengumuman screen-reader (visually hidden).
     Dipakai kanban (pindah antar kolom / urut ulang) & notifikasi.
     ========================================================== */
  const srLive = document.createElement("div");
  srLive.className = "uk-sr-live";
  srLive.setAttribute("aria-live", "polite");
  srLive.setAttribute("role", "status");
  document.body.appendChild(srLive);
  const announce = (message) => {
    srLive.textContent = "";
    window.setTimeout(() => {
      srLive.textContent = message;
    }, 60);
  };

  function initTilt() {
    // Nonaktif di layar sentuh (pointer coarse) & saat user meminta gerakan berkurang
    if (window.matchMedia("(pointer: coarse)").matches || prefersReducedMotion()) return;
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      const strength = parseFloat(card.getAttribute("data-tilt")) || 6;
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });

    return {
      /** Pasang efek tilt ke elemen [data-tilt] baru (ditolak saat reduced-motion) */
      attach: (el) => {
        if (prefersReducedMotion()) return false;
        const card = typeof el === "string" ? document.querySelector(el) : el;
        if (!card || !card.hasAttribute("data-tilt")) return false;
        const strength = parseFloat(card.getAttribute("data-tilt")) || 6;
        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform = `perspective(800px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateY(-4px)`;
        });
        card.addEventListener("mouseleave", () => {
          card.style.transform = "";
        });
        return true;
      },
    };
  }

  /* ==========================================================
     AOS — init dari dalam bundle (tanpa skrip inline, Gap G1)
     ========================================================== */
  function initAOS() {
    if (typeof AOS === "undefined") return;
    // disable: fungsi -> AOS tidak menginisialisasi elemen sama sekali
    // saat user meminta prefers-reduced-motion (konten langsung tampil).
    AOS.init({
      duration: 700,
      once: true,
      offset: 60,
      disable: () => prefersReducedMotion(),
    });
    return {
      refresh: () => AOS.refresh(),
      refreshHard: () => AOS.refreshHard(),
      init: (opts) => AOS.init(opts || {}),
    };
  }

  /* ==========================================================
     PLUGIN BOOTSTRAP — tooltip, popover, toast (dari bundle)
     ========================================================== */
  function initBsPlugins() {
    if (typeof bootstrap === "undefined") return;
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
      new bootstrap.Tooltip(el);
    });
    document.querySelectorAll('[data-bs-toggle="popover"]').forEach((el) => {
      new bootstrap.Popover(el);
    });
    document.querySelectorAll('[data-bs-toggle="toast"]').forEach((el) => {
      el.addEventListener("click", () => {
        const target = document.querySelector(el.getAttribute("data-bs-target"));
        if (target) bootstrap.Toast.getOrCreateInstance(target).show();
      });
    });

    const resolve = (selOrEl) =>
      typeof selOrEl === "string" ? document.querySelector(selOrEl) : selOrEl;

    return {
      /** Tampilkan toast (terima elemen/selektor toast) */
      toast: (target) => {
        const el = resolve(target);
        if (!el) return false;
        bootstrap.Toast.getOrCreateInstance(el).show();
        return true;
      },
      /** Inisialisasi Tooltip pada elemen (atau semua [data-bs-toggle=tooltip]) */
      tooltip: (el) => {
        const target = resolve(el) || document.querySelector('[data-bs-toggle="tooltip"]');
        if (!target) return null;
        return bootstrap.Tooltip.getOrCreateInstance(target);
      },
      /** Inisialisasi Popover pada elemen (atau semua [data-bs-toggle=popover]) */
      popover: (el) => {
        const target = resolve(el) || document.querySelector('[data-bs-toggle="popover"]');
        if (!target) return null;
        return bootstrap.Popover.getOrCreateInstance(target);
      },
    };
  }

  /* ==========================================================
     DATATABLE — pencarian langsung + hitung baris di footer
     Input: [data-dt-search], tabel [data-dt-table], hitung [data-dt-count]
     ========================================================== */
  function initDataTable() {
    const searches = document.querySelectorAll("[data-dt-search]");
    const tables = document.querySelectorAll("[data-dt-table]");
    if (!searches.length || !tables.length) return;

    const tableFor = (search) => {
      const wrap = search.closest(".uk-datatable");
      return wrap ? wrap.querySelector("[data-dt-table]") : tables[0];
    };

    const updateCount = (table, visible, total) => {
      const count = table.closest(".uk-datatable")?.querySelector("[data-dt-count]");
      if (count) {
        const shown = visible ? `1–${visible}` : "0";
        count.textContent = `Menampilkan ${shown} dari ${total}`;
      }
    };

    const apply = (search) => {
      const table = tableFor(search);
      if (!table) return;
      const q = (search.value || "").toLowerCase().trim();
      const rows = [...table.querySelectorAll("tbody tr")];
      let visible = 0;
      rows.forEach((row) => {
        const match = !q || row.textContent.toLowerCase().includes(q);
        row.classList.toggle("d-none", !match);
        if (match) visible++;
      });
      updateCount(table, visible, rows.length);
    };

    const setQuery = (query, search) => {
      const target =
        typeof search === "string" ? document.querySelector(search) : search || searches[0];
      if (!target) return;
      target.value = query || "";
      apply(target);
    };

    searches.forEach((search) => {
      search.addEventListener("input", () => apply(search));
      apply(search);
    });

    return {
      /** Filter semua kolom pencarian data table dengan kata kunci */
      filter: (query, search) => {
        if (search) return setQuery(query, search);
        searches.forEach((s) => setQuery(query, s));
      },
      /** Kosongkan pencarian & tampilkan semua baris */
      clear: (search) => {
        if (search) return setQuery("", search);
        searches.forEach((s) => setQuery("", s));
      },
      /** Perbarui hitungan footer sesuai state input */
      refresh: (search) => {
        const target =
          typeof search === "string" ? document.querySelector(search) : search || searches[0];
        if (target) apply(target);
      },
    };
  }

  /* ==========================================================
     TABLE SORT — klik header th[data-sort], indikator fa-sort*
     ========================================================== */
  function initTableSort() {
    const headers = [...document.querySelectorAll("th[data-sort]")];

    const sortHeader = (th, dir) => {
      const table = th.closest("table");
      const tbody = table?.querySelector("tbody");
      if (!table || !tbody) return;
      const index = [...th.parentElement.children].indexOf(th);
      const nextDir = dir || (th.dataset.dir === "asc" ? "desc" : "asc");
      th.dataset.dir = nextDir;

      table.querySelectorAll("th[data-sort]").forEach((h) => {
        const ic = h.querySelector(".sort-indicator i");
        if (ic) ic.className = "fa-solid fa-sort";
      });
      const ic = th.querySelector(".sort-indicator i");
      if (ic) {
        ic.className = nextDir === "asc" ? "fa-solid fa-sort-up" : "fa-solid fa-sort-down";
      }

      const rows = [...tbody.querySelectorAll("tr")];
      const cellText = (row) => row.children[index]?.textContent.trim().toLowerCase() || "";
      rows.sort((a, b) => {
        const av = cellText(a);
        const bv = cellText(b);
        const na = parseFloat(av.replace(/[^\d.-]/g, ""));
        const nb = parseFloat(bv.replace(/[^\d.-]/g, ""));
        const cmp = !isNaN(na) && !isNaN(nb) ? na - nb : av.localeCompare(bv, "id");
        return nextDir === "asc" ? cmp : -cmp;
      });
      rows.forEach((row) => tbody.appendChild(row));
    };

    headers.forEach((th) => {
      th.addEventListener("click", () => sortHeader(th));
    });

    const findHeader = (table, col) => {
      const tbl = typeof table === "string" ? document.querySelector(table) : table;
      const hs = tbl ? [...tbl.querySelectorAll("th[data-sort]")] : headers;
      const th =
        typeof col === "number" ? hs[col] : hs.find((h) => h.textContent.trim() === col) || hs[0];
      return th || null;
    };

    return {
      /** Urutkan tabel: (tabel, indeksKolom/teksKolom, "asc"/"desc") */
      sortBy: (table, col, dir) => {
        const th = findHeader(table, col);
        if (th) sortHeader(th, dir);
        return !!th;
      },
      /** Urutkan lewat header th[data-sort] */
      sortHeader,
      /** Reset indikator sortir semua header */
      reset: () => {
        headers.forEach((h) => {
          delete h.dataset.dir;
          const ic = h.querySelector(".sort-indicator i");
          if (ic) ic.className = "fa-solid fa-sort";
        });
      },
      headers: () => [...headers],
    };
  }

  /* ==========================================================
     TREE TABLE — expand/collapse baris anak (level > induk)
     Toggle: [data-tree-toggle], level baris: data-tree-level
     ========================================================== */
  function initTreeTable() {
    const bodies = [...document.querySelectorAll("tbody[data-tree-body]")];

    const toggleRow = (rowOrBtn, force) => {
      const btn = typeof rowOrBtn === "string" ? document.querySelector(rowOrBtn) : rowOrBtn;
      if (!btn) return false;
      const row = btn.classList?.contains("uk-tree-row") ? btn : btn.closest?.("tr") || btn;
      const tbody = row.closest("tbody[data-tree-body]");
      if (!tbody) return false;
      const rows = [...tbody.querySelectorAll("tr")];
      const idx = rows.indexOf(row);
      const level = Number(row.dataset.treeLevel || 0);
      const open = force != null ? !force : row.dataset.treeOpen === "true";
      row.dataset.treeOpen = String(!open);
      const icon = row.querySelector("[data-tree-toggle] i") || {};
      if (icon.className !== undefined) {
        icon.className = open ? "fa-solid fa-plus" : "fa-solid fa-minus";
      }
      for (let i = idx + 1; i < rows.length; i++) {
        const l = Number(rows[i].dataset.treeLevel || 0);
        if (l <= level) break;
        rows[i].classList.toggle("d-none", open);
      }
      return true;
    };

    bodies.forEach((tbody) => {
      const rows = [...tbody.querySelectorAll("tr")];
      tbody.querySelectorAll("[data-tree-toggle]").forEach((btn) => {
        btn.addEventListener("click", () => toggleRow(btn));
        btn.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleRow(btn);
          }
        });
        void rows;
      });
    });

    const walkAll = (open) => {
      bodies.forEach((tbody) => {
        [...tbody.querySelectorAll("tr[data-tree-open]")].forEach((row) => {
          if (row.dataset.treeOpen === String(open)) return;
          const btn = row.querySelector("[data-tree-toggle]");
          if (btn) toggleRow(btn, open);
        });
      });
    };

    return {
      /** Buka/tutup baris; terima elemen baris atau tombol [data-tree-toggle] */
      toggle: toggleRow,
      expand: (row) => toggleRow(row, true),
      collapse: (row) => toggleRow(row, false),
      /** Perluas semua node pada tiap tabel pohon */
      expandAll: () => walkAll(true),
      /** Tutup semua node (anak disembunyikan) */
      collapseAll: () => walkAll(false),
    };
  }

  /* ==========================================================
     WHITEBOARD — gambar bebas (pen, garis, kotak, teks, penghapus,
     bersihkan) + pilihan warna. Canvas dibuat via JS di dalam
     .uk-whiteboard-canvas; peka DPR untuk hasil tajam.
     ========================================================== */
  function initWhiteboard() {
    const boards = [];
    document.querySelectorAll("[data-whiteboard]").forEach((wb) => {
      const container = wb.querySelector(".uk-whiteboard-canvas");
      if (!container) return;

      const canvas = document.createElement("canvas");
      container.appendChild(canvas);
      const ctx = canvas.getContext("2d");

      let tool = "pen";
      let color = "#047857";
      let drawing = false;
      let start = null;
      let snapshot = null;

      const resize = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        const w = Math.max(rect.width, 1);
        const h = Math.max(rect.height, 1);
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      };
      resize();
      window.addEventListener("resize", resize);

      const pos = (e) => {
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      };

      const preview = (p) => {
        ctx.putImageData(snapshot, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
        ctx.beginPath();
        if (tool === "line") {
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        } else if (tool === "rect") {
          ctx.strokeRect(start.x, start.y, p.x - start.x, p.y - start.y);
        }
      };

      canvas.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        canvas.setPointerCapture(e.pointerId);
        start = pos(e);
        drawing = true;

        if (tool === "text") {
          drawing = false;
          const txt = window.prompt("Teks di papan tulis:", "");
          if (txt) {
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = color;
            ctx.font = "600 15px Montserrat, sans-serif";
            ctx.fillText(txt, start.x, start.y);
          }
          return;
        }

        if (tool === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
        } else {
          ctx.globalCompositeOperation = "source-over";
          if (tool === "pen") {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
          } else if (tool === "line" || tool === "rect") {
            snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
          }
        }
      });

      canvas.addEventListener("pointermove", (e) => {
        if (!drawing) return;
        const p = pos(e);
        if (tool === "pen") {
          ctx.strokeStyle = color;
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        } else if (tool === "eraser") {
          ctx.lineTo(p.x, p.y);
          ctx.lineWidth = 22;
          ctx.stroke();
          ctx.lineWidth = 3;
        } else if (tool === "line" || tool === "rect") {
          preview(p);
        }
      });

      const stop = (e) => {
        if (!drawing) return;
        drawing = false;
        canvas.releasePointerCapture(e.pointerId);
        ctx.globalCompositeOperation = "source-over";
      };
      canvas.addEventListener("pointerup", stop);
      canvas.addEventListener("pointercancel", stop);

      const setTool = (t) => {
        if (t === "clear") {
          clear();
          return;
        }
        if (!["pen", "line", "rect", "text", "eraser"].includes(t)) return;
        tool = t;
        wb.querySelectorAll("[data-wb-tool]").forEach((b) =>
          b.classList.toggle("active", b.getAttribute("data-wb-tool") === t),
        );
      };

      const setColor = (c) => {
        color = c || color;
        wb.querySelectorAll("[data-wb-color]").forEach((b) =>
          b.classList.toggle("active", b.getAttribute("data-wb-color") === c),
        );
      };

      const clear = () => {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      };

      wb.querySelectorAll("[data-wb-tool]").forEach((btn) => {
        btn.addEventListener("click", () => setTool(btn.getAttribute("data-wb-tool")));
      });
      wb.querySelectorAll("[data-wb-color]").forEach((btn) => {
        btn.addEventListener("click", () => setColor(btn.getAttribute("data-wb-color")));
      });

      boards.push({
        el: wb,
        canvas,
        getContext: () => ctx,
        setTool,
        setColor,
        clear,
        getTool: () => tool,
        getColor: () => color,
        resize,
      });
    });

    const find = (selector) => {
      if (selector == null) return boards[0];
      const el = typeof selector === "string" ? document.querySelector(selector) : selector;
      return boards.find((b) => b.el === el) || boards[0];
    };

    return {
      boards: () => [...boards],
      /** Ambil instance board: Uikit.whiteboard.board(el|selektor|indeks) */
      board: (target) => {
        if (typeof target === "number") return boards[target] || null;
        return find(target) || null;
      },
      // Pintasan cepat ke board pertama (atau yang ditunjuk)
      setTool: (t, target) => find(target)?.setTool(t),
      setColor: (c, target) => find(target)?.setColor(c),
      clear: (target) => find(target)?.clear(),
    };
  }

  /* ==========================================================
     CALENDAR — navigasi bulan (prev/next), render dinamis,
     pilih tanggal, penanda acara. Markup:
       .uk-calendar[data-calendar data-calendar-events='[{d,t}]']
     Header: tombol [data-cal-nav="prev"|"next"], .uk-calendar-title,
     .uk-calendar-grid berisi 7 .uk-calendar-weekday (sisanya di-render).
     API: Uikit.calendar
     ========================================================== */
  function initCalendar() {
    const registry = [];
    const MONTHS = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const monthIdx = Object.fromEntries(MONTHS.map((name, i) => [name.toLowerCase(), i]));

    document.querySelectorAll("[data-calendar]").forEach((root) => {
      const titleEl = root.querySelector(".uk-calendar-title");
      const grid = root.querySelector(".uk-calendar-grid");
      const prevBtn = root.querySelector('[data-cal-nav="prev"]');
      const nextBtn = root.querySelector('[data-cal-nav="next"]');
      if (!titleEl || !grid) return;

      let events = [];
      try {
        events = JSON.parse(root.getAttribute("data-calendar-events") || "[]") || [];
      } catch {
        events = [];
      }
      const today = new Date();
      let year = today.getFullYear();
      let month = today.getMonth();
      const titleMatch = (titleEl.textContent || "").trim().match(/^([A-Za-z]+)\s+(\d{4})$/);
      if (titleMatch) {
        const mi = monthIdx[titleMatch[1].toLowerCase()];
        if (mi !== undefined) {
          month = mi;
          year = parseInt(titleMatch[2], 10);
        }
      }
      let selectedDay = null;

      const buildDay = (d, { muted = false, isToday = false } = {}) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "uk-calendar-day" +
          (muted ? " is-muted" : "") +
          (isToday ? " is-today" : "") +
          (!muted && d === selectedDay ? " is-selected" : "");
        btn.setAttribute("aria-label", `Tanggal ${d}`);
        const num = document.createElement("span");
        num.className = "uk-calendar-num";
        num.textContent = d;
        btn.appendChild(num);
        if (muted) {
          btn.disabled = true;
          return btn;
        }
        events
          .filter((e) => Number(e.d) === d)
          .forEach((ev) => {
            const tag = document.createElement("span");
            tag.className = "uk-cal-event";
            tag.textContent = ev.t || "";
            btn.appendChild(tag);
          });
        btn.addEventListener("click", () => {
          selectedDay = d;
          render();
        });
        return btn;
      };

      const render = () => {
        titleEl.textContent = `${MONTHS[month]} ${year}`;
        [...grid.children].slice(7).forEach((n) => n.remove());
        const firstDow = new Date(year, month, 1).getDay(); // 0 = Minggu
        const daysIn = new Date(year, month + 1, 0).getDate();
        const prevIn = new Date(year, month, 0).getDate();
        for (let i = firstDow - 1; i >= 0; i--) {
          grid.appendChild(buildDay(prevIn - i, { muted: true }));
        }
        for (let d = 1; d <= daysIn; d++) {
          grid.appendChild(
            buildDay(d, {
              isToday:
                d === today.getDate() && month === today.getMonth() && year === today.getFullYear(),
            }),
          );
        }
        const rest = grid.children.length % 7;
        if (rest) {
          for (let i = 1; i <= 7 - rest; i++) {
            grid.appendChild(buildDay(i, { muted: true }));
          }
        }
      };

      const goTo = (ny, nm) => {
        const d = new Date(ny, nm, 1);
        year = d.getFullYear();
        month = d.getMonth();
        selectedDay = null;
        render();
      };
      const select = (d) => {
        if (d < 1 || d > new Date(year, month + 1, 0).getDate()) return false;
        selectedDay = d;
        render();
        return true;
      };

      prevBtn?.addEventListener("click", () => goTo(year, month - 1));
      nextBtn?.addEventListener("click", () => goTo(year, month + 1));
      render();

      registry.push({
        el: root,
        next: () => goTo(year, month + 1),
        prev: () => goTo(year, month - 1),
        goTo,
        today: () => goTo(today.getFullYear(), today.getMonth()),
        select,
        addEvent: (d, title) => {
          events.push({ d: Number(d), t: title });
          render();
        },
        clearEvents: () => {
          events = [];
          render();
        },
        getDate: () => ({ year, month, day: selectedDay }),
        getTitle: () => titleEl.textContent,
      });
    });

    if (!registry.length) return;
    const find = (target) =>
      registry.find(
        (c) => c.el === (typeof target === "string" ? document.querySelector(target) : target),
      ) || registry[0];
    return {
      list: () => [...registry],
      get: find,
      next: (t) => find(t)?.next(),
      prev: (t) => find(t)?.prev(),
      goTo: (y, mo, t) => find(t)?.goTo(y, mo),
      today: (t) => find(t)?.today(),
      select: (d, t) => find(t)?.select(d),
      addEvent: (d, title, t) => find(t)?.addEvent(d, title),
      clearEvents: (t) => find(t)?.clearEvents(),
      getDate: (t) => find(t)?.getDate(),
    };
  }

  /* ==========================================================
     STEPPER — wizard langkah (done/active), tombol & klik langkah.
     Markup: ol.uk-stepper[data-stepper]; tombol [data-step-prev]/next
     di dalam parent. API: Uikit.stepper
     ========================================================== */
  function initStepper() {
    const registry = [];
    document.querySelectorAll("[data-stepper]").forEach((ol) => {
      const steps = [...ol.querySelectorAll(":scope > .uk-step")];
      if (!steps.length) return;
      const prevBtn = ol.parentElement?.querySelector("[data-step-prev]") || null;
      const nextBtn = ol.parentElement?.querySelector("[data-step-next]") || null;
      let current = steps.findIndex((s) => s.classList.contains("active"));
      if (current < 0) current = 0;

      const sync = () => {
        steps.forEach((st, i) => {
          st.classList.toggle("done", i < current);
          st.classList.toggle("active", i === current);
        });
        steps.forEach((st, i) => {
          const dot = st.querySelector(".uk-step-dot");
          if (!dot) return;
          if (i < current) {
            dot.innerHTML = '<i class="fa-solid fa-check"></i>';
          } else {
            dot.textContent = String(i + 1);
          }
        });
        if (prevBtn) prevBtn.disabled = current <= 0;
        if (nextBtn) nextBtn.disabled = current >= steps.length - 1;
      };
      const go = (idx) => {
        current = Math.max(0, Math.min(idx, steps.length - 1));
        sync();
        return current;
      };

      steps.forEach((st, i) =>
        st.addEventListener("click", () => {
          if (i <= current) go(i);
        }),
      );
      prevBtn?.addEventListener("click", () => go(current - 1));
      nextBtn?.addEventListener("click", () => go(current + 1));
      sync();

      registry.push({
        el: ol,
        next: () => go(current + 1),
        prev: () => go(current - 1),
        goTo: go,
        current: () => current,
        total: () => steps.length,
        reset: () => go(0),
      });
    });
    if (!registry.length) return;
    const primary = registry[0];
    const find = (t) =>
      registry.find((s) => s.el === (typeof t === "string" ? document.querySelector(t) : t)) ||
      primary;
    return {
      list: () => [...registry],
      get: find,
      next: (t) => find(t)?.next(),
      prev: (t) => find(t)?.prev(),
      goTo: (i, t) => find(t)?.goTo(i),
      current: (t) => find(t)?.current(),
      total: (t) => find(t)?.total(),
      reset: (t) => find(t)?.reset(),
    };
  }

  /* ==========================================================
     PAGINATION — client-side paging sederhana.
     Markup:
       <ul data-paginate-items><li>…</li></ul>
       <ul class="pagination uk-pagination" data-paginate
           data-target="#idList" data-paginate-size="3"></ul>
     Halaman dibuat otomatis. API: Uikit.pagination
     ========================================================== */
  function initPagination() {
    const registry = [];
    document.querySelectorAll("[data-paginate]").forEach((nav) => {
      const listEl = document.querySelector(nav.getAttribute("data-target") || "");
      if (!listEl) return;
      const items = [...listEl.children].filter((el) => el.tagName === "LI");
      if (!items.length) return;
      const perPage = parseInt(nav.getAttribute("data-paginate-size") || "5", 10) || 5;
      const pages = Math.max(1, Math.ceil(items.length / perPage));

      const mk = (label, { disabled = false, onClick = null } = {}) => {
        const li = document.createElement("li");
        li.className = "page-item" + (disabled ? " disabled" : "");
        const a = document.createElement("a");
        a.className = "page-link";
        a.href = "#";
        a.innerHTML = label;
        if (disabled) a.setAttribute("tabindex", "-1");
        else if (onClick) {
          a.addEventListener("click", (e) => {
            e.preventDefault();
            onClick();
          });
        }
        li.appendChild(a);
        nav.appendChild(li);
        return li;
      };

      let page = 1;
      const prevLi = mk('Sebelum<i class="fa-solid fa-chevron-left ms-1"></i>', { disabled: true });
      const pageLis = [];
      for (let i = 1; i <= pages; i++) {
        pageLis.push(mk(String(i), { onClick: () => go(i) }));
      }
      const nextLi = mk('Berikut<i class="fa-solid fa-chevron-right ms-1"></i>', {
        disabled: pages <= 1,
      });

      function go(p) {
        page = Math.max(1, Math.min(p, pages));
        items.forEach((li, idx) => {
          li.classList.toggle("d-none", Math.floor(idx / perPage) + 1 !== page);
        });
        pageLis.forEach((li, i) => {
          const cur = i + 1 === page;
          li.classList.toggle("active", cur);
          const a = li.querySelector("a");
          if (cur) a?.setAttribute("aria-current", "page");
          else a?.removeAttribute("aria-current");
        });
        prevLi.classList.toggle("disabled", page === 1);
        nextLi.classList.toggle("disabled", page === pages);
        prevLi.querySelector("a")?.toggleAttribute("tabindex", page === 1);
        nextLi.querySelector("a")?.toggleAttribute("tabindex", page === pages);
        return page;
      }

      go(1);
      registry.push({
        el: nav,
        go,
        next: () => go(page + 1),
        prev: () => go(page - 1),
        current: () => page,
        totalPages: () => pages,
      });
    });
    if (!registry.length) return;
    const primary = registry[0];
    const find = (t) =>
      registry.find((p) => p.el === (typeof t === "string" ? document.querySelector(t) : t)) ||
      primary;
    return {
      list: () => [...registry],
      get: find,
      go: (p, t) => find(t)?.go(p),
      next: (t) => find(t)?.next(),
      prev: (t) => find(t)?.prev(),
      current: (t) => find(t)?.current(),
      totalPages: (t) => find(t)?.totalPages(),
    };
  }

  /* ==========================================================
     NOTIFICATION — tumpukan notifikasi push + auto-hide.
     Markup:
       <button data-notify data-notify-title data-notify-text
               data-notify-type="success|info|warning|danger">
       <div class="uk-notification" data-notify-stack
            data-notify-initial='[{title,text,type}]'
            data-notify-no-hide data-notify-duration="4500">
     API: Uikit.notification
     ========================================================== */
  function initNotification() {
    const stacks = document.querySelectorAll("[data-notify-stack]");
    if (!stacks.length) return;

    const ICONS = {
      success: ["fa-circle-check", ""],
      info: ["fa-circle-info", " bg-soft-info text-info"],
      warning: ["fa-triangle-exclamation", " bg-soft-warning text-warning"],
      danger: ["fa-circle-xmark", " bg-soft-danger text-danger"],
    };

    const remove = (item) => {
      if (!item || item.dataset.leaving) return;
      item.dataset.leaving = "1";
      item.classList.add("is-leave");
      item.addEventListener("animationend", () => item.remove(), { once: true });
      setTimeout(() => item.remove(), 450);
    };

    const push = (cfg, stackEl) => {
      const target =
        typeof stackEl === "string" ? document.querySelector(stackEl) : stackEl || stacks[0];
      if (!target || !cfg || !cfg.title) return null;
      const item = document.createElement("div");
      item.className = "uk-notification-item";
      item.setAttribute("role", "status");
      const [icon, mod] = ICONS[cfg.type] || ICONS.info;
      const text = cfg.text || "";
      item.innerHTML =
        `<span class="uk-notification-icon${mod}"><i class="fa-solid ${icon}"></i></span>` +
        `<div class="flex-grow-1"><div class="uk-notification-title"></div><div class="uk-notification-text"></div></div>`;
      item.querySelector(".uk-notification-title").textContent = cfg.title;
      item.querySelector(".uk-notification-text").textContent = text;
      item.addEventListener("click", () => remove(item));
      target.appendChild(item);
      announce(`Notifikasi: ${cfg.title}${text ? " — " + text : ""}`);
      if (!target.hasAttribute("data-notify-no-hide")) {
        const dur = parseInt(target.getAttribute("data-notify-duration") || "4500", 10);
        setTimeout(() => remove(item), dur);
      }
      return item;
    };

    stacks.forEach((stack) => {
      let initial;
      try {
        initial = JSON.parse(stack.getAttribute("data-notify-initial") || "[]") || [];
      } catch {
        initial = [];
      }
      initial.forEach((cfg) => push(cfg, stack));
    });

    document.querySelectorAll("[data-notify]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cfg = {
          title: btn.getAttribute("data-notify-title") || "",
          text: btn.getAttribute("data-notify-text") || "",
          type: btn.getAttribute("data-notify-type") || "info",
        };
        const target =
          document.querySelector(btn.getAttribute("data-notify-stack") || "") || stacks[0];
        push(cfg, target);
      });
    });

    const clearStack = (stackEl) => {
      const target =
        typeof stackEl === "string" ? document.querySelector(stackEl) : stackEl || stacks[0];
      target?.querySelectorAll(".uk-notification-item").forEach((it) => remove(it));
    };

    return {
      push,
      close: remove,
      clear: clearStack,
      stacks: () => [...stacks],
    };
  }

  /* ==========================================================
     SKELETON — simulasi muat (bar shimmer -> konten asli).
     Markup: .uk-skeleton-demo[data-skeleton-demo] berisi
       .uk-skeleton-bars + .uk-skeleton-content
     Tombol: [data-skeleton-toggle data-target="#id"].
     API: Uikit.skeleton (show/hide/simulate)
     ========================================================== */
  function initSkeleton() {
    const demos = [...document.querySelectorAll("[data-skeleton-demo]")];
    if (!demos.length) return;

    const show = (target) => {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return false;
      el.classList.add("is-loading");
      el.setAttribute("aria-busy", "true");
      return true;
    };
    const hide = (target) => {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return false;
      el.classList.remove("is-loading");
      el.setAttribute("aria-busy", "false");
      return true;
    };
    const simulate = (target, ms) => {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return;
      show(el);
      setTimeout(() => hide(el), ms || 2000);
    };

    document.querySelectorAll("[data-skeleton-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = document.querySelector(btn.getAttribute("data-target") || "") || demos[0];
        simulate(target, 2000);
      });
    });

    return {
      list: () => [...demos],
      show,
      hide,
      simulate,
    };
  }

  /* ==========================================================
     LOADING — simulasi proses (overlay spinner dalam kartu).
     Markup: .uk-demo-loading-card[data-loading-demo] berisi
       .uk-demo-loading-content + .uk-demo-loading
     Tombol: [data-loading-toggle data-target="#id"].
     API: Uikit.loading
     ========================================================== */
  function initLoading() {
    const cards = [...document.querySelectorAll("[data-loading-demo]")];
    if (!cards.length) return;

    const show = (target) => {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return false;
      el.classList.add("is-loading");
      return true;
    };
    const hide = (target) => {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return false;
      el.classList.remove("is-loading");
      return true;
    };
    const simulate = (target, ms) => {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return;
      show(el);
      setTimeout(() => hide(el), ms || 2500);
    };

    document.querySelectorAll("[data-loading-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = document.querySelector(btn.getAttribute("data-target") || "") || cards[0];
        simulate(target, 2500);
      });
    });

    return {
      list: () => [...cards],
      show,
      hide,
      simulate,
    };
  }

  /* ==========================================================
     CHARTS — render nyata di <canvas> tanpa pustaka luar.
     Markup: .uk-chart-wrap[data-chart][data-chart-type] berisi
       <canvas></canvas>. Konfigurasi: atribut data-chart (JSON):
       { type: "area"|"bar"|"donut", labels:[], series:[{name,color,values}] }
     API: Uikit.charts (render/refresh/resize otomatis)
     ========================================================== */
  function initCharts() {
    const registry = [];
    const readCfg = (root) => {
      try {
        return JSON.parse(root.getAttribute("data-chart") || "{}") || {};
      } catch {
        return {};
      }
    };
    const cssVar = (name, fallback) => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    };
    const hexToRgba = (hex, a) => {
      const n = parseInt(hex.replace("#", ""), 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    };
    const isHex = (c) => /^#[0-9a-f]{6}$/i.test(c || "");
    const colorFill = (c, a) => (isHex(c) ? hexToRgba(c, a) : c);

    const prep = (canvas) => {
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { ctx, W, H };
    };

    const draw = (root) => {
      const cfg = readCfg(root);
      const type = cfg.type || root.getAttribute("data-chart-type") || "area";
      const canvas = root.querySelector("canvas");
      if (!canvas || !canvas.clientWidth) return;
      const { ctx, W, H } = prep(canvas);
      if (type === "donut") return drawDonut(ctx, cfg, W, H);
      if (type === "bar") return drawBar(ctx, cfg, W, H);
      drawArea(ctx, cfg, W, H);
    };

    const baseTheme = () => ({
      grid: cssVar("--uk-border", "#e2e8f0"),
      text: cssVar("--uk-text-muted", "#64748b"),
      axis: cssVar("--uk-text", "#1e293b"),
    });

    const drawArea = (ctx, cfg, W, H) => {
      const th = baseTheme();
      const pad = { l: 40, r: 12, t: 14, b: 24 };
      const labels = cfg.labels || [];
      const series = cfg.series || [];
      let max = 0;
      series.forEach((s) => (s.values || []).forEach((v) => (max = Math.max(max, Number(v) || 0))));
      max = max || 1;
      const innerW = W - pad.l - pad.r;
      const innerH = H - pad.t - pad.b;
      const x = (i) =>
        labels.length <= 1 ? pad.l + innerW / 2 : pad.l + (innerW * i) / (labels.length - 1);
      const y = (v) => pad.t + innerH * (1 - v / max);
      ctx.font = "11px Montserrat, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let t = 0; t <= 4; t++) {
        const val = (max * t) / 4;
        ctx.strokeStyle = th.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad.l, y(val));
        ctx.lineTo(W - pad.r, y(val));
        ctx.stroke();
        ctx.fillStyle = th.text;
        ctx.fillText(String(Math.round(val)), pad.l - 6, y(val));
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = th.text;
      labels.forEach((l, i) => ctx.fillText(l, x(i), H - pad.b + 8));
      series.forEach((s) => {
        const color = s.color || "#059669";
        const pts = (s.values || []).map((v, i) => [x(i), y(Number(v) || 0)]);
        if (!pts.length) return;
        const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + innerH);
        grad.addColorStop(0, colorFill(color, 0.2));
        grad.addColorStop(1, colorFill(color, 0));
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        ctx.lineTo(pts[pts.length - 1][0], pad.t + innerH);
        ctx.lineTo(pts[0][0], pad.t + innerH);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.stroke();
        const last = pts[pts.length - 1];
        ctx.beginPath();
        ctx.arc(last[0], last[1], 3.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
    };

    const drawBar = (ctx, cfg, W, H) => {
      const th = baseTheme();
      const pad = { l: 40, r: 8, t: 14, b: 24 };
      const labels = cfg.labels || [];
      const series = cfg.series || [];
      let max = 0;
      series.forEach((s) => (s.values || []).forEach((v) => (max = Math.max(max, Number(v) || 0))));
      max = max || 1;
      const innerW = W - pad.l - pad.r;
      const innerH = H - pad.t - pad.b;
      const y = (v) => pad.t + innerH * (1 - v / max);
      ctx.font = "11px Montserrat, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let t = 0; t <= 4; t++) {
        const val = (max * t) / 4;
        ctx.strokeStyle = th.grid;
        ctx.beginPath();
        ctx.moveTo(pad.l, y(val));
        ctx.lineTo(W - pad.r, y(val));
        ctx.stroke();
        ctx.fillStyle = th.text;
        ctx.fillText(String(Math.round(val)), pad.l - 6, y(val));
      }
      const groupW = innerW / Math.max(1, labels.length);
      const barW = Math.min(18, (groupW / (series.length || 1)) * 0.6);
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      labels.forEach((l, i) => {
        ctx.fillStyle = th.text;
        ctx.fillText(l, pad.l + groupW * i + groupW / 2, H - pad.b + 8);
      });
      series.forEach((s, si) => {
        const color = s.color || "#059669";
        (s.values || []).forEach((v, i) => {
          const val = Number(v) || 0;
          const bx = pad.l + groupW * i + groupW / 2 - (barW * series.length) / 2 + barW * si;
          const by = y(val);
          ctx.fillStyle = colorFill(color, 0.9);
          ctx.beginPath();
          ctx.roundRect(bx, by, barW, pad.t + innerH - by, [3, 3, 0, 0]);
          ctx.fill();
        });
      });
    };

    const drawDonut = (ctx, cfg, W, H) => {
      const data = (cfg.series || []).map((s, i) => ({ ...s, i }));
      const total = data.reduce((a, s) => a + ((s.values && s.values[0]) || 0), 0) || 1;
      const cx = W / 2;
      const cy = H / 2;
      const r = Math.min(W, H) / 2 - 12;
      let a0 = -Math.PI / 2;
      data.forEach((s) => {
        const v = Number((s.values && s.values[0]) || 0);
        const a1 = a0 + (v / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, a0, a1);
        ctx.closePath();
        ctx.fillStyle = s.color || "#059669";
        ctx.fill();
        a0 = a1;
      });
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = cssVar("--uk-surface-raised", "#fff");
      ctx.fill();
      ctx.fillStyle = cssVar("--uk-text", "#1e293b");
      ctx.font = "700 15px Montserrat, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(total), cx, cy);
    };

    document.querySelectorAll("[data-chart]").forEach((root) => {
      draw(root);
      registry.push({
        el: root,
        render: () => draw(root),
        config: () => readCfg(root),
      });
    });
    if (!registry.length) return;

    const redrawAll = () => registry.forEach((r) => r.render());
    const onResize = redrawAll;
    window.addEventListener("resize", onResize);

    // Redraw saat tema berganti: <html data-bs-theme> diubah oleh theme
    // switcher, Uikit.theme.set(), atau prefers-color-scheme (mode auto).
    // Warna digambar dari CSS var (--uk-text/--uk-text-muted/--uk-border/
    // --uk-surface-raised) yang ikut berubah mengikuti [data-bs-theme],
    // jadi render ulang cukup untuk menyamakan canvas dengan tema baru.
    const themeObserver = new MutationObserver(redrawAll);
    themeObserver.observe(html, {
      attributes: true,
      attributeFilter: ["data-bs-theme"],
    });
    const find = (t) =>
      registry.find((c) => c.el === (typeof t === "string" ? document.querySelector(t) : t)) ||
      registry[0];
    return {
      list: () => [...registry],
      get: find,
      render: (target, cfg) => {
        const inst = find(target);
        if (!inst) return false;
        if (cfg) inst.el.setAttribute("data-chart", JSON.stringify(cfg));
        inst.render();
        return true;
      },
      refresh: () => registry.forEach((r) => r.render()),
      destroy: () => {
        window.removeEventListener("resize", onResize);
        themeObserver.disconnect();
      },
    };
  }

  /* ==========================================================
     SCHEDULER — slot jadwal interaktif: klik slot kosong utk
     menambah acara, klik acara utk menghapus, drag antar slot.
     API: Uikit.scheduler
     ========================================================== */
  function initScheduler() {
    const roots = [...document.querySelectorAll("[data-scheduler]")];
    if (!roots.length) return;

    const buildEvent = (text, slot) => {
      const ev = document.createElement("span");
      ev.className = "uk-sched-event";
      ev.textContent = text;
      ev.setAttribute("role", "button");
      ev.setAttribute("tabindex", "0");
      attachEvent(ev);
      slot.appendChild(ev);
      return ev;
    };

    const attachEvent = (ev) => {
      ev.draggable = true;
      ev.addEventListener("dragstart", () => {
        ev.classList.add("is-dragging");
      });
      ev.addEventListener("dragend", () => ev.classList.remove("is-dragging"));
      ev.addEventListener("click", () => {
        ev.remove();
      });
      ev.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          ev.remove();
          return;
        }
        // Keyboard: Ctrl+Shift+panah memindah acara antar slot (paritas drag mouse).
        // ↑/↓ = baris waktu, ←/→ = kolom dalam baris; ujung papan aman; fokus ikut.
        if (
          e.ctrlKey &&
          e.shiftKey &&
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
          const root = ev.closest("[data-scheduler]");
          const rowEl = ev.closest(".uk-scheduler-row");
          if (!root || !rowEl) return;
          const rows = [...root.querySelectorAll(".uk-scheduler-row")];
          const cols = [...rowEl.querySelectorAll(".uk-sched-slot")];
          const colIdx = cols.indexOf(ev.parentElement);
          if (colIdx < 0) return;
          let target = null;
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            const rowIdx = rows.indexOf(rowEl);
            const nextRow = rows[rowIdx + (e.key === "ArrowDown" ? 1 : -1)];
            if (!nextRow) return; // ujung papan aman
            const nextCols = [...nextRow.querySelectorAll(".uk-sched-slot")];
            target = nextCols[Math.min(colIdx, nextCols.length - 1)];
          } else {
            target = cols[colIdx + (e.key === "ArrowRight" ? 1 : -1)];
          }
          if (!target || target === ev.parentElement) return;
          e.preventDefault();
          moveTo(ev, target);
          target.classList.add("is-over"); // kilau tujuan (paritas kanban)
          setTimeout(() => target.classList.remove("is-over"), 400);
          ev.focus(); // fokus ikut ke lokasi baru
        }
      });
    };

    const moveTo = (ev, slot) => {
      if (typeof slot === "string") slot = document.querySelector(slot);
      if (!ev || !slot) return false;
      ev.classList.remove("is-dragging");
      slot.appendChild(ev);
      return true;
    };
    const addTo = (text, slot) => {
      if (typeof slot === "string") slot = document.querySelector(slot);
      if (!slot) return null;
      const ev = buildEvent(text || "Acara", slot);
      return ev;
    };
    const clearAll = (root) => {
      const el = typeof root === "string" ? document.querySelector(root) : root || roots[0];
      el?.querySelectorAll(".uk-sched-event").forEach((ev) => ev.remove());
    };

    roots.forEach((root) => {
      const slots = [...root.querySelectorAll(".uk-sched-slot")];
      root.querySelectorAll(".uk-sched-event").forEach(attachEvent);
      slots.forEach((slot) => {
        slot.addEventListener("click", () => {
          if (slot.querySelector(".uk-sched-event")) return; // klik acara di-handle sendiri
          const text = window.prompt("Acara baru (mis. Rapat tim):", "");
          if (text && text.trim()) addTo(text.trim(), slot);
        });
        slot.addEventListener("dragover", (e) => {
          e.preventDefault();
          slot.classList.add("is-over");
        });
        slot.addEventListener("dragleave", () => slot.classList.remove("is-over"));
        slot.addEventListener("drop", (e) => {
          e.preventDefault();
          slot.classList.remove("is-over");
          const dragging = root.querySelector(".uk-sched-event.is-dragging");
          if (dragging) moveTo(dragging, slot);
        });
      });
    });

    return {
      list: () => [...roots],
      add: addTo,
      addAt: (rowIdx, colIdx, text) => {
        const root = roots[0];
        const rows = [...root.querySelectorAll(".uk-scheduler-row")];
        const row = rows[rowIdx] || rows[0];
        const cols = [...row.querySelectorAll(".uk-sched-slot")];
        const slot = cols[colIdx] || cols[0];
        if (slot) return addTo(text, slot);
        return null;
      },
      remove: (ev) => ev?.remove(),
      move: moveTo,
      clear: clearAll,
    };
  }

  /* ==========================================================
     MEDIA PLAYER — Video & Audio dengan kontrol kustom nyata.
     Markup per player:
       [data-video-player] / [data-audio-player] berisi elemen media
       (<video>/<audio>) + [data-media-toggle], [data-media-seek]
       (progress + data-media-bar), [data-media-time].
     API: Uikit.video & Uikit.audio
     ========================================================== */
  const createMediaApi = (registry) => {
    const find = (target) =>
      registry.find(
        (p) => p.el === (typeof target === "string" ? document.querySelector(target) : target),
      ) || registry[0];
    return {
      list: () => [...registry],
      get: find,
      play: (t) => find(t)?.play(),
      pause: (t) => find(t)?.pause(),
      toggle: (t) => find(t)?.toggle(),
      seekTo: (sec, t) => find(t)?.seekTo(sec),
      mute: (m, t) => find(t)?.mute(m),
      getState: (t) => find(t)?.getState(),
    };
  };

  function initMediaPlayers() {
    const videos = [];
    const audios = [];

    const fmt = (s) => {
      if (!isFinite(s)) return "00:00";
      const m = Math.floor(s / 60);
      const ss = Math.floor(s % 60);
      return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
    };

    const bind = (root, media) => {
      const ctl = root.querySelector("[data-media-toggle]");
      const seekEl = root.querySelector("[data-media-seek]");
      const bar = root.querySelector("[data-media-bar]");
      const timeEl = root.querySelector("[data-media-time]");

      const sync = () => {
        const playing = !media.paused && !media.ended;
        root.classList.toggle("is-playing", playing);
        if (ctl) {
          const ic = ctl.querySelector("i");
          if (ic) ic.className = playing ? "fa-solid fa-pause" : "fa-solid fa-play";
        }
        if (bar && isFinite(media.duration) && media.duration > 0) {
          bar.style.width = `${(media.currentTime / media.duration) * 100}%`;
          seekEl?.setAttribute(
            "aria-valuenow",
            String(Math.round((media.currentTime / media.duration) * 100)),
          );
        }
        if (timeEl) {
          timeEl.textContent = `${fmt(media.currentTime)} / ${fmt(media.duration)}`;
        }
      };

      const play = () => {
        const p = media.play();
        if (p && typeof p.then === "function") p.then(sync).catch(sync);
        sync();
      };
      const pause = () => {
        media.pause();
        sync();
      };
      const toggle = () => (media.paused ? play() : pause());
      const seekTo = (sec) => {
        const t = Number(sec) || 0;
        if (isFinite(media.duration)) {
          media.currentTime = Math.max(0, Math.min(t, media.duration));
        } else {
          media.currentTime = Math.max(0, t);
        }
        sync();
        return media.currentTime;
      };
      const mute = (m) => {
        media.muted = m == null ? !media.muted : !!m;
        sync();
        return media.muted;
      };

      ctl?.addEventListener("click", toggle);
      media.addEventListener("click", toggle);
      seekEl?.addEventListener("click", (e) => {
        if (!isFinite(media.duration) || media.duration <= 0) return;
        const rect = seekEl.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        media.currentTime = ratio * media.duration;
        sync();
      });
      seekEl?.addEventListener("keydown", (e) => {
        if (!isFinite(media.duration) || media.duration <= 0) return;
        const jump = e.key === "ArrowRight" ? 5 : e.key === "ArrowLeft" ? -5 : null;
        if (jump != null) {
          e.preventDefault();
          media.currentTime = Math.max(0, Math.min(media.currentTime + jump, media.duration));
        } else if (e.key === "Home") {
          e.preventDefault();
          media.currentTime = 0;
        } else if (e.key === "End") {
          e.preventDefault();
          media.currentTime = media.duration;
        } else {
          return;
        }
        sync();
      });

      ["timeupdate", "loadedmetadata", "play", "pause", "ended", "volumechange"].forEach((ev) =>
        media.addEventListener(ev, sync),
      );
      sync();
      return {
        el: root,
        media,
        play,
        pause,
        toggle,
        seekTo,
        mute,
        getState: () => ({
          paused: media.paused,
          ended: media.ended,
          muted: media.muted,
          current: media.currentTime,
          duration: isFinite(media.duration) ? media.duration : 0,
        }),
      };
    };

    document.querySelectorAll("[data-video-player]").forEach((root) => {
      const media = root.querySelector("video");
      if (media) videos.push(bind(root, media));
    });
    document.querySelectorAll("[data-audio-player]").forEach((root) => {
      const media = root.querySelector("audio");
      if (media) audios.push(bind(root, media));
    });

    return { video: createMediaApi(videos), audio: createMediaApi(audios) };
  }

  /* ==========================================================
     WIDGETS — Catatan Cepat (quick notes): tambah/hapus item.
     Markup: .uk-widget[data-widget] > .card-header > button[data-widget-add]
             .uk-widget-body > ul.uk-widget-list > li.uk-widget-note
     Tombol hapus per item: button[data-widget-remove] di dalam li.
     API: Uikit.widgets (add/remove/clear/count/list)
     ========================================================== */
  function initWidgets() {
    const roots = document.querySelectorAll("[data-widget]");
    if (!roots.length) return;

    const resolve = (root) => {
      if (!root) return roots[0] || null;
      if (typeof root === "string") return document.querySelector(root);
      return root.nodeType ? root : roots[0] || null;
    };
    const listOf = (root) => resolve(root)?.querySelector(".uk-widget-list") || null;

    const remove = (li) => {
      if (typeof li === "string") li = document.querySelector(li);
      if (!li || li.dataset.removing) return false;
      li.dataset.removing = "1";
      li.classList.add("is-removing");
      li.addEventListener("animationend", () => li.remove(), { once: true });
      setTimeout(() => li.remove(), 350);
      return true;
    };

    const add = (text, root) => {
      const target = listOf(root);
      if (!target) return null;
      const li = document.createElement("li");
      li.className = "uk-widget-note";
      li.innerHTML =
        '<i class="fa-solid fa-circle-info text-primary"></i>' +
        '<span class="uk-widget-note-text"></span>' +
        '<button type="button" class="uk-widget-remove" data-widget-remove aria-label="Hapus catatan" title="Hapus"><i class="fa-solid fa-xmark"></i></button>';
      li.querySelector(".uk-widget-note-text").textContent = text;
      target.appendChild(li);
      return li;
    };

    roots.forEach((root) => {
      // Hapus item (delegasi — berlaku juga untuk item hasil add())
      const list = root.querySelector(".uk-widget-list");
      list?.addEventListener("click", (e) => {
        const rm = e.target.closest("[data-widget-remove]");
        if (rm) {
          e.stopPropagation();
          remove(rm.closest(".uk-widget-note"));
        }
      });
      // Tombol "+" di header widget
      root.querySelectorAll("[data-widget-add]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const value = window.prompt("Tulis catatan cepat:", "");
          if (value == null) return;
          const text = value.trim();
          if (text) add(text, root);
        });
      });
    });

    return {
      /** Tambah catatan baru; kembalikan <li> yang dibuat */
      add,
      /** Hapus satu catatan (elemen li / selector) dengan animasi keluar */
      remove,
      /** Kosongkan semua catatan pada widget */
      clear: (root) => {
        const list = listOf(root);
        list?.querySelectorAll(".uk-widget-note").forEach((li) => remove(li));
        return true;
      },
      /** Jumlah catatan saat ini pada widget */
      count: (root) => listOf(root)?.querySelectorAll(".uk-widget-note").length || 0,
      /** Elemen widget yang dikelola */
      list: () => [...roots],
    };
  }

  /* ==========================================================
     TASK CHECKBOX — centang = selesai (pindah kolom Selesai),
     hapus centang = buka ulang (kembali ke Antrian).
     Kolom dikenali lewat data-kanban-status="todo|doing|done"
     (fallback: nama judul kolom). Status visual lewat .uk-task-done.
     API: Uikit.task (complete/reopen/setDone/toggle/counts)
     ========================================================== */
  function initTaskCheckboxes() {
    const columns = document.querySelectorAll("[data-kanban-column]");
    const boxes = document.querySelectorAll(".uk-task-card .form-check-input");
    if (!columns.length || !boxes.length) return;

    const STATUS_ALIAS = {
      todo: ["antrian", "todo", "backlog"],
      doing: ["dikerjakan", "doing", "proses"],
      done: ["selesai", "done", "completed"],
    };
    const colStatus = (col) => {
      const explicit = col.getAttribute("data-kanban-status");
      if (explicit) return explicit;
      const title = (col.querySelector(".uk-kanban-title")?.textContent || "").toLowerCase();
      for (const [status, aliases] of Object.entries(STATUS_ALIAS)) {
        if (aliases.some((a) => title.includes(a))) return status;
      }
      return "";
    };
    const findCol = (status) => [...columns].find((c) => colStatus(c) === status) || null;

    const syncCounts = () => {
      columns.forEach((col) => {
        const el = col.querySelector("[data-kanban-count]");
        if (el) el.textContent = col.querySelectorAll(".uk-task-card").length;
      });
    };
    const moveTo = (card, status) => {
      const col = findCol(status);
      const dropzone = col?.querySelector(".uk-kanban-dropzone");
      if (!dropzone) return false;
      dropzone.appendChild(card);
      syncCounts();
      return true;
    };
    const tagOf = (card) => card.querySelector(".uk-task-tag");
    const dueOf = (card) => card.querySelector(".uk-task-due");

    const setState = (card, done) => {
      if (typeof card === "string") card = document.querySelector(card);
      if (!card) return false;
      const box = card.querySelector(".form-check-input");
      if (box) box.checked = done;
      const tag = tagOf(card);
      if (done) {
        card.classList.add("uk-task-done");
        if (tag && !card.dataset.origTag) {
          card.dataset.origTag = tag.textContent.trim();
          card.dataset.origTagCls = tag.className;
        }
        if (tag) {
          tag.className = "uk-task-tag badge-soft-success";
          tag.textContent = "Selesai";
        }
        dueOf(card)?.classList.add("d-none");
        return moveTo(card, "done");
      }
      card.classList.remove("uk-task-done");
      if (tag && card.dataset.origTag) {
        tag.className = card.dataset.origTagCls || "uk-task-tag";
        tag.textContent = card.dataset.origTag;
        delete card.dataset.origTag;
        delete card.dataset.origTagCls;
      }
      dueOf(card)?.classList.remove("d-none");
      // Buka ulang hanya jika sebelumnya ada di kolom Selesai
      if (colStatus(card.closest("[data-kanban-column]")) === "done") {
        moveTo(card, "todo");
      }
      return true;
    };

    boxes.forEach((box) => {
      box.addEventListener("change", () => {
        const card = box.closest(".uk-task-card");
        if (card) setState(card, box.checked);
      });
    });

    // Kartu selesai yang di-drag ke kolom belum selesai -> otomatis dibuka ulang di tempat
    let dragging = null;
    document.querySelectorAll(".uk-task-card[draggable]").forEach((card) => {
      card.addEventListener("dragstart", () => (dragging = card));
      card.addEventListener("dragend", () => (dragging = null));
    });
    document.addEventListener("drop", () => {
      requestAnimationFrame(() => {
        if (!dragging) return;
        const card = dragging;
        const col = card.closest("[data-kanban-column]");
        const box = card.querySelector(".form-check-input");
        if (card.classList.contains("uk-task-done") && colStatus(col) !== "done" && box?.checked) {
          setState(card, false);
        }
        dragging = null;
      });
    });

    return {
      /** Tandai selesai + pindah ke kolom Selesai */
      complete: (card) => setState(card, true),
      /** Buka ulang + kembalikan ke kolom Antrian */
      reopen: (card) => setState(card, false),
      /** Atur status selesai (true/false) */
      setDone: (card, done) => setState(card, !!done),
      /** Balik status kartu */
      toggle: (card) => setState(card, !card?.classList?.contains("uk-task-done")),
      /** Sinkronkan angka [data-kanban-count] */
      counts: syncCounts,
      /** Kartu yang dikelola */
      list: () => [...boxes].map((b) => b.closest(".uk-task-card")).filter(Boolean),
    };
  }

  /* ==========================================================
     FAB — aksi cepat. Dua pola demo:
       a. FAB "+" [data-fab-menu] = dropdown berisi item
          button[data-fab-action="theme|notify|note"]
       b. FAB kecil [data-fab-action] = aksi langsung sekali klik
     Umpan balik: toast #ukFabToast (jika ada di halaman) + aksi nyata
     (Uikit.theme / Uikit.notification / Uikit.widgets).
     API: Uikit.fab (run/toast/actions)
     ========================================================== */
  function initFab() {
    const buttons = document.querySelectorAll("[data-fab-menu], [data-fab-action]");
    if (!buttons.length) return;

    const toastEl = document.getElementById("ukFabToast");
    const showToast = (text, icon) => {
      if (!toastEl || !window.bootstrap?.Toast) return false;
      const body = toastEl.querySelector(".toast-body");
      if (body) {
        body.replaceChildren();
        const i = document.createElement("i");
        i.className = `fa-solid ${icon || "fa-bolt"} me-2`;
        body.append(i, document.createTextNode(text));
      }
      window.bootstrap.Toast.getOrCreateInstance(toastEl).show();
      return true;
    };

    const ACTIONS = {
      /** Siklus tema light -> dark -> auto */
      theme: () => {
        const order = ["light", "dark", "auto"];
        const current = Uikit.theme.get() || "auto";
        const next = order[(order.indexOf(current) + 1) % order.length];
        Uikit.theme.set(next);
        showToast(`Tema diubah ke ${next}`, "fa-circle-half-stroke");
        return next;
      },
      /** Dorong notifikasi demo ke tumpukan pertama [data-notify-stack] */
      notify: () => {
        if (!Uikit.notification) return false;
        Uikit.notification.push({
          title: "Aksi cepat FAB",
          text: "Notifikasi demo dikirim dari tombol FAB.",
          type: "success",
        });
        showToast("Notifikasi demo dikirim", "fa-bell");
        return true;
      },
      /** Buat catatan cepat baru (prompt) ke widget [data-widget] */
      note: () => {
        const value = window.prompt("Tulis catatan cepat:", "");
        if (value == null) return false;
        const text = value.trim();
        if (!text) return false;
        const li = Uikit.widgets?.add(text) || null;
        if (li) {
          const root = li.closest("[data-widget]");
          if (root) {
            root.scrollIntoView({ behavior: "smooth", block: "center" });
            root.classList.remove("uk-flash");
            void root.offsetWidth;
            root.classList.add("uk-flash");
            setTimeout(() => root.classList.remove("uk-flash"), 1600);
          }
          showToast("Catatan cepat ditambahkan", "fa-note-sticky");
          return true;
        }
        showToast("Tidak ada widget catatan di halaman ini", "fa-circle-exclamation");
        return false;
      },
    };

    const run = (name) =>
      Object.prototype.hasOwnProperty.call(ACTIONS, name) ? ACTIONS[name]() : false;

    buttons.forEach((btn) => {
      // Item aksi (di dalam menu FAB) maupun FAB kecil dengan aksi langsung
      const action = btn.getAttribute("data-fab-action");
      if (action) {
        btn.addEventListener("click", () => run(action));
      }
    });

    return {
      /** Jalankan aksi cepat: "theme" | "notify" | "note" */
      run,
      /** Tampilkan toast umpan balik (icon FontAwesome opsional) */
      toast: showToast,
      /** Daftar aksi yang tersedia */
      actions: () => Object.keys(ACTIONS),
    };
  }

  /* ==========================================================
     DATEPICKER & TIMEPICKER — input kustom Bahasa Indonesia
     (format dd/mm/yyyy & HH:MM konsisten di semua browser; menggantikan
     picker native yang mengikuti locale browser — catatan FC10 selesai).
     Markup: .uk-datepicker[data-datepicker] / .uk-timepicker[data-timepicker]
     ========================================================== */
  const ID_MONTHS = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  // Hari mulai Senin (kolom 0 = Senin) & nama lengkap utk aria-label
  const ID_WEEK_SHORT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const ID_DAYS_LONG = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const ukPad2 = (n) => String(n).padStart(2, "0");
  const ukToDmy = (d) => `${ukPad2(d.getDate())}/${ukPad2(d.getMonth() + 1)}/${d.getFullYear()}`;

  function initDatepicker() {
    const roots = [...document.querySelectorAll("[data-datepicker]")];
    if (!roots.length) return;

    const apis = [];
    const install = (wrapper) => {
      const pop = document.createElement("div");
      pop.className = "uk-picker-pop";
      pop.setAttribute("role", "dialog");
      pop.setAttribute("aria-label", "Pilih tanggal");
      pop.innerHTML = `
      <div class="uk-picker-head">
        <button type="button" class="uk-picker-nav" data-dp-prev aria-label="Bulan sebelumnya"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>
        <div class="uk-picker-title" data-dp-title></div>
        <button type="button" class="uk-picker-nav" data-dp-next aria-label="Bulan berikutnya"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
      </div>
      <div class="uk-picker-week">${ID_WEEK_SHORT.map((d) => `<span>${d}</span>`).join("")}</div>
      <div class="uk-picker-grid" data-dp-grid></div>
      <div class="uk-picker-foot">
        <button type="button" class="btn btn-soft-primary btn-sm" data-dp-today>Hari ini</button>
        <button type="button" class="btn btn-light btn-sm" data-dp-close>Tutup</button>
      </div>`;

      const title = pop.querySelector("[data-dp-title]");
      const grid = pop.querySelector("[data-dp-grid]");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const state = { view: new Date(today), value: null };

      const sameDay = (a, b) =>
        !!a &&
        !!b &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

      const parseDmy = (str) => {
        const m = (str || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (!m) return null;
        const d = new Date(+m[3], +m[2] - 1, +m[1]);
        return sameDay(d, new Date(+m[3], +m[2] - 1, +m[1])) ? d : null;
      };

      const format = () => (state.value ? ukToDmy(state.value) : "");

      const render = () => {
        const y = state.view.getFullYear();
        const m = state.view.getMonth();
        title.textContent = `${ID_MONTHS[m]} ${y}`;
        grid.innerHTML = "";
        const first = new Date(y, m, 1);
        const offset = (first.getDay() + 6) % 7; // Senin = kolom 0
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        const cells = Math.ceil((offset + daysInMonth) / 7) * 7;
        for (let i = 0; i < cells; i++) {
          const dayNum = i - offset + 1;
          const cellDate =
            dayNum < 1
              ? new Date(y, m - 1, daysInMonth + dayNum)
              : dayNum > daysInMonth
                ? new Date(y, m + 1, dayNum - daysInMonth)
                : new Date(y, m, dayNum);
          cellDate.setHours(0, 0, 0, 0);
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "uk-picker-day";
          btn.textContent = cellDate.getDate();
          btn.setAttribute(
            "aria-label",
            `${ID_DAYS_LONG[cellDate.getDay()]}, ${cellDate.getDate()} ${ID_MONTHS[cellDate.getMonth()]} ${cellDate.getFullYear()}`,
          );
          if (dayNum < 1 || dayNum > daysInMonth) btn.classList.add("is-out");
          if (sameDay(cellDate, today)) btn.classList.add("is-today");
          if (sameDay(cellDate, state.value)) btn.classList.add("is-selected");
          btn.addEventListener("click", () => {
            state.value = cellDate;
            state.view = new Date(cellDate.getFullYear(), cellDate.getMonth(), 1);
            input.value = format();
            close(true);
          });
          grid.appendChild(btn);
        }
      };

      const moveMonth = (delta) => {
        state.view = new Date(state.view.getFullYear(), state.view.getMonth() + delta, 1);
        render();
      };

      const pickToday = () => {
        state.value = new Date(today);
        input.value = format();
        close(true);
      };

      const place = () => {
        const r = wrapper.getBoundingClientRect();
        pop.classList.add("open");
        const w = pop.offsetWidth;
        const h = pop.offsetHeight;
        let x = Math.min(r.left, Math.max(8, window.innerWidth - w - 8));
        let y = r.bottom + 6;
        if (y + h > window.innerHeight - 8) y = Math.max(8, r.top - h - 6);
        pop.style.left = `${x}px`;
        pop.style.top = `${y}px`;
      };

      const open = (opts = {}) => {
        if (state.open) return;
        state.open = true;
        const initial = state.value || opts.value || null;
        if (initial) {
          state.value = typeof initial === "string" ? parseDmy(initial) : initial;
          state.view = state.value
            ? new Date(state.value.getFullYear(), state.value.getMonth(), 1)
            : state.view;
        } else {
          state.view = new Date(today.getFullYear(), today.getMonth(), 1);
        }
        render();
        place();
        input.setAttribute("aria-expanded", "true");
        const focusTarget =
          grid.querySelector(".is-selected, .is-today") || grid.querySelector(".uk-picker-day");
        if (focusTarget) focusTarget.focus();
      };

      const close = (restoreFocus) => {
        if (!state.open) return;
        state.open = false;
        pop.classList.remove("open");
        input.setAttribute("aria-expanded", "false");
        if (restoreFocus !== false) input.focus();
      };

      const input = wrapper.querySelector(".uk-picker-input");
      input.setAttribute("aria-haspopup", "dialog");
      input.setAttribute("aria-expanded", "false");
      const parsed = parseDmy(input.value);
      if (parsed) state.value = parsed;
      wrapper.appendChild(pop);

      pop.querySelector("[data-dp-prev]").addEventListener("click", () => moveMonth(-1));
      pop.querySelector("[data-dp-next]").addEventListener("click", () => moveMonth(1));
      pop.querySelector("[data-dp-today]").addEventListener("click", pickToday);
      pop.querySelector("[data-dp-close]").addEventListener("click", () => close(true));

      wrapper.addEventListener("click", (e) => {
        if (pop.contains(e.target)) return;
        if (state.open) close(false);
        else open();
      });
      input.addEventListener("keydown", (e) => {
        if ((e.key === "Enter" || e.key === " ") && !state.open) {
          e.preventDefault();
          open();
        }
      });
      document.addEventListener("click", (e) => {
        if (state.open && !wrapper.contains(e.target)) close(false);
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && state.open) close(true);
      });

      apis.push({
        /** Buka panel kalender (nilai awal opsional: Date atau "dd/mm/yyyy") */
        open,
        /** Tutup panel (focus kembali ke input bila restoreFocus !== false) */
        close,
        isOpen: () => !!state.open,
        /** Nilai terpilih sebagai Date (null bila kosong) */
        get: () => (state.value ? new Date(state.value) : null),
        /** Nilai terpilih sebagai teks "dd/mm/yyyy" */
        value: () => format(),
        /** Set tanggal: Date | "dd/mm/yyyy" | null (menghapus) */
        set: (v) => {
          const d = typeof v === "string" ? parseDmy(v) : v instanceof Date ? new Date(v) : null;
          state.value = d;
          input.value = format();
          return d;
        },
      });
    };
    roots.forEach(install);
    return apis[0];
  }

  function initTimepicker() {
    const roots = [...document.querySelectorAll("[data-timepicker]")];
    if (!roots.length) return;

    const apis = [];
    const install = (wrapper) => {
      const pop = document.createElement("div");
      pop.className = "uk-picker-pop";
      pop.setAttribute("role", "dialog");
      pop.setAttribute("aria-label", "Pilih jam");
      pop.innerHTML = `
      <div class="uk-picker-head">
        <div class="uk-picker-title">Pilih Jam</div>
        <button type="button" class="uk-picker-nav" data-tp-close aria-label="Tutup"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      </div>
      <div class="uk-time-list" data-tp-list></div>
      <div class="uk-picker-foot">
        <button type="button" class="btn btn-soft-primary btn-sm" data-tp-now>Sekarang</button>
      </div>`;

      const list = pop.querySelector("[data-tp-list]");
      const state = { open: false, value: "" };

      const render = () => {
        list.innerHTML = "";
        for (let h = 0; h < 24; h++) {
          for (let quarter = 0; quarter < 4; quarter++) {
            const value = `${ukPad2(h)}:${ukPad2(quarter * 15)}`;
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "uk-time-option";
            btn.textContent = value;
            if (value === state.value) btn.classList.add("is-selected");
            btn.setAttribute("aria-label", `Jam ${value}`);
            btn.addEventListener("click", () => {
              state.value = value;
              input.value = value;
              close(true);
            });
            list.appendChild(btn);
          }
        }
        const now = new Date();
        const current = `${ukPad2(now.getHours())}:${ukPad2(now.getMinutes())}`;
        list.setAttribute("data-tp-current", current);
      };

      const nowValue = () => {
        const now = new Date();
        return `${ukPad2(now.getHours())}:${ukPad2(now.getMinutes())}`;
      };

      const place = () => {
        const r = wrapper.getBoundingClientRect();
        pop.classList.add("open");
        const w = pop.offsetWidth;
        const h = pop.offsetHeight;
        let x = Math.min(r.left, Math.max(8, window.innerWidth - w - 8));
        let y = r.bottom + 6;
        if (y + h > window.innerHeight - 8) y = Math.max(8, r.top - h - 6);
        pop.style.left = `${x}px`;
        pop.style.top = `${y}px`;
      };

      const open = () => {
        if (state.open) return;
        state.open = true;
        render();
        place();
        input.setAttribute("aria-expanded", "true");
        const selected = list.querySelector(".uk-time-option.is-selected");
        if (selected) {
          selected.focus();
          list.scrollTop = selected.offsetTop - list.clientHeight / 2;
        }
      };

      const close = (restoreFocus) => {
        if (!state.open) return;
        state.open = false;
        pop.classList.remove("open");
        input.setAttribute("aria-expanded", "false");
        if (restoreFocus !== false) input.focus();
      };

      const pickNow = () => {
        state.value = nowValue();
        input.value = state.value;
        close(true);
      };

      const input = wrapper.querySelector(".uk-picker-input");
      input.setAttribute("aria-haspopup", "dialog");
      input.setAttribute("aria-expanded", "false");
      if (/^\d{2}:\d{2}$/.test(input.value)) state.value = input.value;
      wrapper.appendChild(pop);

      pop.querySelector("[data-tp-close]").addEventListener("click", () => close(true));
      pop.querySelector("[data-tp-now]").addEventListener("click", pickNow);

      wrapper.addEventListener("click", (e) => {
        if (pop.contains(e.target)) return;
        if (state.open) close(false);
        else open();
      });
      input.addEventListener("keydown", (e) => {
        if ((e.key === "Enter" || e.key === " ") && !state.open) {
          e.preventDefault();
          open();
        }
      });
      document.addEventListener("click", (e) => {
        if (state.open && !wrapper.contains(e.target)) close(false);
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && state.open) close(true);
      });

      apis.push({
        /** Buka panel daftar jam */
        open,
        /** Tutup panel */
        close,
        isOpen: () => !!state.open,
        /** Nilai terpilih "HH:MM" (string kosong bila kosong) */
        value: () => state.value,
        /** Set jam: "HH:MM" | "" (menghapus) */
        set: (v) => {
          state.value = /^\d{2}:\d{2}$/.test(v || "") ? v : "";
          input.value = state.value;
          return state.value;
        },
      });
    };
    roots.forEach(install);
    return apis[0];
  }
})();
