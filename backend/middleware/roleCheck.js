module.exports = function (...allowedRoles) {
    return (req, res, next) => {
        const user = req.user; // This assumes you've already verified JWT in auth middleware

        if (!user) {
            return res.status(401).json({ message: req.__("auth.unauthorized") });
        }

        if (!allowedRoles.includes(user.role)) {
            return res
                .status(403)
                .json({ message: req.__("auth.forbidden_role") });
        }

        next();
    };
};
