// Preencha com seus dados reais. Deixe vazio o que ainda não tiver.
const site = {
  email: "",
  whatsapp: "5519989599014",
  instagram: "",
  linkedin: "",
};

const header = document.querySelector(".header");
const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#menu");
const menuLabel = toggle.querySelector(".sr-only");
const directList = document.querySelector("#direct-list");

function setMenu(open) {
  document.body.classList.toggle("nav-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  menuLabel.textContent = open ? "Fechar menu" : "Abrir menu";
}

toggle.addEventListener("click", () => {
  setMenu(!document.body.classList.contains("nav-open"));
});

menu.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 820) setMenu(false);
});

const progress = document.querySelector(".scroll-progress");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function onScroll() {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.setProperty("--progress", max > 0 ? String(window.scrollY / max) : "0");
}

function splitWords(element) {
  let index = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = child.textContent.split(/( +)/);
        const fragment = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^ +$/.test(part)) {
            fragment.append(part);
            return;
          }
          const word = document.createElement("span");
          word.className = "word";
          word.style.setProperty("--i", String(index++));
          word.textContent = part;
          fragment.append(word);
        });
        child.replaceWith(fragment);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") {
        walk(child);
      }
    });
  };
  walk(element);
}

if (!reduceMotion) {
  document.querySelectorAll("[data-words]").forEach(splitWords);
}

document.querySelectorAll(".stagger").forEach((list) => {
  [...list.children].forEach((child, i) => child.style.setProperty("--i", String(i)));
});

const scrollLists = [...document.querySelectorAll("[data-scroll-in]")];

function updateScrollIn() {
  const vh = window.innerHeight;
  scrollLists.forEach((list) => {
    const columns = getComputedStyle(list).gridTemplateColumns.split(" ").length;
    const listTop = list.getBoundingClientRect().top;
    [...list.children].forEach((item, i) => {
      const last = item.classList.contains("project-last");
      const delay = last ? 0 : (i % columns) * 0.06 * vh;
      const span = vh * (last ? 0.55 : 0.32);
      const top = listTop + item.offsetTop - list.offsetTop;
      const raw = (vh - top - delay) / span;
      const p = Math.min(1, Math.max(0, raw));
      item.style.setProperty("--p", (1 - (1 - p) ** 3).toFixed(3));
    });
  });
}

if (!reduceMotion && scrollLists.length) {
  let scrollInFrame = 0;
  const queueScrollIn = () => {
    if (scrollInFrame) return;
    scrollInFrame = requestAnimationFrame(() => {
      scrollInFrame = 0;
      updateScrollIn();
    });
  };
  updateScrollIn();
  window.addEventListener("scroll", queueScrollIn, { passive: true });
  window.addEventListener("resize", queueScrollIn);
}

if (finePointer) {
  document.querySelectorAll("[data-spotlight]").forEach((group) => {
    const cards = [...group.querySelectorAll(".glow")];
    group.addEventListener("pointermove", (event) => {
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--x", `${event.clientX - rect.left}px`);
        card.style.setProperty("--y", `${event.clientY - rect.top}px`);
      });
    });
  });
}

