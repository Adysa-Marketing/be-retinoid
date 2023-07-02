module.exports = async (req, res, next) => {
  const roleId = req.user.roleId;
  if (![1, 2].includes(roleId)) {
    return res.status(403).json({
      status: "error",
      message: "Anda tidak memiliki hak akses ke url ini",
    });
  }

  return next();
};
