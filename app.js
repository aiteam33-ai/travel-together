// ============================================================
// Trattoria del Sole — app logic (cart, orders, routing, menu).
// Menu/coupon data lives in menu-data.js; this file never hard-codes
// prices or dish info, it only reads from there.
// ============================================================
import { MENU, RESTAURANT_NAME, RESTAURANT_TAGLINE, COUPON, GST_PERCENT, SERVICE_CHARGE_PERCENT } from "./menu-data.js";

document.title = RESTAURANT_NAME;
document.getElementById("tagline-text").textContent = RESTAURANT_TAGLINE;

const TRACKING_STEPS = ["Placed", "Preparing", "On the way", "Delivered"];

// ------------------------------------------------------------
// Task 7: shared reduced-motion flag, checked once and kept live.
// Other modules (background.js, intro.js) read window.trattoriaMotion.
// ------------------------------------------------------------
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
window.trattoriaMotion = { reduced: reducedMotionQuery.matches };
reducedMotionQuery.addEventListener("change", (e) => {
  window.trattoriaMotion.reduced = e.matches;
});

// Retrigger a CSS animation by removing the class, forcing a reflow,
// then re-adding it (Task 3 / Task 6 "pop" effects).
function retriggerPop(el, className) {
  el.classList.remove(className);
  void el.offsetWidth; // force reflow
  el.classList.add(className);
}

// Task 5: "added to cart" toast — updates in place and restarts its
// own 2s timer instead of stacking multiple toasts.
const toastEl = document.getElementById("toast");
let toastTimer = null;
function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2000);
}

// ------------------------------------------------------------
// Theme toggle
// ------------------------------------------------------------
const themeToggleBtn = document.getElementById("theme-toggle-btn");
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggleBtn.innerHTML = theme === "dark" ? "&#9728;" : "&#9790;";
  themeToggleBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
}
applyTheme(document.documentElement.getAttribute("data-theme") || "light");
themeToggleBtn.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  try { localStorage.setItem("trattoriaTheme", next); } catch (e) {}
  applyTheme(next);
});

// ------------------------------------------------------------
// Menu lookup helpers
// ------------------------------------------------------------
function findDish(name) {
  for (const section of MENU) {
    const dish = section.items.find((d) => d.name === name);
    if (dish) return dish;
  }
  return null;
}

// ------------------------------------------------------------
// Cart state: { dishName: { qty, note } }
// ------------------------------------------------------------
const CART_KEY = "trattoriaCart";
const ORDERS_KEY = "trattoriaOrders";
const COUPON_KEY = "trattoriaCoupon";

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (e) {
    return fallback;
  }
}
function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

let cart = loadJSON(CART_KEY, {});
// Drop any dishes from an older menu that no longer exist.
Object.keys(cart).forEach((name) => { if (!findDish(name)) delete cart[name]; });
saveJSON(CART_KEY, cart);

let orders = loadJSON(ORDERS_KEY, []);
if (!Array.isArray(orders)) orders = [];

let appliedCoupon = loadJSON(COUPON_KEY, null);
let couponMessage = "";

function saveCart() { saveJSON(CART_KEY, cart); }
function saveOrders() { saveJSON(ORDERS_KEY, orders); }
function saveCoupon() { saveJSON(COUPON_KEY, appliedCoupon); }

function addToCart(name) {
  if (!cart[name]) cart[name] = { qty: 0, note: "" };
  cart[name].qty += 1;
  saveCart();
  renderCartBar();
  renderCartDrawerIfOpen();
  const dish = findDish(name);
  showToast((dish ? dish.name : name) + " added to cart");
}

function changeQty(name, delta) {
  if (!cart[name]) return;
  cart[name].qty += delta;
  if (cart[name].qty <= 0) delete cart[name];
  saveCart();
  renderCartBar();
  renderCartDrawerIfOpen();
  if (currentPage === "cart") renderCartPage();
}

function removeFromCart(name) {
  delete cart[name];
  saveCart();
  renderCartBar();
  renderCartDrawerIfOpen();
  if (currentPage === "cart") renderCartPage();
}

function setNote(name, note) {
  if (!cart[name]) return;
  cart[name].note = note;
  saveCart();
}

function cartCount() {
  return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
}

