const products = [
  { id: "air-fryer", name: "Fritadeira Air Fryer Philco Redstone 9,5L", price: 329.9, cat: "Cozinha" },
  { id: "caixa-som", name: "Caixa de som Pulse MultiLed", price: 1099, old: 1399, cat: "Som" },
  { id: "chaleira", name: "Chaleira Elétrica Philco Digital Glass 1,7L", price: 229.9, cat: "Cozinha" },
  { id: "aspirador", name: "Aspirador Vertical Britânia 1250W", price: 139.9, cat: "Limpeza" },
  { id: "cafeteira", name: "Cafeteira Elétrica Oster Compacta Inox", price: 99.9, old: 129.9, cat: "Cozinha" },
  { id: "liquidificador", name: "Liquidificador Philco Turbo 3,1L", price: 159.9, cat: "Cozinha" },
  { id: "forno", name: "Forno Elétrico Dako Supreme 44L com Grill", price: 429.9, cat: "Cozinha" },
  { id: "panela-pressao", name: "Panela de Pressão Elétrica Mondial 5L", price: 319.9, old: 379.9, cat: "Cozinha" },
].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

const money = (value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const normalize = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const byId = (id) => products.find((product) => product.id === id);

const grid = document.querySelector("#grid");
const empty = document.querySelector(".catalog-empty");
const search = document.querySelector("#busca");
const searchField = search.closest(".ios-field");
const category = document.querySelector("#categoria");

const waIcon =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.8-1.1-4.6-4-4.8-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.2.5.1.6 0l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>';

grid.innerHTML = products
  .map(
    (product) => `
      <article class="product-card" data-card="${product.id}">
        <div class="thumb">
          <img src="img/p/${product.id}.webp" alt="${product.name}" loading="lazy" decoding="async">
          ${product.old ? '<span class="badge-promo">Oferta</span>' : ""}
        </div>
        <div class="body">
          <h3>${product.name}</h3>
          <p class="price">${product.old ? `<s>${money(product.old)}</s>` : ""}${money(product.price)}</p>
          <a class="buy-btn" href="#" data-buy="${product.id}">${waIcon}Comprar</a>
        </div>
      </article>`
  )
  .join("");

const categories = [...new Set(products.map((product) => product.cat))].sort((a, b) => a.localeCompare(b, "pt-BR"));
category.innerHTML = `<option value="">Todas as categorias</option>${categories.map((name) => `<option>${name}</option>`).join("")}`;

const cards = [...grid.querySelectorAll("[data-card]")];

function applyFilter() {
  const query = normalize(search.value.trim());
  let shown = 0;
  cards.forEach((card) => {
    const product = byId(card.dataset.card);
    const show = (!category.value || product.cat === category.value) && (!query || normalize(product.name).includes(query));
    card.hidden = !show;
    if (show) shown += 1;
  });
  empty.hidden = shown > 0;
}

search.addEventListener("input", applyFilter);
category.addEventListener("change", applyFilter);

/* WhatsApp */

const wa = document.querySelector("[data-wa]");
const waList = wa.querySelector("[data-wa-list]");
const waTyping = wa.querySelector("[data-wa-typing]");
const waInput = wa.querySelector("[data-wa-input]");
const waCompose = wa.querySelector(".wa-compose");
const waSend = wa.querySelector("[data-wa-send]");
const waStatus = wa.querySelector("[data-wa-status]");
const waLast = wa.querySelector("[data-wa-last]");
const waLastTime = wa.querySelector("[data-wa-last-time]");

const ticks =
  '<svg class="wa-ticks" viewBox="0 0 17 11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 6l3 3 6.5-7.5"/><path class="tick-2" d="M7.5 9l6.5-7.5"/></svg>';

const escapeHtml = (text) => text.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
const formatWa = (text) => escapeHtml(text).replace(/\*([^*\n]+)\*/g, "<b>$1</b>");

function orderText(product) {
  const value = product.old ? `De ${money(product.old)} por ${money(product.price)}` : money(product.price);
  return ["Olá! Tenho interesse neste produto:", "", `*Nome:* ${product.name}`, `*Valor:* ${value}`, "", "Vi no site da Onda Eletro."].join("\n");
}

function clock() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function addMsg(from, text, time) {
  const messages = waList.querySelectorAll(".wa-msg");
  const previous = messages[messages.length - 1];
  const msg = document.createElement("div");
  msg.className = `wa-msg wa-${from}`;
  if (!previous || !previous.classList.contains(`wa-${from}`)) msg.classList.add("wa-first");
  msg.dataset.text = text;
  msg.dataset.time = time;
  msg.innerHTML = `${formatWa(text)}<span class="wa-meta">${time}${from === "out" ? ticks : ""}</span>`;
  waList.insertBefore(msg, waTyping);
  return msg;
}

function setInput(text) {
  if (waInput.textContent !== text) waInput.textContent = text;
  waCompose.classList.toggle("has-text", text.length > 0);
}

function setTyping(on) {
  waTyping.hidden = !on;
  waStatus.textContent = on ? "digitando…" : "online";
  waStatus.classList.toggle("is-typing", on);
  waLast.classList.toggle("is-typing", on);
  if (on) waLast.textContent = "digitando…";
  else updateLast();
}

function updateLast() {
  const shown = [...waList.querySelectorAll(".wa-msg:not([hidden])")];
  const last = shown[shown.length - 1];
  if (!last) return;
  waLast.textContent = last.dataset.text.split("\n")[0].replace(/\*/g, "");
  waLastTime.textContent = last.dataset.time;
}

function setChat(open) {
  const isOpen = !wa.hidden && wa.dataset.open === "1";
  if (open === isOpen) return;
  clearTimeout(wa.closeTimer);
  wa.dataset.open = open ? "1" : "";
  if (open) {
    wa.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => wa.classList.add("is-open")));
  } else {
    wa.classList.remove("is-open");
    wa.closeTimer = setTimeout(() => {
      wa.hidden = true;
    }, 400);
  }
}

