'use strict';
const PRODUCTS=[
  {id:1,name:'AirPods Pro 2',price:'',rawPrice:0,image:'images/airpods.png',bgLabel:'AIRPODS PRO 2',scale:1,offsetX:0,offsetY:0},
  {id:2,name:'AirPods 4',price:'',rawPrice:0,image:'images/airpods4.png',bgLabel:'AIRPODS 4',scale:0.8,offsetX:0,offsetY:0},
  {id:3,name:'AirPods Max',price:'',rawPrice:0,image:'images/airpodsmax.png',bgLabel:'AIRPODS MAX',scale:1.4,offsetX:50,offsetY:-20},
];
const PRICE_TIERS={
  'apple-watch-ultra-3':[{qty:1,price:29990},{qty:3,price:27990},{qty:5,price:25990},{qty:10,price:23990}],
  'apple-watch-serie-10':[{qty:1,price:29990},{qty:3,price:27990},{qty:5,price:25990},{qty:10,price:23990}],
  'apple-watch-black-ultra-2':[{qty:1,price:29990},{qty:3,price:27990},{qty:5,price:25990},{qty:10,price:23990}],
  'airpods-4ta-generación':[{qty:1,price:15000},{qty:3,price:13500},{qty:5,price:12500},{qty:10,price:11500}],
  'airpods-pro-2':[{qty:1,price:14000},{qty:3,price:12500},{qty:5,price:11500},{qty:10,price:10500}],
  'airpods-3ra-generación':[{qty:1,price:14000},{qty:3,price:12500},{qty:5,price:11500},{qty:10,price:10500}],
  'batería-magsafe':[{qty:1,price:13000},{qty:3,price:11500},{qty:5,price:10500},{qty:10,price:9500}],
  'max-magnéticos':[{qty:1,price:26990},{qty:3,price:24990},{qty:5,price:22990},{qty:10,price:20990}],
  'cargador-lightning-completo':[{qty:1,price:5000},{qty:3,price:4500},{qty:5,price:4000},{qty:10,price:3500}],
  'cargador-tipo-c-completo':[{qty:1,price:5000},{qty:3,price:4500},{qty:5,price:4000},{qty:10,price:3500}],
  'cargador-samsung-45w':[{qty:1,price:6000},{qty:3,price:5500},{qty:5,price:5000},{qty:10,price:4500}],
};

/* === GOOGLE SHEET INTEGRATION START === */
// URL pública del CSV (ya publicado en Google Sheets)
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTuuegzIC4CQl_Q9BPSpESwrNTBTBdKgMhlfz0Q1S0e-bPMpC_UzCeLod_dCc0e3BBUSV4ooyaQu72M/pub?output=csv';

// ---------- utilidades ----------
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[áä]/g, 'a')
    .replace(/[éë]/g, 'e')
    .replace(/[íï]/g, 'i')
    .replace(/[óö]/g, 'o')
    .replace(/[úü]/g, 'u')
    .replace(/[^a-z0-9-]/g, '');
}

// CSV → array de filas → cada fila → array de celdas
function parseCSV(text) {
  // Split on commas that are NOT inside double quotes.
  // This handles values like "$30,000" that contain commas.
  return text
    .trim()
    .split('\n')
    .map(row => {
      const cells = row.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map(c => c.replace(/^"|"$/g, '').trim());
      return cells;
    });
}

