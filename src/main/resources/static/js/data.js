/**
 * ANNAPURNA™ CAFETERIA MANAGEMENT SYSTEM - DATA STORE & JAVA API CONNECTOR
 *
 * Provides:
 * 1. Default Cafeteria Catalog (Hot Brews, Cold Sips, Bakery, Quick Meals)
 * 2. Available stock management and inventory caching (hides availableCount <= 0)
 * 3. Seamless connection to Java REST backend (Spring Boot / Java Servlets)
 *    Endpoints:
 *      GET  /api/menu          - Fetch full or available menu
 *      POST /api/orders        - Save processed orders
 *      GET  /api/health        - Connection health check
 * 4. Automatic offline fallback when Java backend is offline or loading
 */

const JAVA_BACKEND_CONFIG = {
  // Configure base URL of your Java backend (e.g. Spring Boot running on 8080)
  baseUrl: window.JAVA_API_BASE_URL || 'http://localhost:8081/api',
  timeoutMs: 3000,
  isConnected: false
};

const MENU_STORAGE_KEY = 'annapurna_cafeteria_menu_v2';

// Standard Cafeteria Menu
const DEFAULT_MENU_ITEMS = [
  // --- HOT BREWS ---
  {
    id: 'espresso-single',
    name: 'Artisan Espresso',
    category: 'hot-brews',
    price: 60,
    availableCount: 15,
    badge: 'Single Origin',
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80',
    description: 'Rich, bold, and aromatic single-shot dark roast espresso with a velvet crema head.'
  },
  {
    id: 'cappuccino-velvet',
    name: 'Classic Cappuccino',
    category: 'hot-brews',
    price: 95,
    availableCount: 22,
    badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80',
    description: 'Equal parts dark espresso, steamed farm-fresh milk, and luxurious microfoam froth.'
  },
  {
    id: 'caramel-latte',
    name: 'Caramel Macchiato',
    category: 'hot-brews',
    price: 120,
    availableCount: 18,
    badge: 'Chef Choice',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    description: 'Fresh espresso poured over steamed milk, finished with our house-made buttery caramel drizzle.'
  },
  {
    id: 'masala-chai',
    name: 'Desi Masala Chai',
    category: 'hot-brews',
    price: 40,
    availableCount: 30,
    badge: 'Campus Favorite',
    image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?auto=format&fit=crop&w=600&q=80',
    description: 'Authentic slow-brewed spiced milk tea infused with crushed cardamom, ginger, and cloves.'
  },
  {
    id: 'pumpkin-spice-latte',
    name: 'Seasonal Spice Brew',
    category: 'hot-brews',
    price: 140,
    availableCount: 0, // UNAVAILABLE ITEM (Must be hidden on kiosk screen)
    badge: 'Sold Out',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
    description: 'Autumn seasonal latte with cinnamon, nutmeg, and clove pumpkin puree.'
  },

  // --- COLD SIPS ---
  {
    id: 'cold-brew-reserve',
    name: 'Cold Brew Reserve',
    category: 'cold-sips',
    price: 110,
    availableCount: 14,
    badge: '18hr Steeped',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
    description: 'Smooth, low-acidity 18-hour cold steeped coffee served over crystal clear ice.'
  },
  {
    id: 'iced-hazelnut-frappe',
    name: 'Iced Hazelnut Frappé',
    category: 'cold-sips',
    price: 135,
    availableCount: 10,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
    description: 'Blended icy espresso frappe infused with nutty roasted hazelnut and topped with chocolate curls.'
  },
  {
    id: 'classic-cold-coffee',
    name: 'Annapurna Cold Coffee',
    category: 'cold-sips',
    price: 85,
    availableCount: 25,
    badge: 'Must Try',
    image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=600&q=80',
    description: 'Thick, creamy campus-special blended cold coffee with a scoop of vanilla ice cream.'
  },
  {
    id: 'mango-smoothie',
    name: 'Alphonso Mango Smoothie',
    category: 'cold-sips',
    price: 115,
    availableCount: 0, // UNAVAILABLE ITEM (Must be hidden on kiosk screen)
    badge: 'Out of Season',
    image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=600&q=80',
    description: 'Chilled Alphonso pulp blended with Greek yogurt and wildflower honey.'
  },

  // --- BAKERY & TREATS ---
  {
    id: 'butter-croissant',
    name: 'Golden Butter Croissant',
    category: 'bakery',
    price: 75,
    availableCount: 16,
    badge: 'Fresh Baked',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    description: 'Flaky, multi-layered French pastry baked fresh every morning with pure creamery butter.'
  },
  {
    id: 'blueberry-muffin',
    name: 'Blueberry Crumble Muffin',
    category: 'bakery',
    price: 80,
    availableCount: 4, // Low stock demo
    badge: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80',
    description: 'Moist golden sponge bursting with whole Canadian blueberries and a brown sugar cinnamon crumble.'
  },
  {
    id: 'choc-chip-cookie',
    name: 'Double Chocolate Cookie',
    category: 'bakery',
    price: 50,
    availableCount: 20,
    badge: 'Fresh',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
    description: 'Chewy fudge cookie studded with chunks of 70% dark Belgian chocolate and sea salt.'
  },

  // --- QUICK MEALS ---
  {
    id: 'veg-club-sandwich',
    name: 'Grilled Veg Club Sandwich',
    category: 'quick-meals',
    price: 90,
    availableCount: 12,
    badge: 'Vegetarian',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    description: 'Triple-decker whole wheat toast with grilled zucchini, tomatoes, lettuce, cucumber, and herb mayo.'
  },
  {
    id: 'paneer-tikka-wrap',
    name: 'Paneer Tikka Roll',
    category: 'quick-meals',
    price: 120,
    availableCount: 15,
    badge: 'Chef Special',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    description: 'Clay-oven spiced cottage cheese cubes tossed with crunchy bell peppers wrapped in a soft roomali.'
  },
  {
    id: 'chicken-roll',
    name: 'Smoked Chicken Wrap',
    category: 'quick-meals',
    price: 130,
    availableCount: 8,
    badge: 'High Protein',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
    description: 'Juicy tandoori spiced chicken breast strips with mint chutney and pickled onions.'
  }
];

