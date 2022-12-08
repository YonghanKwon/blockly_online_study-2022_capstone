const Sequelize = require('sequelize');

module.exports = class Chat extends Sequelize.Model{
    static init(sequelize){
        return super.init({
                nick: {
                    type: Sequelize.STRING(15),
                },
                hostWorkSpaceId: {
                    type: Sequelize.INTEGER,
                },
                chat: {
                    type: Sequelize.TEXT,
                },
            },
            {
                sequelize,
                timestamps: true, // 생성일, 수정일 자동생성
                underscored: false, // 생성일, 수정일 카멜케이스
                modelName: 'Chat', // js
                tableName: 'chats', // db 테이블 이름
                paranoid: true, // 삭제한 척 하는것 -> 삭제일 자동생성
                charset: 'utf8', // 한글 입력을 위해서!
                collate: 'utf8_general_ci',
            });
    }
    static associate(db) {
        db.Chat.belongsTo(db.User, {
            foreignKey: 'userId',
            targetKey: 'id',
        })
    }
}