/* ---------- sincronizar hoja con la app ---------- */
function fmt(n){
  return '$' + n.toLocaleString('es-CL');
}
async function syncSheetToConfig() {
  console.info('🔄 Syncing Google Sheet...');
  try {
    const res = await fetch(SHEET_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const txt  = await res.text();
    const rows = parseCSV(txt);
      console.info(`✅ Parsed ${rows.length} rows from Google Sheet`);

    const DATA_START = 3; // fila 4 del sheet (índice 3)
    const sheetProducts = [];

    for (let i = DATA_START; i < rows.length - 1; i += 2) {
      const actRow   = rows[i];     // id, nombre, stock, Si/No por tramo
      const priceRow = rows[i + 1]; // precios por tramo

      // The CSV has an initial empty column, so shift indices by 1
      const rawId = actRow[1] ?? '';
      const name  = actRow[2] ?? '';
      const stock = (actRow[3] ?? '').toLowerCase().startsWith('s');

      // Derive a consistent product key. Prefer the explicit ID from the sheet; if missing, generate one from the name.
      const id = rawId && rawId.trim() !== '' ? rawId : name.toLowerCase().replace(/\s+/g, '-');

      if (!id) continue; // fin de la hoja

      const tiers = [];
      // price columns start at index 4 (1 UN) up to 13 (10 UN)
      for (let col = 4; col <= 13; col++) {
        const active   = (actRow[col] ?? '').toLowerCase().startsWith('s');
        const rawPrice = priceRow[col] ?? '';
        const price    = parseInt(rawPrice.replace(/[^0-9]/g, ''), 10) || 0;
        const qty      = col - 3; // 4→1UN, 5→2UN … 13→10UN
        if (active && price > 0) tiers.push({ qty, price });
      }

      // si nadie está activo, al menos tomamos el precio de 1 UN
      if (!tiers.length && priceRow[4]) {
        const price = parseInt(priceRow[4].replace(/[^0-9]/g, ''), 10);
        tiers.push({ qty: 1, price });
      }

      sheetProducts.push({ id, name, stock, tiers });
    }

    // ---- aplicar a las estructuras globales ----
      console.info(`📊 Processing ${sheetProducts.length} products from sheet`);
    sheetProducts.forEach(({ id, stock, tiers }) => {
      // sobrescribimos los precios por tier (usado por el modal)
      PRICE_TIERS[id] = tiers;

      // buscamos la(s) tarjeta(s) del producto tanto en el catálogo como en el carrusel
      const selectors = [
        `.product-card[data-id="${id}"]`,
        `.csl-slide[data-id="${id}"]`,
        `.card[data-id="${id}"]`
      ];
      const cards = document.querySelectorAll(selectors.join(','));

      cards.forEach(card => {
        // actualizar precio unitario en la tarjeta (y slide) y atributo data-price
        const priceOne = tiers.find(t => t.qty === 1);
        if (priceOne) {
          const formatted = fmt(priceOne.price);
          const priceEl = card.querySelector('.card-price') || card.querySelector('.csl-price');
          if (priceEl) priceEl.textContent = formatted;
          // actualiza atributo data-price para que populate lo use
          card.dataset.price = priceOne.price;
        }
        if (!stock) {
          card.classList.add('out-of-stock');
          card.setAttribute('aria-disabled', 'true');
        } else {
          card.classList.remove('out-of-stock');
          card.removeAttribute('aria-disabled');
        }
      });
    });

  // ==== Actualizar precios en la lista de productos (hero) ====
sheetProducts.forEach(({ name, tiers }) => {
  const priceOne = tiers.find(t => t.qty === 1);
  if (priceOne) {
    const prod = PRODUCTS.find(p => p.name === name);
    if (prod) {
      prod.price = fmt(priceOne.price);
      prod.rawPrice = priceOne.price;
      // Si el héroe está mostrando este producto, actualizar su UI
      if (DOM.productPrice && PRODUCTS[state.current] && PRODUCTS[state.current].name === name) {
        DOM.productPrice.textContent = fmt(priceOne.price);
        // opcional: actualizar atributo data-price en la imagen si se usa
        DOM.productImg.dataset.price = priceOne.price;
      }
    }
  }
});
        console.info('✅ syncSheetToConfig completed');
      document.body.classList.add('sheet-ready');
  } catch (err) {
    console.error('❗ No se pudo cargar la hoja de precios/stock:', err);
  }
}

/* === GOOGLE SHEET INTEGRATION END === */

const FEATURES={
  'airpods-pro-2':['Cancelación activa de ruido','Audio espacial personalizado','Hasta 30 horas de batería','Resistencia al agua IPX4'],
  'airpods-4ta-generación':['Audio adaptativo','Cancelación activa de ruido','Diseño rediseñado','Hasta 30 horas con estuche'],
  'airpods-3ra-generación':['Audio espacial','Resistencia al agua IPX4','Carga MagSafe','Hasta 30 horas con estuche'],
  'apple-watch-ultra-3':['Caja de titanio aeroespacial','Pantalla Always-On 49mm','Hasta 60 horas de batería','GPS de doble frecuencia'],
  'apple-watch-serie-10':['Pantalla OLED más grande','Detección de apnea del sueño','Carga rápida','Diseño más delgado'],
  'apple-watch-black-ultra-2':['Acabado negro carbón','Titanio negro premium','Cristal de zafiro','Hasta 60 horas de batería'],
  'batería-magsafe':['Carga magnética MagSafe','Compacta y liviana','Compatible iPhone 12 en adelante','Sin cables'],
  'max-magnéticos':['Compatibles con MagSafe','Fijación magnética perfecta','Carga inalámbrica optimizada','Múltiples colores'],
  'cargador-lightning-completo':['Cable Lightning incluido','Adaptador de corriente','Compatible iPhone/iPad/AirPods','Carga rápida'],
  'cargador-tipo-c-completo':['Cable USB-C incluido','Compatible iPhone 15+','iPad Pro y MacBook','Carga rápida 20W'],
  'cargador-samsung-45w':['Carga ultra rápida 45W','Compatible línea Galaxy','Cable USB-C incluido','Carga completa en ~1 hora'],
};
const SLIDE_KEY_MAP={
  'airpods-4': 'airpods-4ta-generación',
  'airpods-max': 'max-magnéticos',
  'airpods-3': 'airpods-3ra-generación'
};
const PRODUCT_CONFIG={
  1:{fontSize:'22vw',productScale:1.1,productY:-15,blobYRatio:0.88,blobSpeed:0.030},
  2:{fontSize:'28vw',productScale:1.1,productY:-10,blobYRatio:0.88,blobSpeed:0.030},
  3:{fontSize:'24vw',productScale:1.1,productY:-20,blobYRatio:0.90,blobSpeed:0.030},
};
const state={current:0,isTransitioning:false,cart:[]};
const DOM={
  productImg:document.getElementById('productImg'),productWrap:document.getElementById('productWrap'),
  bgText:document.getElementById('bgText'),bgTextBlue:document.getElementById('bgTextBlue'),
  bgTextZoom:document.getElementById('bgTextZoom'),bgTextBlueWrap:document.getElementById('bgTextBlueWrap'),
  bgTextPerspective:document.querySelector('.bg-text-perspective'),priceBlock:document.querySelector('.price-block'),
  productPrice:document.getElementById('productPrice'),prevBtn:document.getElementById('prevBtn'),
  nextBtn:document.getElementById('nextBtn'),dotsWrap:document.getElementById('dots'),
  addToCart:document.getElementById('addToCart'),cartDrawer:document.getElementById('cartDrawer'),
  cartOverlay:document.getElementById('cartOverlay'),cartItems:document.getElementById('cartItems'),
  cartFooter:document.getElementById('cartFooter'),cartTotal:document.getElementById('cartTotal'),
  cartCount:document.getElementById('cartCount'),closeCart:document.getElementById('closeCart'),
  cartTrigger:document.querySelector('.cart-trigger'),
};

const ProductNav=(()=>{
  let floatTween=null;
  function applyWrapVars(p){
    DOM.productWrap.style.setProperty('--product-scale',p.scale??1);
    DOM.productWrap.style.setProperty('--product-x',(p.offsetX??0)+'px');
    DOM.productWrap.style.setProperty('--product-y',(p.offsetY??0)+'px');
    if(window.innerWidth<=768){const cfg=PRODUCT_CONFIG[p.id];if(cfg){[DOM.bgText,DOM.bgTextBlue,DOM.bgTextZoom].forEach(el=>{if(el)el.style.setProperty('--hero-text-size',cfg.fontSize)});DOM.productWrap.style.setProperty('--product-scale',cfg.productScale);DOM.productWrap.style.setProperty('--product-y',cfg.productY+'px');}}
  }
  function buildDots(){DOM.dotsWrap.innerHTML='';PRODUCTS.forEach((_,i)=>{const d=document.createElement('button');d.className='dot'+(i===state.current?' active':'');d.setAttribute('role','tab');d.setAttribute('aria-label',`Producto ${i+1}`);d.addEventListener('click',()=>goTo(i));DOM.dotsWrap.appendChild(d);});}
  function updateDots(){DOM.dotsWrap.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active',i===state.current));}
  function startFloat(){if(floatTween)floatTween.kill();const s=document.querySelector('.product-stage');floatTween=gsap.to(s,{y:-14,duration:2.5,ease:'sine.inOut',repeat:-1,yoyo:true});}
  function stopFloat(){if(floatTween){floatTween.kill();floatTween=null;}gsap.set(document.querySelector('.product-stage'),{y:0});}
  function goTo(index,direction='next'){
    if(state.isTransitioning||index===state.current)return;
    state.isTransitioning=true;
    const product=PRODUCTS[index],stage=document.querySelector('.product-stage'),priceEl=document.getElementById('priceInner');
    const imgSign=direction==='next'?1:-1,textSign=direction==='next'?-1:1;
    new Image().src=product.image; stopFloat();
    gsap.to(stage,{x:70*imgSign,opacity:0,duration:0.32,ease:'power2.inOut'});
    gsap.to(DOM.bgTextPerspective,{x:70*textSign,opacity:0,duration:0.32,ease:'power2.inOut'});
    if(priceEl)gsap.to(priceEl,{y:'-110%',opacity:0,duration:0.24,ease:'power2.in'});
    gsap.delayedCall(0.32,()=>{
      state.current=index; applyWrapVars(product);
      DOM.bgText.textContent=DOM.bgTextBlue.textContent=DOM.bgTextZoom.textContent=product.bgLabel;
      DOM.productPrice.textContent=product.price; updateDots();
      gsap.set(stage,{x:-70*imgSign,opacity:0}); gsap.set(DOM.bgTextPerspective,{x:-70*textSign,opacity:0});
      if(priceEl)gsap.set(priceEl,{y:'110%',opacity:1});
      function runEntrance(){
        gsap.to(stage,{x:0,opacity:1,duration:0.44,ease:'power2.out',onComplete(){startFloat();state.isTransitioning=false;if(window.innerWidth<=768&&typeof MaskReveal!=='undefined')MaskReveal.refreshMobile();}});
        gsap.to(DOM.bgTextPerspective,{x:0,opacity:1,duration:0.44,ease:'power2.out'});
        if(priceEl)gsap.to(priceEl,{y:'0%',duration:0.36,ease:'power2.out',delay:0.06});
      }
      const img=DOM.productImg; img.onload=()=>{img.onload=null;runEntrance();};
      img.src=product.image; if(img.complete){img.onload=null;runEntrance();}
    });
  }
  function init(){
    buildDots();
    DOM.nextBtn.addEventListener('click',()=>goTo((state.current+1)%PRODUCTS.length,'next'));
    DOM.prevBtn.addEventListener('click',()=>goTo((state.current-1+PRODUCTS.length)%PRODUCTS.length,'prev'));
    let tsx=0;
    document.addEventListener('touchstart',e=>{tsx=e.touches[0].clientX;},{passive:true});
    document.addEventListener('touchend',e=>{const d=tsx-e.changedTouches[0].clientX;if(Math.abs(d)>50)d>0?goTo((state.current+1)%PRODUCTS.length,'next'):goTo((state.current-1+PRODUCTS.length)%PRODUCTS.length,'prev');});
    document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')goTo((state.current+1)%PRODUCTS.length,'next');if(e.key==='ArrowLeft')goTo((state.current-1+PRODUCTS.length)%PRODUCTS.length,'prev');});
    applyWrapVars(PRODUCTS[0]); startFloat();
  }
  return{init};
})();

const Cart=(()=>{
  let isOpen=false;
  function open(){
    if(isOpen)return;isOpen=true;
    DOM.cartDrawer.style.display='flex';DOM.cartDrawer.style.position='fixed';DOM.cartDrawer.style.top='0';DOM.cartDrawer.style.right='0';DOM.cartDrawer.style.height='100%';DOM.cartDrawer.style.zIndex='9999';DOM.cartDrawer.style.visibility='visible';
    void DOM.cartDrawer.offsetHeight;
    document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden';
    DOM.cartOverlay.classList.add('visible');
    gsap.to(DOM.cartOverlay,{opacity:1,duration:0.4,ease:'power2.out'});
    gsap.fromTo(DOM.cartDrawer,{x:'100%'},{x:'0%',duration:0.6,ease:'power4.out'});
    const items=DOM.cartItems.querySelectorAll('.cart-item');
    if(items.length)gsap.fromTo(items,{opacity:0,x:30},{opacity:1,x:0,duration:0.4,stagger:0.07,ease:'power3.out',delay:0.25});
  }
  function close(){
    if(!isOpen)return;
    gsap.to(DOM.cartOverlay,{opacity:0,duration:0.35,ease:'power2.in',onComplete:()=>DOM.cartOverlay.classList.remove('visible')});
    gsap.to(DOM.cartDrawer,{x:'100%',duration:0.45,ease:'power4.in',onComplete:()=>{isOpen=false;DOM.cartDrawer.style.zIndex='';DOM.cartDrawer.style.visibility='';DOM.cartDrawer.style.display='';document.body.style.overflow='';document.documentElement.style.overflow='';}});
  }
  function addItem(product){const ex=state.cart.find(i=>i.product.id===product.id);if(ex)ex.qty++;else state.cart.push({product,qty:1});render();updateBadge();}
  function removeItem(id){state.cart=state.cart.filter(i=>i.product.id!==id);render();updateBadge();}
  function changeQty(id,delta){const item=state.cart.find(i=>i.product.id===id);if(!item)return;item.qty=Math.max(0,item.qty+delta);if(item.qty===0)removeItem(id);else{render();updateBadge();const el=DOM.cartItems.querySelector(`.cart-item[data-id="${id}"] .cart-item-qty span`);if(el)gsap.fromTo(el,{scale:1.45,opacity:.5},{scale:1,opacity:1,duration:.25,ease:'back.out(2)'});}}
  function updateBadge(){const t=state.cart.reduce((s,i)=>s+i.qty,0);DOM.cartCount.textContent=t;DOM.cartCount.classList.toggle('visible',t>0);}
  const fmt=n=>'$'+n.toLocaleString('es-CL');
  function render(){
    if(!state.cart.length){DOM.cartItems.innerHTML='<p class="cart-empty">Tu carrito está vacío</p>';DOM.cartFooter.style.display='none';return;}
    DOM.cartFooter.style.display='block';
    DOM.cartTotal.textContent=fmt(state.cart.reduce((s,i)=>s+i.product.rawPrice*i.qty,0));
    DOM.cartItems.innerHTML=state.cart.map(({product,qty})=>`<div class="cart-item" data-id="${product.id}"><img class="cart-item-img" src="${product.image||''}" alt="${product.name}"><div class="cart-item-info"><p class="cart-item-name">${product.name}</p><p class="cart-item-price">${fmt(product.rawPrice)}</p></div><div class="cart-item-qty"><button class="qty-btn" data-id="${product.id}" data-delta="-1">−</button><span>${qty}</span><button class="qty-btn" data-id="${product.id}" data-delta="1">+</button></div></div>`).join('');
    DOM.cartItems.querySelectorAll('.qty-btn').forEach(btn=>btn.addEventListener('click',()=>changeQty(Number(btn.dataset.id),Number(btn.dataset.delta))));
    const fi=DOM.cartItems.querySelector('.cart-item');if(fi)gsap.fromTo(fi,{opacity:0,x:24},{opacity:1,x:0,duration:0.4,ease:'power3.out'});
  }
  async function openMercadoPago(){
    if(!state.cart.length)return;
    const btn=document.getElementById('mpBtn');if(btn){btn.textContent='Procesando...';btn.disabled=true;}
    try{const res=await fetch('/api/create-preference',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:state.cart.map(({product,qty})=>({name:product.name,qty,price:product.rawPrice}))})});const data=await res.json();if(data.init_point)window.location.href=data.init_point;else throw new Error();}
    catch{if(btn){btn.textContent='Error, intenta de nuevo';btn.disabled=false;}setTimeout(()=>{if(btn){btn.innerHTML=`<svg style="width:18px;height:18px;fill:currentColor;vertical-align:middle;margin-right:8px" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>Pagar con Mercado Pago`;btn.disabled=false;}},2500);}
  }
  function openWhatsApp(){
    if(!state.cart.length)return;
    const f=n=>'$'+n.toLocaleString('es-CL');
    const lines=state.cart.map(({product,qty})=>`\u25b8 ${qty}x ${product.name}\n  ${f(product.rawPrice)} c/u = *${f(product.rawPrice*qty)}*`);
    const total=state.cart.reduce((s,i)=>s+i.product.rawPrice*i.qty,0);
    const msg=['*\u00a1Hola!* Me interesa hacer un pedido:','',...lines,'',`Total: *${f(total)}*`,'','\u00bfTienen stock disponible?'].join('\n');
    window.open(`https://wa.me/56942348587?text=${encodeURIComponent(msg)}`,'_blank');
  }
  function init(){
    document.body.appendChild(DOM.cartDrawer);document.body.appendChild(DOM.cartOverlay);
    DOM.cartTrigger.addEventListener('click',open);DOM.closeCart.addEventListener('click',close);DOM.cartOverlay.addEventListener('click',close);
    document.getElementById('checkoutBtn')?.addEventListener('click',openWhatsApp);
    document.getElementById('mpBtn')?.addEventListener('click',openMercadoPago);
  }
  return{init,addItem,open,close};
})();

