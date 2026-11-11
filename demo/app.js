const categories = { corrida: "Corrida", basquete: "Basquete", casual: "Casual" };

const products = [
  { id: "volt-trainer", name: "Volt Trainer", cat: "corrida", price: 599, tag: "Novo" },
  { id: "flash-run", name: "Flash Run", cat: "corrida", price: 519, old: 649 },
  { id: "court-high", name: "Court High", cat: "basquete", price: 899, tag: "Novo" },
  { id: "air-lume", name: "Air Lume", cat: "casual", price: 699 },
  { id: "shadow-knit", name: "Shadow Knit", cat: "corrida", price: 579 },
  { id: "dunk-pastel", name: "Dunk Pastel", cat: "basquete", price: 799 },
  { id: "cloud-pastel", name: "Cloud Pastel", cat: "casual", price: 599, old: 749 },
  { id: "jump-retro", name: "Jump Retro", cat: "basquete", price: 949 },
  { id: "classic-vinho", name: "Classic Vinho", cat: "casual", price: 399 },
  { id: "terra-low", name: "Terra Low", cat: "casual", price: 699 },
  { id: "clean-white", name: "Clean White", cat: "casual", price: 359, old: 449 },
  { id: "night-low", name: "Night Low", cat: "casual", price: 699, tag: "Novo" },
];

const sizes = [37, 38, 39, 40, 41, 42, 43, 44];
const soldOut = { "court-high": [37, 44], "jump-retro": [38], "air-lume": [43] };

const money = (value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const byId = (id) => products.find((product) => product.id === id);

const grid = document.querySelector("#grid");
const filters = [...document.querySelectorAll("[data-filter]")];
const favs = new Set();
let bag = [];

function renderGrid() {
  grid.innerHTML = products
    .map((product) => {
      const off = product.old ? Math.round((1 - product.price / product.old) * 100) : 0;
      const badge = off ? `<span class="tag tag-off">-${off}%</span>` : product.tag ? `<span class="tag">${product.tag}</span>` : "";
      return `
        <article class="card" data-cat="${product.cat}" data-card="${product.id}">
          <div class="card-media">
            <img src="img/${product.id}.webp?v=2" alt="${product.name}" loading="lazy">
            ${badge}
            <button class="fav" type="button" data-fav="${product.id}" aria-label="Favoritar ${product.name}" aria-pressed="false">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>
            </button>
            <button class="quick-add" type="button" data-quick="${product.id}">Adicionar <span aria-hidden="true">+</span></button>
          </div>
          <div class="card-info">
            <div>
              <h3>${product.name}</h3>
              <p>${categories[product.cat]}</p>
            </div>
            <p class="price">${product.old ? `<s>${money(product.old)}</s>` : ""}${money(product.price)}</p>
          </div>
        </article>`;
    })
    .join("");
}

function applyFilter(filter) {
  filters.forEach((button) => button.classList.toggle("is-active", button.dataset.filter === filter));
  grid.querySelectorAll(".card").forEach((card, index) => {
    const show = filter === "todos" || card.dataset.cat === filter;
    card.hidden = !show;
    if (show) {
      card.style.setProperty("--i", String(index % 8));
      card.classList.remove("is-in");
      void card.offsetWidth;
      card.classList.add("is-in");
    }
  });
}

renderGrid();

filters.forEach((button) => button.addEventListener("click", () => applyFilter(button.dataset.filter)));

document.querySelectorAll("[data-filter-link]").forEach((link) => {
  link.addEventListener("click", () => applyFilter(link.dataset.filterLink));
});

/* Camadas: aviso, janela de tamanho, sacola e pagamento */

const toast = document.querySelector(".toast");
let toastTimer;

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-on"), 1800);
}

function bump(element) {
  element.classList.remove("bump");
  void element.offsetWidth;
  element.classList.add("bump");
}

function setLayer(layer, open) {
  const isOpen = !layer.hidden && layer.dataset.open === "1";
  if (open === isOpen) return;
  clearTimeout(layer.closeTimer);
  layer.dataset.open = open ? "1" : "";
  if (open) {
    layer.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add("is-open")));
  } else {
    layer.classList.remove("is-open");
    layer.closeTimer = setTimeout(() => {
      layer.hidden = true;
    }, 320);
  }
}

const favCount = document.querySelector("[data-fav-count]");

