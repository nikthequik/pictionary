var socket = io();
var pictionary = function() {
    var canvas, context, drawing;

    var draw = function(position) {
        context.beginPath();
        context.arc(position.x, position.y,
                         6, 0, 2 * Math.PI);
        context.fill();
    };
    
    canvas = $('canvas');
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
    var offset = canvas.offset();
    $(window).on('mousedown', function() {
        drawing = true;
    });
    $(window).on('mouseup', function() {
        drawing = false;
    });
    
    
    canvas.on('mousemove', function(event) {
        var position = {x: event.pageX - offset.left,
                        y: event.pageY - offset.top};
        if (drawing) {
            draw(position);
            socket.emit('draw', position);
        }
        
    });
    
    socket.on('draw', draw);
    
};

$(document).ready(function() {
    pictionary();
    
});