let replyTimers = [];

grid.addEventListener("click", (event) => {
  const buy = event.target.closest("[data-buy]");
  if (!buy) return;
  event.preventDefault();
  if (document.documentElement.classList.contains("tour")) return;
  setInput(orderText(byId(buy.dataset.buy)));
  setChat(true);
});

waSend.addEventListener("click", () => {
  const text = waInput.innerText.trim();
  if (!text || document.documentElement.classList.contains("tour")) return;
  const msg = addMsg("out", text, clock());
  setInput("");
  updateLast();
  replyTimers.forEach(clearTimeout);
  replyTimers = [
    setTimeout(() => msg.classList.add("is-delivered"), 700),
    setTimeout(() => msg.classList.add("is-read"), 1400),
    setTimeout(() => setTyping(true), 1900),
    setTimeout(() => {
      setTyping(false);
      addMsg("in", "Oi! Tem sim 😊 Quer retirar na loja ou receber em casa?", clock());
      updateLast();
    }, 3600),
  ];
});

waInput.addEventListener("input", () => waCompose.classList.toggle("has-text", waInput.textContent.trim().length > 0));

wa.querySelector("[data-wa-close]").addEventListener("click", () => setChat(false));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setChat(false);
});

/* Modo vídeo: a página de fora manda o progresso (0 a 1) e a compra acontece sozinha */

const cursor = document.querySelector(".tour-cursor");
const header = document.querySelector(".site-header");
const toolbar = document.querySelector(".catalog-toolbar");
const TOUR_PRODUCT = "air-fryer";
const TOUR_QUERY = "air fryer";
const TOUR_ANSWER = "Receber em casa, por favor!";
const BUY = `[data-buy="${TOUR_PRODUCT}"]`;

const script = [
  { from: "out", text: () => orderText(byId(TOUR_PRODUCT)), time: "14:32", at: 0.465, delivered: 0.48, read: 0.5 },
  { from: "in", text: () => "Oi! Tem sim 😊 Quer retirar na loja ou receber em casa?", time: "14:33", at: 0.59 },
  { from: "out", text: () => TOUR_ANSWER, time: "14:35", at: 0.825, delivered: 0.84, read: 0.855 },
  { from: "in", text: () => "Fechado! Já te mando o valor da entrega ✅", time: "14:36", at: 0.93 },
];
const typingWindows = [
  [0.52, 0.59],
  [0.865, 0.93],
];

