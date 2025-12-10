/**
 * Simple CAPTCHA Generator
 * Generates canvas-based CAPTCHA without external dependencies
 */
const SimpleCaptcha = {
    currentCaptchaId: null,
    currentCaptchaText: null,

    /**
     * Initialize CAPTCHA on a canvas element
     * @param {string} canvasId - ID of the canvas element
     * @param {string} apiEndpoint - API endpoint to fetch CAPTCHA
     */
    async init(canvasId, apiEndpoint) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error('Canvas element not found:', canvasId);
            return;
        }

        try {
            // Fetch CAPTCHA from server
            const response = await fetch(apiEndpoint);
            const data = await response.json();

            if (data.success) {
                this.currentCaptchaId = data.data.id;
                this.currentCaptchaText = data.data.text;
                this.draw(canvas, data.data.text);
            } else {
                console.error('Failed to fetch CAPTCHA');
            }
        } catch (error) {
            console.error('CAPTCHA initialization error:', error);
        }
    },

    /**
     * Draw CAPTCHA on canvas
     * @param {HTMLCanvasElement} canvas 
     * @param {string} text 
     */
    draw(canvas, text) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);

        // Add noise lines
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = this.randomColor(100, 200);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.lineTo(Math.random() * width, Math.random() * height);
            ctx.stroke();
        }

        // Add noise dots
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = this.randomColor(150, 250);
            ctx.beginPath();
            ctx.arc(
                Math.random() * width,
                Math.random() * height,
                1,
                0,
                2 * Math.PI
            );
            ctx.fill();
        }

        // Draw text
        const fontSize = 32;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textBaseline = 'middle';

        const charSpacing = width / (text.length + 1);

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const x = charSpacing * (i + 1);
            const y = height / 2;

            // Random rotation
            const angle = (Math.random() - 0.5) * 0.4;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            // Random color
            ctx.fillStyle = this.randomColor(0, 100);
            ctx.fillText(char, 0, 0);

            ctx.restore();
        }
    },

    /**
     * Generate random color
     * @param {number} min 
     * @param {number} max 
     * @returns {string}
     */
    randomColor(min, max) {
        const r = Math.floor(Math.random() * (max - min) + min);
        const g = Math.floor(Math.random() * (max - min) + min);
        const b = Math.floor(Math.random() * (max - min) + min);
        return `rgb(${r}, ${g}, ${b})`;
    },

    /**
     * Refresh CAPTCHA
     * @param {string} canvasId 
     * @param {string} apiEndpoint 
     */
    async refresh(canvasId, apiEndpoint) {
        await this.init(canvasId, apiEndpoint);
    },

    /**
     * Get current CAPTCHA ID
     * @returns {string}
     */
    getCaptchaId() {
        return this.currentCaptchaId;
    },

    /**
     * Validate CAPTCHA input (client-side check only, server validates)
     * @param {string} input 
     * @returns {boolean}
     */
    validateInput(input) {
        return input && input.trim().length > 0;
    }
};
