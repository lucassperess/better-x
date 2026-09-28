(() => {
  "use strict";

  const DEFAULTS = {
    navFollow: true,
    navChat: true,
    navGrok: true,
    navHistory: false,
    navCreatorStudio: true,
    navPremium: true,
    premiumCard: true,
    todaysNews: true,
    whatsHappening: true,
    relevantPeople: true,
    youMightLike: true,
    legalFooter: true,
    wideLayout: true,
    sideDivider: true,
    verifiedBanner: true,
    floatingGrok: true,
    floatingChat: true
  };

  const NAV_RULES = {
    navFollow: {
      hrefs: ["/i/connect_people", "/i/people"],
      labels: ["follow", "seguir"]
    },
    navChat: {
      hrefs: ["/i/chat"],
      labels: ["chat"]
    },
    navGrok: {
      hrefs: ["/i/grok"],
      labels: ["grok"]
    },
    navHistory: {
      hrefs: ["/i/history"],
      labels: ["history", "histórico"]
    },
    navCreatorStudio: {
      hrefs: ["/i/creator-studio", "/i/creator_studio"],
      labels: ["creator studio", "estúdio de criação"]
    },
    navPremium: {
      hrefs: ["/i/premium_sign_up", "/i/premium"],
      labels: ["premium"]
    }
  };

  const CARD_RULES = {
    premiumCard: ["subscribe to premium", "assine o premium", "assinar o premium"],
    todaysNews: ["today’s news", "today's news", "notícias de hoje"],
    whatsHappening: ["what’s happening", "what's happening", "o que está acontecendo"],
    relevantPeople: ["relevant people", "pessoas relevantes"],
    youMightLike: ["you might like", "who to follow", "talvez você curta", "quem seguir"]
  };

  let settings = { ...DEFAULTS };
  let scheduled = false;
  const timelineScrollers = new WeakSet();

  const normalize = (value) =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const hide = (element) => {
    if (element instanceof HTMLElement) {
      element.dataset.betterXHidden = "true";
    }
  };

  const clearPreviousPass = () => {
    document.querySelectorAll('[data-better-x-hidden="true"]').forEach((element) => {
      delete element.dataset.betterXHidden;
    });
    document.querySelectorAll('[data-better-x-no-divider="true"]').forEach((element) => {
      delete element.dataset.betterXNoDivider;
    });
  };

  const primaryNav = () =>
    document.querySelector('nav[aria-label="Primary"], nav[aria-label="Primário"], header nav');

  const hideNavItem = (rule) => {
    const nav = primaryNav();
    if (!nav) return;

    const links = [...nav.querySelectorAll("a[href]")];
    const byHref = links.find((link) => {
      const href = link.getAttribute("href") || "";
      return rule.hrefs.some((part) => href === part || href.startsWith(`${part}/`));
    });

    const byLabel = links.find((link) => {
      const text = normalize(link.getAttribute("aria-label") || link.textContent);
      return rule.labels.some((label) => text === normalize(label));
    });

    hide(byHref || byLabel);
  };

  const sidebar = () =>
    document.querySelector('[data-testid="sidebarColumn"]') || document.querySelector("aside");

  const textMatches = (element, labels) => {
    const text = normalize(element.textContent);
    return labels.some((label) => text === normalize(label));
  };

  const findCardContainer = (heading, scope) => {
    let node = heading;
    let best = null;
    for (let depth = 0; depth < 12 && node?.parentElement && node.parentElement !== scope; depth += 1) {
      node = node.parentElement;
      const style = getComputedStyle(node);
      const radius = Number.parseFloat(style.borderTopLeftRadius) || 0;
      const hasBorder = [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth]
        .some((width) => Number.parseFloat(width) > 0);
      const rect = node.getBoundingClientRect();
      if ((hasBorder || radius >= 12) && rect.width > 240 && rect.height > 55) {
        best = node;
      }
    }

    if (best) return best;

    const semantic = heading.closest('section, [role="region"]');
    return semantic && semantic !== scope && scope.contains(semantic) ? semantic : null;
  };

  const hideSidebarCard = (labels) => {
    const scope = sidebar();
    if (!scope) return;

    const candidates = scope.querySelectorAll('h1, h2, h3, [role="heading"], [dir="auto"], span');
    for (const heading of candidates) {
      if (textMatches(heading, labels)) {
        hide(findCardContainer(heading, scope));
      }
    }
  };

  const hideLegalFooter = () => {
    const scope = sidebar();
    if (!scope) return;

    const semantic = scope.querySelector('nav[aria-label="Footer"], nav[aria-label="Rodapé"], [role="contentinfo"]');
    if (semantic) {
      hide(semantic);
      return;
    }

    const legalLink = [...scope.querySelectorAll("a[href]")].find((link) => {
      const text = normalize(link.textContent);
      const href = normalize(link.getAttribute("href"));
      return ["terms", "privacy", "cookies", "termos", "privacidade"].includes(text) ||
        href.includes("/tos") || href.includes("/privacy");
    });
    if (!legalLink) return;

    let node = legalLink;
    for (let depth = 0; depth < 7 && node?.parentElement && node.parentElement !== scope; depth += 1) {
      node = node.parentElement;
      const rect = node.getBoundingClientRect();
      const linkCount = node.querySelectorAll("a[href]").length;
      if (linkCount >= 3 && rect.height < 180) {
        hide(node);
        return;
      }
    }
  };

  const removeSideDivider = () => {
    const primary = document.querySelector('[data-testid="primaryColumn"]');
    if (primary) primary.dataset.betterXNoDivider = "true";

    const nav = primaryNav();
    let node = nav;
    for (let depth = 0; depth < 6 && node?.parentElement; depth += 1) {
      node = node.parentElement;
      const style = getComputedStyle(node);
      if (Number.parseFloat(style.borderRightWidth) > 0) {
        node.dataset.betterXNoDivider = "true";
      }
    }
  };

  const alignSearchWithTimeline = () => {
    const primary = document.querySelector('[data-testid="primaryColumn"]');
    if (!primary) return;
    const rightGap = Math.max(16, Math.round(window.innerWidth - primary.getBoundingClientRect().right));
    document.documentElement.style.setProperty("--better-x-search-right", `${rightGap}px`);
  };

  const visibleTimelineTabs = () => {
    // X also uses tablists for photo carousels inside posts.
    const candidates = [...document.querySelectorAll('[data-testid="primaryColumn"] [role="tablist"]')]
      .filter((element) => !element.closest('article, [data-testid="tweet"], [role="dialog"]') &&
        !element.querySelector('[data-testid="tweetPhoto"], video'));
    const selected = candidates.find((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 100 && rect.height > 20;
    }) || candidates[0] || null;
    document.querySelectorAll('[data-better-x-timeline-tabs="true"]').forEach((element) => {
      if (element !== selected) delete element.dataset.betterXTimelineTabs;
    });
    if (selected) selected.dataset.betterXTimelineTabs = "true";
    return selected;
  };

  const enableTimelineWheel = () => {
    const tabs = visibleTimelineTabs();
    if (!tabs || timelineScrollers.has(tabs)) return;

    const updateControls = () => {
      const controls = document.querySelector("#better-x-timeline-controls");
      if (!controls) return;
      const maxScroll = Math.max(0, tabs.scrollWidth - tabs.clientWidth);
      const left = controls.querySelector('[data-direction="left"]');
      const right = controls.querySelector('[data-direction="right"]');
      if (left) left.disabled = tabs.scrollLeft <= 1;
      if (right) right.disabled = tabs.scrollLeft >= maxScroll - 1;
    };

    tabs.addEventListener("wheel", (event) => {
      if (!settings.wideLayout || tabs.dataset.betterXTimelineTabs !== "true") return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      const maxScroll = tabs.scrollWidth - tabs.clientWidth;
      const movingRight = event.deltaY > 0;
      const canMove = movingRight ? tabs.scrollLeft < maxScroll - 1 : tabs.scrollLeft > 1;
      if (!canMove) return;

      event.preventDefault();
      tabs.scrollLeft += event.deltaY;
      window.requestAnimationFrame(updateControls);
    }, { passive: false });

    tabs.addEventListener("scroll", updateControls, { passive: true });

    timelineScrollers.add(tabs);
    window.requestAnimationFrame(updateControls);
  };

  const ensureTimelineControls = () => {
    let controls = document.querySelector("#better-x-timeline-controls");
    if (!visibleTimelineTabs()) {
      controls?.remove();
      return;
    }
    if (!controls) {
      controls = document.createElement("div");
      controls.id = "better-x-timeline-controls";
      controls.innerHTML = '<button type="button" data-direction="right" aria-label="Próximas timelines"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.225 4.811 13.64 3.397 22.242 12l-8.603 8.603-1.414-1.414L18.414 13H2v-2h16.414z"></path></svg></button>';
      controls.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-direction]");
        if (!button) return;
        const tabs = visibleTimelineTabs();
        if (!tabs) return;
        const direction = button.dataset.direction === "right" ? 1 : -1;
        tabs.scrollBy({ left: direction * Math.max(240, tabs.clientWidth * 0.7), behavior: "smooth" });
      });
      document.body.appendChild(controls);
    }
  };

  const findTextElement = (phrases) => {
    const candidates = document.querySelectorAll('main span, main div[dir="auto"], main [role="heading"]');
    return [...candidates].find((element) => {
      const text = normalize(element.textContent);
      return text.length < 220 && phrases.some((phrase) => text.includes(normalize(phrase)));
    });
  };

  const hideVerifiedBanner = () => {
    const match = findTextElement([
      "you aren’t verified yet",
      "you aren't verified yet",
      "get verified",
      "voce ainda nao e verificado",
      "obtenha a verificacao"
    ]);
    if (!match) return;

    let node = match;
    for (let depth = 0; depth < 7 && node?.parentElement; depth += 1) {
      node = node.parentElement;
      const text = normalize(node.textContent);
      const style = getComputedStyle(node);
      const hasDistinctBackground = style.backgroundColor !== "rgba(0, 0, 0, 0)" &&
        style.backgroundColor !== "transparent";
      if (hasDistinctBackground && text.length < 500) {
        hide(node);
        return;
      }
    }
  };

  const accessibleName = (element) => normalize([
    element.getAttribute("aria-label"),
    element.getAttribute("title"),
    element.textContent
  ].filter(Boolean).join(" "));

  const fixedContainer = (element) => {
    let node = element;
    for (let depth = 0; depth < 5 && node instanceof HTMLElement; depth += 1) {
      if (getComputedStyle(node).position === "fixed") return node;
      node = node.parentElement;
    }
    return null;
  };

  const findFloatingControls = () => {
    const controls = [...document.querySelectorAll('button, a[href], [role="button"], [data-testid]')];
    const candidates = controls.filter((control) => {
      const fixed = fixedContainer(control);
      if (!fixed) return false;
      const rect = control.getBoundingClientRect();
      return rect.width >= 42 && rect.width <= 90 && rect.height >= 42 && rect.height <= 90 &&
        rect.left > window.innerWidth * 0.72 && rect.top > window.innerHeight * 0.55 &&
        window.innerWidth - rect.right < 90 && window.innerHeight - rect.bottom < 210;
    });

    const unique = [];
    for (const candidate of candidates.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)) {
      const rect = candidate.getBoundingClientRect();
      const duplicate = unique.some((other) => {
        const otherRect = other.getBoundingClientRect();
        return Math.abs(rect.left - otherRect.left) < 4 && Math.abs(rect.top - otherRect.top) < 4;
      });
      if (!duplicate) unique.push(candidate);
    }

    return unique.slice(-2);
  };

  const applySettings = () => {
    scheduled = false;
    clearPreviousPass();

    for (const [key, rule] of Object.entries(NAV_RULES)) {
      if (settings[key]) hideNavItem(rule);
    }

    for (const [key, labels] of Object.entries(CARD_RULES)) {
      if (settings[key]) hideSidebarCard(labels);
    }

    if (settings.legalFooter) hideLegalFooter();
    document.documentElement.dataset.betterXWideLayout = String(Boolean(settings.wideLayout));
    if (settings.wideLayout) {
      alignSearchWithTimeline();
      ensureTimelineControls();
      enableTimelineWheel();
    } else {
      document.documentElement.style.removeProperty("--better-x-search-right");
      document.querySelector("#better-x-timeline-controls")?.remove();
    }
    if (settings.sideDivider) removeSideDivider();
    if (settings.verifiedBanner) hideVerifiedBanner();

    const floating = settings.floatingGrok || settings.floatingChat ? findFloatingControls() : [];
    const namedGrok = floating.find((control) => accessibleName(control).includes("grok"));
    const namedChat = floating.find((control) => accessibleName(control).includes("chat") || accessibleName(control).includes("message"));
    const grokControl = namedGrok || floating[0];
    const chatControl = namedChat || floating[1] || (floating.length === 1 ? floating[0] : null);
    if (settings.floatingGrok) hide(grokControl);
    if (settings.floatingChat) hide(chatControl);
  };

  const scheduleApply = () => {
    if (scheduled) return;
    scheduled = true;
    window.setTimeout(applySettings, 120);
  };

  chrome.storage.sync.get(DEFAULTS, (stored) => {
    settings = { ...DEFAULTS, ...stored };
    scheduleApply();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    for (const [key, change] of Object.entries(changes)) {
      if (key in DEFAULTS) settings[key] = change.newValue;
    }
    scheduleApply();
  });

  const observer = new MutationObserver(scheduleApply);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("popstate", scheduleApply);
  window.addEventListener("resize", scheduleApply);

})();