function cartSubtotal() {
  return Object.entries(cart).reduce((sum, [name, item]) => {
    const dish = findDish(name);
    return sum + (dish ? dish.price * item.qty : 0);
  }, 0);
}

function isFirstOrder() {
  return orders.length === 0;
}
function couponIsActive() {
  return appliedCoupon === COUPON.code && (!COUPON.firstOrderOnly || isFirstOrder());
}
function cartDiscount() {
  return couponIsActive() ? Math.round((cartSubtotal() * COUPON.percent) / 100) : 0;
}
function cartGst(afterDiscount) {
  return Math.round((afterDiscount * GST_PERCENT) / 100);
}
function cartServiceCharge(afterDiscount) {
  return Math.round((afterDiscount * SERVICE_CHARGE_PERCENT) / 100);
}
function cartFinalTotal() {
  const subtotal = cartSubtotal();
  const discount = cartDiscount();
  const afterDiscount = subtotal - discount;
  return afterDiscount + cartGst(afterDiscount) + cartServiceCharge(afterDiscount);
}

// ------------------------------------------------------------
// Orders
// ------------------------------------------------------------
function nextOrderNumber() {
  if (orders.length === 0) return 1001;
  return Math.max(...orders.map((o) => o.number)) + 1;
}

function placeOrder(details) {
  const subtotal = cartSubtotal();
  const discount = cartDiscount();
  const afterDiscount = subtotal - discount;
  const gst = cartGst(afterDiscount);
  const service = cartServiceCharge(afterDiscount);

  const items = Object.entries(cart).map(([name, item]) => {
    const dish = findDish(name);
    return { name, price: dish ? dish.price : 0, qty: item.qty, note: item.note || "" };
  });

  const order = {
    number: nextOrderNumber(),
    time: new Date().toISOString(),
    items,
    subtotal,
    discount,
    couponCode: discount > 0 ? COUPON.code : null,
    gst,
    service,
    total: afterDiscount + gst + service,
    status: "Placed",
    ...details,
  };

  orders.unshift(order);
  saveOrders();
  cart = {};
  saveCart();
  appliedCoupon = null;
  saveCoupon();
  renderCartBar();
  return order;
}

function advanceOrders() {
  let changed = false;
  orders.forEach((order) => {
    const idx = TRACKING_STEPS.indexOf(order.status);
    if (idx !== -1 && idx < TRACKING_STEPS.length - 1) {
      order.status = TRACKING_STEPS[idx + 1];
      changed = true;
    }
  });
  if (changed) {
    saveOrders();
    if (currentPage === "orders") renderOrdersPage();
  }
}
setInterval(advanceOrders, 10000);

// ------------------------------------------------------------
// Cart bar + drawer
// ------------------------------------------------------------
const cartBar = document.getElementById("cartBar");
const cartBarCount = document.getElementById("cartBarCount");
const cartBarTotal = document.getElementById("cartBarTotal");
const cartDrawer = document.getElementById("cartDrawer");
const cartDrawerOverlay = document.getElementById("cartDrawerOverlay");
const cartDrawerBody = document.getElementById("cartDrawerBody");
const cartDrawerCount = document.getElementById("cartDrawerCount");

// Task 3: cart count pop — retriggers everywhere the count is shown,
// every time it changes (including quick repeated changes).
function setCartCountText(el, count) {
  if (el.textContent === String(count)) return;
  el.textContent = count;
  retriggerPop(el, "count-pop");
}

function renderCartBar() {
  const count = cartCount();
  setCartCountText(cartBarCount, count);
  setCartCountText(cartDrawerCount, count);
  if (count === 0) {
    cartBar.classList.remove("show");
    return;
  }
  cartBar.classList.add("show");
  cartBarTotal.textContent = "₹" + cartFinalTotal();
}

