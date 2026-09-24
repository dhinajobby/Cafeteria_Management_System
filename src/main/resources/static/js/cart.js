/**
 * ANNAPURNA™ CAFETERIA MANAGEMENT SYSTEM - CART MANAGER & ORDER PROCESSOR
 *
 * Handles:
 * - Persistent cart state in localStorage
 * - Stock limit checks (cannot exceed availableCount)
 * - Item addition, decrementing, and total cancellation
 * - Order checkout, receipt generation, and Java backend order dispatch (POST /api/orders)
 */

const CART_STORAGE_KEY = 'annapurna_cafeteria_cart_v2';
const LAST_ORDER_STORAGE_KEY = 'annapurna_last_order_v2';

const CartManager = (function () {
  function loadCart() {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    if (!data) return {};
    try {
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }

  function findItem(id) {
    if (typeof getMenuItemById === 'function') return getMenuItemById(id);
    if (typeof window !== 'undefined' && typeof window.getMenuItemById === 'function') return window.getMenuItemById(id);
    return null;
  }

  function triggerDeductStock(cart) {
    if (typeof deductStock === 'function') return deductStock(cart);
    if (typeof window !== 'undefined' && typeof window.deductStock === 'function') return window.deductStock(cart);
  }

  return {
    /**
     * Get current cart object: { [itemId]: quantity }
     */
    getCart: function () {
      return loadCart();
    },

    /**
     * Add item or increment quantity
     * Returns: { success: boolean, message?: string, quantity: number }
     */
    addItem: function (itemId) {
      const item = findItem(itemId);
      if (!item) {
        return { success: false, message: 'Item not found in menu.' };
      }

      if (item.availableCount <= 0) {
        return { success: false, message: `${item.name} is currently out of stock.` };
      }

      const cart = loadCart();
      const currentQty = cart[itemId] || 0;

      if (currentQty + 1 > item.availableCount) {
        return {
          success: false,
          message: `Only ${item.availableCount} units of ${item.name} are available in the cafeteria.`,
          quantity: currentQty
        };
      }

      cart[itemId] = currentQty + 1;
      saveCart(cart);
      return { success: true, quantity: cart[itemId] };
    },

    /**
     * Decrement item quantity or remove if reaches 0
     */
    decrementItem: function (itemId) {
      const cart = loadCart();
      if (!cart[itemId]) return { success: true, quantity: 0 };

      if (cart[itemId] > 1) {
        cart[itemId] -= 1;
      } else {
        delete cart[itemId];
      }

      saveCart(cart);
      return { success: true, quantity: cart[itemId] || 0 };
    },

    /**
     * Remove item completely from cart (Cancel button on card)
     */
    removeItem: function (itemId) {
      const cart = loadCart();
      if (cart[itemId]) {
        delete cart[itemId];
        saveCart(cart);
      }
      return { success: true };
    },

    /**
     * Clear all user entries in the cart
     */
    clearCart: function () {
      localStorage.removeItem(CART_STORAGE_KEY);
      return { success: true };
    },

    /**
     * Get detailed summary for billing and floating badges
     */
    getCartSummary: function () {
      const cart = loadCart();
      let totalItems = 0;
      let totalPrice = 0;
      const itemsList = [];

      for (const [id, qty] of Object.entries(cart)) {
        const item = findItem(id);
        if (item && qty > 0) {
          const subtotal = item.price * qty;
          totalItems += qty;
          totalPrice += subtotal;

          itemsList.push({
            id: item.id,
            name: item.name,
            category: item.category,
            unitPrice: item.price,
            quantity: qty,
            subtotal: subtotal
          });
        }
      }

      return {
        items: itemsList,
        totalItems: totalItems,
        totalPrice: totalPrice
      };
    },

    /**
     * Process checkout and save order record
     * Deducts stock and dispatches order payload to Java backend
     */
    checkoutOrder: async function () {
      const summary = this.getCartSummary();
      if (summary.totalItems === 0) {
        return { success: false, message: 'Cart is empty.' };
      }

      // Generate unique token number (e.g. AP-142)
      const tokenNumber = 'AP-' + Math.floor(100 + Math.random() * 900);
      const orderId = 'ORD-' + Date.now();

      const orderRecord = {
        orderId: orderId,
        token: tokenNumber,
        timestamp: new Date().toISOString(),
        formattedDate: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        formattedTime: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        items: summary.items,
        totalItems: summary.totalItems,
        grandTotal: summary.totalPrice,
        kioskId: 'K-01'
      };

      // 1. Deduct stock in catalog
      const cart = loadCart();
      triggerDeductStock(cart);

      // 2. Persist order details for Thank You page & printing
      localStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(orderRecord));

      // 3. Clear active cart
      this.clearCart();

      // 4. Send Order to Java backend REST API asynchronously
      await this.sendOrderToJavaBackend(orderRecord);

      return {
        success: true,
        order: orderRecord
      };
    },

    /**
     * Retrieve details of the most recently placed order
     */
    getLastOrder: function () {
      const data = localStorage.getItem(LAST_ORDER_STORAGE_KEY);
      if (!data) return null;
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    },

    /**
     * Asynchronously post order payload to Java backend
     * Endpoint: POST /api/orders
     */
    sendOrderToJavaBackend: async function (orderPayload) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const baseUrl = (typeof JAVA_BACKEND_CONFIG !== 'undefined' && JAVA_BACKEND_CONFIG.baseUrl)
          ? JAVA_BACKEND_CONFIG.baseUrl
          : (typeof window !== 'undefined' && window.JAVA_BACKEND_CONFIG ? window.JAVA_BACKEND_CONFIG.baseUrl : 'http://localhost:8080/api');

        const response = await fetch(`${baseUrl}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
  items: orderPayload.items.map(item => ({
    itemId: Number(item.id),
    quantity: item.quantity
  })),
  paymentMethod: 'CASH',
  notes: ''
}),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (response.ok) {
          const result = await response.json();
          console.log('Order successfully registered with Java Backend:', result);
        }
      } catch (err) {
        console.debug('Java backend connection skipped (running in standalone kiosk mode):', err.message);
      }
    }
  };
})();

// Global exports
if (typeof window !== 'undefined') {
  window.CartManager = CartManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CartManager;
}
