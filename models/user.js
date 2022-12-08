const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            email: {
                type: Sequelize.STRING(40),
                allowNull: false,
                unique: true,
            },
            nick: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING(100), //hash화 되면 길이가 늘어나니까 넉넉하게
                allowNull: false,
            },
            },
            {
                sequelize,
                timestamps: true, // 생성일, 수정일 자동생성
                underscored: false, // 생성일, 수정일 카멜케이스
                modelName: 'User', // js
                tableName: 'users', // db 테이블 이름
                paranoid: true, // 삭제한 척 하는것 -> 삭제일 자동생성
                charset: 'utf8', // 한글 입력을 위해서!
                collate: 'utf8_general_ci',
            });
    }
    static associate(db){
        db.User.hasMany(db.WorkSpace, {
            foreignKey: 'userId',
            sourceKey: 'id',
        });
        db.User.hasMany(db.Chat, {
            foreignKey: 'userId',
            sourceKey: 'id',
        })
    }
}
