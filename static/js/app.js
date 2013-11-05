$(document).ready(function(){

    var wsServer = 'http://localhost:8000';
    var socket = io.connect(wsServer);
    var username
        , statusMessage = $('#statusMessage')
        , joinButton = $('button#join')
        , sendButton = $('button#send')
        , inputMessage = $('input#message');

    socket.on('connecting', function() {
        statusMessage.html("Loading");
        statusMessage.show();
    });

    socket.on('connect', function() {
        statusMessage.hide();

        joinButton.click(function() {
            socket.emit('usernameRequest', {
                username: $('input#username').val()
            });
        });
        joinButton.prop('disabled', false);
    });

    socket.on('usernameRequestResult', function(data) {
        if(data.accepted) {
            username = data.username;
            $('#usernameRequest').hide();
            $('#chatroom').show();
            addSystemMessage('Hi {0}, and welcome to the chatroom.'.format(username));
            addUser('<strong>{0}</strong>'.format(username));

            inputMessage.keyup(function(event){
                if(event.keyCode == 13){
                    sendButton.click();
                }
            });

            sendButton.click(function() {
                var message = inputMessage.val();
                socket.emit('message', {
                    message: message
                });

                var formattedMessage = "<span class='red'><strong>{0}:</strong> {1}</span>".format(username, message);
                addMessage(formattedMessage);
                inputMessage.val('');
            });
        }
        else {
            // Show message, make input box red?
        }
    });

    socket.on('message', function(data) {
        var formattedMessage = '<strong>{0}</strong>: {1}'.format(data.username, data.message);
        addMessage(formattedMessage);
    });

    socket.on('newUser', function(data) {
        addUser(data.username);
        addSystemMessage('{0} has joined the chatroom. Introduce yourself!'.format(data.username));
    });

    socket.on('userList', function(data) {
        for(var i = 0; i < data.users.length; i++)
            addUser(data.users[i]);
    });

    socket.on('userDisconnect', function(data) {
        addSystemMessage('{0} just left the chatroom :('.format(data.username));
        removeUser(data.username);
    });

    socket.on('disconnect', function() {
        console.log('Server closed connection');
    });

    socket.on('error', function() {
        console.log('An error occurred...');
    });
});

function addMessage(message) {
    $('#messageList').append('<li>{0}</li>'.format(message));
};

function addSystemMessage(message) {
    $('#messageList').append('<li class="systemMessage">{0}</li>'.format(message));
};

function addUser(username) {
    $('#userList').append('<li data-user="{0}">{0}</li>'.format(username));
};

function removeUser(username) {
    $('[data-user="{0}"]'.format(username)).remove();
};