function buildMiniCartRow(name, item) {
  const dish = findDish(name);
  if (!dish) return document.createDocumentFragment();
  const row = document.createElement("div");
  row.className = "bill-row";
  row.innerHTML = `
    <div class="bill-thumb"></div>
    <div class="bill-row-main">
      <div class="bill-row-top">
        <span class="bill-row-name">${dish.name}</span>
        <span>₹${dish.price * item.qty}</span>
      </div>
      <div class="qty-control">
        <button class="qty-btn" data-action="dec" data-name="${name}" aria-label="Decrease ${dish.name} quantity">-</button>
        <span>${item.qty}</span>
        <button class="qty-btn" data-action="inc" data-name="${name}" aria-label="Increase ${dish.name} quantity">+</button>
      </div>
    </div>
  `;
  row.querySelector('[data-action="dec"]').addEventListener("click", () => changeQty(name, -1));
  row.querySelector('[data-action="inc"]').addEventListener("click", () => changeQty(name, 1));
  return row;
}

function renderCartDrawerIfOpen() {
  if (cartDrawer.classList.contains("show")) renderCartDrawer();
}

function renderCartDrawer() {
  cartDrawerBody.innerHTML = "";
  const entries = Object.entries(cart);
  if (entries.length === 0) {
    cartDrawerBody.innerHTML = `<p class="empty-state">Your table is empty &mdash; add something delicious.</p>`;
    return;
  }
  entries.forEach(([name, item]) => cartDrawerBody.appendChild(buildMiniCartRow(name, item)));
  const totalRow = document.createElement("div");
  totalRow.className = "bill-total-row";
  totalRow.innerHTML = `<span>Total</span><span>₹${cartFinalTotal()}</span>`;
  cartDrawerBody.appendChild(totalRow);

  const goBtn = document.createElement("button");
  goBtn.className = "primary-btn";
  goBtn.textContent = "View Full Bill";
  goBtn.addEventListener("click", () => {
    closeCartDrawer();
    goTo("cart");
  });
  cartDrawerBody.appendChild(goBtn);
}

function openCartDrawer() {
  renderCartDrawer();
  cartDrawer.classList.add("show");
  cartDrawerOverlay.classList.add("show");
}
function closeCartDrawer() {
  cartDrawer.classList.remove("show");
  cartDrawerOverlay.classList.remove("show");
}

cartBar.addEventListener("click", openCartDrawer);
document.getElementById("cartDrawerClose").addEventListener("click", closeCartDrawer);
cartDrawerOverlay.addEventListener("click", closeCartDrawer);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCartDrawer();
});

// ------------------------------------------------------------
// Menu page: search, chips, dish cards
// ------------------------------------------------------------
const menuSearchInput = document.getElementById("menuSearchInput");
const menuChipRow = document.getElementById("menuChipRow");
const menuGroups = document.getElementById("menuGroups");
let activeMenuFilter = "all";

// ------------------------------------------------------------
// Task 6: favourite dishes, remembered across refreshes.
// ------------------------------------------------------------
const FAVOURITES_KEY = "trattoriaFavourites";
const favourites = new Set(loadJSON(FAVOURITES_KEY, []));

function toggleFavourite(name, heartBtn) {
  if (favourites.has(name)) {
    favourites.delete(name);
  } else {
    favourites.add(name);
  }
  saveJSON(FAVOURITES_KEY, Array.from(favourites));
  const nowFav = favourites.has(name);
  heartBtn.classList.toggle("filled", nowFav);
  heartBtn.innerHTML = nowFav ? "&#9829;" : "&#9825;";
  heartBtn.setAttribute("aria-pressed", String(nowFav));
  retriggerPop(heartBtn, "pop");
}

