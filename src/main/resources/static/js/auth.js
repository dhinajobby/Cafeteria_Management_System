/**
 * ANNAPURNA™ CAFETERIA MANAGEMENT SYSTEM - ADMIN AUTHENTICATION
 *
 * Provides:
 * 1. Admin authentication verification
 * 2. Session state persistence in sessionStorage
 * 3. Route guarding for admin.html
 * 4. Logout management
 */

const ADMIN_STORAGE_KEY = 'annapurna_admin_session_v1';

 //Default Admin Credentials (for campus cafeteria administration & evaluation)
const ADMIN_CREDENTIALS = {
  username: 'admin@cafeteria.com',
  password: 'Asiet@123'
};

const AuthManager = (function () {
  return {
    /**
     * Authenticate admin with username & password
     */
    login: function (username, password) {
      const u = (username || '').trim();
      const p = (password || '').trim();

      if (u === ADMIN_CREDENTIALS.username && p === ADMIN_CREDENTIALS.password) {
        const sessionData = {
          role: 'admin',
          username: u,
          token: 'ADM-' + Date.now(),
          loginTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        };
        sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(sessionData));
        return { success: true, user: sessionData };
      }

      return {
        success: false,
        message: 'Invalid credentials.'
      };
    },

    /**
     * Check if an admin is currently logged in
     */
    isLoggedIn: function () {
      const data = sessionStorage.getItem(ADMIN_STORAGE_KEY);
      if (!data) return false;
      try {
        const parsed = JSON.parse(data);
        return parsed && parsed.role === 'admin';
      } catch (e) {
        return false;
      }
    },

    /**
     * Get current logged-in admin details
     */
    getAdminUser: function () {
      const data = sessionStorage.getItem(ADMIN_STORAGE_KEY);
      if (!data) return null;
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    },

    /**
     * Clear admin session and redirect to Welcome page
     */
    logout: function () {
      sessionStorage.removeItem(ADMIN_STORAGE_KEY);
      window.location.href = 'index.html';
    },

    /**
     * Guard function: enforce admin login on admin.html
     */
    requireAdmin: function () {
      if (!this.isLoggedIn()) {
        window.location.href = 'login.html';
      }
    }
  };
})();

// Global exports
if (typeof window !== 'undefined') {
  window.AuthManager = AuthManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthManager;
}
