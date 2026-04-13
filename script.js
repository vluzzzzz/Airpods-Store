/* =============================================
   AIRPODS STORE — script.js
   ============================================= */
'use strict';

/* ══ DATOS ══ */
const PRODUCTS = [
  { id:1, name:'AirPods Pro 2',  price:'$25.000', rawPrice:25000, image:'images/airpods.png',    bgLabel:'AIRPODS PRO 2', scale:1,   offsetX:0,  offsetY:0  },
  { id:2, name:'AirPods 4',      price:'$18.500', rawPrice:18500, image:'images/airpods4.png',   bgLabel:'AIRPODS 4',     scale:0.8, offsetX:0,  offsetY:0  },
  { id:3, name:'AirPods Max',    price:'$72.000', rawPrice:72000, image:'images/airpodsmax.png', bgLabel:'AIRPODS MAX',   scale:1.4, offsetX:50, offsetY:-20},
];

const PRICE_TIERS = {
  'apple-watch-ultra-3':        [{qty:1,price:29990},{qty:3,price:27990},{qty:5,price:25990},{qty:10,price:23990}],
  'apple-watch-serie-10':       [{qty:1,price:29990},{qty:3,price:27990},{qty:5,price:25990},{qty:10,price:23990}],
  'apple-watch-black-ultra-2':  [{qty:1,price:29990},{qty:3,price:27990},{qty:5,price:25990},{qty:10,price:23990}],
  'airpods-4ta-generación':     [{qty:1,price:15000},{qty:3,price:13500},{qty:5,price:12500},{qty:10,price:11500}],
  'airpods-pro-2':              [{qty:1,price:14000},{qty:3,price:12500},{qty:5,price:11500},{qty:10,price:10500}],
  'airpods-3ra-generación':     [{qty:1,price:14000},{qty:3,price:12500},{qty:5,price:11500},{qty:10,price:10500}],
  'batería-magsafe':            [{qty:1,price:13000},{qty:3,price:11500},{qty:5,price:10500},{qty:10,price:9500}],
  'max-magnéticos':             [{qty:1,price:26990},{qty:3,price:24990},{qty:5,price:22990},{qty:10,price:20990}],
  'cargador-lightning-completo':[{qty:1,price:5000}, {qty:3,price:4500}, {qty:5,price:4000}, {qty:10,price:3500}],
  'cargador-tipo-c-completo':   [{qty:1,price:5000}, {qty:3,price:4500}, {qty:5,price:4000}, {qty:10,price:3500}],
  'cargador-samsung-45w':       [{qty:1,price:6000}, {qty:3,price:5500}, {qty:5,price:5000}, {qty:10,price:4500}],
};

const FEATURES = {
  'airpods-pro-2':              ['Cancelación activa de ruido','Audio espacial personalizado','Hasta 30 horas de batería','Resistencia al agua IPX4'],
  'airpods-4ta-generación':     ['Audio adaptativo','Cancelación activa de ruido','Diseño rediseñado','Hasta 30 horas con estuche'],
  'airpods-3ra-generación':     ['Audio espacial','Resistencia al agua IPX4','Carga MagSafe','Hasta 30 horas con estuche'],
  'apple-watch-ultra-3':        ['Caja de titanio aeroespacial','Pantalla Always-On 49mm','Hasta 60 horas de batería','GPS de doble frecuencia'],
  'apple-watch-serie-10':       ['Pantalla OLED más grande','Detección de apnea del sueño','Carga rápida','Diseño más delgado'],
  'apple-watch-black-ultra-2':  ['Acabado negro carbón','Titanio negro premium','Cristal de zafiro','Hasta 60 horas de batería'],
  'batería-magsafe':            ['Carga magnética MagSafe','Compacta y liviana','Compatible iPhone 12 en adelante','Sin cables'],
  'max-magnéticos':             ['Compatibles con MagSafe','Fijación magnética perfecta','Carga inalámbrica optimizada','Múltiples colores'],
  'cargador-lightning-completo':['Cable Lightning incluido','Adaptador de corriente','Compatible iPhone/iPad/AirPods','Carga rápida'],
  'cargador-tipo-c-completo':   ['Cable USB-C incluido','Compatible iPhone 15+','iPad Pro y MacBook','Carga rápida 20W'],
  'cargador-samsung-45w':       ['Carga ultra rápida 45W','Compatible línea Galaxy','Cable USB-C incluido','Carga completa en ~1 hora'],
};

const SLIDE_KEY_MAP = {
  'airpods-max': 'max-magnéticos',
};

/* ══════════════════════════════════════════════
   PANEL DE CONTROL MANUAL POR PRODUCTO (MOBILE)
   Editá estos valores sin romper el blob ni layout.
   ══════════════════════════════════════════════ */
const PRODUCT_CONFIG = {
  1: { // ─── AirPods Pro 2 ───────────────────────
    fontSize:     '24vw',  /* EDIT: tamaño texto de fondo          */
    productScale: 1.3,     /* EDIT: escala del PNG                 */
    productY:    -15,      /* EDIT: posición vertical px (- = arr) */
    blobYRatio:   0.88,    /* EDIT: altura blob (0=top, 1=bottom)  */
    blobSpeed:    0.030,   /* EDIT: velocidad blob (menor = más lento y suave) */
  },
  2: { // ─── AirPods 4 ──────────────────────────
    fontSize:     '28vw',  /* EDIT: tamaño texto de fondo          */
    productScale: 1.1,     /* EDIT: escala del PNG                 */
    productY:    -10,      /* EDIT: posición vertical px           */
    blobYRatio:   0.88,    /* EDIT: altura blob                    */
    blobSpeed:    0.030,   /* EDIT: velocidad blob                 */
  },
  3: { // ─── AirPods Max ─────────────────────────
    fontSize:     '24vw',  /* EDIT: tamaño texto de fondo          */
    productScale: 0.9,     /* EDIT: escala del PNG                 */
    productY:    -20,      /* EDIT: posición vertical px           */
    blobYRatio:   0.90,    /* EDIT: altura blob                    */
    blobSpeed:    0.030,   /* EDIT: velocidad blob                 */
  },
};

/* ══ ESTADO ══ */
const state = { current:0, isTransitioning:false, cart:[] };

/* ══ DOM ══ */
const DOM = {
  productImg:        document.getElementById('productImg'),
  productWrap:       document.getElementById('productWrap'),
  bgText:            document.getElementById('bgText'),
  bgTextBlue:        document.getElementById('bgTextBlue'),
  bgTextZoom:        document.getElementById('bgTextZoom'),
  bgTextBlueWrap:    document.getElementById('bgTextBlueWrap'),
  bgTextPerspective: document.querySelector('.bg-text-perspective'),
  priceBlock:        document.querySelector('.price-block'),
  productPrice:      document.getElementById('productPrice'),
  prevBtn:           document.getElementById('prevBtn'),
  nextBtn:           document.getElementById('nextBtn'),
  dotsWrap:          document.getElementById('dots'),
  addToCart:         document.getElementById('addToCart'),
  cartDrawer:        document.getElementById('cartDrawer'),
  cartOverlay:       document.getElementById('cartOverlay'),
  cartItems:         document.getElementById('cartItems'),
  cartFooter:        document.getElementById('cartFooter'),
  cartTotal:         document.getElementById('cartTotal'),
  cartCount:         document.getElementById('cartCount'),
  closeCart:         document.getElementById('closeCart'),
  cartTrigger:       document.querySelector('.cart-trigger'),
};

