var _ = require('underscore');

module.exports = function(io) {

    var users = {};

    io.sockets.on('connection', function(socket) {
        //socket.broadcast.emit('join', { id: socket.id });

        socket.on('usernameRequest', function(data) {
            var username = data.username
                , available = !_.contains(users, username);

            socket.emit('usernameRequestResult', {
                accepted: available,
                username: username
            });

            if(available) {
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
