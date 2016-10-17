var socket = io();
var pictionary = function() {
    var canvas, context, drawing, currentRole, guessBox;
    
    var assignRole = function(role) {
        currentRole = role.role;
        $('#main h2 span').text(currentRole);
        if (currentRole === 'Drawer') {
            $('#secret').text('Secret Word: ' + role.secretWord);
            $('#top-message').hide();
        } else {
            $('#secret').text('');
            $('#top-message').show();
        }
        
    };
    
    var draw = function(position) {
        context.beginPath();
        context.arc(position.x, position.y, 6, 0, 2 * Math.PI);
        context.fill();
    };

    var onKeyDown = function(event) {
        if (event.keyCode != 13) { // Enter
            return;
        }
        socket.emit('guess', guessBox.val());
        guessBox.val('');
    };
    
    guessBox = $('#guess input');
    guessBox.on('keydown', onKeyDown);
    
    canvas = $('canvas');
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
    var offset = canvas.offset();
    
    //Only draw on mousedown
    $(window).on('mousedown', function() {
        drawing = true;
    });
    $(window).on('mouseup', function() {
        drawing = false;
    });
    
    
    canvas.on('mousemove', function(event) {
        var position = {x: event.pageX - offset.left,
                        y: event.pageY - offset.top};
        if (drawing && currentRole === 'Drawer') {
            draw(position);
            socket.emit('draw', position);
        }
        
    });
    
    socket.on('assignRole', assignRole);
    socket.on('draw', draw);
    socket.on('guess', function(guess) {
        $('#lastGuess span').text(guess);
    });
    
};

$(document).ready(function() {
    pictionary();
});