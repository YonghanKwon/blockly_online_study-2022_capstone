const SocketIO = require('socket.io');
const cookieParser = require('cookie-parser');
const axios = require('axios');


module.exports = (server, app, sessionMiddleware) => {
    const io = SocketIO(server, { path: '/socket.io' });
    app.set('io', io);
    const workspace = io.of('/workspace');

    // session 연결
    io.use((socket, next) => {
        cookieParser(process.env.COOKIE_SECRET)(socket.request, socket.request.res || {}, next); // 미들웨어 확장패턴
        sessionMiddleware(socket.request, socket.request.res || {}, next);
    });

    io.on('connection', (socket) => {
        const req = socket.request;
        const { headers: { referer } } = req;
        const hostWorkSpaceId = referer.split('/')[referer.split('/').length - 1].replace(/\?.+/, '');
        socket.join(hostWorkSpaceId);
        socket.on('chat', (data) => {
            socket.to(data.hostWorkSpaceId).emit(data);
        });
        socket.on('disconnect', () => {
            socket.leave(hostWorkSpaceId);
            socket.to(hostWorkSpaceId).emit('exit',{
                chat: `${req.session.userNick}퇴장!!`,
            });
        });
    });
};


