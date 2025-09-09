const jwt = require('jsonwebtoken');

function verifyJwt(req, res, next) {
	try {
		const authHeader = req.headers['authorization'] || '';
		const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
		if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

		const secret = process.env.JWT_SECRET || 'secretkey';
		const decoded = jwt.verify(token, secret);
		req.user = decoded;
		return next();
	} catch (err) {
		return res.status(401).json({ msg: 'Token is not valid' });
	}
}

const authMiddleware = verifyJwt;

module.exports = { verifyJwt, authMiddleware };
