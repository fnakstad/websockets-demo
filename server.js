var express = require('express')
    , http  = require('http')
    , path  = require('path');

var app    = module.exports = express(),
    server = http.createServer(app)
    , io   = require('socket.io').listen(server);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'))
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.cookieSession(
    {
        secret: process.env.COOKIE_SECRET || "Superdupersecret"
    }));

require('./routes.js')(app);
require('./ws_events.js')(io);

app.set('port', process.env.PORT || 8000);
server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});