const sheet = document.querySelector("[data-sheet]");
const sizesBox = sheet.querySelector(".sizes");
const addSize = sheet.querySelector("[data-add-size]");
let quickProduct = null;
let quickSize = null;

function fillQuick(id) {
  const product = byId(id);
  if (quickProduct === product) return;
  quickProduct = product;
  sheet.querySelector(".quick-img").src = `img/${product.id}.webp?v=2`;
  sheet.querySelector(".quick-img").alt = product.name;
  sheet.querySelector(".quick-cat").textContent = categories[product.cat];
  sheet.querySelector(".quick-name").textContent = product.name;
  sheet.querySelector(".quick-price").innerHTML = `${product.old ? `<s>${money(product.old)}</s>` : ""}${money(product.price)} <small>ou 10x de ${money(product.price / 10)}</small>`;
  const out = soldOut[product.id] || [];
  sizesBox.innerHTML = sizes
    .map((size) => `<button type="button" data-size="${size}" ${out.includes(size) ? "disabled" : ""}>${size}</button>`)
    .join("");
  pickSize(null);
}

function pickSize(size) {
  quickSize = size;
  sizesBox.querySelectorAll("[data-size]").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.size) === size);
  });
  addSize.disabled = size === null;
  addSize.textContent = size === null ? "Escolha um tamanho" : `Adicionar à sacola · ${money(quickProduct.price)}`;
}

function openQuick(id) {
  quickProduct = null;
  fillQuick(id);
  setLayer(sheet, true);
}

sizesBox.addEventListener("click", (event) => {
  const button = event.target.closest("[data-size]");
  if (button) pickSize(Number(button.dataset.size));
});

addSize.addEventListener("click", () => {
  const line = bag.find((item) => item.id === quickProduct.id && item.size === quickSize);
  if (line) line.qty += 1;
  else bag.push({ id: quickProduct.id, size: quickSize, qty: 1 });
  renderBag();
  setLayer(sheet, false);
  bump(bagCount);
  showToast(`${quickProduct.name} (${quickSize}) na sacola`);
});

const drawer = document.querySelector("[data-drawer]");
const bagList = drawer.querySelector(".bag-list");
const bagEmpty = drawer.querySelector(".bag-empty");
const bagCount = document.querySelector("[data-bag-count]");
const checkout = drawer.querySelector("[data-checkout]");

function bagTotals() {
  return bag.reduce(
    (sum, item) => ({ items: sum.items + item.qty, total: sum.total + item.qty * byId(item.id).price }),
    { items: 0, total: 0 }
  );
}

function renderBag() {
  bagList.innerHTML = bag
    .map((item, index) => {
      const product = byId(item.id);
      return `
        <li>
          <img src="img/${product.id}.webp?v=2" alt="">
          <div>
            <strong>${product.name}</strong>
            <span>Tamanho ${item.size} · ${money(product.price * item.qty)}</span>
          </div>
          <div class="qty">
            <button type="button" data-dec="${index}" aria-label="Tirar um">−</button>
            <span>${item.qty}</span>
            <button type="button" data-inc="${index}" aria-label="Pôr mais um">+</button>
          </div>
        </li>`;
    })
    .join("");
  const { items, total } = bagTotals();
  bagCount.hidden = items === 0;
  bagCount.textContent = String(items);
  bagEmpty.hidden = items > 0;
  checkout.disabled = items === 0;
  drawer.querySelector("[data-bag-total]").textContent = money(total);
}

const pay = document.querySelector("[data-pay-layer]");
const payForm = pay.querySelector("[data-pay-form]");
const payLoading = pay.querySelector("[data-pay-loading]");
const payDone = pay.querySelector("[data-pay-done]");
const payButton = pay.querySelector("[data-pay]");
const payNome = pay.querySelector("[data-pay-nome]");
const payCep = pay.querySelector("[data-pay-cep]");
const methods = [...pay.querySelectorAll("[data-method]")];
const confetti = pay.querySelector(".confetti");
let payTimer;

confetti.innerHTML = Array.from({ length: 28 }, (_, i) => {
  const x = (i * 37) % 100;
  const delay = (i % 7) * 0.05;
  const turn = (i % 2 ? 1 : -1) * (200 + ((i * 53) % 340));
  return `<i style="--x:${x}%;--d:${delay}s;--r:${turn}deg;--c:${i % 4}"></i>`;
}).join("");

