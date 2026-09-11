/**
 * NovaTrend E-Commerce Interactive Script
 * Handles Cart Drawer, Wishlist, Flash Sale Countdown, Quick View Modal, and Search
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. Initial State & Data
  // ==========================================
  const FREE_SHIPPING_THRESHOLD = 300.00;

  // Initial Cart State (3 items matching the mockup badge "3")
  let cart = [
    {
      id: 'p1',
      name: 'Essential Hoodie',
      price: 59.99,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'p2',
      name: 'Air Max 270',
      price: 129.99,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'p4',
      name: 'Smart Watch Series 9',
      price: 199.99,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80'
    }
  ];

  let wishlist = new Set();

  // ==========================================
  // 2. DOM Elements
  // ==========================================
  // Header Elements
  const cartToggleBtn = document.getElementById('cartToggleBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartCountBadge = document.getElementById('cartCount');
  const drawerCartCount = document.getElementById('drawerCartCount');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotalAmount = document.getElementById('cartSubtotalAmount');
  const shippingStatusText = document.getElementById('shippingStatusText');
  const shippingProgressBar = document.getElementById('shippingProgressBar');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const continueShoppingBtn = document.getElementById('continueShoppingBtn');
  
  // Wishlist Elements
  const wishlistBtn = document.getElementById('wishlistBtn');
  const wishlistCountBadge = document.getElementById('wishlistCount');

  // Search Elements
  const searchTrigger = document.getElementById('searchTrigger');
  const searchModal = document.getElementById('searchModal');
  const searchCloseBtn = document.getElementById('searchCloseBtn');
  const searchInput = document.getElementById('searchInput');

  // Mobile Menu
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const navMenu = document.getElementById('navMenu');

  // Quick View Modal Elements
  const quickViewOverlay = document.getElementById('quickViewOverlay');
  const quickViewCloseBtn = document.getElementById('quickViewCloseBtn');
  const qvImg = document.getElementById('qvImg');
  const qvTitle = document.getElementById('qvTitle');
  const qvPrice = document.getElementById('qvPrice');
  const qvRating = document.getElementById('qvRating');
  const qvDesc = document.getElementById('qvDesc');
  const qvQtyInput = document.getElementById('qvQtyInput');
  const qvQtyMinus = document.getElementById('qvQtyMinus');
  const qvQtyPlus = document.getElementById('qvQtyPlus');
  const qvAddToCartBtn = document.getElementById('qvAddToCartBtn');

  // Toast Container
  const toastContainer = document.getElementById('toastContainer');

  let currentQuickViewProduct = null;

  // ==========================================
  // 3. Cart Functions
  // ==========================================
  function updateCartUI() {
    // Calculate total quantity & subtotal
    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Update Badges
    cartCountBadge.textContent = totalQty;
    drawerCartCount.textContent = `(${totalQty})`;

    // Update Subtotal Display
    cartSubtotalAmount.textContent = `$${subtotal.toFixed(2)}`;

    // Update Free Shipping Progress Bar
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      shippingStatusText.innerHTML = `🎉 Congratulations! You have unlocked <strong>Free Worldwide Shipping</strong>!`;
      shippingProgressBar.style.width = '100%';
    } else {
      const remaining = (FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2);
      const percentage = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      shippingStatusText.innerHTML = `You're <strong>$${remaining}</strong> away from <strong>Free Worldwide Shipping</strong>!`;
      shippingProgressBar.style.width = `${percentage}%`;
    }

    // Render Cart Items
    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div style="text-align: center; padding: 40px 10px; color: #9CA3AF;">
          <i class="fa-solid fa-bag-shopping" style="font-size: 3rem; margin-bottom: 12px; opacity: 0.5;"></i>
          <p style="font-weight: 600; font-size: 1.05rem; color: #374151;">Your bag is currently empty</p>
          <p style="font-size: 0.85rem; margin-top: 4px;">Explore our collections and discover something you love!</p>
        </div>
      `;
      return;
    }

    cartItemsList.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
          <div class="cart-qty-ctrls">
            <button class="cart-qty-btn qty-decrease" data-id="${item.id}" aria-label="Decrease quantity">-</button>
            <span class="cart-qty-val">${item.quantity}</span>
            <button class="cart-qty-btn qty-increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    `).join('');
  }

  function addToCart(product, quantity = 1) {
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: quantity,
        image: product.image
      });
    }

    updateCartUI();
    showToast(`Added <strong>${product.name}</strong> to your bag!`, 'fa-solid fa-bag-shopping');
    openCart();
  }

  function removeFromCart(productId) {
    const item = cart.find(i => i.id === productId);
    if (item) {
      cart = cart.filter(i => i.id !== productId);
      updateCartUI();
      showToast(`Removed <strong>${item.name}</strong> from bag.`, 'fa-regular fa-trash-can');
    }
  }

  function updateQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        removeFromCart(productId);
      } else {
        updateCartUI();
      }
    }
  }

  function openCart() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ==========================================
  // 4. Wishlist Functions
  // ==========================================
  function toggleWishlist(productId, productName, buttonElement) {
    if (wishlist.has(productId)) {
      wishlist.delete(productId);
      if (buttonElement) buttonElement.classList.remove('active');
      showToast(`Removed <strong>${productName}</strong> from wishlist.`, 'fa-regular fa-heart');
    } else {
      wishlist.add(productId);
      if (buttonElement) buttonElement.classList.add('active');
      showToast(`Added <strong>${productName}</strong> to wishlist!`, 'fa-solid fa-heart');
    }

    wishlistCountBadge.textContent = wishlist.size;
  }

  // ==========================================
  // 5. Toast Notification System
  // ==========================================
  function showToast(message, iconClass = 'fa-solid fa-check') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="${iconClass}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ==========================================
  // 6. Quick View Modal
  // ==========================================
  function openQuickView(product) {
    currentQuickViewProduct = product;
    qvImg.src = product.image;
    qvImg.alt = product.name;
    qvTitle.textContent = product.name;
    qvPrice.textContent = `$${parseFloat(product.price).toFixed(2)}`;
    qvRating.textContent = `(${product.rating || 120} reviews)`;
    qvQtyInput.value = '1';

    quickViewOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeQuickView() {
    quickViewOverlay.classList.remove('active');
    document.body.style.overflow = '';
    currentQuickViewProduct = null;
  }

  // ==========================================
  // 7. Flash Sale Live Countdown Timer
  // ==========================================
  function initCountdownTimer() {
    // Set target time: 2 days, 15 hours, 45 minutes, 30 seconds from now
    let remainingSeconds = (2 * 24 * 60 * 60) + (15 * 60 * 60) + (45 * 60) + 30;

    const daysEl = document.getElementById('timerDays');
    const hoursEl = document.getElementById('timerHours');
    const minsEl = document.getElementById('timerMinutes');
    const secsEl = document.getElementById('timerSeconds');

    function tick() {
      if (remainingSeconds <= 0) {
        remainingSeconds = 0;
      }

      const days = Math.floor(remainingSeconds / (24 * 3600));
      const hours = Math.floor((remainingSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;

      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minsEl.textContent = String(minutes).padStart(2, '0');
      secsEl.textContent = String(seconds).padStart(2, '0');

      if (remainingSeconds > 0) {
        remainingSeconds--;
      }
    }

    tick();
    setInterval(tick, 1000);
  }

  // ==========================================
  // 8. Event Listeners & Delegations
  // ==========================================

  // Cart Drawer Events
  cartToggleBtn.addEventListener('click', openCart);
  cartCloseBtn.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  continueShoppingBtn.addEventListener('click', closeCart);

  checkoutBtn.addEventListener('click', () => {
    alert(`Thank you for checking out! Order placed for $${cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}.`);
    cart = [];
    updateCartUI();
    closeCart();
  });

  // Cart Drawer Item Quantity & Remove Buttons
  cartItemsList.addEventListener('click', (e) => {
    const target = e.target;
    
    // Increase quantity
    const incBtn = target.closest('.qty-increase');
    if (incBtn) {
      const id = incBtn.dataset.id;
      updateQuantity(id, 1);
      return;
    }

    // Decrease quantity
    const decBtn = target.closest('.qty-decrease');
    if (decBtn) {
      const id = decBtn.dataset.id;
      updateQuantity(id, -1);
      return;
    }

    // Remove item
    const removeBtn = target.closest('.cart-item-remove');
    if (removeBtn) {
      const id = removeBtn.dataset.id;
      removeFromCart(id);
      return;
    }
  });

  // Floating Hero Cards (Click to add or view)
  document.querySelectorAll('.floating-card').forEach(card => {
    card.addEventListener('click', () => {
      const product = {
        id: card.dataset.id,
        name: card.dataset.name,
        price: card.dataset.price,
        image: card.dataset.img
      };
      addToCart(product, 1);
    });
  });

  // New Arrivals Product Cards (Cart Button & Wishlist Button & Quick View)
  document.querySelectorAll('.product-card').forEach(card => {
    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = card.dataset.price;
    const image = card.dataset.img;
    const rating = card.dataset.rating;

    // Cart Button Click
    const cartBtn = card.querySelector('.card-cart-btn');
    if (cartBtn) {
      cartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart({ id, name, price, image }, 1);
      });
    }

    // Wishlist Button Click
    const wishBtn = card.querySelector('.wishlist-btn');
    if (wishBtn) {
      wishBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWishlist(id, name, wishBtn);
      });
    }

    // Open Quick View on Thumbnail or Title Click
    const thumb = card.querySelector('.product-thumb');
    const title = card.querySelector('.product-name');
    [thumb, title].forEach(el => {
      if (el) {
        el.addEventListener('click', () => {
          openQuickView({ id, name, price, image, rating });
        });
      }
    });
  });

  // Best Sellers Actions
  document.querySelectorAll('.bestseller-card').forEach(card => {
    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = card.dataset.price;
    const image = card.dataset.img;

    const quickAddBtn = card.querySelector('.btn-quick-add');
    if (quickAddBtn) {
      quickAddBtn.addEventListener('click', () => {
        addToCart({ id, name, price, image }, 1);
      });
    }

    const wishBtn = card.querySelector('.btn-icon-wishlist');
    if (wishBtn) {
      wishBtn.addEventListener('click', () => {
        toggleWishlist(id, name, wishBtn);
      });
    }
  });

  // Quick View Quantity Buttons
  qvQtyMinus.addEventListener('click', () => {
    let val = parseInt(qvQtyInput.value) || 1;
    if (val > 1) qvQtyInput.value = val - 1;
  });

  qvQtyPlus.addEventListener('click', () => {
    let val = parseInt(qvQtyInput.value) || 1;
    qvQtyInput.value = val + 1;
  });

  // Quick View Add to Cart
  qvAddToCartBtn.addEventListener('click', () => {
    if (currentQuickViewProduct) {
      const qty = parseInt(qvQtyInput.value) || 1;
      addToCart(currentQuickViewProduct, qty);
      closeQuickView();
    }
  });

  quickViewCloseBtn.addEventListener('click', closeQuickView);
  quickViewOverlay.addEventListener('click', (e) => {
    if (e.target === quickViewOverlay) closeQuickView();
  });

  // Search Modal Toggle
  searchTrigger.addEventListener('click', () => {
    searchModal.classList.add('active');
    setTimeout(() => searchInput.focus(), 100);
  });

  searchCloseBtn.addEventListener('click', () => {
    searchModal.classList.remove('active');
  });

  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) searchModal.classList.remove('active');
  });

  // Mobile Menu Toggle
  mobileMenuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const icon = mobileMenuToggle.querySelector('i');
    if (navMenu.classList.contains('active')) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-xmark');
    } else {
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    }
  });

  // Close Mobile Menu on Link Click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      const icon = mobileMenuToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    });
  });

  // Keyboard Shortcuts (Esc to close modals)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      closeQuickView();
      searchModal.classList.remove('active');
    }
  });

  // Slider Arrows for New Arrivals (Smooth Scroll)
  const arrivalsGrid = document.getElementById('newArrivalsGrid');
  const arrivalsPrev = document.getElementById('arrivalsPrev');
  const arrivalsNext = document.getElementById('arrivalsNext');

  if (arrivalsPrev && arrivalsNext && arrivalsGrid) {
    arrivalsPrev.addEventListener('click', () => {
      arrivalsGrid.scrollBy({ left: -280, behavior: 'smooth' });
    });
    arrivalsNext.addEventListener('click', () => {
      arrivalsGrid.scrollBy({ left: 280, behavior: 'smooth' });
    });
  }

  // ==========================================
  // 9. Initialize Page
  // ==========================================
  updateCartUI();
  initCountdownTimer();
});


const http = require('http');

const server = http.createServer((req, res) => {
    res.statusCode = 200; // ស្ថានភាពថាជោគជ័យ
    res.setHeader('Content-Type', 'text/plain'); // ប្រភេទទិន្នន័យជា text
    res.end('សួស្តី! នេះជា Web Server ដំបូងរបស់ខ្ញុំ!'); // ផ្ញើចម្លើយទៅ client
});

server.listen(3000, () => {
    console.log('Server កំពុងដំណើរការនៅ port 3000');
});