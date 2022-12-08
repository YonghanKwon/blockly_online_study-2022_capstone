const passport = require('passport');
const local = require('./localStrategy');
const User = require('../models/user');

module.exports = () => {
    // 첫 로그인시 실행
    passport.serializeUser((user, done) => {
        done(null, user.id); // 세션(메모리)에 유저id만 저장 왜? 메모리가 한정돼있기 때문, id만 있어도 정보를 불러올 수 있으니까 메모리에 id만 저장,
        // 나중에는 저장 X, 저장용 서버를 따로 만듬, 수억명의 id를 저장할 수 없으니까, 메모리가 못버팀
    });

    // {id: 3, 'connect.sid' : s%3248952389457239} 이런식으로 저장된다고 함 sid = 세션 쿠키(브라우저로 가는 정보 즉, id변환이라고 생각)

    // 로그인 이후 실행
    passport.deserializeUser((id, done) => { // 여기서 req.user가 생성된다
        User.findOne({ where: { id } })
            .then(user => done(null, user)) // user찾아서 반환된다
            .catch(err => done(err));
    });

    // 등록
    local();
};