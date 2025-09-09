function requireRole(allowedRoles) {
	return function roleGuard(req, res, next) {
		const user = req.user;
		if (!user || !user.role) {
			return res.status(401).json({ msg: 'Unauthorized' });
		}
		if (!allowedRoles.includes(user.role)) {
			return res.status(403).json({ msg: 'Forbidden' });
		}
		return next();
	};
}

module.exports = { requireRole };
