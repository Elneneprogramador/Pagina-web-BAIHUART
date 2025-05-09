
// ----- EVENTOS INICIALES -----
document.addEventListener('DOMContentLoaded', () => {
  configurarDropdown();
  configurarCarousel();
  configurarBusqueda();
  configurarIdioma();
  mostrarNombreUsuario();
  actualizarContadorCarrito();
  function mostrarUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const btnLogout = document.getElementById('btn-logout');
    const spanUsuario = document.getElementById('nombreUsuarioHeader');
  
    if (usuario) {
      spanUsuario.textContent = usuario.email.split('@')[0];
      if (btnLogout) btnLogout.style.display = 'inline-block';
    } else {
      spanUsuario.textContent = '';
      if (btnLogout) btnLogout.style.display = 'none';
    }
  }
  
  // Ejecutar al cargar
  document.addEventListener('DOMContentLoaded', mostrarUsuario);
  
});

// ----- CONFIGURACIONES -----
function configurarDropdown() {
  const dropdown = document.querySelector('.dropdown');
  const toggle = dropdown?.querySelector('.dropdown-toggle');
  const menu = dropdown?.querySelector('.dropdown-menu');

  if (dropdown && toggle && menu) {
    dropdown.addEventListener('mouseenter', () => { if (window.innerWidth >= 768) menu.classList.add('show'); });
    dropdown.addEventListener('mouseleave', () => { if (window.innerWidth >= 768) menu.classList.remove('show'); });
    toggle.addEventListener('click', e => {
      e.preventDefault();
      menu.classList.toggle('show');
    });
  }

  window.addEventListener('resize', () => {
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
      if (menu) menu.classList.remove('show');
      actualizarCarousel();
    }, 150);
  });
}

function configurarBusqueda() {
  const barraBusqueda = document.getElementById('barra-busqueda');
  if (barraBusqueda) {
    barraBusqueda.addEventListener('input', () => {
      const filtro = barraBusqueda.value.toLowerCase().trim();
      const productos = document.querySelectorAll('.product-card');
      productos.forEach(card => {
        const texto = card.innerText.toLowerCase();
        card.style.display = texto.includes(filtro) ? 'block' : 'none';
      });
    });
  }
}

function configurarIdioma() {
  const idiomaGuardado = localStorage.getItem('idiomaSeleccionado') || 'es';
  document.getElementById('selector-idioma').value = idiomaGuardado;
  cambiarIdioma(idiomaGuardado);

  document.getElementById('selector-idioma').addEventListener('change', (e) => {
    const idioma = e.target.value;
    localStorage.setItem('idiomaSeleccionado', idioma);
    cambiarIdioma(idioma);
  });
}

// Cerrar sesión (agrega en tu header)
function cerrarSesion() {
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

// ----- CARRUSEL -----
function configurarCarousel() {
  const track = document.querySelector('.carousel-track');
  const leftBtn = document.querySelector('.carousel-btn.left');
  const rightBtn = document.querySelector('.carousel-btn.right');
  const cards = Array.from(document.querySelectorAll('.product-card'));

  if (!track || !leftBtn || !rightBtn || !cards.length) return;

  const totalItems = cards.length;
  let index = 0;
  let scrollInterval;

  function getItemsPerView() {
    if (window.innerWidth >= 1200) return 4;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function updateCarousel() {
    const cardWidth = cards[0].offsetWidth + 16;
    const itemsPerView = getItemsPerView();
    const maxIndex = totalItems - itemsPerView;
    if (index > maxIndex) index = 0;
    const offset = index * cardWidth;
    track.style.transform = `translateX(-${offset}px)`;
  }

  rightBtn.addEventListener('click', () => {
    const items = getItemsPerView();
    if (index < totalItems - items) {
      index++;
      updateCarousel();
    }
  });

  leftBtn.addEventListener('click', () => {
    if (index > 0) {
      index--;
      updateCarousel();
    }
  });

  function startAutoScroll() {
    clearInterval(scrollInterval);
    scrollInterval = setInterval(() => {
      const items = getItemsPerView();
      index = (index < totalItems - items) ? index + 1 : 0;
      updateCarousel();
    }, 4000);
  }

  [track, leftBtn, rightBtn].forEach(el => {
    el.addEventListener('mouseenter', () => clearInterval(scrollInterval));
    el.addEventListener('mouseleave', startAutoScroll);
  });

  updateCarousel();
  startAutoScroll();
}

// ----- FUNCIONES GLOBALES -----
function agregarAlCarrito(nombre, img, precio) {
  // Obtener carrito actual o crear uno vacío
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  
  // Crear objeto del producto
  const producto = {
    id: Date.now(), // ID único
    nombre: nombre,
    img: img,
    precio: precio,
    cantidad: 1
  };

  // Verificar si el producto ya está en el carrito
  const productoExistente = carrito.find(item => item.nombre === nombre);
  
  if (productoExistente) {
    productoExistente.cantidad += 1; // Aumentar cantidad si ya existe
  } else {
    carrito.push(producto); // Agregar nuevo producto
  }

  // Guardar en localStorage
  localStorage.setItem('carrito', JSON.stringify(carrito));
  
  // Actualizar interfaz
  actualizarContadorCarrito();
  mostrarNotificacion(`"${nombre}" se agregó al carrito`);
  animarCarrito();

  // Si estamos en carrito.html, actualizar la lista
  if (window.location.pathname.includes('carrito.html')) {
    cargarCarrito();
  }
}


function mostrarNombreUsuario() {
  const usuarioStr = localStorage.getItem('usuario');
  const span = document.getElementById('nombreUsuarioHeader');
  if (usuarioStr && span) {
    try {
      const usuario = JSON.parse(usuarioStr);
      const nombre = usuario.nombre || usuario.email.split('@')[0];
      span.innerText = `Hola, ${nombre}`;
    } catch {
      span.innerText = '';
    }
  } else if (span) {
    span.innerText = '';
  }
}

function abrirLightbox(src) {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (lightbox && img) {
    img.src = src;
    lightbox.style.display = 'flex';
  }
}

function cerrarLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) lightbox.style.display = 'none';
}

