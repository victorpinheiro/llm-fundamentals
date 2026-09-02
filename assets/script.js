(function () {
  var toggle = document.getElementById("menuToggle");
  var sidebar = document.getElementById("sidebar");
  var overlay = document.getElementById("sidebarOverlay");
  if (!toggle || !sidebar || !overlay) return;

  function openMenu() {
    sidebar.classList.add("open");
    overlay.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fechar menu");
  }
  function closeMenu() {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
  }
  function isMenuOpen() {
    return sidebar.classList.contains("open");
  }
  toggle.addEventListener("click", function () {
    if (isMenuOpen()) {
      closeMenu();
      toggle.focus();
    } else {
      openMenu();
    }
  });
  overlay.addEventListener("click", function () {
    closeMenu();
    toggle.focus();
  });

  // Close on Escape while the mobile sidebar is open.
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isMenuOpen()) {
      closeMenu();
      toggle.focus();
    }
  });

  // Basic focus trap: while the mobile sidebar is open, Tab cycles
  // within the sidebar's focusable elements only.
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Tab" || !isMenuOpen() || window.innerWidth > 880) return;

    var candidates = sidebar.querySelectorAll(
      "a[href], button:not([disabled]), summary, input, [tabindex]:not([tabindex='-1'])"
    );
    var focusable = [];
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      // Skip items hidden inside a closed <details> (the <summary> itself
      // is always visible/focusable), or otherwise not rendered.
      var parentDetails = el.tagName === "SUMMARY" ? null : el.closest("details");
      if (parentDetails && !parentDetails.open) continue;
      if (el.offsetParent === null) continue;
      focusable.push(el);
    }
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    var current = document.activeElement;

    if (event.shiftKey) {
      if (current === first || !sidebar.contains(current)) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (current === last || !sidebar.contains(current)) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  // Close the mobile sidebar automatically after navigating.
  var links = sidebar.querySelectorAll("a");
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function () {
      if (window.innerWidth <= 880) closeMenu();
    });
  }

  // Scroll the active nav link into view within the sidebar.
  var active = sidebar.querySelector("a.active");
  if (active && active.scrollIntoView) {
    active.scrollIntoView({ block: "center" });
  }
})();

// Checkbox persistence via localStorage.
// Each page gets a key derived from its pathname; each checkbox is
// identified by its index on that page.
(function () {
  var STORAGE_PREFIX = "llm-pratica:cb:";
  var pageKey = STORAGE_PREFIX + location.pathname.replace(/^\//, "");
  var boxes = document.querySelectorAll('.markdown-body input[type="checkbox"]');
  if (!boxes.length) return;

  // Restore saved state.
  try {
    var saved = JSON.parse(localStorage.getItem(pageKey));
    if (Array.isArray(saved)) {
      for (var i = 0; i < boxes.length && i < saved.length; i++) {
        boxes[i].checked = saved[i];
      }
    }
  } catch (_) {}

  // Save on every change.
  function persist() {
    var state = [];
    for (var i = 0; i < boxes.length; i++) {
      state.push(boxes[i].checked);
    }
    try { localStorage.setItem(pageKey, JSON.stringify(state)); } catch (_) {}
  }

  for (var i = 0; i < boxes.length; i++) {
    boxes[i].addEventListener("change", persist);
  }
})();