/**
 * Initialize data store from localStorage or defaults
 */
function initMenuStorage() {
  const existing = localStorage.getItem(MENU_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(DEFAULT_MENU_ITEMS));
    return DEFAULT_MENU_ITEMS;
  }
  try {
    return JSON.parse(existing);
  } catch (e) {
    console.error('Failed to parse menu storage, resetting defaults', e);
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(DEFAULT_MENU_ITEMS));
    return DEFAULT_MENU_ITEMS;
  }
}

/**
 * Get all menu items
 */
function getMenuItems() {
  return initMenuStorage();
}

/**
 * Kiosk requirement:
 * Returns ONLY available items (hides items where availableCount <= 0)
 */
function getAvailableMenuItems() {
  const all = getMenuItems();
  return all.filter(item => typeof item.availableCount === 'number' && item.availableCount > 0);
}

/**
 * Find single menu item by ID
 */
function getMenuItemById(id) {
  const all = getMenuItems();
  return all.find(item => item.id === id) || null;
}

/**
 * Deduct available stock upon successful order placement
 * Persists locally and synchronizes with Java backend if available
 */
function deductStock(cart) {
  const items = getMenuItems();
  let updated = false;

  items.forEach(item => {
    if (cart[item.id]) {
      const qtyPurchased = cart[item.id];
      item.availableCount = Math.max(0, item.availableCount - qtyPurchased);
      updated = true;
    }
  });

  if (updated) {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
    // Trigger async sync with Java backend if configured
    syncStockWithJavaBackend(cart);
  }
}

/**
 * Reset menu items back to default sample inventory
 */
function resetMenuToDefaults() {
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(DEFAULT_MENU_ITEMS));
  return DEFAULT_MENU_ITEMS;
}

/**
 * ADMIN CRUD OPERATIONS
 */

/**
 * Add a new food item to the catalog
 */
async function addMenuItem(itemData) {
  const items = getMenuItems();

  const newItem = {
    id: itemData.id || 'item-' + Date.now(),
    name: itemData.name.trim(),
    category: itemData.category || 'quick-meals',
    price: Math.max(1, Number(itemData.price) || 0),
    availableCount: Math.max(0, Number(itemData.availableCount) || 0),
    badge: itemData.badge || null,
    image: itemData.image || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    description: itemData.description || ''
  };

  try {
    const response = await fetch(`${JAVA_BACKEND_CONFIG.baseUrl}/admin/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newItem.name,
        categoryId: Number(itemData.categoryId),
        price: newItem.price,
        stockQuantity: newItem.availableCount,
        description: newItem.description,
        imageUrl: newItem.image,
        isAvailable: true
      })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    await fetchMenuFromJavaBackend();
    return { success: true };

  } catch (err) {
    console.error("Backend save failed:", err);

    // Fallback: still save locally
    items.unshift(newItem);
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));

    return { success: true, offline: true };
  }
}

/**
 * Update existing food item
 */
async function updateMenuItem(id, updatedFields) {

  const categoryMap = {
    "hot-brews": 1,
    "cold-sips": 2,
    "bakery": 3,
    "quick-meals": 4
  };

  try {
    const response = await fetch(`${JAVA_BACKEND_CONFIG.baseUrl}/admin/items/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: updatedFields.name,
        categoryId: categoryMap[updatedFields.category],
        price: Number(updatedFields.price),
        stockQuantity: Number(updatedFields.availableCount),
        description: updatedFields.description || "",
        imageUrl: updatedFields.image || "",
        isAvailable: Number(updatedFields.availableCount) > 0
      })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    await fetchMenuFromJavaBackend();
    return { success: true };

  } catch (err) {
    console.error("Update failed:", err);

    // Local fallback
    const items = getMenuItems();
    const index = items.findIndex(item => item.id === id);

    if (index !== -1) {
      items[index] = { ...items[index], ...updatedFields };
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
    }

    return { success: true, offline: true };
  }
}