/* ══════════════════════════════════════════════
   MÓDULO: NAVEGACIÓN DE PRODUCTOS
   ══════════════════════════════════════════════ */
const ProductNav = (() => {
  let floatTween = null;

  function applyWrapVars(p) {
    DOM.productWrap.style.setProperty('--product-scale', p.scale ?? 1);
    DOM.productWrap.style.setProperty('--product-x', (p.offsetX ?? 0) + 'px');
    DOM.productWrap.style.setProperty('--product-y', (p.offsetY ?? 0) + 'px');

    /* En mobile: aplicar config individual del PRODUCT_CONFIG */
    if (window.innerWidth <= 768) {
      const cfg = PRODUCT_CONFIG[p.id];
      if (cfg) {
        /* Tamaño de texto de fondo — vía custom property que el CSS consume */
        [DOM.bgText, DOM.bgTextBlue, DOM.bgTextZoom].forEach(el => {
          if (el) el.style.setProperty('--hero-text-size', cfg.fontSize);
        });
        /* Escala y posición vertical del PNG */
        DOM.productWrap.style.setProperty('--product-scale', cfg.productScale);
        DOM.productWrap.style.setProperty('--product-y', cfg.productY + 'px');
      }
    }
  }

  function buildDots() {
    DOM.dotsWrap.innerHTML = '';
    PRODUCTS.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'dot' + (i === state.current ? ' active' : '');
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', `Producto ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      DOM.dotsWrap.appendChild(d);
    });
  }

  function updateDots() {
    DOM.dotsWrap.querySelectorAll('.dot').forEach((d, i) =>
      d.classList.toggle('active', i === state.current));
  }

  function startFloat() {
    if (floatTween) floatTween.kill();
    const stage = document.querySelector('.product-stage');
    floatTween = gsap.to(stage, { y:-14, duration:2.5, ease:'sine.inOut', repeat:-1, yoyo:true });
  }

  function stopFloat() {
    if (floatTween) { floatTween.kill(); floatTween = null; }
    gsap.set(document.querySelector('.product-stage'), { y:0 });
  }

  function goTo(index, direction = 'next') {
    if (state.isTransitioning || index === state.current) return;
    state.isTransitioning = true;

    const product  = PRODUCTS[index];
    const stage    = document.querySelector('.product-stage');
    const priceEl  = document.getElementById('priceInner');
    const imgSign  = direction === 'next' ?  1 : -1;
    const textSign = direction === 'next' ? -1 :  1;
    const preloader = new Image();
    preloader.src = product.image;

    stopFloat();

    gsap.to(stage,                 { x:70*imgSign,  opacity:0, duration:0.32, ease:'power2.inOut' });
    gsap.to(DOM.bgTextPerspective, { x:70*textSign, opacity:0, duration:0.32, ease:'power2.inOut' });
    if (priceEl) gsap.to(priceEl,  { y:'-110%', opacity:0, duration:0.24, ease:'power2.in' });

    gsap.delayedCall(0.32, () => {
      state.current = index;
      applyWrapVars(product);
      DOM.bgText.textContent =
        DOM.bgTextBlue.textContent =
        DOM.bgTextZoom.textContent = product.bgLabel;
      DOM.productPrice.textContent = product.price;
      updateDots();

      gsap.set(stage,                 { x:-70*imgSign,  opacity:0 });
      gsap.set(DOM.bgTextPerspective, { x:-70*textSign, opacity:0 });
      if (priceEl) gsap.set(priceEl,  { y:'110%', opacity:1 });

      function runEntrance() {
        gsap.to(stage, { x:0, opacity:1, duration:0.44, ease:'power2.out',
          onComplete() {
            startFloat();
            state.isTransitioning = false;
            /* Actualizar posición del blob en mobile al nuevo producto */
            if (window.innerWidth <= 768 && typeof MaskReveal !== 'undefined') {
              MaskReveal.refreshMobile();
            }
          }
        });
        gsap.to(DOM.bgTextPerspective, { x:0, opacity:1, duration:0.44, ease:'power2.out' });
        if (priceEl) gsap.to(priceEl, { y:'0%', duration:0.36, ease:'power2.out', delay:0.06 });
      }

      const img = DOM.productImg;
      img.onload = () => { img.onload = null; runEntrance(); };
      img.src = product.image;
      if (img.complete) { img.onload = null; runEntrance(); }
    });
  }

  function init() {
    buildDots();
    DOM.nextBtn.addEventListener('click', () => goTo((state.current+1)%PRODUCTS.length, 'next'));
    DOM.prevBtn.addEventListener('click', () => goTo((state.current-1+PRODUCTS.length)%PRODUCTS.length, 'prev'));

    let touchStartX = 0;
    document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive:true });
    document.addEventListener('touchend', e => {
      const d = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(d) > 50)
        d > 0 ? goTo((state.current+1)%PRODUCTS.length,'next')
              : goTo((state.current-1+PRODUCTS.length)%PRODUCTS.length,'prev');
    });
    document.addEventListener('keydown', e => {
      if (e.key==='ArrowRight') goTo((state.current+1)%PRODUCTS.length,'next');
      if (e.key==='ArrowLeft')  goTo((state.current-1+PRODUCTS.length)%PRODUCTS.length,'prev');
    });

    applyWrapVars(PRODUCTS[0]);
    startFloat();
  }

  return { init };
})();

/* ══════════════════════════════════════════════
   MÓDULO: CARRITO
   ══════════════════════════════════════════════ */
