var WebSocketServer = require("websocket").server;
var http            = require("http");

process.title = "node-chat";

var HOST    = "127.0.0.1";
var PORT    = 5000;
var ORIGIN  = "http://test.local";

var server = http.createServer(function(request, response){}).listen(PORT, HOST);

wsServer = new WebSocketServer({
    httpServer: server
});

var hist    = [];
var clients = [];

wsServer.on("request", function(request){
    // reject from other hosts
    if (doReject(request)) {
        console.log((new Date()) + " " + request.origin + " was rejected.");
        return;
    }

    // accept connection
    var connection = request.accept(null, request.origin);

    console.log((new Date()) + " " + request.origin + " was connected.");

    var index = clients.push(connection) - 1;

    connection.on("message", function(message){
        // skip if non-utf message
        if (message.type !== "utf8") {
            return;
        }
        console.log((new Date()) + " Receive new message");
        var msgData;
        try {
            msgData = JSON.parse(message.utf8Data);
        } catch (e) {
            console.log((new Date()) + " Error:");
            console.log(e);
            return;
        }

        /**
         *  messageData = {
         *      type:"auth|spick",
         *      data:""
         *  }
         */
        if (msgData.type === 'auth') {
            console.log((new Date()) + " Auth as '" + msgData.data + "'");
            clients[index].userName = msgData.data;
        } else
        if (msgData.type === 'spick') {
            console.log((new Date()) + " '" + clients[index].userName + "' say: " + msgData.data);
            wsServer.broadcast(JSON.stringify({
                user: clients[index].userName,
                data: msgData.data
            }));
        }
    });

    connection.on("close", function(connection){
        console.log((new Date()) + " User '" + clients[index].userName + "' disconnected.");
        clients.splice(index, 1);
    });
});

process.addListener('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

var doReject = function(request) {
    // return request.origin !== ORIGIN;
    return false;
};