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
        next();
    } catch (error) {
        return response(res, 401, false, 'Invalid token.');
    }
};

module.exports = authAdmin;