function fillPay() {
  const first = bag[0] && byId(bag[0].id);
  const { items, total } = bagTotals();
  pay.querySelector("[data-pay-img]").src = first ? `img/${first.id}.webp?v=2` : "";
  pay.querySelector("[data-pay-name]").textContent = items > 1 ? `${items} itens` : first ? first.name : "";
  pay.querySelector("[data-pay-detail]").textContent = items === 1 ? `Tamanho ${bag[0].size}` : "Frete grátis";
  pay.querySelector("[data-pay-total]").textContent = money(total);
  payButton.textContent = `Pagar ${money(total)}`;
}

function pickMethod(name) {
  methods.forEach((button) => button.classList.toggle("is-active", button.dataset.method === name));
}

function payStage(stage) {
  payForm.hidden = stage !== "form";
  payLoading.hidden = stage !== "loading";
  payDone.hidden = stage !== "done";
}

function openPay() {
  fillPay();
  payStage("form");
  setLayer(drawer, false);
  setLayer(pay, true);
}

methods.forEach((button) => button.addEventListener("click", () => pickMethod(button.dataset.method)));

payButton.addEventListener("click", () => {
  if (!methods.some((button) => button.classList.contains("is-active"))) pickMethod("pix");
  payStage("loading");
  clearTimeout(payTimer);
  payTimer = setTimeout(() => {
    payStage("done");
    bag = [];
    renderBag();
  }, 1600);
});

document.addEventListener("click", (event) => {
  if (document.documentElement.classList.contains("tour")) return;

  const fav = event.target.closest("[data-fav]");
  if (fav) {
    const id = fav.dataset.fav;
    if (favs.has(id)) favs.delete(id);
    else favs.add(id);
    fav.setAttribute("aria-pressed", String(favs.has(id)));
    bump(fav);
    favCount.hidden = favs.size === 0;
    favCount.textContent = String(favs.size);
    if (favs.has(id)) showToast(`${byId(id).name} nos favoritos`);
    return;
  }

  const quick = event.target.closest("[data-quick]");
  if (quick) {
    openQuick(quick.dataset.quick);
    return;
  }

  const inc = event.target.closest("[data-inc]");
  const dec = event.target.closest("[data-dec]");
  if (inc || dec) {
    const index = Number(inc ? inc.dataset.inc : dec.dataset.dec);
    bag[index].qty += inc ? 1 : -1;
    if (bag[index].qty <= 0) bag.splice(index, 1);
    renderBag();
    return;
  }

  if (event.target.closest("[data-open-bag]")) {
    setLayer(drawer, true);
    return;
  }

  if (event.target.closest("[data-checkout]")) {
    openPay();
    return;
  }

  const close = event.target.closest("[data-close]");
  if (close) setLayer(close.closest(".sheet"), false);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  document.querySelectorAll(".sheet:not([hidden])").forEach((layer) => setLayer(layer, false));
});

const newsForm = document.querySelector(".news-form");
newsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  newsForm.hidden = true;
  document.querySelector(".news-done").hidden = false;
});

renderBag();

/* Modo vídeo: a página de fora manda o progresso (0 a 1) e a compra acontece sozinha */

const cursor = document.querySelector(".tour-cursor");
const TOUR_PRODUCT = "flash-run";
const TOUR_SIZE = 41;
const TOUR_NOME = "Ana Souza";
const TOUR_CEP = "13170-000";

const path = [
  { t: 0.1, at: "start" },
  { t: 0.18, at: `[data-quick="${TOUR_PRODUCT}"]` },
  { t: 0.215, at: `[data-quick="${TOUR_PRODUCT}"]` },
  { t: 0.27, at: `[data-size="${TOUR_SIZE}"]` },
  { t: 0.3, at: `[data-size="${TOUR_SIZE}"]` },
  { t: 0.33, at: "[data-add-size]" },
  { t: 0.355, at: "[data-add-size]" },
  { t: 0.39, at: ".top [data-open-bag]" },
  { t: 0.415, at: ".top [data-open-bag]" },
  { t: 0.47, at: "[data-checkout]" },
  { t: 0.505, at: "[data-checkout]" },
  { t: 0.54, at: "[data-pay-nome]" },
  { t: 0.62, at: "[data-pay-nome]" },
  { t: 0.64, at: "[data-pay-cep]" },
  { t: 0.67, at: "[data-pay-cep]" },
  { t: 0.69, at: '[data-method="pix"]' },
  { t: 0.705, at: '[data-method="pix"]' },
  { t: 0.73, at: "[data-pay]" },
  { t: 0.755, at: "[data-pay]" },
];

