const { sequelize, Sequelize } = require(".");

module.exports = (sequelize, Sequelize) => {
    let User = sequelize.define('user', {
        uid: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        username: {
            type: Sequelize.TEXT
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        user_type: {
            type: Sequelize.ENUM('admin', 'clerk', 'customer','storeOwner','brandManager'),
            defaultValue:'Customer'
        }
    });
    return User;
};