// Mostrar productos en carrito.html
function cargarCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contenedor = document.getElementById('carrito-contenido');
  const totalEl = document.getElementById('total');

  if (carrito.length === 0) {
    contenedor.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío 🛒</p>';
    totalEl.textContent = '0';
    return;
  }

  contenedor.innerHTML = carrito.map(item => `
    <div class="producto-carrito">
      <img src="${item.img}" alt="${item.nombre}" onerror="this.src='img/placeholder.jpg'">
      <div class="info-producto">
        <h4>${item.nombre}</h4>
        <p>$${item.precio.toLocaleString()} x ${item.cantidad}</p>
        <p>Subtotal: $${(item.precio * item.cantidad).toLocaleString()}</p>
        <button class="hero-btn btn-eliminar" onclick="eliminarDelCarrito(${item.id})">Eliminar</button>
      </div>
    </div>
  `).join('');

  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  totalEl.textContent = total.toLocaleString();
}


function eliminarDelCarrito(id) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito = carrito.filter(item => item.id !== id);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  cargarCarrito();
  actualizarContadorCarrito();
  mostrarNotificacion('Producto eliminado');
}

// Vaciar carrito
function vaciarCarrito() {
  localStorage.removeItem('carrito');
  cargarCarrito();
  actualizarContadorCarrito();
  mostrarNotificacion('Carrito vaciado');
}

function cambiarIdioma(idioma) {
  const textos = traducciones[idioma];
  for (const id in textos) {
    if (id === "buscar-placeholder") continue;
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = textos[id];
  }

  const barra = document.getElementById('barra-busqueda');
  if (barra && textos["buscar-placeholder"]) {
    barra.setAttribute("placeholder", textos["buscar-placeholder"]);
  }

  if (window.location.pathname.includes('carrito.html')) cargarCarrito();
}

function mostrarNotificacion(mensaje) {
  const noti = document.getElementById('notificacion-carrito');
  const texto = document.getElementById('notificacion-mensaje');
  if (!noti || !texto) return;
  texto.textContent = mensaje;
  noti.classList.add('activa');
  setTimeout(() => noti.classList.remove('activa'), 3000);
}

function animarCarrito() {
  const carritoIcon = document.querySelector('.cart i');
  if (!carritoIcon) return;
  carritoIcon.classList.add('bounce');
  setTimeout(() => carritoIcon.classList.remove('bounce'), 500);
}

function getIdioma() {
  return localStorage.getItem('idiomaSeleccionado') || 'es';
}

