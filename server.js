var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

io.on('connection', function (socket) {
    console.log('Client connected');
    socket.on('draw', function(position) {
        socket.broadcast.emit('draw', position);
    });
    /*console.log('Client connected');

    socket.once('disconnect', function() {
        console.log('Client disconnected');
        socket.broadcast.emit('countdown', io.engine.clientsCount);
    });


    socket.on('enter', function(count) {
        socket.broadcast.emit('newConnect', io.engine.clientsCount);
        socket.emit('welcome', io.engine.clientsCount);
    });
    socket.on('message', function(message) {
        console.log('Received message:', message);
        socket.broadcast.emit('message', message);
    });*/
});

server.listen(process.env.PORT || 8080);