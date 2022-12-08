const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');
const webSocket = require('./socket');

dotenv.config(); // dotenv설정은 맨 위에

// router
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const workSpaceRouter = require('./routes/workspace');
const { sequelize } = require('./models');
const passportConfig = require('./passport');

const app = express();
passportConfig(); // 패스포트 설정
app.set('port', process.env.PORT || 8002) // port 지정
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});
sequelize.sync({ force: false }) // true일 경우 -> sequelize가 db모델 변경된경우 지우고 다시 만들어줌 , 실서비스때는 사용X!! 주의
    .then(()=>{
        console.log('데이터베이스 연결성공');
    })
    .catch((err)=>{
        console.log(err);
    });

app.use(morgan('dev')); // 서버로들어온 요청과 응답을 기록해 주는 미들웨어
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 경로 지정

// body-parser
app.use(express.json()); // json 파싱
app.use(express.urlencoded({ extended: false })); // form 파싱

app.use(cookieParser(process.env.COOKIE_SECRET)) // cookie-parser, 비밀키는 .env에
// 세션설정
const sessionMiddleware = session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET, // 쿠키 암호화
    cookie: { // 세션 쿠키 옵션
        httpOnly: true,
        secure: false,
    }
});
app.use(sessionMiddleware);
// session 에 종속되므로, express-session 밑에,
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/workspace', workSpaceRouter);

// error
// router가 없는 경우
app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다`);
    error.status = 404;
    next(error);
});
// error
app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}; // 개발시에만 에러 표시
    res.status(err.status || 500).render('error');
});

// 몇번 port에서 실행할지 지정
const server = app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기중');
});

webSocket(server, app, sessionMiddleware);
// webSocket(server, app);