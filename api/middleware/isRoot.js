module.exports = async (req, res, next) => {
  const roleId = req.user.roleId;
  if (![1].includes(roleId)) {
    return res.status(405).json({
      status: "error",
      message: "Anda tidak memiliki hak akses ",
    });
  }

  return next();
};
