const Sequelize = require('sequelize');

module.exports = class WorkSpaceGroup extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            title: {
                type: Sequelize.STRING(100),
            },
            hostUserId: {
                type: Sequelize.INTEGER,
            },
            subUserId: {
                type: Sequelize.INTEGER,
            },
            subUserNick: {
                type: Sequelize.STRING(40),
            },
        }, {
            sequelize,
            timestamps: true, // 생성일, 수정일 자동생성
            underscored: false, // 생성일, 수정일 카멜케이스
            modelName: 'WorkSpaceGroup', // js
            tableName: 'workspacegroups', // db 테이블 이름
            paranoid: true, // 삭제한 척 하는것 -> 삭제일 자동생성
            charset: 'utf8', // 한글 입력을 위해서!
            collate: 'utf8_general_ci',
        });
    }
    static associate(db){
    }
}
