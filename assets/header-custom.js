<script>
// Wrap in a DOMContentLoaded event in case script is in the <head>
document.addEventListener('DOMContentLoaded', function () {
  const cartIcon = document.querySelector('a#cart-icon');

  if (!cartIcon) return;

  const originalHref = cartIcon.getAttribute('href');

  // ✅ IMMEDIATELY disable the cart
  cartIcon.removeAttribute('href');
  // cartIcon.classList.add('cart-temp-disabled');
  cartIcon.style.pointerEvents = 'none';
  // cartIcon.style.opacity = '0.5';
  cartIcon.title = 'Cart loading...';

  // ✅ Re-enable after 2 seconds
  setTimeout(() => {
    cartIcon.setAttribute('href', originalHref);
    // cartIcon.classList.remove('cart-temp-disabled');
    cartIcon.style.pointerEvents = '';
    // cartIcon.style.opacity = '';
    cartIcon.removeAttribute('title');

    console.log('✅ Cart link re-enabled after delay');
  }, 2000);
});

</script>
<script>
 document.addEventListener("DOMContentLoaded", function () {
    const customCheckmarkSVG = `
        <svg width="9" height="8" viewBox="0 0 9 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.82415 6.15237L0.726419 4.05464L0.012085 4.76395L2.82415 7.57601L8.86078 1.53938L8.15147 0.830078L2.82415 6.15237Z" fill="currentColor"></path>
        </svg>
    `;

    function updateIcons() {
        document.querySelectorAll(".rebuy-cart__progress-step-icon").forEach(iconDiv => {
            iconDiv.innerHTML = customCheckmarkSVG; // Force the checkmark SVG every time
        });

        document.querySelectorAll(".rebuy-cart__progress-step").forEach(stepDiv => {
            stepDiv.style.opacity = stepDiv.classList.contains("complete") ? "1" : "0.5"; // Adjust opacity
        });
    }

    function observeStepChanges(stepDiv) {
        const stepObserver = new MutationObserver(() => {
            updateIcons(); // Ensure all icons reset every time "complete" is added or removed
        });

        // Observe only class changes on each progress step
        stepObserver.observe(stepDiv, { attributes: true, attributeFilter: ["class"] });
    }

    // Observer to detect when Rebuy's Smart Cart appears
    const rebuyObserver = new MutationObserver((mutations, observer) => {
        const progressSteps = document.querySelectorAll(".rebuy-cart__progress-step");

        if (progressSteps.length > 0) {
            updateIcons(); // Initial update to checkmarks
            observer.disconnect(); // Stop once Smart Cart is loaded

            // Observe each step for class changes
            progressSteps.forEach(observeStepChanges);
        }
    });

    // Start observing the document for when Rebuy's Smart Cart appears
    rebuyObserver.observe(document.body, { childList: true, subtree: true });
});
</script>

<script>
document.addEventListener("DOMContentLoaded", () => {
  const shopButton = document.querySelector("#header-shop-button");
  const megaMenuContainer = document.querySelector(".mega-menu-container");

  // Create dark overlay element
  const overlay = document.createElement("div");
  overlay.className = "dark-overlay";
  document.body.appendChild(overlay);

  // Function to show overlay and disable scroll
  function showOverlay() {
    overlay.classList.add("visible");
    document.body.style.overflow = "hidden"; // Disable scrolling
  }

  // Function to hide overlay and enable scroll
  function hideOverlay() {
    overlay.classList.remove("visible");
    document.body.style.overflow = ""; // Enable scrolling
    document.querySelector("#header-shop-button svg").style.transform = "unset";
  }

  // Add click event listener to shop button
  shopButton.addEventListener("click", () => {
    if (shopButton.classList.contains("dropdown-selected")) {
      // If dropdown is already selected, show overlay
      
      showOverlay();
    } else {
      // If dropdown is not selected, hide overlay
      hideOverlay();
    }
  });

  // Add click event listener to overlay to close mega menu
  overlay.addEventListener("click", () => {
    // Hide mega menu
    megaMenuContainer.style.visibility = "hidden";
    // Remove dropdown-selected class from shop button
    shopButton.classList.remove("dropdown-selected");
    // Hide overlay and enable scroll
    hideOverlay();
  });
});
</script>

