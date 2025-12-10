const CaptchaService = require('../services/captchaService');

class CaptchaController {
    /**
     * Generate new CAPTCHA
     */
    static generate(req, res) {
        try {
            const { id, text } = CaptchaService.create();

            // Return CAPTCHA ID and text (text will be rendered on client-side canvas)
            res.json({
                success: true,
                data: {
                    id,
                    text
                }
            });
        } catch (error) {
            console.error('CAPTCHA generation error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate CAPTCHA'
            });
        }
    }
}

module.exports = CaptchaController;
