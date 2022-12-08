const express = require('express');
const { User, WorkSpace, WorkSpaceGroup } = require('../models');
const {isLoggedIn, isNotLoggedIn} = require("./middlewares");


const router = express.Router();

// 공통사항
router.use((req, res, next) => {
    res.locals.user = req.user;
    next();
})

// 회원가입
router.get('/join', isNotLoggedIn, (req, res, next) => {
    res.render('join', { title: '회원가입' });
})

// 메인페이지 - 기본페이지
router.get('/', async (req, res, next) => {
    try{
        if(req.user) {
            const workspaces = await WorkSpaceGroup.findAll({
                where: {
                    subUserId: req.user.id,
                }
            });
            res.render('main', {title: 'Capstone', workspaces: workspaces});
        }
        else res.render('main', {title: 'Capstone'});
    } catch(error){
        console.error(error);
        next(error);
    }
})

module.exports = router;