function buildDishCard(dish) {
  const card = document.createElement("div");
  card.className = "card dish-card";

  const badgeText = dish.bestSeller ? "Most Loved" : dish.chefSpecial ? "Chef's Special" : null;
  const isFav = favourites.has(dish.name);

  card.innerHTML = `
    ${badgeText ? `<span class="dish-badge">${badgeText}</span>` : ""}
    <button class="heart-btn ${isFav ? "filled" : ""}" type="button"
      aria-pressed="${isFav}" aria-label="Add ${dish.name} to favourites">${isFav ? "&#9829;" : "&#9825;"}</button>
    <img class="dish-image" src="${dish.image}" alt="${dish.name} (${dish.english || dish.name})" loading="lazy">
    <div class="dish-body">
      <div class="dish-name-row">
        <span class="veg-dot ${dish.veg ? "veg" : "nonveg"}"></span>
        <span class="dish-name">${dish.name}</span>
      </div>
      ${dish.english ? `<span class="dish-english">${dish.english}</span>` : ""}
      <p class="dish-desc">${dish.description}</p>
      <div class="dish-tags">${(dish.tags || []).map((t) => `<span class="dish-tag">${t}</span>`).join("")}</div>
      <div class="dish-footer">
        <span class="dish-price">₹${dish.price}</span>
        <button class="add-btn" type="button">Add</button>
      </div>
    </div>
  `;

  // Task 2: "Added ✓" state for 1.2s, re-adding every press and
  // never getting stuck (previous timer is always cleared first).
  const addBtn = card.querySelector(".add-btn");
  addBtn.addEventListener("click", () => {
    addToCart(dish.name);
    clearTimeout(addBtn._addedTimer);
    addBtn.textContent = "Added ✓";
    addBtn.classList.add("added");
    addBtn._addedTimer = setTimeout(() => {
      addBtn.textContent = "Add";
      addBtn.classList.remove("added");
    }, 1200);
  });

  // Task 6: favourite heart — never triggers Add to Cart.
  const heartBtn = card.querySelector(".heart-btn");
  heartBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavourite(dish.name, heartBtn);
  });

  return card;
}

function renderMenuChips() {
  menuChipRow.innerHTML = "";
  const allChip = document.createElement("button");
  allChip.className = "menu-chip" + (activeMenuFilter === "all" ? " active" : "");
  allChip.textContent = "All";
  allChip.addEventListener("click", () => { activeMenuFilter = "all"; renderMenu(); });
  menuChipRow.appendChild(allChip);

  MENU.forEach((section) => {
    const chip = document.createElement("button");
    chip.className = "menu-chip" + (activeMenuFilter === section.group ? " active" : "");
    chip.textContent = section.group;
    chip.addEventListener("click", () => { activeMenuFilter = section.group; renderMenu(); });
    menuChipRow.appendChild(chip);
  });
}

function renderMenu() {
  renderMenuChips();
  menuGroups.innerHTML = "";
  const query = menuSearchInput.value.trim().toLowerCase();
  let anyResults = false;

  MENU.forEach((section) => {
    if (activeMenuFilter !== "all" && activeMenuFilter !== section.group) return;

    const items = section.items.filter((dish) => {
      if (!query) return true;
      return (
        dish.name.toLowerCase().includes(query) ||
        (dish.english || "").toLowerCase().includes(query) ||
        dish.description.toLowerCase().includes(query)
      );
    });
    if (items.length === 0) return;
    anyResults = true;

    const groupEl = document.createElement("div");
    groupEl.className = "menu-group";
    groupEl.innerHTML = `<h2>${section.group}${section.groupEnglish ? `<span class="group-english">${section.groupEnglish}</span>` : ""}</h2>`;
    const grid = document.createElement("div");
    grid.className = "dish-grid";
    items.forEach((dish) => grid.appendChild(buildDishCard(dish)));
    groupEl.appendChild(grid);
    menuGroups.appendChild(groupEl);
  });

  if (!anyResults) {
    menuGroups.innerHTML = `<p class="no-results">No dishes match &ldquo;${query}&rdquo;.</p>`;
  }
}
menuSearchInput.addEventListener("input", renderMenu);

// ------------------------------------------------------------
// Cart page ("the bill")
// ------------------------------------------------------------
const cartPageBody = document.getElementById("cartPageBody");

