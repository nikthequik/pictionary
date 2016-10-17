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
var userPool = [];

var changeRoles = function(id) {
    for(var i = 0; i < userPool.length; i++) {
        if (userPool[i].id == id && userPool[i].role === 'Drawer') {
            userPool.splice(i, 1);
            if (userPool.length > 0) {
                userPool[0].role = 'Drawer';
                io.to(userPool[0].id).emit('assignRole', {
                    role: 'Drawer',
                    secretWord: currentSecret
                });
            }
            i--;
        } else if (userPool[i].id === id && userPool[i].role === 'Guesser'){
            userPool.splice(i, 1);
            io.to(userPool[i].id).emit('assignRole', {
                role: 'Guesser'
            });
            i--;
        } else if(userPool[i].role === 'Guesser') {
            io.to(userPool[i].id).emit('assignRole', {
                role: 'Guesser'
            });
        }
    }    
};

io.on('connection', function (socket) {
    var clientCount = io.engine.clientsCount;
    
    if (clientCount === 1) {
        userPool.push({
            id: socket.id,
            role: 'Drawer'
        });
        socket.emit('assignRole', {
            role: 'Drawer',
            secretWord: currentSecret
        });
    } else {
        userPool.push({
            id: socket.id,
            role: 'Guesser'
        });
        socket.emit('assignRole', {
            role: 'Guesser'
        });
    }
    console.log(clientCount, currentSecret, 'first');
    console.log('User Pool', userPool);
    
    socket.on('draw', function(position) {
        socket.broadcast.emit('draw', position);
    });
    socket.on('guess', function(guess) {
        io.emit('guess', guess);
        console.log(guess.toLowerCase(), currentSecret);
        if (guess.toLowerCase() === currentSecret) {
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
        console.log('Client Disconnected: ' + socket.id, clientCount);
        changeRoles(socket.id);
        console.log('User Pool', userPool);
    });
});

server.listen(process.env.PORT || 8080);