const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

// 로그인 안한 사람들만 접근 가능하도록 isNotLoggedIn 넣어줌, 이게 먼저 실행됨
router.post('/join', isNotLoggedIn, async (req, res, next)=>{
    const { email, nick, password } = req.body; // front에서 email, nick, password 보내주면
    try{
        const exUser = await User.findOne({ where: { email } });
        if(exUser){ // 이메일이 이미 존재하면 프론트에 에러 표시
            return res.redirect('/join?error=exist');
        }
        const hash = await bcrypt.hash(password, 12); // pw를 헤시화해서 저장, 숫자가 높을수록 더 많은 헤시화, but 시간많이 걸림
        await User.create({
            email,
            nick,
            password: hash, // 비밀번호 헤시화해서 저장
        });
        return res.redirect('/');
    } catch(error){
        console.log(error);
        return next(error);
    }
})

// 로그인은 세션문제, 카카오등의 문제등일 많이서 passport 라이브러리를 사용한다
// auth/login -> authenticate('local')이 먼저 실행되고, localStrategy가 실행되는 형식이라고 함
// done함수 호출시 그 다음, (authError, user, info)파트가 실행됨
// login(user ) -> 실행시, index.js의 serializeUser가 실행됨
// done되는 순간 그 뒤가 실행됨 (loginError) => ...
router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if(authError){
            console.error(authError);
            return next(authError);
        }
        if(!user){
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginError) => {
            if(loginError){
                console.error(loginError);
                return next(loginError);
            }
            // 세션쿠키를 브라우저로 보내줌!
            return res.redirect('/'); // 로그인 성공!
        });
    })(req, res, next); // 미들웨어는 req, res, next를 붙인다. 미들웨어 확장하는 형식이라고 함
});

router.get('/logout', isLoggedIn, (req, res) => {
    req.logout(() => {
        res.redirect('/');
    }); // 세션 쿠키가 사라짐, 서버에서 세션쿠키를 지워버림
    // req.session.destroy(); // 세션을 지움, 파괴
    // res.redirect('/');
});

module.exports = router;