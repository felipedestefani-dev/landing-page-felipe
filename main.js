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

document.querySelector("#year").textContent = String(new Date().getFullYear());

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

function onScroll() {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
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
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

const counters = document.querySelectorAll("[data-count]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function runCounter(el) {
  const target = Number(el.dataset.count);
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = String(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

if (!reduceMotion) {
  counters.forEach((el) => {
    el.textContent = "0";
  });

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((el) => counterObserver.observe(el));
}

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
  channels.push({
    href: `https://wa.me/${digits}`,
    label: "WhatsApp",
    value: formatPhone(site.whatsapp),
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

if (channels.length) {
  directList.hidden = false;
  footerSocial.hidden = false;
  channels.forEach((channel) => {
    addChannel(directList, channel.href, channel.label, channel.value, channel.blank);
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
    `Oi, Felipe! Meu nome é ${nome}.`,
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
