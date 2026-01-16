// ----- Data -----
const PRODUCTS = [
  {id:'armor1', name:'AREZ | ARMOR 0.1 ', note:'Polyester 87% Elastane 13%', price:369, img:'assets/Image/Compression_shirt/ARMOR01/01.jpg', category:'Compression Shirt'},
  {id:'helen-bra', name:'HELEN | Premium Bra', note:'Nylon 78% Elastane 12%', price:839, img:'assets/Image/Woman/HELEN/HELEN_BRA.jpg', category:'Woman'},
  {id:'helen-short', name:'HELEN | Premium Short', note:'Nylon 78% Elastane 12%', price:839, img:'assets/Image/Woman/HELEN/HELEN_SHORT.jpg', category:'Woman'},
  {id:'helen-set', name:'HELEN Set', note:'Nylon 78% Elastane 12%', price:1499, img:'assets/Image/Woman/HELEN/HELEN_SET.jpg', category:'Woman'},
  {id:'oversized-valor', name:'AREZ | VALOR', note:'Cotton 100% | 200 GSM', price:379, img:'assets/Image/Tshirt/VALOR/valor.jpg', category:'Oversized'},
  {id:'oversized-basic', name:'AREZ | BASIC TEE', note:'Cotton 100% | 200 GSM', price:279, img:'assets/Image/Tshirt/Basic/Basic.jpg', category:'Oversized'},
];

// ----- Helpers -----
const $ = sel => document.querySelector(sel);
const format = n => `฿${n.toLocaleString('th-TH')}`;

// Render product grid
const grid = $('#grid');
const tpl = $('#cardTpl');
function renderGrid(items){
  grid.innerHTML='';
  if(!items.length){
    grid.innerHTML = `<div class="card" style="grid-column: span 12; text-align:center; padding:24px">Product not found</div>`;
    return;
  }
  items.forEach(p=>{
    const node = tpl.content.cloneNode(true);
    node.querySelector('.title').textContent=p.name;
    node.querySelector('.muted').textContent=p.note;
    node.querySelector('.price').textContent=format(p.price);
    const thumb = node.querySelector('.thumb');
    thumb.innerHTML = `<img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">` +
      thumb.innerHTML;
    // Make card clickable with custom link for armor1 and helen-bra
    const card = node.querySelector('.card');
    card.style.cursor = 'pointer';
    if (p.id === 'armor1') {
      card.onclick = () => window.location.href = 'armor01.html';
    } else if (p.id === 'helen-bra') {
      card.onclick = () => window.location.href = 'helen_bra.html';
    }
      else if (p.id === 'helen-short') {
      card.onclick = () => window.location.href = 'helen_short.html';
    } 
      else if (p.id === 'helen-set') {
      card.onclick = () => window.location.href = 'helen_set.html';
    }
      else if (p.id === 'oversized-valor') {
      card.onclick = () => window.location.href = 'valor.html';
    }
      else if (p.id === 'oversized-basic') {
      card.onclick = () => window.location.href = 'basictee.html';
    }
    else {
      card.onclick = () => window.location.href = `product.html?id=${p.id}`;
    }
    grid.appendChild(node);
  });
}

function renderProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = PRODUCTS.find(p => p.id === id);

  if (!product) return;

  const container = document.getElementById("product-detail");
  if (container) {
    container.innerHTML = `
      <div class="card" style="max-width:500px;margin:auto;">
        <img src="${product.img}" alt="${product.name}" style="width:100%;border-radius:16px;">
        <h2>${product.name}</h2>
        <p>${product.note}</p>
        <p><strong>฿${product.price}</strong></p>
        <button class="btn full" onclick="addToCart('${product.id}')">Add to Cart</button>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderGridByCategory(PRODUCTS);
  renderProductDetail();
});


// Search
const q = $('#q');
const clearSearch = $('#clearSearch');
q.addEventListener('input',()=>{
  const term = q.value.trim().toLowerCase();
  renderGridByCategory(PRODUCTS.filter(p=> (p.name+p.note).toLowerCase().includes(term)));
  clearSearch.style.display = q.value ? '' : 'none';
});
clearSearch.addEventListener('click',()=>{
  q.value='';
  renderGridByCategory(PRODUCTS);
  q.focus();
  clearSearch.style.display = 'none';
});

// ----- Cart state -----
const CART_KEY = 'arez-min-store-cart-v1';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

function save() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCount();
  renderCart();
}

function addToCart(id, size) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  let item = cart.find(i => i.id === id && i.size === size);
  if (item) {
    item.qty += 1;
  } else {
    cart.push({ id, size, qty: 1 });
  }
  save();
  openDrawer();
}

// Update other cart functions to use array format
function removeFromCart(id, size) {
  cart = cart.filter(i => !(i.id === id && i.size === size));
  save();
}

function changeQty(id, size, delta) {
  let item = cart.find(i => i.id === id && i.size === size);
  if (item) {
    item.qty = Math.max(1, item.qty + delta);
    save();
  }
}

function cartItems() {
  return cart.map(i => ({
    ...PRODUCTS.find(p => p.id === i.id),
    size: i.size,
    qty: i.qty
  })).filter(Boolean);
}
function subtotal(){ return cartItems().reduce((s,i)=> s + i.price * i.qty, 0); }

// ----- Cart UI -----
const drawer = $('#drawer');
const itemsEl = $('#items');
const subtotalEl = $('#subtotal');
const grandEl = $('#grand');
const shippingEl = $('#shipping');
const SHIPPING = 60;

function renderCart(){
  const items = cartItems();
  itemsEl.innerHTML='';
  if(!items.length){
    itemsEl.innerHTML = `<div class="empty">Cart is empty</div>`;
  } else {
    items.forEach(p=>{
      const el = document.createElement('div');
      el.className='item';
      el.innerHTML = `
        <div class="thumb"></div>
        <div>
          <div style="font-weight:600">${p.name}</div>
          <div class="muted">${format(p.price)}</div>
          <div class="qty">
            <button class="btn" data-act="dec">−</button>
            <span>${p.qty}</span>
            <button class="btn" data-act="inc">+</button>
            <button class="btn" style="margin-left:auto" data-act="rm">Remove</button>
          </div>
        </div>
        <div><strong>${format(p.price*p.qty)}</strong></div>
      `;
      el.querySelector('[data-act="dec"]').onclick=()=>changeQty(p.id,-1);
      el.querySelector('[data-act="inc"]').onclick=()=>changeQty(p.id,1);
      el.querySelector('[data-act="rm"]').onclick=()=>removeFromCart(p.id);
      itemsEl.appendChild(el);
    });
  }
  const st = subtotal();
  subtotalEl.textContent = format(st);
  shippingEl.textContent = st>0 ? format(SHIPPING) : '฿0';
  grandEl.textContent = format(st + (st>0?SHIPPING:0));
}

// Cart count
function updateCount(){
  const count = Object.values(cart).reduce((s,n)=> s+n, 0);
  document.querySelectorAll('#cartCount').forEach(b=> b.textContent = count);
}

// Drawer controls
const openCartBtn = $('#openCart');
const fab = $('#fab');
const scrim = $('#closeDrawer');
const x = $('#x');

function openDrawer(){ drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); }
function closeDrawer(){ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); }

[openCartBtn, fab].forEach(b=> b.addEventListener('click', openDrawer));
[scrim, x].forEach(b=> b.addEventListener('click', closeDrawer));

// Checkout demo
$('#checkoutBtn').addEventListener('click', ()=>{
  const order = { items: cartItems(), subtotal: subtotal(), shipping: (subtotal()>0?SHIPPING:0) };
  alert('ตัวอย่างเท่านั้น!\n\n' + JSON.stringify(order, null, 2))});

function renderGridByCategory(products) {
  grid.innerHTML = '';
  const categories = [...new Set(products.map(p => p.category))];
  categories.forEach(cat => {
    const section = document.createElement('section');
    section.innerHTML = `<h2 style="margin:24px 0 12px;">${cat}</h2><div class="grid"></div>`;
    const gridEl = section.querySelector('.grid');
    products.filter(p => p.category === cat).forEach(p => {
      const node = tpl.content.cloneNode(true);
      node.querySelector('.title').textContent = p.name;
      node.querySelector('.muted').textContent = p.note;
      node.querySelector('.price').textContent = format(p.price);
      const thumb = node.querySelector('.thumb');
      thumb.innerHTML = `<img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">` +
        thumb.innerHTML;
      const card = node.querySelector('.card');
      card.style.cursor = 'pointer';
      if (p.id === 'armor1') {
        card.onclick = () => window.location.href = 'armor01.html';
      } else if (p.id === 'helen-bra') {
        card.onclick = () => window.location.href = 'helen_bra.html';
      } else if (p.id === 'helen-short') {
        card.onclick = () => window.location.href = 'helen_short.html';
      } else if (p.id === 'helen-set') {
        card.onclick = () => window.location.href = 'helen_set.html';
      } else if (p.id === 'oversized-valor') {
        card.onclick = () => window.location.href = 'valor.html';
      } else if (p.id === 'oversized-basic') {
        card.onclick = () => window.location.href = 'basictee.html';
      } else {
        card.onclick = () => window.location.href = `product.html?id=${p.id}`;
      }
      gridEl.appendChild(node);
    });
    grid.appendChild(section);
  });
}