const CartButton=(()=>{
  let timer=null;
  function trigger(){const btn=DOM.addToCart;if(btn.classList.contains('added'))return;Cart.addItem(PRODUCTS[state.current]);btn.classList.add('added');const r=document.createElement('span');r.style.cssText='position:absolute;border-radius:50%;width:10px;height:10px;background:rgba(0,0,0,.08);transform:scale(0);animation:rippleOut .5s ease-out forwards;top:50%;left:50%;margin:-5px 0 0 -5px;pointer-events:none;';btn.appendChild(r);setTimeout(()=>r.remove(),600);clearTimeout(timer);timer=setTimeout(()=>btn.classList.remove('added'),2200);}
  function init(){DOM.addToCart.addEventListener('click',trigger);const s=document.createElement('style');s.textContent='@keyframes rippleOut{to{transform:scale(28);opacity:0}}';document.head.appendChild(s);}
  return{init};
})();

const MaskReveal=(()=>{
  const N=64,RX_DESK=220,RY_DESK=115,RX_MOB=120,RY_MOB=38,AMP_MOB=0.45;
  const isMob=()=>window.innerWidth<=768,rand=()=>Math.random()*Math.PI*2;
  const MODES=[{k:2,amp:46,spd:0.7,ph:rand()},{k:3,amp:30,spd:1.5,ph:rand()},{k:4,amp:20,spd:-0.9,ph:rand()},{k:5,amp:14,spd:2.3,ph:rand()},{k:7,amp:8,spd:-2.0,ph:rand()},{k:1,amp:16,spd:1.2,ph:rand()}];
  const VM=[{k:1,amp:20,spd:1.7,ph:rand()},{k:2,amp:12,spd:2.5,ph:rand()},{k:3,amp:7,spd:0.9,ph:rand()}];
  let rafId=null,mx=0,my=0,bx=0,by=0,inside=false,scale=0,wr=null,started=false,rt=null;
  const cacheRect=()=>{wr=DOM.bgTextBlueWrap.getBoundingClientRect();};
  function getMC(){if(!wr)cacheRect();const cur=PRODUCTS[state.current],cfg=cur?PRODUCT_CONFIG[cur.id]:null,ratio=cfg?cfg.blobYRatio:0.88;return{x:wr.left+wr.width*.5,y:wr.top+wr.height*ratio};}
  function getLerp(){if(!isMob())return 0.055;const cur=PRODUCTS[state.current],cfg=cur?PRODUCT_CONFIG[cur.id]:null;return cfg?cfg.blobSpeed:0.025;}
  function poly(cx,cy,t){const RX=isMob()?RX_MOB:RX_DESK,RY=isMob()?RY_MOB:RY_DESK,amp=isMob()?AMP_MOB:1,pts=[];for(let i=0;i<N;i++){const a=(i/N)*Math.PI*2;let dr=0;for(const m of MODES)dr+=m.amp*amp*Math.sin(m.k*a+m.spd*t+m.ph);let dv=0;for(const m of VM)dv+=m.amp*amp*Math.sin(m.k*a+m.spd*t+m.ph);const rx=(RX+dr)*scale,ry=(RY+dr*.38)*scale;pts.push(`${(cx+rx*Math.cos(a)).toFixed(1)}px ${(cy+ry*Math.sin(a)+dv*scale).toFixed(1)}px`);}return`polygon(${pts.join(',')})`;}
  function animate(ts){const t=ts*.001,lerp=getLerp();scale+=((inside?1:0)-scale)*(inside?.10:.08);if(!inside&&scale<.004){scale=0;DOM.bgTextBlueWrap.style.clipPath='polygon(0px 0px,0px 0px,0px 0px)';rafId=null;return;}if(!started){bx=mx;by=my;started=true;}bx+=(mx-bx)*lerp;by+=(my-by)*lerp;DOM.bgTextBlueWrap.style.clipPath=poly(bx-wr.left,by-wr.top,t);rafId=requestAnimationFrame(animate);}
  const startLoop=()=>{if(!rafId)rafId=requestAnimationFrame(animate);};
  function refreshMobile(){if(!isMob())return;cacheRect();if(!inside){inside=true;started=false;}const c=getMC();mx=c.x;my=c.y;startLoop();}
  function init(){
    document.fonts.ready.then(()=>{cacheRect();if(isMob()){const c=getMC();mx=c.x;my=c.y;bx=c.x;by=c.y;inside=true;started=true;startLoop();}});
    window.addEventListener('resize',()=>{cacheRect();if(isMob()&&!inside)refreshMobile();},{passive:true});
    const hero=document.getElementById('hero');
    hero.addEventListener('mousemove',e=>{if(isMob())return;if(!wr)cacheRect();mx=e.clientX;my=e.clientY;inside=true;startLoop();});
    hero.addEventListener('mouseleave',()=>{if(isMob())return;inside=false;started=false;startLoop();});
    hero.addEventListener('touchstart',e=>{if(!isMob())return;if(!wr)cacheRect();clearTimeout(rt);mx=e.touches[0].clientX;my=e.touches[0].clientY;},{passive:true});
    hero.addEventListener('touchend',()=>{if(!isMob())return;clearTimeout(rt);rt=setTimeout(()=>{const c=getMC();mx=c.x;my=c.y;},1500);},{passive:true});
  }
  return{init,refreshMobile};
})();