if (finePointer && !reduceMotion) {
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

const telas = document.querySelector(".telas");
const deviceTabs = document.querySelector(".device-tabs");
const device = document.querySelector("#device");

if (telas && deviceTabs && device) {
  const pin = telas.querySelector(".telas-pin");
  const stage = device.parentElement;
  const screen = device.querySelector(".device-screen");
  const tabs = [...deviceTabs.querySelectorAll("[data-device]")];
  const frames = tabs.map((tab) => device.querySelector(`[data-screen="${tab.dataset.device}"]`));

  const sizes = {};

  const fitFrame = (frame) => {
    const { width, height } = sizes[frame.dataset.screen];
    const realWidth = Number(frame.dataset.width);
    const scale = width / realWidth;
    frame.style.width = `${realWidth}px`;
    frame.style.height = `${(height - frame.offsetTop) / scale}px`;
    frame.style.transform = `scale(${scale})`;
  };

  const fitFrames = () => {
    const current = device.dataset.device;
    device.style.transition = "none";
    tabs.forEach((tab) => {
      device.dataset.device = tab.dataset.device;
      sizes[tab.dataset.device] = { width: screen.clientWidth, height: screen.clientHeight };
    });
    device.dataset.device = current;
    void device.offsetWidth;
    device.style.transition = "";
    frames.forEach(fitFrame);
  };

  const fitDevice = () => {
    const base = parseFloat(getComputedStyle(stage).getPropertyValue("--base"));
    const stageH = stage.clientHeight;
    const pcW = Math.min(1000, stage.clientWidth / 1.18, (stageH - 24) * 1.6);
    const pcH = pcW * 0.625 + 16;
    const below = pin.getBoundingClientRect().bottom - stage.getBoundingClientRect().top - pcH;
    stage.style.setProperty("--pc-w", `${pcW}px`);
    device.style.setProperty("--fit", String(Math.min(1, stageH / base)));
    telas.style.marginBottom = `${-Math.max(0, below - 40)}px`;
    fitFrames();
  };

  new ResizeObserver(fitDevice).observe(stage);

  const showDevice = (name) => {
    if (device.dataset.device === name) return;
    device.dataset.device = name;
    tabs.forEach((tab) => tab.setAttribute("aria-selected", String(tab.dataset.device === name)));
    frames.forEach((frame) => {
      const active = frame.dataset.screen === name;
      frame.classList.toggle("is-active", active);
      frame.toggleAttribute("inert", !active);
    });
  };

  const pinDistance = () => telas.offsetHeight - pin.offsetHeight;

  const frameReady = (frame) => {
    const doc = frame.contentDocument;
    return Boolean(doc && doc.readyState === "complete" && frame.contentWindow.exemplo);
  };

  const loadNext = (index) => {
    const next = frames[index + 1];
    if (next && !next.src) next.src = next.dataset.src;
  };

  const startFrames = () => loadNext(-1);

  let tourProgress = 0;
  let inView = false;

  let warmIndex = -1;

  const playFrame = (frame, index) => {
    if (!frameReady(frame)) return;
    const live = inView && frame.classList.contains("is-active");
    frame.contentWindow.exemplo.idle(!live);
    if (live || (inView && index === warmIndex)) frame.contentWindow.exemplo.tour(tourProgress);
  };

  const updateTelas = () => {
    if (window.scrollY > 0) startFrames();
    const rect = telas.getBoundingClientRect();
    inView = rect.bottom > 0 && rect.top < window.innerHeight;
    if (!inView) {
      frames.forEach(playFrame);
      return;
    }
    tourProgress = Math.min(1, Math.max(0, (header.offsetHeight - rect.top) / pinDistance()));
    const progress = tourProgress * tabs.length;
    const index = Math.min(tabs.length - 1, Math.floor(progress));
    const seg = Math.min(1, progress - index);
    warmIndex = seg > 0.8 ? index + 1 : seg < 0.2 ? index - 1 : -1;
    showDevice(tabs[index].dataset.device);
    deviceTabs.style.setProperty("--seg", seg.toFixed(3));
    frames.forEach(playFrame);
  };

  let ticking = false;
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      updateTelas();
    });
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      const start = telas.getBoundingClientRect().top + window.scrollY - header.offsetHeight;
      const top = start + pinDistance() * ((index + 0.02) / tabs.length);
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  frames.forEach((frame, index) => {
    frame.addEventListener("load", () => {
      if (!frame.src) return;
      playFrame(frame);
      loadNext(index);
    });
  });

  const startLater = () => setTimeout(startFrames, 1500);
  if (document.readyState === "complete") startLater();
  else window.addEventListener("load", startLater, { once: true });

  updateTelas();
}

const flow = document.querySelector(".flow");

