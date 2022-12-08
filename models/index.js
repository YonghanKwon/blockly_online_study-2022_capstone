const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env]; // env 정보 가져오기
const User = require('./user');
const WorkSpace = require('./workspace');
const WorkSpaceGroup = require('./workspacegroup');
const Chat = require('./chat');

const db = {};
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

db.sequelize = sequelize;

db.User = User;
db.WorkSpace = WorkSpace;
db.WorkSpaceGroup = WorkSpaceGroup;
db.Chat = Chat;

User.init(sequelize);
WorkSpace.init(sequelize);
WorkSpaceGroup.init(sequelize);
Chat.init(sequelize);

User.associate(db);
WorkSpace.associate(db);
WorkSpaceGroup.associate(db);
Chat.associate(db);

module.exports = db;