// ----- TRADUCCIONES -----
const traducciones = {
  es: {
    "nav-tienda": "Tienda",
    "nav-galeria": "Galería",
    "nav-ofertas": "Ofertas",
    "hero-titulo": "Arte que cobra vida. Estilo que deja huella.",
    "ver-productos": "VER PRODUCTOS",
    "buscar-placeholder": "Buscar productos…",
    "notificacion-producto": "fue añadido al carrito.",
    "titulo-carrito": "Tu Carrito",
    "btn-vaciar": "Vaciar Carrito",
    "carrito-vacio": "Tu carrito está vacío 🛒",
    "total-label-prefix": "Total",
    "eliminar": "Eliminar",
    "galeria-titulo":"GALERÍA DE DISEÑOS",
    "filter-todos":"Todos",
    "filter-miticos":"Animales Míticos",
    "filter-anime":"Anime",
    "filter-pop":"Cultura Pop",
    "ofertas-titulo":"OFERTAS ESPECIALES",
  "ofertas-subtitulo":"Ofertas Especiales 🔥",
  "oferta1-text": "Pack: Póster + Stickers",
  "oferta1-old": "$50.000",
  "oferta1-new": "$45.000",
  "oferta1-btn": "Agregar al carrito",

  // segundo pack
  "oferta2-text": "Pack: Sudadera con capucha + Póster + Stickers",
  "oferta2-old": "$145.000",
  "oferta2-new": "$115.000",
  "oferta2-btn": "Agregar al carrito",
  "oferta3-text": "Pack: Sudadera con capucha + Póster + Stickers",
"oferta3-old": "$145.000",
"oferta3-new": "$115.000",
"oferta3-btn": "Agregar al carrito",
  },
  en: {
    "nav-tienda": "Shop",
  "nav-galeria": "Gallery",
  "nav-ofertas": "Offers",
  "hero-titulo": "YOUR STYLE, YOUR ATTITUDE",
  "ver-productos": "SEE PRODUCTS",
  "buscar-placeholder": "Search products…",
  "notificacion-producto": "was added to the cart.",
  "titulo-carrito": "Your Cart",
  "btn-vaciar": "Empty Cart",
  "carrito-vacio": "Your cart is empty 🛒",
  "total-label-prefix":"Total",
  "eliminar": "Remove",
  "galeria-titulo":"DESIGNS GALLERY",
  "filter-todos":"All",
  "filter-miticos":"Mythical Animals",
  "filter-anime":"Anime",
  "filter-pop":"Pop Culture",
  "ofertas-titulo":"SPECIAL OFFERS",
  "ofertas-subtitulo":"Special Deals 🔥",
  // primer pack
  "oferta1-text": "Pack: Poster + Sticker Pack",
  "oferta1-old": "$50.000",
  "oferta1-new": "$45.000",
  "oferta1-btn": "Add to cart",
  // segundo pack
  "oferta2-text": "Pack: Hoodie + Poster + Sticker",
  "oferta2-old": "$145.000",
  "oferta2-new": "$115.000",
  "oferta2-btn": "Add to cart",
  "oferta3-text": "Pack: Hoodie + Poster + Sticker",
"oferta3-old": "$145.000",
"oferta3-new": "$115.000",
"oferta3-btn": "Add to cart",

},
pt: {
  "nav-tienda": "Loja",
  "nav-galeria": "Galeria",
  "nav-ofertas": "Ofertas",
  "hero-titulo": "SEU ESTILO, SUA ATITUDE",
  "ver-productos": "VER PRODUTOS",
  "buscar-placeholder": "Buscar produtos…",
  "notificacion-producto": "foi adicionado ao carrinho.",
  "titulo-carrito": "Seu carrinho",
  "btn-vaciar": "Esvaziar carrinho",
  "carrito-vacio": "Seu carrinho está vazio 🛒",
  "total-label-prefix": "Total",
  "eliminar": "Remover",
  "galeria-titulo":"GALERIA DE DESENHOS",
  "filter-todos":"Todos",
  "filter-miticos":"Animais Míticos",
  "filter-anime":"Anime",
  "filter-pop":"Cultura Pop",
  "ofertas-titulo":"OFERTAS ESPECIAIS",
  "ofertas-subtitulo":"Ofertas Especiais 🔥",
  // primeiro pack
  "oferta1-text": "Pacote: Pôster + Adesivo",
  "oferta1-old": "$50.000",
  "oferta1-new": "$45.000",
  "oferta1-btn": "Adicionar ao carrinho",
  // segundo pack
  "oferta2-text": "Pacote: Moletom + Pôster + Adesivo",
  "oferta2-old": "$145.000",
  "oferta2-new": "$115.000",
  "oferta2-btn": "Adicionar ao carrinho",
  "oferta3-text": "Pacote: Moletom com Capuz + Pôster + Adesivo",
  "oferta3-old": "$145.000",
  "oferta3-new": "$115.000",
  "oferta3-btn": "Adicionar ao carrinho"

}
  
};

// Simulación de base de datos (solo para demo)
// Base de datos simulada
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

// Elementos del DOM
const tituloFormulario = document.getElementById('titulo-formulario');
const btnAccion = document.getElementById('btn-accion');
const switchFormulario = document.getElementById('switch-formulario');
const textoSwitch = document.getElementById('texto-switch');
const camposRegistro = document.getElementById('campos-registro');
const errorLogin = document.getElementById('error-login');

let esRegistro = false;