/**
 * Delete a food item from the menu
 */
async function deleteMenuItem(id) {
  try {
    const response = await fetch(`${JAVA_BACKEND_CONFIG.baseUrl}/admin/items/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Failed to delete item.");
    }

    await fetchMenuFromJavaBackend();
    return { success: true };

  } catch (err) {
    console.error("Delete failed:", err);

    // Offline fallback
    let items = getMenuItems();
    items = items.filter(item => item.id !== id);
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));

    return { success: true, offline: true };
  }
}

/**
 * Quick stock update (increment, decrement, or set count)
 */
function updateItemStock(id, newCount) {
  const items = getMenuItems();
  const item = items.find(i => i.id === id);
  if (!item) return { success: false, message: 'Item not found' };

  item.availableCount = Math.max(0, Number(newCount) || 0);
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
  return { success: true, availableCount: item.availableCount };
}

/**
 * Java Backend REST API Bridge
 * Connects to Spring Boot / Java REST backend if running
 */
async function syncStockWithJavaBackend(cart) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), JAVA_BACKEND_CONFIG.timeoutMs);

    const response = await fetch(`${JAVA_BACKEND_CONFIG.baseUrl}/menu/deduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart }),
      signal: controller.signal
    });
    clearTimeout(timer);

    if (response.ok) {
      console.log('Stock successfully synced with Java backend.');
    }
  } catch (err) {
    // Graceful offline fallback: The cafeteria kiosk operates smoothly even when Java server is offline
    console.debug('Java backend unreachable for stock sync. Local storage remains primary.', err.message);
  }
}

/**
 * Async Menu Loader (Attempts to fetch latest menu from Java backend, with local fallback)
 */
async function fetchMenuFromJavaBackend() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      JAVA_BACKEND_CONFIG.timeoutMs
    );

    const response = await fetch(
      `${JAVA_BACKEND_CONFIG.baseUrl}/catalog/items`,
      {
        signal: controller.signal
      }
    );

    clearTimeout(timer);

    if (response.ok) {
      const remoteMenu = await response.json();

      if (Array.isArray(remoteMenu)) {
        const mappedMenu = remoteMenu.map(item => ({
          id: String(item.itemId),
          name: item.name,
          category: item.categoryName.toLowerCase().replace(/\s+/g, '-'),
          price: Number(item.price),
          description: item.description || '',
          image: item.imageUrl || '',
          availableCount:
            item.stockQuantity === null
              ? 999
              : Number(item.stockQuantity),
          badge: null
        }));

        localStorage.setItem(
          MENU_STORAGE_KEY,
          JSON.stringify(mappedMenu)
        );

        JAVA_BACKEND_CONFIG.isConnected = true;
        return mappedMenu;
      }
    }
  } catch (e) {
    JAVA_BACKEND_CONFIG.isConnected = false;
  }

  return getMenuItems();
}

// Initial self-invocation
initMenuStorage();

// Global exports
if (typeof window !== 'undefined') {
  window.JAVA_BACKEND_CONFIG = JAVA_BACKEND_CONFIG;
  window.getMenuItems = getMenuItems;
  window.getAvailableMenuItems = getAvailableMenuItems;
  window.getMenuItemById = getMenuItemById;
  window.deductStock = deductStock;
  window.resetMenuToDefaults = resetMenuToDefaults;
  window.addMenuItem = addMenuItem;
  window.updateMenuItem = updateMenuItem;
  window.deleteMenuItem = deleteMenuItem;
  window.updateItemStock = updateItemStock;
  window.fetchMenuFromJavaBackend = fetchMenuFromJavaBackend;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    JAVA_BACKEND_CONFIG,
    DEFAULT_MENU_ITEMS,
    getMenuItems,
    getAvailableMenuItems,
    getMenuItemById,
    deductStock,
    resetMenuToDefaults,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    updateItemStock,
    fetchMenuFromJavaBackend
  };
}