const Cart = (() => {
  let isOpen = false;

  function open() {
    if (isOpen) return; isOpen = true;

    /* CART FIX: forzar todos los estilos críticos inline
       antes de que GSAP tome control — sobreescribe cualquier
       conflicto de z-index o stacking context */
    DOM.cartDrawer.style.display    = 'flex';
    DOM.cartDrawer.style.position   = 'fixed';
    DOM.cartDrawer.style.top        = '0';
    DOM.cartDrawer.style.right      = '0';
    DOM.cartDrawer.style.height     = '100%';
    DOM.cartDrawer.style.zIndex     = '9999';
    DOM.cartDrawer.style.visibility = 'visible';

    /* Forzar reflow sincrónico — resuelve el "state desync"
       donde el browser no pintaba hasta el próximo repaint */
    void DOM.cartDrawer.offsetHeight;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    DOM.cartOverlay.classList.add('visible');
    gsap.to(DOM.cartOverlay, { opacity:1, duration:0.4, ease:'power2.out' });
    gsap.fromTo(DOM.cartDrawer, { x:'100%' }, { x:'0%', duration:0.6, ease:'power4.out' });
    const items = DOM.cartItems.querySelectorAll('.cart-item');
    if (items.length) gsap.fromTo(items,{opacity:0,x:30},{opacity:1,x:0,duration:0.4,stagger:0.07,ease:'power3.out',delay:0.25});
  }

  function close() {
    if (!isOpen) return;
    gsap.to(DOM.cartOverlay, {opacity:0,duration:0.35,ease:'power2.in',onComplete:()=>DOM.cartOverlay.classList.remove('visible')});
    gsap.to(DOM.cartDrawer, {x:'100%',duration:0.45,ease:'power4.in',onComplete:()=>{
      isOpen=false;
      /* Limpiar los inline overrides del open() */
      DOM.cartDrawer.style.zIndex     = '';
      DOM.cartDrawer.style.visibility = '';
      DOM.cartDrawer.style.display    = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }});
  }

  function addItem(product) {
    const ex = state.cart.find(i => i.product.id === product.id);
    if (ex) ex.qty++; else state.cart.push({ product, qty:1 });
    render(); updateBadge();
  }

  function removeItem(id) { state.cart=state.cart.filter(i=>i.product.id!==id); render(); updateBadge(); }

  function changeQty(id, delta) {
    const item = state.cart.find(i=>i.product.id===id); if(!item) return;
    item.qty = Math.max(0, item.qty+delta);
    if (item.qty===0) removeItem(id); else { render(); updateBadge(); }
  }

  function updateBadge() {
    const total = state.cart.reduce((s,i)=>s+i.qty,0);
    DOM.cartCount.textContent = total;
    DOM.cartCount.classList.toggle('visible', total>0);
  }

  function fmt(n) { return '$'+n.toLocaleString('es-CL'); }

  function render() {
    if (!state.cart.length) {
      DOM.cartItems.innerHTML='<p class="cart-empty">Tu carrito está vacío</p>';
      DOM.cartFooter.style.display='none'; return;
    }
    DOM.cartFooter.style.display='block';
    DOM.cartTotal.textContent=fmt(state.cart.reduce((s,i)=>s+i.product.rawPrice*i.qty,0));
    DOM.cartItems.innerHTML=state.cart.map(({product,qty})=>`
      <div class="cart-item" data-id="${product.id}">
        <img class="cart-item-img" src="${product.image||''}" alt="${product.name}">
        <div class="cart-item-info">
          <p class="cart-item-name">${product.name}</p>
          <p class="cart-item-price">${fmt(product.rawPrice)}</p>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-id="${product.id}" data-delta="-1">−</button>
          <span>${qty}</span>
          <button class="qty-btn" data-id="${product.id}" data-delta="1">+</button>
        </div>
      </div>`).join('');
    DOM.cartItems.querySelectorAll('.qty-btn').forEach(btn=>
      btn.addEventListener('click',()=>changeQty(Number(btn.dataset.id),Number(btn.dataset.delta))));
    const fi=DOM.cartItems.querySelector('.cart-item');
    if(fi) gsap.fromTo(fi,{opacity:0,x:24},{opacity:1,x:0,duration:0.4,ease:'power3.out'});
  }

  /* ── Mercado Pago ── */
  async function openMercadoPago() {
    if (!state.cart.length) return;
    const btn = document.getElementById('mpBtn');
    if (btn) { btn.textContent = 'Procesando...'; btn.disabled = true; }
    try {
      const items = state.cart.map(({product, qty}) => ({
        name:  product.name,
        qty:   qty,
        price: product.rawPrice,
      }));
      const res = await fetch('/api/create-preference', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('No se recibió init_point');
      }
    } catch(err) {
      console.error('Error MP:', err);
      if (btn) { btn.textContent = 'Error, intenta de nuevo'; btn.disabled = false; }
      setTimeout(() => {
        if (btn) {
          btn.innerHTML = `<svg style="width:18px;height:18px;fill:currentColor;vertical-align:middle;margin-right:8px" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>Pagar con Mercado Pago`;
          btn.disabled = false;
        }
      }, 2500);
    }
  }

  function openWhatsApp() {
    if (!state.cart.length) return;
    const lines=state.cart.map(({product,qty})=>{
      const total=product.rawPrice*qty;
      return `\u25b8 ${qty}x ${product.name}\n  ${fmt(product.rawPrice)} c/u = *${fmt(total)}*`;
    });
    const total=state.cart.reduce((s,i)=>s+i.product.rawPrice*i.qty,0);
    const msg=['*\u00a1Hola!* Me interesa hacer un pedido:','',...lines,'',`Total: *${fmt(total)}*`,'','\u00bfTienen stock disponible?'].join('\n');
    window.open(`https://wa.me/56942348587?text=${encodeURIComponent(msg)}`,'_blank');
  }

  function init() {
    /* Mover al final del body — garantiza que el carrito esté
       FUERA de cualquier stacking context restrictivo */
    document.body.appendChild(DOM.cartDrawer);
    document.body.appendChild(DOM.cartOverlay);

    DOM.cartTrigger.addEventListener('click', open);
    DOM.closeCart.addEventListener('click', close);
    DOM.cartOverlay.addEventListener('click', close);
    document.getElementById('checkoutBtn')?.addEventListener('click', openWhatsApp);
    document.getElementById('mpBtn')?.addEventListener('click', openMercadoPago);
  }

  return { init, addItem, open, close };
})();

/* ══════════════════════════════════════════════
   MÓDULO: BOTÓN ADD TO CART
   ══════════════════════════════════════════════ */
const CartButton = (() => {
  let timer = null;
  function trigger() {
    const btn=DOM.addToCart;
    if (btn.classList.contains('added')) return;
    Cart.addItem(PRODUCTS[state.current]);
    btn.classList.add('added');
    const ripple=document.createElement('span');
    ripple.style.cssText='position:absolute;border-radius:50%;width:10px;height:10px;background:rgba(0,0,0,0.08);transform:scale(0);animation:rippleOut 0.5s ease-out forwards;top:50%;left:50%;margin:-5px 0 0 -5px;pointer-events:none;';
    btn.appendChild(ripple);
    setTimeout(()=>ripple.remove(),600);
    clearTimeout(timer);
    timer=setTimeout(()=>btn.classList.remove('added'),2200);
  }
  function init() {
    DOM.addToCart.addEventListener('click', trigger);
    const s=document.createElement('style');
    s.textContent='@keyframes rippleOut{to{transform:scale(28);opacity:0}}';
    document.head.appendChild(s);
  }
  return { init };
})();

/* ══════════════════════════════════════════════
   MÓDULO: MASK REVEAL — blob líquido
   Mobile: siempre activo, suave, touch-aware
   ══════════════════════════════════════════════ */