// Alternar entre Login/Registro
switchFormulario.addEventListener('click', (e) => {
  e.preventDefault();
  esRegistro = !esRegistro;

  if (esRegistro) {
    tituloFormulario.textContent = "Regístrate";
    btnAccion.textContent = "Registrar";
    camposRegistro.style.display = "block";
    textoSwitch.textContent = "¿Ya tienes cuenta?";
    switchFormulario.textContent = "Inicia sesión aquí";
  } else {
    tituloFormulario.textContent = "Iniciar Sesión";
    btnAccion.textContent = "Entrar";
    camposRegistro.style.display = "none";
    textoSwitch.textContent = "¿No tienes cuenta?";
    switchFormulario.textContent = "Regístrate aquí";
  }
});

// Manejar Login/Registro
btnAccion.addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (esRegistro) {
    registrarUsuario(email, password);
  } else {
    iniciarSesion(email, password);
  }
});

// Función para registrar
function registrarUsuario(email, password) {
  const nombre = document.getElementById('nombre').value;
  const apellido = document.getElementById('apellido').value;
  const telefono = document.getElementById('telefono').value;

  // Validación básica
  if (!email || !password || !nombre || !apellido || !telefono) {
    mostrarError("Todos los campos son obligatorios");
    return;
  }

  if (usuarios.some(u => u.email === email)) {
    mostrarError("Este correo ya está registrado");
    return;
  }

  // Guardar usuario
  usuarios.push({
    nombre,
    apellido,
    telefono,
    email,
    password // ¡En un proyecto real NUNCA guardes contraseñas así!
  });

  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  mostrarError("¡Registro exitoso!", true);
  esRegistro = false;
  switchFormulario.click(); // Volver a login
}

// Función para login
function iniciarSesion(email, password) {
  const usuario = usuarios.find(u => u.email === email && u.password === password);

  if (usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    window.location.href = "index.html";
  } else {
    mostrarError("Correo o contraseña incorrectos");
  }
}

// Mostrar mensajes de error/éxito
function mostrarError(mensaje, esExito = false) {
  errorLogin.textContent = mensaje;
  errorLogin.style.color = esExito ? "#27ae60" : "#ff3223";
  errorLogin.style.display = "block";
  setTimeout(() => errorLogin.style.display = "none", 3000);
}

// ——— Contador del icono de carrito ———
function actualizarContadorCarrito() {
  // Leer carrito y calcular total de ítems
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  // Actualizar todos los spans .cart-count (para tienda y carrito.html)
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = totalItems;
  });
}

// Llamamos también justo después de definirla,
// para asegurarnos de que al cargar la página muestre el valor correcto.
document.addEventListener('DOMContentLoaded', actualizarContadorCarrito);
document.addEventListener('DOMContentLoaded', () => {
  const items = [...document.querySelectorAll('.masonry-item')];
  const buttons = document.querySelectorAll('.filter-btn');
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCap = document.getElementById('lb-caption');
  let currentIndex = 0;

  // FILTRO
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      items.forEach(item => {
        item.style.display = (cat === '*' || item.dataset.category === cat)
          ? 'block' : 'none';
      });
    });
  });

  // LIGHTBOX: abrir
  items.forEach((item, i) => {
    item.querySelector('img').addEventListener('click', () => {
      currentIndex = i;
      showLightbox();
    });
  });

  function showLightbox() {
    const item = items[currentIndex];
    lbImg.src = item.querySelector('img').src;
    lbCap.textContent = item.querySelector('figcaption').textContent;
    lb.style.display = 'flex';
  }

  // LIGHTBOX: cerrar y nav
  document.querySelector('.lb-close').onclick = ()=> lb.style.display='none';
  document.querySelector('.lb-prev').onclick = ()=> {
    currentIndex = (currentIndex-1+items.length)%items.length; showLightbox();
  };
  document.querySelector('.lb-next').onclick = ()=> {
    currentIndex = (currentIndex+1)%items.length; showLightbox();
  };
});
// 2) Variable global de idioma
let currentLang = 'es';

// 3) Función que renderiza el carrito (simplificada)
function renderCart() {
  const emptyEl = document.getElementById('carrito-empty');
  if (cart.length === 0) {
    emptyEl.style.display = 'block';
    emptyEl.textContent = translations[currentLang]['carrito-vacio'];
  } else {
    emptyEl.style.display = 'none';
    // … renderizas los items …
  }
}

// 4) Listener del selector de idioma
document.getElementById('selector-idioma')
  .addEventListener('change', e => {
    currentLang = e.target.value;    // 'es', 'en' o 'pt'
    renderCart();                    // vuelve a pintar el carrito (vacío o con items)
    updateStaticTexts();             // y actualiza los demás textos fijos
  });

// 5) Ejemplo de updateStaticTexts para otros textos
function updateStaticTexts() {
  document.getElementById('titulo-carrito')
    .textContent = translations[currentLang]['titulo-carrito'];
  document.getElementById('btn-vaciar')
    .textContent = translations[currentLang]['btn-vaciar'];
  // …etc…
}

// ¡No olvides llamar a renderCart() al inicializar tu página!
renderCart();


  