const path = [
  { t: 0.17, at: "start" },
  { t: 0.2, at: "#busca" },
  { t: 0.29, at: "#busca" },
  { t: 0.33, at: BUY },
  { t: 0.395, at: BUY },
  { t: 0.44, at: "[data-wa-send]" },
  { t: 0.5, at: "[data-wa-send]" },
  { t: 0.69, at: "start" },
  { t: 0.71, at: "[data-wa-input]" },
  { t: 0.79, at: "[data-wa-input]" },
  { t: 0.81, at: "[data-wa-send]" },
  { t: 0.85, at: "[data-wa-send]" },
];

const taps = [
  [0.2, 0.215],
  [0.38, 0.395],
  [0.45, 0.465],
  [0.71, 0.725],
  [0.81, 0.825],
];

const clamp = (value) => Math.min(1, Math.max(0, value));
const ease = (value) => (value < 0.5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2);
const between = (t, start, end) => clamp((t - start) / (end - start));
const within = (t, [start, end]) => t >= start && t < end;
let tourT = -1;
let tourMsgs = [];
let tourChatKey = "";
let followUntil = 0;
let following = false;

function startTour() {
  document.documentElement.classList.add("tour");
  replyTimers.forEach(clearTimeout);
  waList.querySelectorAll(".wa-msg").forEach((msg) => msg.remove());
  tourMsgs = script.map((line) => {
    const msg = addMsg(line.from, line.text(), line.time);
    msg.hidden = true;
    return msg;
  });
  tourChatKey = "";
  category.value = "";
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
  cursor.classList.toggle("is-on", (t > 0.17 && t < 0.49) || (t > 0.69 && t < 0.85));
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
  else following = false;
}

function scrollFor(t) {
  const toolTop = Math.max(0, toolbar.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 14);
  const max = document.documentElement.scrollHeight - innerHeight;
  const deep = Math.max(toolTop, Math.min(max, toolTop + innerHeight * 1.4));
  if (t < 0.13) return deep * ease(between(t, 0.02, 0.12));
  return deep + (toolTop - deep) * ease(between(t, 0.13, 0.18));
}

function tour(value) {
  const t = clamp(value);
  if (t === tourT) return;
  if (!document.documentElement.classList.contains("tour")) startTour();
  tourT = t;

  const query = TOUR_QUERY.slice(0, Math.round(TOUR_QUERY.length * between(t, 0.22, 0.29)));
  if (search.value !== query) {
    search.value = query;
    applyFilter();
  }
  searchField.classList.toggle("is-focus", t >= 0.215 && t < 0.395);

  const top = Math.round(scrollFor(t));
  if (Math.round(window.scrollY) !== top) window.scrollTo({ top, behavior: "instant" });

  grid.querySelector(`[data-card="${TOUR_PRODUCT}"]`).classList.toggle("is-hover", t >= 0.31 && t < 0.4);
  document.querySelector(BUY).classList.toggle("is-press", t >= 0.38 && t < 0.395);

  setChat(t >= 0.395);

  script.forEach((line, index) => {
    const msg = tourMsgs[index];
    msg.hidden = t < line.at;
    if (line.delivered) {
      msg.classList.toggle("is-delivered", t >= line.delivered);
      msg.classList.toggle("is-read", t >= line.read);
    }
  });

  let draft = "";
  if (t < 0.465) draft = script[0].text();
  else if (t >= 0.725 && t < 0.825) draft = TOUR_ANSWER.slice(0, Math.round(TOUR_ANSWER.length * between(t, 0.73, 0.79)));
  setInput(draft);
  waInput.classList.toggle("is-focus", (t >= 0.395 && t < 0.465) || (t >= 0.725 && t < 0.825));
  waSend.classList.toggle("is-press", (t >= 0.45 && t < 0.465) || (t >= 0.81 && t < 0.825));
  const typing = typingWindows.some((range) => within(t, range));
  const chatKey = `${tourMsgs.map((msg) => (msg.hidden ? 0 : 1)).join("")}${typing ? 1 : 0}`;
  if (chatKey !== tourChatKey) {
    tourChatKey = chatKey;
    setTyping(typing);
  }

  followUntil = performance.now() + 450;
  if (!following) {
    following = true;
    requestAnimationFrame(followCursor);
  }
}

function idle(on) {
  document.documentElement.classList.toggle("idle", on);
}

window.exemplo = { tour, idle };