const MaskReveal = (() => {
  const N=64;
  /* Radios del blob. RY móvil pequeño = solo cubre parte inferior */
  const RX_DESK=220, RY_DESK=115;
  const RX_MOB =170, RY_MOB = 52;

  function isMob(){ return window.innerWidth <= 768; }
  function rand(){ return Math.random()*Math.PI*2; }

  const MODES=[
    {k:2,amp:46,spd:0.7,ph:rand()},{k:3,amp:30,spd:1.5,ph:rand()},
    {k:4,amp:20,spd:-0.9,ph:rand()},{k:5,amp:14,spd:2.3,ph:rand()},
    {k:7,amp:8,spd:-2.0,ph:rand()},{k:1,amp:16,spd:1.2,ph:rand()},
  ];
  const V_MODES=[
    {k:1,amp:20,spd:1.7,ph:rand()},{k:2,amp:12,spd:2.5,ph:rand()},{k:3,amp:7,spd:0.9,ph:rand()},
  ];

  let rafId=null, mouseX=0, mouseY=0, blobX=0, blobY=0;
  let isInside=false, scale=0, wrapRect=null, started=false;
  let touchActive=false; /* si el dedo está tocando el texto */

  function cacheRect(){ wrapRect=DOM.bgTextBlueWrap.getBoundingClientRect(); }

  /* Posición base del blob en mobile: parte inferior del texto */
  function getMobileCenter(){
    if (!wrapRect) cacheRect();
    const cur = PRODUCTS[state.current];
    const cfg = cur ? PRODUCT_CONFIG[cur.id] : null;
    const ratio = cfg ? cfg.blobYRatio : 0.88;
    return {
      x: wrapRect.left + wrapRect.width  * 0.5,
      y: wrapRect.top  + wrapRect.height * ratio,
    };
  }

  /* Velocidad de suavizado — per-producto en mobile, fija en desktop */
  function getLerpFactor(){
    if (!isMob()) return 0.055;
    const cur = PRODUCTS[state.current];
    const cfg = cur ? PRODUCT_CONFIG[cur.id] : null;
    return cfg ? cfg.blobSpeed : 0.030;
  }

  function buildPolygon(cx,cy,t){
    const RX = isMob() ? RX_MOB : RX_DESK;
    const RY = isMob() ? RY_MOB : RY_DESK;
    const pts=[];
    for(let i=0;i<N;i++){
      const angle=(i/N)*Math.PI*2;
      let dr=0; for(const m of MODES) dr+=m.amp*Math.sin(m.k*angle+m.spd*t+m.ph);
      let dv=0; for(const m of V_MODES) dv+=m.amp*Math.sin(m.k*angle+m.spd*t+m.ph);
      const rx=(RX+dr)*scale, ry=(RY+dr*0.38)*scale;
      pts.push(`${(cx+rx*Math.cos(angle)).toFixed(1)}px ${(cy+ry*Math.sin(angle)+dv*scale).toFixed(1)}px`);
    }
    return `polygon(${pts.join(',')})`;
  }

  function animate(ts){
    const t=ts*0.001;
    const lerp=getLerpFactor();
    scale+=((isInside?1:0)-scale)*(isInside?0.10:0.08);
    if(!isInside&&scale<0.004){
      scale=0;
      DOM.bgTextBlueWrap.style.clipPath='polygon(0px 0px,0px 0px,0px 0px)';
      rafId=null; return;
    }
    if(!started){ blobX=mouseX; blobY=mouseY; started=true; }
    blobX+=(mouseX-blobX)*lerp;
    blobY+=(mouseY-blobY)*lerp;
    DOM.bgTextBlueWrap.style.clipPath=buildPolygon(blobX-wrapRect.left,blobY-wrapRect.top,t);
    rafId=requestAnimationFrame(animate);
  }

  function startLoop(){ if(!rafId) rafId=requestAnimationFrame(animate); }

  /* Llamado cuando cambia el producto en mobile */
  function refreshMobile(){
    if (!isMob()) return;
    cacheRect();
    if (!touchActive){
      const c=getMobileCenter();
      mouseX=c.x; mouseY=c.y;
    }
    if (!isInside){ isInside=true; started=false; }
    startLoop();
  }

  function init(){
    document.fonts.ready.then(()=>{
      cacheRect();
      if(isMob()){
        /* Auto-start en mobile: blob en la parte inferior del texto */
        const c=getMobileCenter();
        mouseX=c.x; mouseY=c.y; blobX=c.x; blobY=c.y;
        isInside=true; started=true;
        startLoop();
      }
    });

    window.addEventListener('resize',()=>{
      cacheRect();
      if(isMob()&&!isInside) refreshMobile();
    },{passive:true});

    const hero=document.getElementById('hero');

    /* Desktop: seguir mouse */
    hero.addEventListener('mousemove',e=>{
      if(isMob()) return;
      if(!wrapRect) cacheRect();
      mouseX=e.clientX; mouseY=e.clientY;
      isInside=true; startLoop();
    });
    hero.addEventListener('mouseleave',()=>{
      if(isMob()) return;
      isInside=false; started=false; startLoop();
    });

    /* Mobile: el dedo mueve el blob, al soltar vuelve a la base */
    hero.addEventListener('touchmove',e=>{
      if(!isMob()) return;
      if(!wrapRect) cacheRect();
      touchActive=true;
      const touch=e.touches[0];
      mouseX=touch.clientX;
      mouseY=touch.clientY;
      /* Asegurarse de que el blob esté activo */
      if(!isInside){ isInside=true; started=false; startLoop(); }
    },{passive:true});

    hero.addEventListener('touchend',()=>{
      if(!isMob()) return;
      touchActive=false;
      /* Volver suavemente a la posición base */
      const c=getMobileCenter();
      mouseX=c.x; mouseY=c.y;
    },{passive:true});
  }

  return { init, refreshMobile };
})();

/* ══════════════════════════════════════════════
   MÓDULO: PRODUCT PAGE — View Transitions
   ══════════════════════════════════════════════ */
