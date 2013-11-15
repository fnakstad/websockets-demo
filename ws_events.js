var _ = require('underscore');

module.exports = function(io) {

    var users = {};

    function checkUsername(username) {
        return !_.contains(users, username);
    }

    io.sockets.on('connection', function(socket) {

        socket.on('usernameCheck', function(data) {
            socket.emit('usernameCheckResult', {
                available: checkUsername(data.username),
                username: data.username
            });
        });

        socket.on('joinRequest', function(data) {
            var username = data.username,
                accepted = checkUsername(username);

            socket.emit('joinRequestResult', {
                accepted: accepted,
                username: username
            });

            if(accepted) {
                users[socket.id] = username;
                socket.join('chatroom');

                if(!_.isEmpty(users))
                    socket.emit('userList', {
                        users: _.without(_.values(users), username)
                    });

                socket.broadcast.to('chatroom').emit('newUser', {
                    username: username
                });
            }
        });

        socket.on('message', function(data) {
            socket.broadcast.to('chatroom').emit('message', {
                message: data.message,
                username: users[socket.id]
            });
        });

        socket.on('disconnect', function() {
            if(users[socket.id]) {
                var username = users[socket.id];
                users = _.omit(users, socket.id);
                socket.broadcast.to('chatroom').emit('userDisconnect', {
                    username: username
                });
            }
        });
    });
};
