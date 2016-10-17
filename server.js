var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var selectSecretWord = function() {
    var words = ["word", "letter", "number", "person", "pen", "class", "people",
    "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
    "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "page", "country", "question",
    "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "children", "example", "paper", "music", "river", "car",
    "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
    "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
    "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
    "space"
    ];
    var randomNumber = Math.floor(Math.random()*words.length);
    return words[randomNumber];
};
var currentSecret = selectSecretWord();

io.on('connection', function (socket) {
    var clientCount = io.engine.clientsCount;

    if (clientCount === 1) {
        socket.emit('assignRole', {
            role: 'Drawer',
            secretWord: currentSecret
        });
    } else {
        socket.emit('assignRole', {
            role: 'Guesser'
        });
    }
    console.log(clientCount, currentSecret, 'first');
    
    socket.on('draw', function(position) {
        socket.broadcast.emit('draw', position);
    });
    socket.on('guess', function(guess) {
        socket.broadcast.emit('guess', guess);
        console.log(guess.toLowerCase(), currentSecret);
        if (guess.toLowerCase() === currentSecret) {
            console.log('fire');
            currentSecret = selectSecretWord();
            socket.emit('assignRole', {
                role: 'Drawer',
                secretWord: currentSecret
            });
            socket.broadcast.emit('assignRole', {
                role: "Guesser"
            });
        }
    });
    socket.on('disconnect', function() {
        clientCount = io.engine.clientsCount;
        console.log('Client Disconnected', clientCount);
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