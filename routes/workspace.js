const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { User, WorkSpace, Chat } = require('../models');
const db = require('../models/index');

const router = express.Router();
const WorkSpaceGroup = db.sequelize.models.WorkSpaceGroup;

// workspace 생성
router.post('/new', isLoggedIn, async (req, res, next) => {
    try{
        const newWorkSpace = await WorkSpace.create({
            userId: req.user.id,
            status: 'host',
        });
        // workspace_group도 같이생성
        await WorkSpaceGroup.create({
            title: req.user.nick + '님의 ' + newWorkSpace.id + "번방",
            hostWorkSpaceId: newWorkSpace.id,
            subWorkSpaceId: newWorkSpace.id,
            hostUserId: req.user.id,
            subUserId: req.user.id,
            subUserNick: req.user.nick
        });
        res.redirect('/');
    } catch(error){
        console.error(error);
        next(error);
    }
});

// workspace 입장, 호스트의 워크스페이스만 입장 가능
router.get('/:hostWorkSpaceId', isLoggedIn, async(req, res, next) => {
    try{
        // 입장하려는 호스트의 워크스페이스가 존재하는지 탐색
        const exHostWorkSpace = await WorkSpace.findOne({
            where: {
                id: req.params.hostWorkSpaceId,
                status: 'host',
            }
        });
        if(!exHostWorkSpace){
            return res.status(404).send('존재하지 않는 workspace');
        }

        // 자신이 호스트의 워크스페이스와 연결돼있는지 확인
        const exWorkSpace = await WorkSpaceGroup.findOne({
            where : {
                hostWorkSpaceId: req.params.hostWorkSpaceId,
                subUserId: req.user.id,
            },
        });

        // 자신이 호스트의 워크스페이스와 연결이 안돼있는 경우
        if(!exWorkSpace) {
            // subworkspace 생성
            const newSubWorkSpace = await WorkSpace.create({
                userId: req.user.id,
                status: 'sub',
            });
            // 호스트의 워크스페이스와 자신의 서브 워크스페이스를 연결
            await WorkSpaceGroup.create({
                title: req.user.nick + '님의 ' + newSubWorkSpace.id + "번방",
                hostWorkSpaceId: req.params.hostWorkSpaceId,
                subWorkSpaceId: newSubWorkSpace.id,
                hostUserId: exHostWorkSpace.userId,
                subUserId: req.user.id,
                subUserNick: req.user.nick,
            });
            req.session.myWorkSpace = newSubWorkSpace;
        }
     
        const workSpaceGroups = await WorkSpaceGroup.findAll({
            where: {
                hostWorkSpaceId: req.params.hostWorkSpaceId,
            }
        });

        // 이전 채팅 불러오기
        const chats = await Chat.findAll({
            where: {
                hostWorkSpaceId: req.params.hostWorkSpaceId
            }
        });
        
        // 내 워크스페이스가 존재?
        if(exWorkSpace){
            const myWorkSpace = await WorkSpace.findOne({
                where: {
                    id: exWorkSpace.subWorkSpaceId,
                }
            });
            req.session.myWorkSpace = myWorkSpace;
            req.app.get('io').to(req.params.hostWorkSpaceId).emit('join_ex', {
                chat: `${req.user.nick}님 입장`,
                workspace: myWorkSpace,
            });
        }
        else{
            const newSubWorkSpace = await WorkSpaceGroup.findOne({
                where:{
                    hostWorkSpaceId: req.params.hostWorkSpaceId,
                    subUserId: req.user.id
                }
            });

            req.app.get('io').to(req.params.hostWorkSpaceId).emit('join_new',{
                chat: `${req.user.nick}님 입장`,
                workspace: newSubWorkSpace,
            });
        }
        
        req.session.userNick = req.user.nick;
        req.session.myWorkSpaceId = req.session.myWorkSpace.id;
        // console.log(req.session.myWorkSpace.id);
        res.render('workspace', {
            workSpaceGroups,
            chats,
            myWorkSpace : req.session.myWorkSpace,
            hostWorkSpace: exHostWorkSpace,
            myUserNick : req.user.nick,
        });
    } catch(error){
        console.error(error);
        next(error);
    }
});


