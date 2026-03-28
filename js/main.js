(function () {
  const LANG_KEY = "kjl-lang";
  const THEME_KEY = "kjl-theme";

  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  function applyLang(lang) {
    const valid = lang === "zh" ? "zh" : "en";
    document.documentElement.setAttribute("data-lang", valid);
    document.documentElement.lang = valid === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-set-lang]").forEach((btn) => {
      const isActive = btn.getAttribute("data-set-lang") === valid;
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      btn.classList.toggle("active", isActive);
    });
    try {
      localStorage.setItem(LANG_KEY, valid);
    } catch (_) {}
  }

  function applyTheme(theme) {
    const t = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch (_) {}
  }

  function initLang() {
    let saved = null;
    try {
      saved = localStorage.getItem(LANG_KEY);
    } catch (_) {}
    const initial =
      saved === "en" || saved === "zh"
        ? saved
        : navigator.language && navigator.language.toLowerCase().startsWith("zh")
          ? "zh"
          : "en";
    applyLang(initial);
  }

  function initTheme() {
    let saved = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch (_) {}
    applyTheme(saved === "light" || saved === "dark" ? saved : "dark");
  }

  initLang();
  initTheme();

  document.querySelectorAll("[data-set-lang]").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      applyLang(this.getAttribute("data-set-lang"));
    });
  });

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const cur = document.documentElement.getAttribute("data-theme") || "dark";
      applyTheme(cur === "dark" ? "light" : "dark");
      if (navMenu) {
        navMenu.classList.remove("active");
      }
      if (navToggle) {
        navToggle.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      const open = navMenu.classList.toggle("active");
      navToggle.classList.toggle("active", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        navMenu.classList.remove("active");
        navToggle.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll('.nav-menu a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function () {
      document.querySelectorAll(".nav-menu a").forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
    });
  });
})();