const ProductModal = (() => {
  let isOpen=false, originCard=null, originRect=null, qty=1, tiers=[], currentProduct=null;
  let tiersOpen=false, imgIndex=0, imgList=[], isTemp=false, openingImage='';

  const ppage   = document.getElementById('ppage');
  const overlay = document.getElementById('ppageOverlay');
  const backBtn = document.getElementById('ppageBack');

  function fmt(n){return '$'+Number(n).toLocaleString('es-CL');}

  const PRODUCT_IMAGES = {
    'apple-watch-ultra-3'        : 'images/apple-watch-ultra-3.png',
    'apple-watch-serie-10'       : 'images/serie-10.png',
    'apple-watch-black-ultra-2'  : 'images/black-ultra-2.png',
    'airpods-4ta-generacion'     : 'images/airpods-4gen.png',
    'airpods-pro-2'              : 'images/airpods-pro-2.png',
    'airpods-3ra-generacion'     : 'images/airpods-3gen.png',
    'bateria-magsafe'            : 'images/bateria-magsafe.png',
    'max-magneticos'             : 'images/max-magneticos.png',
    'cargador-lightning-completo': 'images/cargador-lightning.png',
    'cargador-tipo-c-completo'   : 'images/cargador-tipo-c.png',
    'cargador-samsung-45w'       : 'images/cargador-samsung-45w.png',
  };

  function getImgSlug(name){
    return name.toLowerCase()
      .replace(/\s+/g,'-')
      .replace(/[áä]/g,'a').replace(/[éë]/g,'e')
      .replace(/[íï]/g,'i').replace(/[óö]/g,'o')
      .replace(/[úü]/g,'u')
      .replace(/[^a-z0-9-]/g,'');
  }

  const TWO_IMG=['bateria-magsafe','cargador-lightning-completo','cargador-tipo-c-completo','cargador-samsung-45w'];
  function buildImgList(cardImg, nameOrKey){
    const slug = getImgSlug(nameOrKey);
    const v1 = PRODUCT_IMAGES[slug] || cardImg;
    return TWO_IMG.includes(slug)
      ? [v1, `images/${slug}-v2.png`]
      : [v1, `images/${slug}-v2.png`, `images/${slug}-v3.png`];
  }

  function renderDots(){
    const wrap=document.getElementById('ppageImgDots');
    if(!wrap) return;
    wrap.innerHTML=imgList.map((_,i)=>
      `<div class="ppage-img-dot${i===imgIndex?' active':''}"></div>`
    ).join('');
    wrap.querySelectorAll('.ppage-img-dot').forEach((d,i)=>d.addEventListener('click',()=>goToImg(i)));
  }

  function updateArrow(){
    const btn=document.getElementById('ppageImgNext');
    if(!btn) return;
    btn.classList.toggle('hidden', isTemp || imgIndex>=imgList.length-1);
  }

  function renderTempThumbs(){
    const wrap=document.getElementById('ppageThumbs');
    if(!wrap) return;
    wrap.innerHTML='';
    imgList.forEach((src,i)=>{
      const thumb=document.createElement('div');
      thumb.className='ppage-thumb';
      thumb.dataset.index=i;
      thumb.innerHTML=`<img src="${src}" alt="">`;
      gsap.set(thumb,{opacity:0,y:20,scale:0.8});
      wrap.appendChild(thumb);
      gsap.to(thumb,{opacity:1,y:0,scale:1,duration:0.35,delay:i*0.06,ease:'back.out(1.5)'});
      thumb.addEventListener('click',()=>activateFromTemp(i));
    });
  }

  function activateFromTemp(newIndex){
    isTemp=false;
    const imgEl=document.getElementById('ppageImg');
    const imgWrap=document.getElementById('ppageImgWrap');
    const wrap=document.getElementById('ppageThumbs');

    wrap.innerHTML='';
    for(let i=0;i<newIndex;i++) addThumb(imgList[i],i);
    imgIndex=newIndex;

    const IMG_SCALES={
      'apple-watch-ultra-3':      [1,1,1],
      'apple-watch-serie-10':     [1,1,0.75],
      'apple-watch-black-ultra-2':[1,0.75,0.75],
      'airpods-4ta-generacion':   [1,1,1.3],
      'airpods-pro-2':            [1,1,1],
      'airpods-3ra-generacion':   [1,1,1],
      'bateria-magsafe':          [1,1,1],
      'max-magneticos':           [1,1,1],
      'cargador-lightning-completo':[1,1.4,1],
      'cargador-tipo-c-completo': [1,1,1],
      'cargador-samsung-45w':     [1,1,1],
    };

    gsap.to(imgWrap,{opacity:0,scale:0.88,duration:0.25,ease:'power3.in',
      onComplete:()=>{
        imgEl.src=imgList[imgIndex];
        const s=(IMG_SCALES[getImgSlug(currentProduct.name)]??[1,1,1])[imgIndex]??1;
        document.getElementById('ppageImgWrap').style.setProperty('--ppage-img-scale',s);
        gsap.fromTo(imgWrap,{opacity:0,scale:0.88},{opacity:1,scale:1,duration:0.4,ease:'power3.out'});
      }
    });
    renderDots(); updateArrow();
  }

  function addThumb(src,fromIndex){
    const wrap=document.getElementById('ppageThumbs');
    if(!wrap) return;
    if(wrap.querySelector(`[data-index="${fromIndex}"]`)) return;
    const thumb=document.createElement('div');
    thumb.className='ppage-thumb';
    thumb.dataset.index=fromIndex;
    thumb.innerHTML=`<img src="${src}" alt="">`;
    gsap.set(thumb,{opacity:0,y:20,scale:0.8});
    wrap.appendChild(thumb);
    gsap.to(thumb,{opacity:1,y:0,scale:1,duration:0.35,ease:'back.out(1.5)'});
    thumb.addEventListener('click',()=>goToImg(fromIndex));
  }

  let isAnimatingImg = false;

  function goToImg(newIndex){
    if(newIndex===imgIndex) return;
    if(isTemp) return;
    if(isAnimatingImg) return;
    if(newIndex < 0 || newIndex >= imgList.length) return;
    const imgEl=document.getElementById('ppageImg');
    const imgWrap=document.getElementById('ppageImgWrap');
    const direction=newIndex>imgIndex?1:-1;
    const prevSrc=imgEl.src, prevIndex=imgIndex;

    const preloader = new Image();
    preloader.src = imgList[newIndex];

    function doTransition(){
      isAnimatingImg = true;
      if(direction>0){
        addThumb(prevSrc,prevIndex);
      } else {
        const wrap=document.getElementById('ppageThumbs');
        if(wrap) wrap.querySelectorAll('.ppage-thumb').forEach(thumb=>{
          if(Number(thumb.dataset.index)>=newIndex)
            gsap.to(thumb,{opacity:0,y:20,scale:0.8,duration:0.25,ease:'power2.in',onComplete:()=>thumb.remove()});
        });
      }
      imgIndex=newIndex;
      gsap.to(imgWrap,{
        x:direction>0?-60:60,opacity:0,scale:0.88,duration:0.3,ease:'power3.in',
        onComplete:()=>{
          imgEl.src=imgList[imgIndex];
          const IMG_SCALES={
            'apple-watch-ultra-3':      [1,1,1],
            'apple-watch-serie-10':     [1,1,0.75],
            'apple-watch-black-ultra-2':[1,0.75,0.75],
            'airpods-4ta-generacion':   [1,1,1.3],
            'airpods-pro-2':            [1,1,1],
            'airpods-3ra-generacion':   [1,1,1],
            'bateria-magsafe':          [1,1,1],
            'max-magneticos':           [1,1,1],
            'cargador-lightning-completo':[1,1.4,1],
            'cargador-tipo-c-completo': [1,1,1],
            'cargador-samsung-45w':     [1,1,1],
          };
          const s=(IMG_SCALES[getImgSlug(currentProduct?.name||'')]??[1,1,1])[imgIndex]??1;
          const iw=document.getElementById('ppageImgWrap');
          if(iw) iw.style.setProperty('--ppage-img-scale',s);
          gsap.fromTo(imgWrap,{x:direction>0?80:-80,opacity:0,scale:0.88},{x:0,opacity:1,scale:1,duration:0.45,ease:'power3.out',
            onComplete:()=>{ isAnimatingImg=false; }});
        }
      });
      renderDots(); updateArrow();
    }

    if(preloader.complete){
      doTransition();
    } else {
      preloader.onload  = doTransition;
      preloader.onerror = doTransition;
    }
  }

  function resetCarousel(cardImgSrc, name, mappedKey){
    imgIndex=0; imgList=buildImgList(cardImgSrc, mappedKey || name);
    const wrap=document.getElementById('ppageThumbs');
    if(wrap) wrap.innerHTML='';
    const imgWrap=document.getElementById('ppageImgWrap');
    if(imgWrap) imgWrap.style.setProperty('--ppage-img-scale','1');
    renderDots(); updateArrow();
  }

  function priceForQty(q){
    let u=tiers[0]?.price??0;
    for(const t of tiers) if(q>=t.qty) u=t.price;
    return u;
  }

  function renderTiers(){
    const table=document.getElementById('ppagePricesTable');
    const base=tiers[0]?.price??1;
    const sel=document.getElementById('ppageTierSelectedText');
    const selPrice=document.getElementById('ppageTierSelectedPrice');
    if(sel) sel.textContent=qty===1?'1 unidad':`${qty}+ unidades`;
    if(selPrice) selPrice.textContent=fmt(priceForQty(qty));
    table.innerHTML=tiers.map(tier=>{
      const pct=Math.round((1-tier.price/base)*100);
      const save=pct>0?`−${pct}%`:'Base';
      return `<div class="price-row${qty===tier.qty?' selected':''}" data-qty="${tier.qty}" data-price="${tier.price}">
        <span class="price-row-qty">${tier.qty===1?'1 unidad':`${tier.qty}+ unidades`}</span>
        <span class="price-row-amount">${fmt(tier.price)} <small style="font-family:var(--font-body);font-size:11px;opacity:0.5">c/u</small></span>
        <span class="price-row-save">${save}</span>
      </div>`;
    }).join('');
    table.querySelectorAll('.price-row').forEach(row=>{
      row.addEventListener('click',()=>{
        qty=Number(row.dataset.qty);
        document.getElementById('ppageQtyNum').textContent=qty;
        updateTotal(); renderTiers();
      });
    });
  }

  function openTiers(){
    tiersOpen=true;
    const list=document.getElementById('ppageTiersList');
    const chev=document.getElementById('ppageTierChevron');
    list.style.height=list.scrollHeight+'px';
    list.classList.add('open'); chev.classList.add('open');
  }

  function closeTiers(){
    tiersOpen=false;
    const list=document.getElementById('ppageTiersList');
    const chev=document.getElementById('ppageTierChevron');
    list.style.height='0';
    list.classList.remove('open'); chev.classList.remove('open');
  }

  function toggleTiers(){tiersOpen?closeTiers():openTiers();}

  function openAccordion(id){
    const body=document.getElementById(id+'-body');
    const chev=document.getElementById(id+'-chev');
    if(!body||!chev) return;
    const isOpen=body.style.height!=='0px'&&body.style.height!=='';
    if(isOpen){body.style.height='0';chev.classList.remove('open');}
    else{body.style.height=body.scrollHeight+'px';chev.classList.add('open');}
  }

  function updateTotal(){
    document.getElementById('ppageTotal').textContent=fmt(priceForQty(qty)*qty);
    renderTiers();
  }

  function renderFeatures(key){
    const feats=FEATURES[key]||[];
    const inner=document.getElementById('ppage-features-inner');
    if(inner) inner.innerHTML='<ul>'+feats.map(f=>`<li>${f}</li>`).join('')+'</ul>';
  }

  function _getCardImg(card){
    return card?.querySelector('.card-img-wrap img')||card?.querySelector('.csl-img img')||null;
  }

  function clearVTNames(card){
    if(card) card.style.viewTransitionName = '';
    const ci=_getCardImg(card); if(ci) ci.style.viewTransitionName='';
    ppage.style.viewTransitionName='';
    document.getElementById('ppageImg').style.viewTransitionName='';
  }

  function showModal(card){
    ppage.style.display='flex'; ppage.style.position='fixed';
    ppage.style.inset='0';
    ppage.style.left='0'; ppage.style.top='0';
    ppage.style.right='0'; ppage.style.bottom='0';
    ppage.style.width=''; ppage.style.height='';
    ppage.style.borderRadius='0'; ppage.style.overflow='hidden';
    document.body.style.overflow='hidden';
    ppage.style.viewTransitionName='vt-container';
    document.getElementById('ppageImg').style.viewTransitionName='vt-image';
    ppage.classList.add('active');
    overlay.classList.add('active'); overlay.style.opacity='1';
    card.style.visibility='hidden';
    card.style.viewTransitionName='';
    const ci=_getCardImg(card); if(ci) ci.style.viewTransitionName='';
  }

  function hideModal(targetCard){
    if(targetCard){
      targetCard.style.visibility='';
      targetCard.style.viewTransitionName='vt-container';
      const isCarousel = targetCard.classList.contains('csl-slide');
      const ci=_getCardImg(targetCard);
      if(ci && !isCarousel) ci.style.viewTransitionName='vt-image';
    }
    ppage.classList.remove('active'); overlay.classList.remove('active');
    overlay.style.opacity='0';
    isTemp=false; isAnimatingImg=false; openingImage='';
    const ppageInfo=document.getElementById('ppageInfo');
    if(ppageInfo) ppageInfo.style.opacity='';
    const pb=document.getElementById('ppageBack');
    if(pb) pb.style.opacity='';
    ppage.style.display='none'; ppage.style.viewTransitionName='';
    document.getElementById('ppageImg').style.viewTransitionName='';
    if(targetCard) targetCard.classList.remove('animating');
    isOpen=false; currentProduct=null; originCard=null;
    document.documentElement.style.overflow='';
    document.body.style.overflow='';
    
  }

  function open(card){
    if(isOpen) return;
    isOpen=true; originCard=card; qty=1; tiersOpen=false;

    const id  = 'cat-'+card.dataset.name.replace(/\s+/g,'-').toLowerCase();
    const rawKey = id.replace('cat-','');
    const key = SLIDE_KEY_MAP[rawKey] || rawKey;
    tiers = PRICE_TIERS[key]||[{qty:1,price:Number(card.dataset.price)}];

    currentProduct = {
      id, name: card.dataset.name,
      price:    fmt(tiers[0]?.price ?? card.dataset.price),
      rawPrice: tiers[0]?.price ?? Number(card.dataset.price),
      image:    (card.querySelector('.card-img-wrap img')||card.querySelector('.dc-img img')||card.querySelector('.csl-img img'))?.src||'',
    };

    openingImage = currentProduct.image;

    document.getElementById('ppageImg').src            = currentProduct.image;
    document.getElementById('ppageImg').alt            = currentProduct.name;
    document.getElementById('ppageName').textContent   = currentProduct.name;
    document.getElementById('ppageDesc').textContent   = card.dataset.desc||'';
    document.getElementById('ppageQtyNum').textContent = '1';

    ['ppage-features','ppage-delivery'].forEach(id=>{
      const b=document.getElementById(id+'-body');
      const c=document.getElementById(id+'-chev');
      if(b) b.style.height='0'; if(c) c.classList.remove('open');
    });
    renderTiers(); updateTotal(); renderFeatures(key);
    resetCarousel(currentProduct.image, card.dataset.name, key);

    const isCslSlide = card.classList.contains('csl-slide');

    ppage.querySelectorAll('*').forEach(el=>{
      el.style.opacity=''; el.style.transform=''; el.style.transition='';
    });

    if(isCslSlide){
      isTemp = true;
      updateArrow();
      renderTempThumbs();
    } else {
      const cardFileName = currentProduct.image.split('/').pop().split('?')[0];
      const matchIdx = imgList.findIndex(src => src.split('/').pop() === cardFileName);
      if(matchIdx > 0){
        imgIndex = matchIdx;
        const ppImg = document.getElementById('ppageImg');
        if(ppImg) ppImg.src = imgList[imgIndex];
        renderDots(); updateArrow();
      }
    }
    const list=document.getElementById('ppageTiersList');
    if(list) list.style.height='0';

    originRect = card.getBoundingClientRect();

    if(!document.startViewTransition || window.innerWidth <= 900){
      const cx=(originRect.left+originRect.width/2)/window.innerWidth*100;
      const cy=(originRect.top+originRect.height/2)/window.innerHeight*100;
      ppage.style.cssText=`display:flex;flex-direction:column;position:fixed;top:0;right:0;bottom:0;left:0;width:100vw;max-width:100vw;height:100dvh;margin:0;padding:0;border-radius:0;overflow:hidden;overflow-x:hidden;overflow-y:hidden;transform-origin:${cx.toFixed(2)}% ${cy.toFixed(2)}%;`;
      /* Scroll lock: html + body */
      document.documentElement.style.overflow='hidden';
      document.body.style.overflow='hidden';
      
      ppage.classList.add('active'); overlay.classList.add('active');
      overlay.style.opacity='0'; card.style.visibility='hidden';
      gsap.to(overlay,{opacity:1,duration:0.4,ease:'power2.out'});
      gsap.fromTo(ppage,{scale:0},{scale:1,duration:0.52,ease:'expo.out',
        onComplete(){
          /* Limpiar transform residual que puede afectar el layout */
          ppage.style.transformOrigin='';
          ppage.style.transform='';
        }});
      return;
    }

    card.style.viewTransitionName = 'vt-container';
    const ci = _getCardImg(card);
    if(ci){
      ci._savedFilter     = ci.style.filter;
      ci._savedTransition = ci.style.transition;
      ci.style.transition = 'none';
      ci.style.filter     = 'none';
      ci.offsetHeight;
      ci.style.viewTransitionName = 'vt-image';
    }

    const t = document.startViewTransition(() => showModal(card));
    const restoreCI = () => {
      if(ci && ci._savedFilter !== undefined){
        ci.style.transition = ci._savedTransition || '';
        ci.style.filter     = ci._savedFilter;
        delete ci._savedFilter; delete ci._savedTransition;
      }
    };
    t.finished
      .then(() => { clearVTNames(card); restoreCI(); })
      .catch(() => {
        clearVTNames(card); restoreCI();
        card.style.visibility = '';
        isOpen=false; currentProduct=null; originCard=null;
      });
  }

  function close(){
    if(!isOpen||!originRect) return;

    const targetCard = originCard;

    if(!document.startViewTransition || window.innerWidth <= 900){
      let rect=originRect;
      if(targetCard){ const f=targetCard.getBoundingClientRect(); if(f.width>0) rect=f; }
      const cx=(rect.left+rect.width/2)/window.innerWidth*100;
      const cy=(rect.top+rect.height/2)/window.innerHeight*100;
      ppage.style.transformOrigin=`${cx.toFixed(2)}% ${cy.toFixed(2)}%`;
      gsap.to(overlay,{opacity:0,duration:0.3,ease:'power2.in'});
      gsap.to(ppage,{scale:0,duration:0.42,ease:'expo.in',
        onComplete(){ hideModal(targetCard); }});
      return;
    }

    const ppageImgEl   = document.getElementById('ppageImg');
    const ppageImgWrap = document.getElementById('ppageImgWrap');

    /* Garantizar que openingImage esté lista antes del snapshot */
    const doCloseVT = () => {
      /* Matar tweens GSAP para evitar scale residual en ppageImgWrap */
      gsap.killTweensOf(ppageImgWrap);
      gsap.killTweensOf(ppageImgEl);
      if(ppageImgWrap){ ppageImgWrap.style.transform=''; ppageImgWrap.style.opacity=''; }
      if(ppageImgEl)   ppageImgEl.style.transition='none';
      if(ppageImgWrap) ppageImgWrap.style.setProperty('--ppage-img-scale','1');
      if(ppageImgEl)   ppageImgEl.offsetHeight;

      const ppageInfo=document.getElementById('ppageInfo');
      const ppageBack=document.getElementById('ppageBack');
      if(ppageInfo) ppageInfo.style.opacity='0';
      if(ppageBack) ppageBack.style.opacity='0';

      ppage.style.borderRadius='20px';
      document.documentElement.classList.add('vt-closing');

      const isCarousel = originCard?.classList.contains('csl-slide');
      ppage.style.viewTransitionName='vt-container';
      if(ppageImgEl && !isCarousel) ppageImgEl.style.viewTransitionName='vt-image';

      const t = document.startViewTransition(() => hideModal(targetCard));
      t.finished
        .then(()=>{
          const ciClose = _getCardImg(targetCard);
          if(ciClose) ciClose.style.opacity='0';
          clearVTNames(targetCard);
          requestAnimationFrame(()=>{ requestAnimationFrame(()=>{ if(ciClose) ciClose.style.opacity=''; }); });
        })
        .catch(()=>{ clearVTNames(targetCard); hideModal(targetCard); })
        .finally(()=>{ document.documentElement.classList.remove('vt-closing'); });
    };

    if(ppageImgEl && openingImage){
      ppageImgEl.src = openingImage;
      ppageImgEl.decode().then(doCloseVT).catch(doCloseVT);
    } else {
      doCloseVT();
    }
  }

  function init(){
    ppage.style.display='none';
    overlay.style.opacity='0';

    backBtn.addEventListener('click',close);
    overlay.addEventListener('click',close);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});

    const tierSel=document.getElementById('ppageTierSelected');
    if(tierSel) tierSel.addEventListener('click',toggleTiers);

    const nextViewBtn=document.getElementById('ppageImgNext');
    if(nextViewBtn) nextViewBtn.addEventListener('click',()=>goToImg(imgIndex+1));

    document.getElementById('ppageQtyMinus').addEventListener('click',()=>{
      if(qty>1){qty--;document.getElementById('ppageQtyNum').textContent=qty;updateTotal();}
    });
    document.getElementById('ppageQtyPlus').addEventListener('click',()=>{
      qty++;document.getElementById('ppageQtyNum').textContent=qty;updateTotal();
    });

    document.getElementById('ppageWaBtn')?.addEventListener('click',()=>{
      if(!currentProduct) return;
      const unit=priceForQty(qty),total=unit*qty;
      const msg=[
        '*\u00a1Hola!* Me interesa este producto:','',
        `\u25b8 ${qty}x ${currentProduct.name}`,
        `  Precio: ${fmt(unit)} c/u`,
        `  Total: *${fmt(total)}*`,'',
        '\u00bfTienen stock disponible?'
      ].join('\n');
      window.open(`https://wa.me/56942348587?text=${encodeURIComponent(msg)}`,'_blank');
    });

    document.getElementById('ppageCartBtn').addEventListener('click',()=>{
      if(!currentProduct) return;
      const unit=priceForQty(qty);
      const prod={...currentProduct,rawPrice:unit,price:fmt(unit)};
      for(let i=0;i<qty;i++) Cart.addItem(prod);
      const btn=document.getElementById('ppageCartBtn');
      /* Solo swap de ícono — sin texto para no romper el layout */
      btn.innerHTML='<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
      setTimeout(()=>{
        btn.innerHTML='<svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.2 14h9.5c.8 0 1.5-.5 1.7-1.2l3-7H6.2L5.3 3H1v2h3l3.6 7.6-1.3 2.4c-.1.2-.2.5-.2.8 0 1.1.9 2 2 2h12v-2H8.4c-.1 0-.2-.1-.2-.2l.03-.12L9.1 14z"/></svg>';
      },1800);
    });

    /* ── Mercado Pago desde el modal ── */
    document.getElementById('ppageMpBtn')?.addEventListener('click', async ()=>{
      if(!currentProduct) return;
      const btn = document.getElementById('ppageMpBtn');
      const unit = priceForQty(qty);
      const total = unit * qty;
      btn.textContent = 'Procesando...';
      btn.disabled = true;
      try {
        const res = await fetch('/api/create-preference', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [{ name: currentProduct.name, qty, price: unit }]
          }),
        });
        const data = await res.json();
        if(data.init_point) {
          window.location.href = data.init_point;
        } else {
          throw new Error('Sin init_point');
        }
      } catch(err) {
        console.error('MP modal error:', err);
        btn.textContent = 'Error, intenta de nuevo';
        btn.disabled = false;
        setTimeout(()=>{
          btn.innerHTML = `<svg style="width:18px;height:18px;fill:currentColor;vertical-align:middle;margin-right:8px" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>Pagar con Mercado Pago`;
          btn.disabled = false;
        }, 2500);
      }
    });

    ['ppage-features','ppage-delivery'].forEach(id=>{
      const header=document.getElementById(id+'-header');
      if(header) header.addEventListener('click',()=>openAccordion(id));
    });

    document.querySelectorAll('.card-btn').forEach(btn=>{
      btn.addEventListener('click',e=>{e.stopPropagation();open(btn.closest('[data-name]'));});
    });

    document.getElementById('storeBannerBtn')?.addEventListener('click',()=>{
      document.getElementById('productos').scrollIntoView({behavior:'smooth'});
    });
  }

  return {init,close,open};
})();