const taps = [
  [0.195, 0.215],
  [0.285, 0.3],
  [0.34, 0.355],
  [0.4, 0.415],
  [0.49, 0.505],
  [0.545, 0.56],
  [0.645, 0.66],
  [0.695, 0.705],
  [0.74, 0.755],
];

const clamp = (value) => Math.min(1, Math.max(0, value));
const ease = (value) => (value < 0.5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2);
const between = (t, start, end) => clamp((t - start) / (end - start));
let tourT = 0;
let tourBagKey = "";
let followUntil = 0;

function startTour() {
  document.documentElement.classList.add("tour");
  favs.clear();
  favCount.hidden = true;
  bag = [];
  renderBag();
}

function pointOf(selector) {
  if (selector === "start") return { x: innerWidth * 0.62, y: innerHeight * 0.92 };
  const element = document.querySelector(selector);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  if (!rect.width) return null;
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function placeCursor() {
  const t = tourT;
  cursor.classList.toggle("is-on", t > 0.1 && t < 0.77);
  cursor.classList.toggle("is-tap", taps.some(([start, end]) => t >= start && t <= end));
  let next = path.findIndex((step) => step.t >= t);
  if (next === -1) next = path.length - 1;
  const prev = Math.max(0, next - 1);
  const from = pointOf(path[prev].at);
  const to = pointOf(path[next].at) || from;
  if (!to) return;
  const k = next === prev ? 1 : ease(between(t, path[prev].t, path[next].t));
  const x = from ? from.x + (to.x - from.x) * k : to.x;
  const y = from ? from.y + (to.y - from.y) * k : to.y;
  cursor.style.transform = `translate(${x}px, ${y}px)`;
}

function followCursor() {
  placeCursor();
  if (performance.now() < followUntil) requestAnimationFrame(followCursor);
}

function tour(t) {
  if (!document.documentElement.classList.contains("tour")) startTour();
  tourT = clamp(t);

  const shopTop = grid.getBoundingClientRect().top + window.scrollY - document.querySelector(".top").offsetHeight - 20;
  window.scrollTo({ top: shopTop * ease(between(t, 0.02, 0.13)), behavior: "instant" });

  const card = grid.querySelector(`[data-card="${TOUR_PRODUCT}"]`);
  card.classList.toggle("is-hover", t > 0.15 && t < 0.36);

  const sheetOpen = t >= 0.215 && t < 0.355;
  fillQuick(TOUR_PRODUCT);
  pickSize(t >= 0.3 ? TOUR_SIZE : null);
  setLayer(sheet, sheetOpen);

  const inBag = t >= 0.355;
  const key = inBag ? "1" : "";
  if (key !== tourBagKey) {
    tourBagKey = key;
    bag = inBag ? [{ id: TOUR_PRODUCT, size: TOUR_SIZE, qty: 1 }] : [];
    renderBag();
    if (inBag) bump(bagCount);
  }

  if (t >= 0.355 && t < 0.41) {
    toast.textContent = `${byId(TOUR_PRODUCT).name} (${TOUR_SIZE}) na sacola`;
    toast.classList.add("is-on");
  } else {
    toast.classList.remove("is-on");
  }

  setLayer(drawer, t >= 0.415 && t < 0.505);

  const payOpen = t >= 0.505;
  if (payOpen && inBag) fillPay();
  setLayer(pay, payOpen);
  payNome.value = TOUR_NOME.slice(0, Math.round(TOUR_NOME.length * between(t, 0.56, 0.62)));
  payCep.value = TOUR_CEP.slice(0, Math.round(TOUR_CEP.length * between(t, 0.66, 0.68)));
  payNome.classList.toggle("is-focus", t >= 0.545 && t < 0.645);
  payCep.classList.toggle("is-focus", t >= 0.645 && t < 0.69);
  pickMethod(t >= 0.705 ? "pix" : null);
  payStage(t < 0.755 ? "form" : t < 0.835 ? "loading" : "done");
  pay.style.setProperty("--load", between(t, 0.755, 0.835).toFixed(3));
  pay.style.setProperty("--done", between(t, 0.835, 1).toFixed(3));

  followUntil = performance.now() + 450;
  requestAnimationFrame(followCursor);
}

window.sola = { tour };
