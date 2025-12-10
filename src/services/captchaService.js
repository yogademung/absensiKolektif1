// Simple in-memory CAPTCHA store
const captchaStore = new Map();

// Clean up expired CAPTCHAs every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of captchaStore.entries()) {
        if (now > value.expires) {
            captchaStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

class CaptchaService {
    /**
     * Generate random CAPTCHA text
     */
    static generateText(length = 6) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking characters
        let text = '';
        for (let i = 0; i < length; i++) {
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return text;
    }

    /**
     * Create a new CAPTCHA and store it
     * @returns {Object} { id, text }
     */
    static create() {
        const id = this.generateId();
        const text = this.generateText();
        const expires = Date.now() + (5 * 60 * 1000); // 5 minutes

        captchaStore.set(id, {
            text: text.toLowerCase(), // Store as lowercase for case-insensitive comparison
            expires,
            attempts: 0
        });

        return { id, text };
    }

    /**
     * Validate CAPTCHA
     * @param {string} id - CAPTCHA ID
     * @param {string} userInput - User's CAPTCHA input
     * @returns {boolean} - True if valid
     */
    static validate(id, userInput) {
        if (!id || !userInput) {
            return false;
        }

        const captcha = captchaStore.get(id);

        if (!captcha) {
            return false; // CAPTCHA not found or expired
        }

        // Check if expired
        if (Date.now() > captcha.expires) {
            captchaStore.delete(id);
            return false;
        }

        // Increment attempts (prevent brute force)
        captcha.attempts++;
        if (captcha.attempts > 3) {
            captchaStore.delete(id);
            return false;
        }

        // Validate (case-insensitive)
        const isValid = captcha.text === userInput.toLowerCase().trim();

        // Delete CAPTCHA after validation attempt (single-use)
        if (isValid) {
            captchaStore.delete(id);
        }

        return isValid;
    }

    /**
     * Generate unique CAPTCHA ID
     */
    static generateId() {
        return `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get CAPTCHA count (for monitoring)
     */
    static getCount() {
        return captchaStore.size;
    }
}

module.exports = CaptchaService;
