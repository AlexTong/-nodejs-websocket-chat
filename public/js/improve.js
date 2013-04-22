(function($){
    var settings;
    var userName;
    var connection;
    var isConnected = false;
    var msgQueue    = [];
    var dataContainer, dataInput, connectButton, disconnectButton, submitButton;
    var methods = {
        init: function(options){
            settings = $.extend({
                "host":                 "127.0.0.1",
                "port":                 "8080",
                "rowCount":             5,
                "dataContainer":        "#chat-data-container",
                "errorContainer":       "#chat-error-container",
                "dataInput":            "#chat-data-input",
                "connectButton":        "#chat-connect-button",
                "disconnectButton":     "#chat-disconnect-button",
                "submitButton":         "#chat-submit-button"
            }, options);

            dataContainer       = $(settings.dataContainer);
            errorContainer      = $(settings.errorContainer);
            dataInput           = $(settings.dataInput);
            submitButton        = $(settings.submitButton);
            connectButton       = $(settings.connectButton);
            disconnectButton    = $(settings.disconnectButton);

            connectButton.click(function(e){
                e.preventDefault();
                if (isConnected) {
                    return;
                }
                window.WebSocket = window.WebSocket || window.MozWebSocket;
                    if (!window.WebSocket) {
                    alert("Sorry, but your browser doesn't support WebSockets.");
                    return;
                }
                connection  = new WebSocket("ws://" + settings.host + ":" + settings.port);
                connection.onopen = function(){
                    userName    = prompt('Enter your name, please.');
                    this.send(JSON.stringify({
                        type:"auth",
                        data:userName
                    }));
                    isConnected = true;
                    methods.updateButtonsView();
                };
                connection.onerror = function(error){
                    console.log(error);
                };
                connection.onmessage = function(msg){
                    methods.updateChatContainer(msg.data, msg.timeStamp);
                };
                connection.onclose = function(){
                    isConnected = false;
                    methods.updateButtonsView();
                };
            });
            disconnectButton.click(function(e){
                e.preventDefault();
                try {
                    connection.close();
                    isConnected = false;
                    methods.updateButtonsView();
                } catch (err) {}
            });
            submitButton.click(function(e){
                e.preventDefault();
                methods.submitData();
            });
            dataInput.keydown(function(event){
                if (event.which === 13) {
                    methods.submitData();
                }
            });
            methods.updateButtonsView();
        },
        updateChatContainer: function(message, timestamp){
            var msg, str;
            var formateTime = function(timestamp) {
                var date = new Date(timestamp);
                hours    = date.getHours()   < 10 ? '0' + date.getHours()   : date.getHours();
                minutes  = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
                seconds  = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
                return '[' + hours + ':' + minutes + ':' + seconds + ']';
            };
            try {
                msg = JSON.parse(message);
            } catch (e) {
                console.log("Error");
                console.log(e);
                return;
            }
            str = '<p>' + formateTime(timestamp) + ' <span class="user">' + msg.user + ':</span> ' + msg.data + '</p>';
            if (msgQueue.length >= settings.rowCount) {
                msgQueue.splice(0, 1);
            }
            msgQueue.push(str);
            dataContainer.text('');
            msgQueue.forEach(function(entry){
                dataContainer.append(entry);
            });
        },
        updateButtonsView: function(){
             if (isConnected) {
                dataContainer.show();
                dataInput.show();
                connectButton.hide();
                disconnectButton.show();
                submitButton.show();
            } else {
                dataContainer.hide();
                dataInput.hide();
                connectButton.show();
                disconnectButton.hide();
                submitButton.hide();
            }
        },
        submitData: function(){
            if (isConnected) {
                var data = $.trim(dataInput.val());
                if (data) {
                    connection.send(JSON.stringify({
                        type: "spick",
                        data: data
                    }));
                }
                dataInput.val('');
            }
        }
    };

    $.fn.WebSocketChat = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Method " +  method + " does not exist on jQuery.WebSocketChat");
        }
    };
})(jQuery);