// 채팅입력시
router.post('/:hostWorkSpaceId/chat', async (req, res, next) => {
    try {
        const findNickFor = await User.findOne({
            where: {
                id: req.user.id,
            }
        });
        const chat = await Chat.create({
            userId: req.user.id,
            nick: findNickFor.nick,
            hostWorkSpaceId: req.params.hostWorkSpaceId,
            chat: req.body.chat,
        });
        req.app.get('io').to(req.params.hostWorkSpaceId).emit('chat', chat);
        res.send('ok');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// snapshot 변경
router.post('/:hostWorkSpaceId/change/snapshot', async (req, res, next) => {
    try{
        console.log(req.session.myWorkSpaceId + " " + req.params.hostWorkSpaceId)
        // 권한 확인 -> 내가 내 워크스페이스를 바꾸거나, 호스트가 다른 워크스페이스를 바꾼 경우
        if((req.session.myWorkSpaceId == req.body.changeWorkSpaceId) || req.session.myWorkSpaceId == req.params.hostWorkSpaceId) {

            await WorkSpace.update({
                snapshot: req.body.snapshot,
            }, {
                where: {
                    id: req.body.changeWorkSpaceId,
                }
            });
            const changeWorkSpace = await WorkSpace.findOne({
                where: {
                    id: req.body.changeWorkSpaceId,
                }
            });

            console.log(req.session.myWorkSpaceId, '가, ', req.body.changeWorkSpaceId, '의 snapshot을 변경했습니다');
            req.app.get('io').to(req.params.hostWorkSpaceId).emit('changeSnapshot', changeWorkSpace);
        
        }
        
        res.send('ok');
    } catch(error){
        console.error(error);
        next(error);
    }
});

// snapshot 받아오기
// myworkspace
router.post('/:hostWorkSpaceId/get/snapshot', async (req, res, next) => {
    try{
        const workspace = await WorkSpace.findOne({
            where: {
                id: req.body.watchingWorkSpaceId,
            }
        });

        req.app.get('io').to(req.params.hostWorkSpaceId).emit('getSnapshot', {
            workspace,
            myWorkSpaceId: req.session.myWorkSpaceId
        });
        res.send('ok');

    } catch (error){
        console.error(error);
        next(error);
    }
});

// 내 스냅샷 받아오기
// parsing문제 때문에 따로 받아옴
router.post('/:hostWorkSpaceId/get/snapshot/my', async (req, res, next) => {
    try{
        const workspace = await WorkSpace.findOne({
            where: {
                id: req.body.watchingWorkSpaceId,
            }
        });

        req.app.get('io').to(req.params.hostWorkSpaceId).emit('getMySnapshot', {
            workspace,
            myWorkSpaceId: req.session.myWorkSpaceId
        });
        res.send('ok');

    } catch (error){
        console.error(error);
        next(error);
    }
});

// freeze
// 요청한 사람이 호스트인 경우, freeze를 뿌림
router.post('/:hostWorkSpaceId/freeze', async (req, res, next) => {
   try{
       // 요청한 사람이 호스트인 경우
       if(req.session.myWorkSpace.id == req.params.hostWorkSpaceId){
           req.app.get('io').to(req.params.hostWorkSpaceId).emit('freeze');
           res.send('ok');
       }
   } catch(error){
       console.error(error);
       next(error);
   }
});

router.post('/:hostWorkSpaceId/unfreeze', async (req, res, next) => {
    try{
        if(req.session.myWorkSpace.id == req.params.hostWorkSpaceId){
            req.app.get('io').to(req.params.hostWorkSpaceId).emit('unfreeze');
            res.send('ok');
        }
    } catch (error){
        console.error(error);
        next(error);
    }
});

module.exports = router;