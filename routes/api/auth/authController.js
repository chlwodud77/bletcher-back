const {
  User,
  Sequelize: { Op }
} = require("../../../models");

/*
  Sign In
  POST /api/auth/signin
*/
exports.postSignIn = async (req, res, next) => {
  const { id, password } = req.body;

  try {
    const user = await User.authenticate(id, password);
    if (!user) {
      return res
        .status(401)
        .send({ error: "Login failed! Check authentication credentials" });
    }

    const token = await user.authorize();
    return res.status(200).send({ user, token });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/*
  Check user status with JWT token
  GET /api/auth/check
*/
exports.check = (req, res) => {
  res.json({
    success: true,
    info: req.decoded
  });
};
