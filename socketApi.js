var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};
const activeUsers = new Set();
socketApi.io = io;

io.on("connection", async function (socket) {
    io.removeAllListeners();



    socket.on('user-disconnected', (name) => {
        console.log('Wylogował się ' + name);
    });
    socket.on("disconnect", () => {
        console.log('Odłączył się')
        socket.emit("hello", "world");
    });


    // socket.on("disconnect", () => {
    //     activeUsers.delete(req.session.userName);
    //     console.log(activeUsers);
    //     io.emit("user disconnected", req.session.userName);
    // });

    // socket.on("chat message", function (data) {
    //     io.emit("chat message", data);
    // });
    // socket.on("typing", function (data) {
    //     socket.broadcast.emit("typing", data);
    // });
    socket.on('check-logged-users', () => {
        console.log('Wystąpiło zdarzenie check-logged-users')
        io.emit("who-is-logged", [...activeUsers]);
    })
});



module.exports = socketApi;