function renderCategoryGrids(products) {
  // Clear each grid
  document.getElementById('compression-grid').innerHTML = '';
  document.getElementById('woman-grid').innerHTML = '';
  document.getElementById('oversized-grid').innerHTML = '';

  products.forEach(p => {
    let gridId = '';
    if (p.category === 'Compression Shirt') gridId = 'compression-grid';
    else if (p.category === 'Woman') gridId = 'woman-grid';
    else if (p.category === 'Oversized') gridId = 'oversized-grid';
    if (!gridId) return;

    const node = tpl.content.cloneNode(true);
    node.querySelector('.title').textContent = p.name;
    node.querySelector('.muted').textContent = p.note;
    node.querySelector('.price').textContent = format(p.price);
    const thumb = node.querySelector('.thumb');
    thumb.innerHTML = `<img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">` +
      thumb.innerHTML;
    const card = node.querySelector('.card');
    card.style.cursor = 'pointer';
    // Custom links
    if (p.id === 'armor1') {
      card.onclick = () => window.location.href = 'armor01.html';
    } else if (p.id === 'helen-bra') {
      card.onclick = () => window.location.href = 'helen_bra.html';
    } else if (p.id === 'helen-short') {
      card.onclick = () => window.location.href = 'helen_short.html';
    } else if (p.id === 'helen-set') {
      card.onclick = () => window.location.href = 'helen_set.html';
    } else if (p.id === 'oversized-valor') {
      card.onclick = () => window.location.href = 'valor.html';
    } else if (p.id === 'oversized-basic') {
      card.onclick = () => window.location.href = 'basictee.html';
    } else {
      card.onclick = () => window.location.href = `product.html?id=${p.id}`;
    }
    document.getElementById(gridId).appendChild(node);
  });
}

// Call this on page load
document.addEventListener("DOMContentLoaded", () => {
  renderCategoryGrids(PRODUCTS);
});

// Add this script block before </body> or in script.js
function addArmorToCart(size) {
  addToCart('armor1', size);
}

function addToCart(id, size) {
  // Find product
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  // Example cart logic (extend as needed)
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  // Check if same product and size already in cart
  let item = cart.find(i => i.id === id && i.size === size);
  if (item) {
    item.qty += 1;
  } else {
    cart.push({ id, size, qty: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  // Optionally update cart UI
}