function renderCartPage() {
  cartPageBody.innerHTML = "";
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    cartPageBody.innerHTML = `<p class="empty-state">Your table is empty. Add something delicious from the menu!</p>`;
    return;
  }

  const bill = document.createElement("div");
  bill.className = "bill-card";

  entries.forEach(([name, item]) => {
    const dish = findDish(name);
    if (!dish) return;
    const row = document.createElement("div");
    row.className = "bill-row";
    row.innerHTML = `
      <div class="bill-thumb"></div>
      <div class="bill-row-main">
        <div class="bill-row-top">
          <span class="bill-row-name">${dish.name}</span>
          <button class="remove-btn" type="button">Remove</button>
        </div>
        <div class="bill-row-top">
          <div class="qty-control">
            <button class="qty-btn" data-action="dec" aria-label="Decrease ${dish.name} quantity">-</button>
            <span>${item.qty}</span>
            <button class="qty-btn" data-action="inc" aria-label="Increase ${dish.name} quantity">+</button>
          </div>
          <span style="font-weight:700;">₹${dish.price * item.qty}</span>
        </div>
        <input class="note-input" type="text" placeholder="Note for the kitchen (optional)" value="${item.note || ""}">
      </div>
    `;
    row.querySelector('[data-action="dec"]').addEventListener("click", () => changeQty(name, -1));
    row.querySelector('[data-action="inc"]').addEventListener("click", () => changeQty(name, 1));
    row.querySelector(".remove-btn").addEventListener("click", () => removeFromCart(name));
    row.querySelector(".note-input").addEventListener("input", (e) => setNote(name, e.target.value));
    bill.appendChild(row);
  });

  // Coupon box
  const couponBox = document.createElement("div");
  if (couponIsActive()) {
    couponBox.innerHTML = `
      <div class="bill-summary-row" style="align-items:center;">
        <span style="color:var(--veg); font-weight:700;">${COUPON.code} applied &mdash; you saved ₹${cartDiscount()}</span>
        <button class="remove-btn" id="removeCouponBtn" type="button">Remove</button>
      </div>
    `;
    couponBox.querySelector("#removeCouponBtn").addEventListener("click", () => {
      appliedCoupon = null;
      saveCoupon();
      couponMessage = "";
      renderCartPage();
    });
  } else {
    couponBox.innerHTML = `
      <div class="coupon-row">
        <input type="text" id="couponInput" placeholder="Coupon code (e.g. ${COUPON.code})">
        <button class="qty-btn" id="applyCouponBtn" type="button" style="width:auto; padding:0 16px; border-radius:8px;">Apply</button>
      </div>
      <div class="coupon-message ${couponMessage ? "error" : ""}" id="couponMsgEl">${couponMessage}</div>
    `;
    couponBox.querySelector("#applyCouponBtn").addEventListener("click", () => {
      const raw = couponBox.querySelector("#couponInput").value.trim().toUpperCase();
      if (raw !== COUPON.code) {
        couponMessage = "That code is not valid.";
      } else if (COUPON.firstOrderOnly && !isFirstOrder()) {
        couponMessage = "This code is only for your first order.";
      } else {
        appliedCoupon = COUPON.code;
        saveCoupon();
        couponMessage = "";
      }
      renderCartPage();
    });
  }
  bill.appendChild(couponBox);

  const subtotal = cartSubtotal();
  const discount = cartDiscount();
  const afterDiscount = subtotal - discount;
  const gst = cartGst(afterDiscount);
  const service = cartServiceCharge(afterDiscount);

  const summary = document.createElement("div");
  summary.style.marginTop = "12px";
  summary.innerHTML = `
    <div class="bill-summary-row"><span>Subtotal</span><span>₹${subtotal}</span></div>
    ${discount > 0 ? `<div class="bill-summary-row" style="color:var(--veg);"><span>Discount (${COUPON.code})</span><span>-₹${discount}</span></div>` : ""}
    <div class="bill-summary-row"><span>GST (${GST_PERCENT}%)</span><span>₹${gst}</span></div>
    <div class="bill-summary-row"><span>Service charge (${SERVICE_CHARGE_PERCENT}%)</span><span>₹${service}</span></div>
    <div class="bill-total-row"><span>Total</span><span>₹${afterDiscount + gst + service}</span></div>
  `;
  bill.appendChild(summary);

  const checkoutBtn = document.createElement("button");
  checkoutBtn.className = "primary-btn";
  checkoutBtn.textContent = "Proceed to Checkout";
  checkoutBtn.addEventListener("click", () => goTo("checkout"));
  bill.appendChild(checkoutBtn);

  cartPageBody.appendChild(bill);
}

// ------------------------------------------------------------
// Checkout page
// ------------------------------------------------------------
const checkoutBody = document.getElementById("checkoutBody");