/* ══════════════════════════════════════════════
   MÓDULO: NAV SCROLL
   ══════════════════════════════════════════════ */
const NavScroll = (() => {
  function init(){
    const nav=document.querySelector('.nav');
    window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>40),{passive:true});
  }
  return {init};
})();

/* ══════════════════════════════════════════════
   MÓDULO: SECCIÓN PRODUCTOS
   ══════════════════════════════════════════════ */
const ProductsSection = (() => {
  function applyImageScales(){
    document.querySelectorAll('.product-card').forEach(card=>{
      card.style.setProperty('--card-img-scale',card.dataset.imgScale??0.75);
    });
  }
  function animateCards(){
    const cards=document.querySelectorAll('.product-card');
    if(!cards.length) return;
    gsap.set(cards,{opacity:0,y:40});
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const card=entry.target,idx=Array.from(cards).indexOf(card);
          gsap.to(card,{opacity:1,y:0,duration:0.65,ease:'power3.out',delay:(idx%4)*0.08});
          obs.unobserve(card);
        }
      });
    },{threshold:0.1});
    cards.forEach(c=>obs.observe(c));
  }
  function init(){applyImageScales();animateCards();}
  return {init};
})();

/* ══════════════════════════════════════════════
   MÓDULO: SWIPER CARRUSEL — Productos Destacados
   ══════════════════════════════════════════════ */