/* ═══════════════════════════════════════════════════════════════
   PRODUCT MODAL — Container Transform (v3 — ghost-free)

   card-container → la CAJA se expande/compacta (puede distorsionar)
   product-hero   → el PNG vuela SIN distorsión (object-fit:contain)

   FIX 1 — Ghost PNG en cierre:
   • ppageImgEl.style.opacity='0' DENTRO del callback (antes del
     snapshot "new"), así el browser nunca ve el PNG del modal
     solapado con el PNG de la card en el último frame.
   • VT names se limpian en vt.finished Y en el callback mismo.

   FIX 2 — UI sync:
   • ppage-info arranca opacity:0 pero el fade-in GSAP empieza
     inmediatamente después de que el startViewTransition retorna
     (simultáneo con el vuelo), no después de vt.finished.
   • Duración 0.30s — llega a 1 cuando el PNG está en posición.

   FIX 3 — Handover refinado en cierre:
   • cardImg.src se actualiza ANTES del VT (en la img ya decodificada).
   • card.style.visibility='' antes de que el browser tome el
     snapshot "new", garantizando que sea visible desde frame 0.
═══════════════════════════════════════════════════════════════ */
const ProductModal=(()=>{
  let isOpen=false,originCard=null,originRect=null,qty=1,tiers=[],currentProduct=null,tiersOpen=false;
  let imgIndex=0,imgList=[],isTemp=false,openingImage='',isAnimImg=false;
  const ppage=document.getElementById('ppage'),overlay=document.getElementById('ppageOverlay'),backBtn=document.getElementById('ppageBack');
  const fmt=n=>'$'+Number(n).toLocaleString('es-CL');
  const getCardImg=c=>c?.querySelector('.card-img-wrap img')||c?.querySelector('.csl-img img')||null;
  const lockScroll=()=>{document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';};
  const unlockScroll=()=>{document.documentElement.style.overflow='';document.body.style.overflow='';};

  /* Limpieza total de VT names — llamar SIEMPRE después de vt.finished */
  function cleanAllVT(card){
    const ci=getCardImg(card),pi=document.getElementById('ppageImg');
    if(card){card.style.viewTransitionName='';card.style.visibility='';}
    if(ci){ci.style.viewTransitionName='';ci.style.transition='';}
    ppage.style.viewTransitionName='';
    if(pi){pi.style.viewTransitionName='';pi.style.transition='';pi.style.opacity='';}
  }

  const PRODUCT_IMAGES={'apple-watch-ultra-3':'images/apple-watch-ultra-3.png','apple-watch-serie-10':'images/serie-10.png','apple-watch-black-ultra-2':'images/black-ultra-2.png','airpods-4ta-generacion':'images/airpods-4gen.png','airpods-pro-2':'images/airpods-pro-2.png','airpods-3ra-generacion':'images/airpods-3gen.png','bateria-magsafe':'images/bateria-magsafe.png','max-magneticos':'images/max-magneticos.png','cargador-lightning-completo':'images/cargador-lightning.png','cargador-tipo-c-completo':'images/cargador-tipo-c.png','cargador-samsung-45w':'images/cargador-samsung-45w.png'};
  const slug=n=>n.toLowerCase().replace(/\s+/g,'-').replace(/[áä]/g,'a').replace(/[éë]/g,'e').replace(/[íï]/g,'i').replace(/[óö]/g,'o').replace(/[úü]/g,'u').replace(/[^a-z0-9-]/g,'');
  const TWO=['bateria-magsafe','cargador-lightning-completo','cargador-tipo-c-completo','cargador-samsung-45w'];
  const buildImgList=(src,key)=>{const s=slug(key),v1=PRODUCT_IMAGES[s]||src;return TWO.includes(s)?[v1,`images/${s}-v2.png`]:[v1,`images/${s}-v2.png`,`images/${s}-v3.png`];};
  const IMG_SCALES={'apple-watch-ultra-3':[1,1,1],'apple-watch-serie-10':[1,1,.75],'apple-watch-black-ultra-2':[1,.75,.75],'airpods-4ta-generacion':[1,1,1.3],'airpods-pro-2':[1,1,1],'airpods-3ra-generacion':[1,1,1],'bateria-magsafe':[1,1,1],'max-magneticos':[1,1,1],'cargador-lightning-completo':[1,1.4,1],'cargador-tipo-c-completo':[1,1,1],'cargador-samsung-45w':[1,1,1]};

  function renderDots(){const w=document.getElementById('ppageImgDots');if(!w)return;w.innerHTML=imgList.map((_,i)=>`<div class="ppage-img-dot${i===imgIndex?' active':''}"></div>`).join('');w.querySelectorAll('.ppage-img-dot').forEach((d,i)=>d.addEventListener('click',()=>goToImg(i)));}
  function updateArrow(){const b=document.getElementById('ppageImgNext');if(b)b.classList.toggle('hidden',isTemp||imgIndex>=imgList.length-1);}
  function renderTempThumbs(){const w=document.getElementById('ppageThumbs');if(!w)return;w.innerHTML='';imgList.forEach((src,i)=>{const t=document.createElement('div');t.className='ppage-thumb';t.dataset.index=i;t.innerHTML=`<img src="${src}" alt="">`;gsap.set(t,{opacity:0,y:20,scale:.8});w.appendChild(t);gsap.to(t,{opacity:1,y:0,scale:1,duration:.35,delay:i*.06,ease:'back.out(1.5)'});t.addEventListener('click',()=>activateFromTemp(i));});}
  function activateFromTemp(ni){isTemp=false;const ie=document.getElementById('ppageImg'),iw=document.getElementById('ppageImgWrap'),w=document.getElementById('ppageThumbs');w.innerHTML='';for(let i=0;i<ni;i++)addThumb(imgList[i],i);imgIndex=ni;gsap.to(iw,{opacity:0,scale:.88,duration:.25,ease:'power3.in',onComplete:()=>{ie.src=imgList[imgIndex];const s=(IMG_SCALES[slug(currentProduct.name)]??[1,1,1])[imgIndex]??1;document.getElementById('ppageImgWrap')?.style.setProperty('--ppage-img-scale',s);gsap.fromTo(iw,{opacity:0,scale:.88},{opacity:1,scale:1,duration:.4,ease:'power3.out'});}});renderDots();updateArrow();}
  function addThumb(src,fi){const w=document.getElementById('ppageThumbs');if(!w||w.querySelector(`[data-index="${fi}"]`))return;const t=document.createElement('div');t.className='ppage-thumb';t.dataset.index=fi;t.innerHTML=`<img src="${src}" alt="">`;gsap.set(t,{opacity:0,y:20,scale:.8});w.appendChild(t);gsap.to(t,{opacity:1,y:0,scale:1,duration:.35,ease:'back.out(1.5)'});t.addEventListener('click',()=>goToImg(fi));}
  function goToImg(ni){
    if(ni===imgIndex||isTemp||isAnimImg||ni<0||ni>=imgList.length)return;
    const ie=document.getElementById('ppageImg'),iw=document.getElementById('ppageImgWrap'),dir=ni>imgIndex?1:-1,pi=ie.src,pI=imgIndex,pre=new Image();
    pre.src=imgList[ni];
    function go(){isAnimImg=true;if(dir>0)addThumb(pi,pI);else{const w=document.getElementById('ppageThumbs');if(w)w.querySelectorAll('.ppage-thumb').forEach(t=>{if(Number(t.dataset.index)>=ni)gsap.to(t,{opacity:0,y:20,scale:.8,duration:.25,ease:'power2.in',onComplete:()=>t.remove()});});}imgIndex=ni;gsap.to(iw,{x:dir>0?-60:60,opacity:0,scale:.88,duration:.3,ease:'power3.in',onComplete:()=>{ie.src=imgList[imgIndex];const s=(IMG_SCALES[slug(currentProduct?.name||'')]??[1,1,1])[imgIndex]??1;document.getElementById('ppageImgWrap')?.style.setProperty('--ppage-img-scale',s);gsap.fromTo(iw,{x:dir>0?80:-80,opacity:0,scale:.88},{x:0,opacity:1,scale:1,duration:.45,ease:'power3.out',onComplete:()=>{isAnimImg=false;}});}});renderDots();updateArrow();}
    if(pre.complete)go();else{pre.onload=go;pre.onerror=go;}
  }
  function resetCarousel(src,name,key){imgIndex=0;imgList=buildImgList(src,key||name);const w=document.getElementById('ppageThumbs');if(w)w.innerHTML='';document.getElementById('ppageImgWrap')?.style.setProperty('--ppage-img-scale','1');renderDots();updateArrow();}
  const priceForQty=q=>{let u=tiers[0]?.price??0;for(const t of tiers)if(q>=t.qty)u=t.price;return u;};
  function renderTiers(){
    const table=document.getElementById('ppagePricesTable'),base=tiers[0]?.price??1;
    const sel=document.getElementById('ppageTierSelectedText'),sp=document.getElementById('ppageTierSelectedPrice');
    if(sel)sel.textContent=qty===1?'1 unidad':`${qty}+ unidades`;
    if(sp)sp.textContent=fmt(priceForQty(qty));
    table.innerHTML=tiers.map(t=>{const p=Math.round((1-t.price/base)*100);return`<div class="price-row${qty===t.qty?' selected':''}" data-qty="${t.qty}" data-price="${t.price}"><span class="price-row-qty">${t.qty===1?'1 unidad':`${t.qty}+ unidades`}</span><span class="price-row-amount">${fmt(t.price)} <small style="font-family:var(--font-body);font-size:11px;opacity:.5">c/u</small></span><span class="price-row-save">${p>0?`−${p}%`:'Base'}</span></div>`;}).join('');
    table.querySelectorAll('.price-row').forEach(r=>r.addEventListener('click',()=>{qty=Number(r.dataset.qty);document.getElementById('ppageQtyNum').textContent=qty;updateTotal();renderTiers();}));
  }
  function openTiers(){tiersOpen=true;const l=document.getElementById('ppageTiersList'),c=document.getElementById('ppageTierChevron');l.style.height=l.scrollHeight+'px';l.classList.add('open');c.classList.add('open');}
  function closeTiers(){tiersOpen=false;const l=document.getElementById('ppageTiersList'),c=document.getElementById('ppageTierChevron');l.style.height='0';l.classList.remove('open');c.classList.remove('open');}
  function toggleTiers(){tiersOpen?closeTiers():openTiers();}
  function openAccordion(id){const b=document.getElementById(id+'-body'),c=document.getElementById(id+'-chev');if(!b||!c)return;const o=b.style.height!=='0px'&&b.style.height!=='';if(o){b.style.height='0';c.classList.remove('open');}else{b.style.height=b.scrollHeight+'px';c.classList.add('open');}}
  function updateTotal(){document.getElementById('ppageTotal').textContent=fmt(priceForQty(qty)*qty);renderTiers();}
  function renderFeatures(key){const f=FEATURES[key]||[],i=document.getElementById('ppage-features-inner');if(i)i.innerHTML='<ul>'+f.map(x=>`<li>${x}</li>`).join('')+'</ul>';}
  function populate(card,key){
    const ci=getCardImg(card);
    tiers = PRICE_TIERS[key] || [{ qty: 1, price: Number(card.dataset.price) }];
    currentProduct = {
      id: 'cat-' + (card.dataset.id || ''),
      name: card.dataset.name,
      price: fmt(tiers[0]?.price ?? card.dataset.price),
      rawPrice: tiers[0]?.price ?? Number(card.dataset.price),
      image: ci?.src || ''
    };
    openingImage=currentProduct.image;
    document.getElementById('ppageImg').src=currentProduct.image;
    document.getElementById('ppageImg').alt=currentProduct.name;
    document.getElementById('ppageName').textContent=currentProduct.name;
    document.getElementById('ppageDesc').textContent=card.dataset.desc||'';
    document.getElementById('ppageQtyNum').textContent='1';
    ['ppage-features','ppage-delivery'].forEach(id=>{const b=document.getElementById(id+'-body'),c=document.getElementById(id+'-chev');if(b)b.style.height='0';if(c)c.classList.remove('open');});
    document.getElementById('ppageTiersList').style.height='0';
    renderTiers();updateTotal();renderFeatures(key);
    resetCarousel(currentProduct.image,card.dataset.name,key);
    if(card.classList.contains('csl-slide')){isTemp=true;updateArrow();renderTempThumbs();}
  }

  /* ════════════════════════════════════════════
     OPEN — Container Transform
     ════════════════════════════════════════════ */
  function open(card){
    if(isOpen)return;
    isOpen=true;originCard=card;qty=1;tiersOpen=false;
    const rawKey = card.dataset.id;
    const key = SLIDE_KEY_MAP[rawKey] || rawKey;
    populate(card,key);
    originRect=card.getBoundingClientRect();
    const cardImg=getCardImg(card),ppageImgEl=document.getElementById('ppageImg'),ppageInfo=document.getElementById('ppageInfo');

    /* ── FALLBACK: mobile / sin VT API ── */
    if(!document.startViewTransition||window.innerWidth<=900){
      const cx=(originRect.left+originRect.width/2)/window.innerWidth*100,cy=(originRect.top+originRect.height/2)/window.innerHeight*100;
      ppage.style.cssText=`display:flex;flex-direction:column;position:fixed;top:0;right:0;bottom:0;left:0;width:100vw;max-width:100vw;height:100dvh;margin:0;padding:0;border-radius:0;overflow:hidden;transform-origin:${cx.toFixed(2)}% ${cy.toFixed(2)}%;`;
      if(ppageInfo)ppageInfo.style.opacity='1';
      lockScroll();ppage.classList.add('active');overlay.classList.add('active');overlay.style.opacity='0';card.style.visibility='hidden';
      gsap.to(overlay,{opacity:1,duration:.4,ease:'power2.out'});
      gsap.fromTo(ppage,{scale:0},{scale:1,duration:.52,ease:'expo.out',onComplete(){ppage.style.transformOrigin='';ppage.style.transform='';}});
      return;
    }

    /* ── VT APERTURA ──
       OLD state: card (card-container) + cardImg (product-hero)
       NEW state: ppage (card-container) + ppageImgEl (product-hero)
    */

    /* UI empieza grande y desplazada — como si viniera del estado fullscreen.
       Se achica y baja a su posición final mientras la caja termina de expandirse. */
    if(ppageInfo){ppageInfo.style.opacity='0';ppageInfo.style.transform='scale(1.28) translateY(32px)';}
    const ppageBack=document.getElementById('ppageBack');
    if(ppageBack){ppageBack.style.opacity='0';ppageBack.style.transform='scale(1.04) translateY(-10px)';}

    /* Asignar nombres al OLD state */
    card.style.viewTransitionName='card-container';
    if(cardImg){cardImg.style.transition='none';void cardImg.offsetHeight;cardImg.style.viewTransitionName='product-hero';}

    const vt=document.startViewTransition(()=>{
      /* Quitar de la card */
      card.style.viewTransitionName='';
      if(cardImg){cardImg.style.viewTransitionName='';cardImg.style.transition='';}
      card.style.visibility='hidden';

      /* Montar modal fullscreen */
      ppage.style.display='flex';ppage.style.position='fixed';ppage.style.inset='0';
      ppage.style.width='100vw';ppage.style.height='100dvh';
      ppage.style.margin='0';ppage.style.padding='0';ppage.style.borderRadius='0';ppage.style.overflow='hidden';
      ppage.style.transform='';ppage.style.transformOrigin='';

      /* Asignar nombres al NEW state */
      ppage.style.viewTransitionName='card-container';
      ppageImgEl.style.transition='none';
      ppageImgEl.style.viewTransitionName='product-hero';

      ppage.classList.add('active');overlay.classList.add('active');overlay.style.opacity='1';
      lockScroll();
    });

    /* FIX 2: Fade-in del UI SIMULTANEO al vuelo — no esperar vt.finished */
    vt.ready.then(()=>{
      /* ppageInfo: el contenedor sube a su posición (wrapper) */
      if(ppageInfo) gsap.to(ppageInfo,{opacity:1,scale:1,y:0,duration:.38,ease:'power3.out'});

      /* Elementos internos: stagger individual — cada uno entra escalonado */
      const els=[
        ppageInfo?.querySelector('.ppage-name'),
        ppageInfo?.querySelector('.ppage-desc'),
        document.getElementById('ppageTierWrap'),
        document.getElementById('ppageActionsWrap'),
        document.getElementById('ppageAccordions'),
      ].filter(Boolean);

      /* Cada elemento parte invisible y desplazado abajo */
      gsap.set(els,{opacity:0,y:14});
      gsap.to(els,{
        opacity:1, y:0,
        duration:.30,
        ease:'power2.out',
        stagger:.06,        /* 60ms entre cada elemento */
        delay:.10,          /* empieza cuando la caja ya casi llegó */
      });

      /* Botón Volver */
      if(ppageBack) gsap.to(ppageBack,{opacity:1,scale:1,y:0,duration:.24,ease:'power2.out',delay:.06});
    }).catch(()=>{
      if(ppageInfo){ppageInfo.style.opacity='1';ppageInfo.style.transform='';}
      if(ppageBack){ppageBack.style.opacity='1';ppageBack.style.transform='';}
    });

    vt.finished
      .then(()=>{
        /* Limpiar VT names del modal */
        ppage.style.viewTransitionName='';
        ppageImgEl.style.viewTransitionName='';ppageImgEl.style.transition='';
        /* Restaurar por si el fade-in no completó */
        if(ppageInfo){ppageInfo.style.opacity='1';ppageInfo.style.transform='';}
        if(ppageBack){ppageBack.style.opacity='1';ppageBack.style.transform='';}
      })
      .catch(()=>{
        cleanAllVT(card);
        isOpen=false;currentProduct=null;originCard=null;unlockScroll();
        if(ppageInfo){ppageInfo.style.opacity='1';ppageInfo.style.transform='';}
      });
  }

  /* ════════════════════════════════════════════
     CLOSE — Container compacta a card (ghost-free)
     ════════════════════════════════════════════ */
  function close(){
    if(!isOpen||!originRect)return;
    const card=originCard,cardImg=getCardImg(card),ppageImgEl=document.getElementById('ppageImg'),iw=document.getElementById('ppageImgWrap');

    /* ¿Es una card normal (no slide de carrusel)? */
    const isNormalCard=!card?.classList.contains('csl-slide');

    /* Limpiar transforms residuales de GSAP */
    gsap.killTweensOf(iw);gsap.killTweensOf(ppageImgEl);
    if(iw){iw.style.transform='';iw.style.opacity='';iw.style.setProperty('--ppage-img-scale','1');}

    /* ── FALLBACK ── */
    if(!document.startViewTransition||window.innerWidth<=900){
      let r=originRect;if(card){const f=card.getBoundingClientRect();if(f.width>0)r=f;}
      const cx=(r.left+r.width/2)/window.innerWidth*100,cy=(r.top+r.height/2)/window.innerHeight*100;
      ppage.style.transformOrigin=`${cx.toFixed(2)}% ${cy.toFixed(2)}%`;
      gsap.to(overlay,{opacity:0,duration:.3,ease:'power2.in'});
      gsap.to(ppage,{scale:0,duration:.42,ease:'expo.in',onComplete(){
        ppage.classList.remove('active');overlay.classList.remove('active');overlay.style.opacity='0';
        ppage.style.display='none';ppage.style.transform='';ppage.style.transformOrigin='';
        if(card)card.style.visibility='';
        isOpen=false;currentProduct=null;originCard=null;isTemp=false;isAnimImg=false;openingImage='';
        unlockScroll();
      }});
      return;
    }

    const closingImgSrc=openingImage||ppageImgEl?.src||'';
    const ppageInfo=document.getElementById('ppageInfo');
    const ppageBack=document.getElementById('ppageBack');

    function doClose(){
      if(ppageImgEl){
        ppageImgEl.src=closingImgSrc;
        ppageImgEl.style.transition='none';
        ppageImgEl.style.transform='';
      }
      if(cardImg&&closingImgSrc)cardImg.src=closingImgSrc;
      void ppageImgEl?.offsetHeight;

      /* Para cards normales: los elementos de UI (texto, botones, thumbs)
         reciben su propio VT name — el browser los extrae del snapshot de ppage.
         El "hueco" que dejan en ppage es blanco (= fondo del modal) → seamless.
         CSS los desvanece gradualmente. ppage (card-container) no se toca: 
         el fondo blanco contrae completo sin fade. */
      if(isNormalCard) document.documentElement.classList.add('vt-closing-card');

      /* Sin VT names en el UI. Todo dentro del snapshot de card-container.
         El OLD state (contenido) hace fade via CSS. El grupo tiene
         background:#fff → caja siempre sólida aunque el contenido desaparezca. */
      ppage.style.viewTransitionName='card-container';
      ppageImgEl.style.viewTransitionName='product-hero';

      const vt=document.startViewTransition(()=>{
        ppageImgEl.style.opacity='0';
        ppageImgEl.style.viewTransitionName='';
        ppageImgEl.style.transition='';
        iw?.style.setProperty('--ppage-img-scale','1');
        ppage.style.viewTransitionName='';
        ppage.classList.remove('active');overlay.classList.remove('active');overlay.style.opacity='0';
        ppage.style.display='none';ppage.style.transform='';ppage.style.borderRadius='';
        if(card){
          card.style.visibility='';
          card.style.viewTransitionName='card-container';
          if(cardImg){cardImg.style.transition='none';cardImg.style.viewTransitionName='product-hero';}
        }
        unlockScroll();
        isOpen=false;currentProduct=null;originCard=null;isTemp=false;isAnimImg=false;openingImage='';
        ppageInfo?.style.removeProperty('opacity');
        ppageInfo?.style.removeProperty('transform');
        ppageBack?.style.removeProperty('opacity');
      });

      vt.finished
        .then(()=>{
          document.documentElement.classList.remove('vt-closing-card');
          if(card)card.style.viewTransitionName='';
          if(cardImg){cardImg.style.viewTransitionName='';cardImg.style.transition='';}
          if(ppageImgEl)ppageImgEl.style.opacity='';

        })
        .catch(()=>{
          document.documentElement.classList.remove('vt-closing-card');
          cleanAllVT(card);
          if(ppageImgEl)ppageImgEl.style.opacity='';

          isOpen=false;currentProduct=null;originCard=null;unlockScroll();
        });
    }

    if(ppageImgEl?.src)ppageImgEl.decode().then(doClose).catch(doClose);
    else doClose();
  }

  function init(){
    ppage.style.display='none';overlay.style.opacity='0';

    backBtn.addEventListener('click',close);overlay.addEventListener('click',close);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
    document.getElementById('ppageTierSelected')?.addEventListener('click',toggleTiers);
    document.getElementById('ppageImgNext')?.addEventListener('click',()=>goToImg(imgIndex+1));

    /* ── Swipe en mobile sobre el panel de imagen ── */
    const panel=document.getElementById('ppageImgPanel');
    if(panel){
      let tx=0,ty=0;
      panel.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
      panel.addEventListener('touchend',e=>{
        const dx=tx-e.changedTouches[0].clientX;
        const dy=ty-e.changedTouches[0].clientY;
        if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))
          goToImg(dx>0?imgIndex+1:imgIndex-1);
      },{passive:true});
    }
    document.getElementById('ppageQtyMinus').addEventListener('click',()=>{if(qty>1){qty--;document.getElementById('ppageQtyNum').textContent=qty;updateTotal();}});
    document.getElementById('ppageQtyPlus').addEventListener('click',()=>{qty++;document.getElementById('ppageQtyNum').textContent=qty;updateTotal();});
    document.getElementById('ppageWaBtn')?.addEventListener('click',()=>{if(!currentProduct)return;const u=priceForQty(qty),t=u*qty;const msg=[`*\u00a1Hola!* Me interesa este producto:`,'',`\u25b8 ${qty}x ${currentProduct.name}`,`  Precio: ${fmt(u)} c/u`,`  Total: *${fmt(t)}*`,'','\u00bfTienen stock disponible?'].join('\n');window.open(`https://wa.me/56942348587?text=${encodeURIComponent(msg)}`,'_blank');});
    document.getElementById('ppageCartBtn').addEventListener('click',()=>{if(!currentProduct)return;const u=priceForQty(qty),p={...currentProduct,rawPrice:u,price:fmt(u)};for(let i=0;i<qty;i++)Cart.addItem(p);const b=document.getElementById('ppageCartBtn');b.innerHTML='<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';setTimeout(()=>{b.innerHTML='<svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.2 14h9.5c.8 0 1.5-.5 1.7-1.2l3-7H6.2L5.3 3H1v2h3l3.6 7.6-1.3 2.4c-.1.2-.2.5-.2.8 0 1.1.9 2 2 2h12v-2H8.4c-.1 0-.2-.1-.2-.2l.03-.12L9.1 14z"/></svg>';},1800);});
    document.getElementById('ppageMpBtn')?.addEventListener('click',async()=>{if(!currentProduct)return;const b=document.getElementById('ppageMpBtn'),u=priceForQty(qty);b.textContent='Procesando...';b.disabled=true;try{const r=await fetch('/api/create-preference',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{name:currentProduct.name,qty,price:u}]})});const d=await r.json();if(d.init_point)window.location.href=d.init_point;else throw new Error();}catch{b.textContent='Error, intenta de nuevo';b.disabled=false;setTimeout(()=>{b.innerHTML=`<svg style="width:18px;height:18px;fill:currentColor;vertical-align:middle;margin-right:8px" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>Pagar con Mercado Pago`;b.disabled=false;},2500);}});
    ['ppage-features','ppage-delivery'].forEach(id=>document.getElementById(id+'-header')?.addEventListener('click',()=>openAccordion(id)));
    document.querySelectorAll('.card-btn').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();open(btn.closest('[data-name]'));}));
  }
  return{init,close,open};
})();