<script>
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' && e.keyCode !== 27) return;

  // Find any visible/open dropdown menus
  const openMenus = Array.from(document.querySelectorAll('li.tree-menu.has-dropdown .toggle-menu'))
    .filter(menu => {
      const cs = getComputedStyle(menu);
      const isVisible = menu.offsetParent !== null && cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
      const isNotHiddenClass = !menu.classList.contains('toggle-menu-hidden');
      return isVisible && isNotHiddenClass;
    });

  if (!openMenus.length) return;

  e.preventDefault();

  // Close only the open ones
  openMenus.forEach(menu => {
    menu.classList.add('toggle-menu-hidden');

    const li = menu.closest('li.tree-menu.has-dropdown');
    if (!li) return;

    // Reset pill styling (match your existing click-away behavior)
    const relativeDiv = li.querySelector('div.relative');
    if (relativeDiv) {
      relativeDiv.style.background = '';
      relativeDiv.style.border = '2px solid transparent';
      relativeDiv.style.borderRadius = '';
    }

    // Unrotate caret + remove clicked class
    const trigger = li.querySelector('a.tree-menu-item');
    if (trigger) {
      trigger.classList.remove('clicked');
      const svg = trigger.querySelector('svg');
      if (svg) svg.classList.remove('rotated');
      trigger.focus();
    }
  });
}, true);
</script>
<script>
// Trap focus in mobile menu
(() => {
  const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function isActuallyVisible(el) {
    if (!el) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;

    const r = el.getBoundingClientRect();
    const hasSize = r.width > 0 && r.height > 0;
    const inViewportHoriz = r.right > 0 && r.left < window.innerWidth;

    return hasSize && inViewportHoriz;
  }

  function getDrawer() {
    return document.querySelector('div#mobile-navigation.menu-drawer');
  }

  function getTrigger() {
    // Your custom hamburger button in header.liquid
    return document.querySelector('button#mobile-navigation');
  }

  function getCloseButton(drawer) {
    return drawer ? drawer.querySelector('button') : null;
  }

  function getFocusable(drawer) {
    return Array.from(drawer.querySelectorAll(FOCUSABLE)).filter(el => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      if (el.closest('[hidden], [aria-hidden="true"]')) return false;
      return el.offsetParent !== null;
    });
  }

  function focusFirst(drawer) {
    if (!drawer) return;
    if (!drawer.hasAttribute('tabindex')) drawer.setAttribute('tabindex', '-1');

    const closeBtn = getCloseButton(drawer);
    if (closeBtn) {
      closeBtn.focus();
      return;
    }

    const els = getFocusable(drawer);
    (els[0] || drawer).focus();
  }

  function focusTriggerOrRestore(lastFocused) {
    const t = getTrigger();
    if (t && t.focus) {
      t.focus();
      return;
    }
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function closeDrawer(drawer, state) {
    if (!drawer) return;

    // Temporarily disable focus trap during closing animation
    state.isClosing = true;

    const closeBtn = getCloseButton(drawer);
    if (closeBtn) closeBtn.click();

    // Re-enable trap after animation and after we refocus the trigger
    // (tune these if your animation is longer)
    setTimeout(() => { state.isClosing = false; }, 450);
  }

  function installHandlers() {
    const drawer = getDrawer();
    const trigger = getTrigger();
    if (!drawer || !trigger) return false;

    if (drawer.__focusTrapInstalled) return true;
    drawer.__focusTrapInstalled = true;

    const state = {
      lastFocused: null,
      isClosing: false
    };

    // When trigger is clicked, stash focus and move focus into drawer once it becomes visible
    trigger.addEventListener('click', () => {
      state.lastFocused = document.activeElement;

      const start = Date.now();
      const timer = setInterval(() => {
        const d = getDrawer();
        if (d && isActuallyVisible(d)) {
          clearInterval(timer);
          focusFirst(d);
        } else if (Date.now() - start > 1000) {
          clearInterval(timer);
        }
      }, 30);
    });

    // If user clicks the drawer close button, refocus trigger after close
    const closeBtn = getCloseButton(drawer);
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        // mark closing so focusin trap doesn't pull focus back in
        state.isClosing = true;

        // After close starts, return focus to trigger
        setTimeout(() => {
          focusTriggerOrRestore(state.lastFocused);
        }, 0);

        // Re-enable trapping once the drawer should be fully closed
        setTimeout(() => { state.isClosing = false; }, 450);
      }, true);
    }

    // Key handling (capture so we win against other handlers)
    document.addEventListener('keydown', (e) => {
      const d = getDrawer();
      if (!d || !isActuallyVisible(d) || state.isClosing) return;

      // ESC closes drawer and returns focus to trigger
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();

        closeDrawer(d, state);

        // Refocus trigger immediately (trap is disabled while closing)
        setTimeout(() => {
          focusTriggerOrRestore(state.lastFocused);
        }, 0);

        return;
      }

      // Trap tab inside drawer
      if (e.key !== 'Tab') return;

      const els = getFocusable(d);
      if (!els.length) {
        e.preventDefault();
        d.focus();
        return;
      }

      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement;

      // If focus escaped, bring it back
      if (!d.contains(active)) {
        e.preventDefault();
        first.focus();
        return;
      }

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
        return;
      }

      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
        return;
      }
    }, true);

    // If focus is moved outside while open, pull it back in (unless closing)
    document.addEventListener('focusin', (e) => {
      const d = getDrawer();
      if (!d || !isActuallyVisible(d) || state.isClosing) return;
      if (d.contains(e.target)) return;

      const els = getFocusable(d);
      (els[0] || d).focus();
    });

    return true;
  }

  if (!installHandlers()) {
    const obs = new MutationObserver(() => {
      if (installHandlers()) obs.disconnect();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
</script>
<script>
// Only focus on expanded menu items in mobile menu
document.addEventListener("DOMContentLoaded", () => {
  const FOCUSABLE = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]"
  ].join(",");

  function getDrawer() {
    // You have TWO elements with id="mobile-navigation".
    // The drawer is the one with class "menu-drawer".
    return document.querySelector("#mobile-navigation.menu-drawer");
  }

  function setPanelFocusable(panel, enabled) {
    const nodes = panel.querySelectorAll(FOCUSABLE);

    nodes.forEach((el) => {
      // cache original tabindex once
      if (!el.hasAttribute("data-orig-tabindex")) {
        const orig = el.getAttribute("tabindex");
        el.setAttribute("data-orig-tabindex", orig === null ? "" : orig);
      }

      if (enabled) {
        const orig = el.getAttribute("data-orig-tabindex");
        if (orig === "") el.removeAttribute("tabindex");
        else el.setAttribute("tabindex", orig);
      } else {
        el.setAttribute("tabindex", "-1");
      }
    });
  }

  function syncAccordionItem(item) {
    const btn = item.querySelector(":scope > button[aria-expanded]");
    const panel = item.querySelector(":scope > .accordion-content");
    if (!btn || !panel) return;

    const expanded = btn.getAttribute("aria-expanded") === "true";
    setPanelFocusable(panel, expanded);
  }

  function syncAll() {
    const drawer = getDrawer();
    if (!drawer) return;

    drawer.querySelectorAll(".accordion-item").forEach(syncAccordionItem);
  }

  // 1) Sync immediately (in case drawer is already in DOM)
  syncAll();

  // 2) Sync whenever aria-expanded changes (covers click + keyboard)
  const attrObserver = new MutationObserver((mutations) => {
    let shouldSync = false;
    for (const m of mutations) {
      if (m.type === "attributes" && m.attributeName === "aria-expanded") {
        shouldSync = true;
        break;
      }
    }
    if (shouldSync) syncAll();
  });

  // 3) Sync whenever the drawer DOM changes (covers re-render/injection)
  const domObserver = new MutationObserver(() => syncAll());

  function attachObservers() {
    const drawer = getDrawer();
    if (!drawer) return false;

    // observe aria-expanded on current buttons
    drawer.querySelectorAll(".accordion-item > button[aria-expanded]").forEach((btn) => {
      attrObserver.observe(btn, { attributes: true });
    });

    // observe drawer subtree for injected/replaced content
    domObserver.observe(drawer, { childList: true, subtree: true });

    return true;
  }

  // attach now if possible
  if (!attachObservers()) {
    // drawer may be injected later; watch the document until it appears
    const docObserver = new MutationObserver(() => {
      if (attachObservers()) {
        syncAll();
        docObserver.disconnect();
      }
    });
    docObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  // 4) If your Alpine store toggles drawer open, resync right after open click
  // (This is defensive, in case open triggers DOM replacement)
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest('button[@click], button#mobile-navigation');
    if (!trigger) return;
    setTimeout(syncAll, 0);
  }, true);
});

