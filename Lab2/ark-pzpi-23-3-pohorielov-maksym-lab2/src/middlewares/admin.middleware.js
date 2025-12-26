exports.adminOnly = (req, res, next) => {
    // Перевіряємо, чи після authMiddleware у нас є дані користувача та роль admin
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            message: "Доступ відхилено: необхідні права адміністратора" 
        });
    }
};