function renderCheckoutPage() {
  checkoutBody.innerHTML = "";

  if (cartCount() === 0) {
    checkoutBody.innerHTML = `<p class="empty-state">Your table is empty &mdash; add something before checking out!</p>`;
    return;
  }

  const wrap = document.createElement("div");
  wrap.className = "bill-card";
  wrap.innerHTML = `
    <div class="bill-total-row" style="margin-bottom:16px;"><span>Order Total</span><span>₹${cartFinalTotal()}</span></div>

    <div class="form-field">
      <label for="coName">Name</label>
      <input type="text" id="coName" placeholder="Your name">
      <div class="form-error" id="coNameError"></div>
    </div>
    <div class="form-field">
      <label for="coPhone">Phone</label>
      <input type="tel" id="coPhone" placeholder="10-digit phone number" inputmode="numeric">
      <div class="form-error" id="coPhoneError"></div>
    </div>
    <div class="form-field">
      <label for="coAddress">Address</label>
      <textarea id="coAddress" rows="3" placeholder="Delivery address"></textarea>
      <div class="form-error" id="coAddressError"></div>
    </div>

    <div class="form-field">
      <label>How would you like it?</label>
      <div class="option-row" id="coMode">
        <label class="option-pill"><input type="radio" name="coMode" value="Dine-in"> Dine-in</label>
        <label class="option-pill"><input type="radio" name="coMode" value="Takeaway"> Takeaway</label>
        <label class="option-pill"><input type="radio" name="coMode" value="Delivery" checked> Delivery</label>
      </div>
    </div>

    <div class="form-field">
      <label>Payment</label>
      <div class="option-row" id="coPayment">
        <label class="option-pill"><input type="radio" name="coPayment" value="Cash on delivery" checked> Cash</label>
        <label class="option-pill"><input type="radio" name="coPayment" value="UPI"> UPI</label>
        <label class="option-pill"><input type="radio" name="coPayment" value="Card"> Card</label>
      </div>
    </div>

    <button class="primary-btn" id="placeOrderBtn" type="button">Place Order</button>
  `;
  checkoutBody.appendChild(wrap);

  document.getElementById("placeOrderBtn").addEventListener("click", () => {
    const nameEl = document.getElementById("coName");
    const phoneEl = document.getElementById("coPhone");
    const addressEl = document.getElementById("coAddress");
    document.getElementById("coNameError").textContent = "";
    document.getElementById("coPhoneError").textContent = "";
    document.getElementById("coAddressError").textContent = "";

    let valid = true;
    const name = nameEl.value.trim();
    if (name === "") { document.getElementById("coNameError").textContent = "Please tell us your name."; valid = false; }
    const phone = phoneEl.value.trim();
    if (!/^\d{10}$/.test(phone)) { document.getElementById("coPhoneError").textContent = "Please enter exactly 10 digits."; valid = false; }
    const address = addressEl.value.trim();
    const mode = document.querySelector('input[name="coMode"]:checked').value;
    if (mode !== "Dine-in" && address === "") { document.getElementById("coAddressError").textContent = "Please add an address."; valid = false; }
    if (!valid) return;

    const payment = document.querySelector('input[name="coPayment"]:checked').value;
    const order = placeOrder({ name, phone, address, mode, payment });
    showGrazie(order);
  });
}

// ------------------------------------------------------------
// "Grazie!" confirmation
// ------------------------------------------------------------
const grazieOverlay = document.getElementById("grazieOverlay");
let lastPlacedOrderNumber = null;

function showGrazie(order) {
  lastPlacedOrderNumber = order.number;
  document.getElementById("grazieOrderNumber").textContent = "Order #" + order.number;
  grazieOverlay.classList.add("show");
}
document.getElementById("grazieViewOrderBtn").addEventListener("click", () => {
  grazieOverlay.classList.remove("show");
  goTo("orders");
});

// ------------------------------------------------------------
// Orders page + tracker
// ------------------------------------------------------------
const ordersBody = document.getElementById("ordersBody");

function buildTracker(status) {
  const currentIndex = Math.max(0, TRACKING_STEPS.indexOf(status));
  const isLastStep = currentIndex === TRACKING_STEPS.length - 1;
  const fillPercent = isLastStep ? 100 : ((currentIndex + 0.5) / TRACKING_STEPS.length) * 100;

  const wrap = document.createElement("div");
  wrap.className = "tracker";
  wrap.innerHTML = `
    <div class="tracker-line-bg"></div>
    <div class="tracker-line-fill" style="width:${fillPercent}%"></div>
    <div class="tracker-steps">
      ${TRACKING_STEPS.map((step, i) => {
        const done = i < currentIndex || (isLastStep && i === currentIndex);
        const current = i === currentIndex && !done;
        const cls = done ? "done" : current ? "current" : "";
        return `
          <div class="tracker-step ${cls}">
            <div class="tracker-dot">${done ? "✓" : i + 1}</div>
            <div class="tracker-label">${step}</div>
          </div>
        `;
      }).join("")}
    </div>
  `;
  return wrap;
}