const Carousel3D = (() => {
  function init(){
    if(typeof Swiper==='undefined') return;

    const swiper=new Swiper('.csl-swiper',{
      effect:'coverflow',grabCursor:true,centeredSlides:true,
      slidesPerView:'auto',loop:false,initialSlide:2,
      mousewheel:{forceToAxis:true},keyboard:{enabled:true,onlyInViewport:true},
      coverflowEffect:{rotate:50,stretch:0,depth:50,modifier:1,slideShadows:false},
      navigation:{prevEl:'.csl-arr-prev',nextEl:'.csl-arr-next'},
      pagination:{el:'.csl-pagination',clickable:true},
    });

    const slides = document.querySelectorAll('.csl-swiper .swiper-slide');
    gsap.set(slides, { opacity:0, y:50 });
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          gsap.to([...slides], { opacity:1, y:0, duration:0.7, ease:'power3.out', stagger:0.08 });
          obs.disconnect();
        }
      });
    }, { threshold:0.2 });
    obs.observe(document.querySelector('.csl-swiper'));

    let wasDragged=false,pendingOpen=null;
    swiper.on('sliderMove',()=>{wasDragged=true;});
    swiper.on('touchStart',()=>{wasDragged=false;});
    swiper.on('slideChangeTransitionEnd',()=>{
      if(pendingOpen!==null){const s=pendingOpen;pendingOpen=null;ProductModal.open(s);}
    });

    document.querySelectorAll('.csl-swiper .swiper-slide[data-name]').forEach((slide,i)=>{
      slide.addEventListener('click',()=>{
        if(wasDragged) return;
        if(!slide.classList.contains('swiper-slide-active')){pendingOpen=slide;swiper.slideTo(i);return;}
        ProductModal.open(slide);
      });
    });
  }
  return {init};
})();

/* ══ FLIP CARDS — POR QUÉ ELEGIRNOS ══ */
document.querySelectorAll('.porque-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
});

/* ══ INIT ══ */
document.addEventListener('DOMContentLoaded',()=>{
  ProductNav.init();
  Cart.init();
  CartButton.init();
  MaskReveal.init();
  ProductsSection.init();
  NavScroll.init();
  ProductModal.init();
  Carousel3D.init();

  const revealRect=document.getElementById('revealRect');
  const svgText=revealRect?revealRect.closest('svg'):null;
  if(revealRect&&svgText&&typeof ScrollTrigger!=='undefined'){
    gsap.fromTo(revealRect,
      {attr:{width:0}},
      {
        attr:{width:520},ease:'none',
        scrollTrigger:{trigger:'.csl-title-wrap',start:'top 65%',end:'top -10%',scrub:2}
      }
    );
  }
});
