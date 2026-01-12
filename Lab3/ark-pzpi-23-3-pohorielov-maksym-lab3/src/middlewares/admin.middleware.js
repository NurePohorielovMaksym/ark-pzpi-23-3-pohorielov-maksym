// src/middlewares/admin.middleware.js
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      ok: false, 
      error: "Доступ заборонено: потрібні права адміністратора" 
    });
  }
};