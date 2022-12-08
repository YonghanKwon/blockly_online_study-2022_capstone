const Sequelize = require('sequelize');

module.exports = class WorkSpace extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            snapshot: {
                type: Sequelize.TEXT, // TEXT or BLOB or JSONTYPE 고민중
            },
            lastEntryNumber: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            position: {
                type: Sequelize.TEXT,
            },
            status: {
                type: Sequelize.ENUM('host', 'sub'),
            }
        },
        {
            sequelize,
            timestamps: true, // 생성일, 수정일 자동생성
            underscored: false, // 생성일, 수정일 카멜케이스
            modelName: 'WorkSpace', // js
            tableName: 'workspaces', // db 테이블 이름
            paranoid: true, // 삭제한 척 하는것 -> 삭제일 자동생성
            charset: 'utf8', // 한글 입력을 위해서!
            collate: 'utf8_general_ci',
        });
    }
    static associate(db){
        db.WorkSpace.belongsTo(db.User,{
            foreignKey: 'userId',
            targetKey: 'id',
        });
        db.WorkSpace.belongsToMany(db.WorkSpace, {
            foreignKey: 'hostWorkSpaceId', // 외래키 이름
            as: 'hostWorkSpaceId',
            through: 'WorkSpaceGroup',
        });
        db.WorkSpace.belongsToMany(db.WorkSpace, {
            foreignKey: 'subWorkSpaceId',
            as: 'subWorkSpaceId',
            through: 'WorkSpaceGroup',
        });
    }
}