if (flow) {
  const steps = [...flow.querySelectorAll(".flow-step")];
  const items = [...flow.querySelectorAll(".fw-list [data-at]")];
  const loaders = [...flow.querySelectorAll("[data-load]")];
  const typingBubble = flow.querySelector(".fw-typing");
  const status = flow.querySelector("[data-flow-status]");
  const input = flow.querySelector("[data-flow-input]");
  const compose = flow.querySelector(".fw-compose");
  const clamp = (value) => Math.min(1, Math.max(0, value));
  const at = (element) => Number(element.dataset.at);
  const isOut = (element) => element.classList.contains("fw-out");
  items.forEach((element) => {
    if (element.tagName === "P" && isOut(element)) element.dataset.text = element.firstChild.textContent.trim();
  });
  let lastKey = "";

  const copy = steps[0].querySelector(".flow-copy");

  const updateFlow = () => {
    const stickyTop = parseFloat(getComputedStyle(copy).top);
    const line = Number.isNaN(stickyTop) ? window.innerHeight * 0.6 : stickyTop + 1;
    let scene = 0;
    let local = 0;
    steps.forEach((step, index) => {
      const rect = step.getBoundingClientRect();
      if (rect.top > line) return;
      scene = index;
      local = clamp((line - rect.top) / rect.height);
    });

    const progress = scene + local;
    const key = progress.toFixed(3);
    if (key === lastKey) return;
    lastKey = key;

    steps.forEach((step, index) => step.classList.toggle("is-active", index === scene));
    items.forEach((element) => {
      element.classList.toggle("on", progress >= at(element));
      if (isOut(element)) element.classList.toggle("read", progress >= at(element) + 0.1);
    });
    loaders.forEach((element) => element.classList.toggle("done", progress >= Number(element.dataset.load)));

    const next = items.find((element) => progress < at(element));
    const typing = Boolean(next && !isOut(next) && progress >= at(next) - 0.12);
    typingBubble.classList.toggle("on", typing);
    const statusText = typing ? "digitando…" : "online";
    if (status.textContent !== statusText) status.textContent = statusText;
    status.classList.toggle("is-typing", typing);

    let draft = "";
    if (next && next.dataset.text) {
      const typed = clamp((progress - at(next) + 0.16) / 0.12);
      draft = next.dataset.text.slice(0, Math.round(next.dataset.text.length * typed));
    }
    if (input.textContent !== draft) input.textContent = draft;
    compose.classList.toggle("has-text", draft.length > 0);
  };

  let flowTicking = false;
  const requestFlow = () => {
    if (flowTicking) return;
    flowTicking = true;
    requestAnimationFrame(() => {
      flowTicking = false;
      updateFlow();
    });
  };

  window.addEventListener("scroll", requestFlow, { passive: true });
  window.addEventListener("resize", requestFlow);
  updateFlow();
}

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const navLinks = [...document.querySelectorAll(".nav-links a[href^='#']:not(.btn)")];
const sections = [...document.querySelectorAll("main section[id]")];

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = `#${entry.target.id}`;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === id);
      });
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);

sections.forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.05 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

function addChannel(list, href, label, value, blank) {
  const item = document.createElement("li");
  const link = document.createElement("a");
  link.href = href;
  if (blank) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  const name = document.createElement("strong");
  name.textContent = label;
  const detail = document.createElement("span");
  detail.textContent = value;
  link.append(name, detail);
  item.append(link);
  list.append(item);
}

const channels = [];

if (site.email) {
  channels.push({
    href: `mailto:${site.email}`,
    label: "E-mail",
    value: site.email,
    blank: false,
  });
}

if (site.whatsapp) {
  const digits = site.whatsapp.replace(/\D/g, "");
  const texto = "Oi! Quero fazer um orçamento de site.";
  channels.push({
    href: `https://wa.me/${digits}?text=${encodeURIComponent(texto)}`,
    label: "Faça seu orçamento",
    value: "",
    blank: true,
  });
}

if (site.instagram) {
  const user = site.instagram.replace(/^@/, "").trim();
  channels.push({
    href: `https://instagram.com/${user}`,
    label: "Instagram",
    value: `@${user}`,
    blank: true,
  });
}

if (site.linkedin) {
  const url = site.linkedin.startsWith("http")
    ? site.linkedin
    : `https://www.linkedin.com/in/${site.linkedin.replace(/^@/, "").trim()}`;
  channels.push({
    href: url,
    label: "LinkedIn",
    value: "Ver perfil",
    blank: true,
  });
}

if (channels.length && directList) {
  directList.hidden = false;
  channels.forEach((channel) => {
    addChannel(directList, channel.href, channel.label, channel.value, channel.blank);
  });
}