function renderOrdersPage() {
  ordersBody.innerHTML = "";
  if (orders.length === 0) {
    ordersBody.innerHTML = `<p class="empty-state">You haven't placed any orders yet.</p>`;
    return;
  }
  orders.forEach((order) => {
    const card = document.createElement("div");
    card.className = "card order-card";
    card.innerHTML = `
      <div class="bill-row-top" style="margin-bottom:8px;">
        <span class="bill-row-name">Order #${order.number}</span>
        <span style="font-weight:700;">₹${order.total}</span>
      </div>
      <div style="color:var(--text-secondary); font-size:0.85rem; margin-bottom:10px;">
        ${new Date(order.time).toLocaleString()} &middot; ${order.mode || ""}
      </div>
    `;
    const list = document.createElement("ul");
    list.style.cssText = "list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:4px;";
    order.items.forEach((item) => {
      const li = document.createElement("li");
      li.style.cssText = "display:flex; justify-content:space-between; font-size:0.9rem;";
      li.innerHTML = `<span>${item.name} x ${item.qty}</span><span>₹${item.price * item.qty}</span>`;
      list.appendChild(li);
    });
    card.appendChild(list);
    card.appendChild(buildTracker(order.status));
    ordersBody.appendChild(card);
  });
}

// ------------------------------------------------------------
// Reservation + contact forms (demo, no backend)
// ------------------------------------------------------------
document.getElementById("reservationForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const nameEl = document.getElementById("resName");
  const dateEl = document.getElementById("resDate");
  const timeEl = document.getElementById("resTime");
  document.getElementById("resNameError").textContent = "";
  document.getElementById("resDateError").textContent = "";
  document.getElementById("resTimeError").textContent = "";
  document.getElementById("resSuccess").textContent = "";

  let valid = true;
  if (nameEl.value.trim() === "") { document.getElementById("resNameError").textContent = "Please tell us your name."; valid = false; }
  if (!dateEl.value) { document.getElementById("resDateError").textContent = "Please pick a date."; valid = false; }
  if (!timeEl.value) { document.getElementById("resTimeError").textContent = "Please pick a time."; valid = false; }
  if (!valid) return;

  document.getElementById("resSuccess").textContent = "Grazie! Your table request has been sent.";
  e.target.reset();
  document.getElementById("resGuests").value = 2;
});

document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("contactMsg");
  if (msgEl.value.trim() === "") return;
  document.getElementById("contactSuccess").textContent = "Grazie! We'll be in touch soon.";
  e.target.reset();
});

// ------------------------------------------------------------
// Routing
// ------------------------------------------------------------
const PAGES = ["home", "menu", "about", "gallery", "reservations", "contact", "cart", "checkout", "orders"];
let currentPage = "home";

function showPage(page) {
  currentPage = page;
  PAGES.forEach((p) => {
    document.getElementById("page-" + p).classList.toggle("active", p === page);
  });
  document.querySelectorAll(".site-nav a[data-page]").forEach((a) => {
    a.classList.toggle("active", a.dataset.page === page);
  });
  if (page === "menu") renderMenu();
  if (page === "cart") renderCartPage();
  if (page === "checkout") renderCheckoutPage();
  if (page === "orders") renderOrdersPage();
  window.scrollTo({ top: 0 });
}

function goTo(page) {
  window.location.hash = "#" + page;
}

function router() {
  const hash = window.location.hash.replace("#", "") || "home";
  const page = PAGES.includes(hash) ? hash : "home";
  showPage(page);
}

document.querySelectorAll('a[data-page]').forEach((a) => {
  a.addEventListener("click", (e) => {
    // Let the hash change happen natively; just make sure the nav
    // itself doesn't scroll sideways oddly on phones.
  });
});

window.addEventListener("hashchange", router);

// ------------------------------------------------------------
// Boot
// ------------------------------------------------------------
renderCartBar();
router();