const NavScroll=(()=>{function init(){const nav=document.querySelector('.nav');window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>40),{passive:true});}return{init};})();
const ProductsSection=(()=>{
  function init(){
    document.querySelectorAll('.product-card').forEach(c=>c.style.setProperty('--card-img-scale',c.dataset.imgScale??0.75));
    const cards=document.querySelectorAll('.product-card');if(!cards.length)return;
    gsap.set(cards,{opacity:0,y:40});
    const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){const c=e.target,i=Array.from(cards).indexOf(c);gsap.to(c,{opacity:1,y:0,duration:.65,ease:'power3.out',delay:(i%4)*.08});obs.unobserve(c);}});},{threshold:0.1});
    cards.forEach(c=>obs.observe(c));
  }
  return{init};
})();
const Carousel3D=(()=>{
  function init(){
    if(typeof Swiper==='undefined')return;
    const sw=new Swiper('.csl-swiper',{effect:'coverflow',grabCursor:true,centeredSlides:true,slidesPerView:'auto',loop:false,initialSlide:2,mousewheel:{forceToAxis:true},keyboard:{enabled:true,onlyInViewport:true},coverflowEffect:{rotate:50,stretch:0,depth:50,modifier:1,slideShadows:false},navigation:{prevEl:'.csl-arr-prev',nextEl:'.csl-arr-next'},pagination:{el:'.csl-pagination',clickable:true}});
    const slides=document.querySelectorAll('.csl-swiper .swiper-slide');
    gsap.set(slides,{opacity:0,y:50});
    const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){gsap.to([...slides],{opacity:1,y:0,duration:.7,ease:'power3.out',stagger:.08});obs.disconnect();}});},{threshold:.2});
    obs.observe(document.querySelector('.csl-swiper'));
    let drag=false,pend=null;
    sw.on('sliderMove',()=>{drag=true;});sw.on('touchStart',()=>{drag=false;});
    sw.on('slideChangeTransitionEnd',()=>{if(pend!==null){const s=pend;pend=null;ProductModal.open(s);}});
    document.querySelectorAll('.csl-swiper .swiper-slide[data-name]').forEach((slide,i)=>{
      slide.addEventListener('click',()=>{if(drag)return;if(!slide.classList.contains('swiper-slide-active')){pend=slide;sw.slideTo(i);return;}ProductModal.open(slide);});
    });
  }
  return{init};
})();
document.querySelectorAll('.porque-card').forEach(c=>c.addEventListener('click',()=>c.classList.toggle('flipped')));
document.addEventListener('DOMContentLoaded', async () => {
  // 1️⃣ cargar precios y stock desde Google Sheet
  await syncSheetToConfig();

// Refresh sheet data every minute to keep prices and stock up‑to‑date
setInterval(syncSheetToConfig, 60000);

  // 2️⃣ iniciar la UI (solo después de que los datos estén listos)
  ProductNav.init();Cart.init();CartButton.init();MaskReveal.init();
  ProductsSection.init();NavScroll.init();ProductModal.init();Carousel3D.init();

  const rr=document.getElementById('revealRect');
  if(rr && typeof ScrollTrigger !== 'undefined')
    gsap.fromTo(rr,{attr:{width:0}},{attr:{width:520},ease:'none',scrollTrigger:{trigger:'.csl-title-wrap',start:'top 65%',end:'top -10%',scrub:2}});
});