</script>
<script>
// Rebuy Smart Cart Upsell Widget - Move focus to selector when button is clicked
(function () {
  const WIDGET_ID = "215185";

  function focusSelectFromButton(button) {
    const productBlock = button.closest(".rebuy-product-block");
    if (!productBlock) return;

    let tries = 0;
    (function attempt() {
      tries += 1;

      const select = productBlock.querySelector("select.rebuy-select");
      if (select && !select.disabled) {
        const style = window.getComputedStyle(select);
        const hidden = style.display === "none" || style.visibility === "hidden";
        if (!hidden) {
          select.focus();
          return;
        }
      }

      if (tries < 12) requestAnimationFrame(attempt);
    })();
  }

  // Capture phase so we beat other handlers where possible
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("button.rebuy-button");
    if (!btn) return;

    // Scope to your widget instance in Smart Cart
    const widgetRoot = btn.closest(`[data-rebuy-id="${WIDGET_ID}"]`);
    if (!widgetRoot) return;

    // Let Rebuy do its click work, then focus
    setTimeout(() => focusSelectFromButton(btn), 0);
  }, true);

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;

    const btn = e.target.closest("button.rebuy-button");
    if (!btn) return;

    const widgetRoot = btn.closest(`[data-rebuy-id="${WIDGET_ID}"]`);
    if (!widgetRoot) return;

    setTimeout(() => focusSelectFromButton(btn), 0);
  }, true);
})();
</script>
<script>
// Rebuy Smart Cart upsell widget - normalize focus + prevent widget from being skipped
(function () {
  const WIDGET_ID = "215185";

  // ---------- Helpers ----------
  function getWidgetRoot() {
    return document.querySelector(`[data-rebuy-id="${WIDGET_ID}"]`);
  }

  // Update if your cart root selector differs (first match wins)
  const CART_ROOT_SELECTORS = [
    ".rebuy-smartcart",
    ".rebuy-cart",
    "[data-rebuy-smartcart]",
    "#rebuy-smartcart"
  ];

  function getCartRoot() {
    for (const sel of CART_ROOT_SELECTORS) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function isVisible(el) {
    if (!el) return false;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") return false;
    if (el.hasAttribute("hidden")) return false;

    // fixed overlays sometimes have no offsetParent
    return el.offsetParent !== null || cs.position === "fixed";
  }

  function setTabbable(el, tabbable) {
    if (!el) return;
    if (tabbable) {
      // If Rebuy set tabindex="-1", undo it
      if (el.getAttribute("tabindex") === "-1") el.removeAttribute("tabindex");
      // If it had tabindex="0" injected, let native focusability rule
      // (removing tabindex is fine; anchors/buttons/selects remain focusable)
      if (el.hasAttribute("tabindex")) el.removeAttribute("tabindex");
    } else {
      el.setAttribute("tabindex", "-1");
    }
  }

  // ---------- 1) Normalization (your script) ----------
  function normalize(root) {
    if (!root) return;

    // A) Remove tabindex from price span
    root.querySelectorAll(".rebuy-money span[tabindex]").forEach((el) => {
      el.removeAttribute("tabindex");
    });

    // B) Normalize focusability by slide visibility
    const slides = root.querySelectorAll(".splide__slide");
    slides.forEach((slide) => {
      const isHidden =
        slide.getAttribute("aria-hidden") === "true" ||
        slide.classList.contains("splide__slide--clone") ||
        slide.classList.contains("is-hidden");

      const focusables = slide.querySelectorAll(
        "a[href], button, select, input, textarea, [role='button'], [role='link'], [role='combobox']"
      );

      focusables.forEach((el) => setTabbable(el, !isHidden));
    });

    // C) Remove tabindex=0 from non-interactive junk
    root.querySelectorAll('[tabindex="0"]').forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const isNative =
        tag === "button" ||
        (tag === "a" && el.hasAttribute("href")) ||
        tag === "select" ||
        tag === "input" ||
        tag === "textarea";

      const role = el.getAttribute("role");
      const isRoleInteractive = role === "button" || role === "link" || role === "combobox";

      if (!isNative && !isRoleInteractive) {
        el.removeAttribute("tabindex");
      }
    });
  }

  // ---------- 2) “Nudge on open” so widget is not skipped ----------
  function getFirstFocusableInWidget(widgetRoot) {
    if (!widgetRoot) return null;

    // Prefer a real control in your widget
    const preferred =
      widgetRoot.querySelector("button.rebuy-button") ||
      widgetRoot.querySelector("select.rebuy-select");

    if (preferred) return preferred;

    return widgetRoot.querySelector(
      'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]):not([type="hidden"]), [tabindex]:not([tabindex="-1"])'
    );
  }

  function shouldNudgeFocus(cartRoot, widgetRoot) {
    const active = document.activeElement;

    if (!cartRoot || !widgetRoot) return false;

    // If focus is already inside widget, do nothing
    if (active && widgetRoot.contains(active)) return false;

    // If focus is outside cart (or body), cart focus mgmt failed
    if (!active || active === document.body || !cartRoot.contains(active)) return true;

    // If focus is inside cart but on a non-interactive container, nudge
    const tag = active.tagName ? active.tagName.toLowerCase() : "";
    return tag === "div" || tag === "section" || tag === "main";
  }

  function nudgeFocusIntoWidgetOncePerOpen() {
    const cartRoot = getCartRoot();
    const widgetRoot = getWidgetRoot();

    if (!isVisible(cartRoot)) {
      // cart closed: reset marker
      if (cartRoot) cartRoot.removeAttribute("data-widget-focus-nudged");
      return;
    }

    // only run once per open
    if (cartRoot.getAttribute("data-widget-focus-nudged") === "true") return;

    // The widget may mount after the cart becomes visible; retry briefly
    let tries = 0;
    const attempt = () => {
      tries++;

      const c = getCartRoot();
      const w = getWidgetRoot();

      if (!isVisible(c) || !w || !isVisible(w)) {
        if (tries < 20) return setTimeout(attempt, 50);
        return;
      }

      // normalize right before nudging to avoid focusing something that becomes untabbable
      normalize(w);

      if (shouldNudgeFocus(c, w)) {
        const first = getFirstFocusableInWidget(w);
        if (first) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              try { first.focus(); } catch (e) {}
            });
          });
        }
      }

      c.setAttribute("data-widget-focus-nudged", "true");
    };

    attempt();
  }

  // ---------- Boot / Observers ----------
  function boot() {
    const root = getWidgetRoot();
    if (!root) return false;

    normalize(root);
    nudgeFocusIntoWidgetOncePerOpen();
    return true;
  }

  // Single global observer to handle:
  // - widget injection/re-render
  // - cart open/close
  if (!window.__rebuyFocusStabilizerAndNudge215185) {
    const obs = new MutationObserver(() => {
      const root = getWidgetRoot();
      if (root) normalize(root);
      nudgeFocusIntoWidgetOncePerOpen();
    });

    obs.observe(document.documentElement, { subtree: true, childList: true, attributes: true });
    window.__rebuyFocusStabilizerAndNudge215185 = obs;

    // Also try after any click that might open cart
    document.addEventListener(
      "click",
      () => setTimeout(() => nudgeFocusIntoWidgetOncePerOpen(), 0),
      true
    );
  }

  // Retry on load (Smart Cart mounts late)
  let tries = 0;
  (function retry() {
    tries++;
    if (boot()) return;
    if (tries < 40) setTimeout(retry, 250);
  })();
})();
</script>