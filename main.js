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
const form = document.querySelector("#contact-form");
const success = document.querySelector("#form-success");
const directList = document.querySelector("#direct-list");
const footerSocial = document.querySelector("#footer-social");

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

document.querySelectorAll(".marquee").forEach((marquee) => {
  const track = marquee.querySelector(".marquee-track");
  const copy = track.cloneNode(true);
  copy.setAttribute("aria-hidden", "true");
  marquee.append(copy);
});

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

  const activeFrame = () => frames.find((frame) => frame.classList.contains("is-active"));

  const fitFrame = (frame) => {
    const realWidth = Number(frame.dataset.width);
    const scale = screen.clientWidth / realWidth;
    frame.style.width = `${realWidth}px`;
    frame.style.height = `${(screen.clientHeight - frame.offsetTop) / scale}px`;
    frame.style.transform = `scale(${scale})`;
  };

  const fitFrames = () => fitFrame(activeFrame());

  const fitDevice = () => {
    const base = parseFloat(getComputedStyle(stage).getPropertyValue("--base"));
    const stageH = stage.clientHeight;
    const pcW = Math.min(1000, stage.clientWidth / 1.18, (stageH - 24) * 1.6);
    const pcH = pcW * 0.625 + 16;
    const below = pin.getBoundingClientRect().bottom - stage.getBoundingClientRect().top - pcH;
    stage.style.setProperty("--pc-w", `${pcW}px`);
    device.style.setProperty("--fit", String(Math.min(1, stageH / base)));
    telas.style.marginBottom = `${-Math.max(0, below - 40)}px`;
  };

  new ResizeObserver(fitFrames).observe(screen);
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
    fitFrame(activeFrame());
  };

  const pinDistance = () => telas.offsetHeight - pin.offsetHeight;

  const frameReady = (frame) => {
    const doc = frame.contentDocument;
    return Boolean(doc && doc.readyState === "complete" && frame.contentWindow.sola);
  };

  let tourProgress = 0;
  let inView = false;

  const playFrame = (frame) => {
    if (!frameReady(frame)) return;
    const live = inView && frame.classList.contains("is-active");
    frame.contentWindow.sola.idle(!live);
    if (live) frame.contentWindow.sola.tour(tourProgress);
  };

  const updateTelas = () => {
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

  const loadNext = (index) => {
    const next = frames[index + 1];
    if (next && !next.src) next.src = next.dataset.src;
  };

  frames.forEach((frame, index) => {
    frame.addEventListener("load", () => {
      if (!frame.src) return;
      playFrame(frame);
      loadNext(index);
    });
    if (frameReady(frame)) loadNext(index);
  });

  updateTelas();
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

function formatPhone(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("55")) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 12 && digits.startsWith("55")) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
  }
  return value.trim();
}

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
  const texto = "Oi! Quero um site.";
  channels.push({
    href: `https://wa.me/${digits}?text=${encodeURIComponent(texto)}`,
    label: "Mandar no WhatsApp",
    value: "",
    blank: true,
    footer: false,
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
    if (channel.footer === false || channel.label === "WhatsApp") return;
    footerSocial.hidden = false;
    const link = document.createElement("a");
    link.href = channel.href;
    link.textContent = channel.label;
    if (channel.blank) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    footerSocial.append(link);
  });
}

const copyButton = success.querySelector("[data-copy]");
const anotherButton = success.querySelector("[data-reset]");
const mailLink = success.querySelector("[data-mail]");
const whatsLink = success.querySelector("[data-whatsapp]");
const messageBox = success.querySelector("textarea");
const successName = success.querySelector("[data-name]");

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(messageBox.value);
    copyButton.textContent = "Copiado!";
  } catch {
    messageBox.focus();
    messageBox.select();
    copyButton.textContent = "Seleciona e copia";
  }
});

anotherButton.addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  success.hidden = true;
  copyButton.textContent = "Copiar";
  form.querySelector("[name='nome']").focus();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  if (String(data.get("empresa") || "").trim()) return;

  const nome = String(data.get("nome") || "").trim();
  const email = String(data.get("email") || "").trim();
  const tipo = String(data.get("tipo") || "").trim();
  const mensagem = String(data.get("mensagem") || "").trim();
  const body = [
    `Oi, North Company! Meu nome é ${nome}.`,
    `E-mail: ${email}`,
    `Tipo de site: ${tipo}`,
    "",
    mensagem,
  ].join("\n");
  const subject = "Quero um site";

  successName.textContent = nome.split(/\s+/)[0];
  messageBox.value = body;

  if (site.email) {
    const href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    mailLink.hidden = false;
    mailLink.href = href;
    window.location.href = href;
  } else {
    mailLink.hidden = true;
  }

  if (site.whatsapp) {
    const digits = site.whatsapp.replace(/\D/g, "");
    whatsLink.hidden = false;
    whatsLink.href = `https://wa.me/${digits}?text=${encodeURIComponent(body)}`;
  } else {
    whatsLink.hidden = true;
  }

  form.hidden = true;
  success.hidden = false;
  success.focus();
});
