const jwt = require('jsonwebtoken');
const response = require('../utils/response');

const authAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    if (!token) {
        return response(res, 401, false, 'Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        req.clientInfo = {
            ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip,
            user_agent: req.headers['user-agent'],
            admin_email: decoded.email
        };
        next();
    } catch (error) {
        return response(res, 401, false, 'Invalid token.');
    }
};

module.exports = authAdmin;
