const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      name: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      profileImgName: {
        type: DataTypes.STRING(300),
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      type: {
        type: DataTypes.STRING(1),
        allowNull: false
      }
    },
    {
      timestamps: true,
      paranoid: true
    }
  );

  /* Hash the password before saving the user model */
  User.beforeCreate(user => {
    return bcrypt
      .hash(user.password, 10)
      .then(hash => {
        user.password = hash;
      })
      .catch(err => {
        throw new Error();
      });
  });

  /* Search for a user by email and password. */
  User.authenticate = async function(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error({ error: "Invalid login credentials" });
    }

    const isPasswordMatch = await bcrypt.compareSync(password, user.password);
    if (!isPasswordMatch) {
      throw new Error({ error: "Invalid login credentials" });
    }

    return user;
  };

  /* Generate an auth token for the user */
  User.prototype.authorize = function() {
    const user = this;
    const p = new Promise((resolve, reject) => {
      jwt.sign(
        { _id: user.id, email: user.email },
        process.env.JWT_KEY,
        (err, token) => {
          if (err) reject(err);
          resolve(token);
        }
      );
    });
    return p;
  };

  return User;
};
