module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Comment', {
      postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Post',
          key: 'postId',
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'userId',
        },
      },
      content: {
        type: DataTypes.STRING(10000),
        allowNull: true,
      },
    }, {
      timestamps: true,
      paranoid: true,
    });
  };