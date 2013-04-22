(function($){
    var connection;
    var isConnected = false;
    var host;
    var msgQueue = [];
    var rowCount = 5;
    var userName;
    var dataContainer, dataInput, connectButton, disconnectButton, submitButton;
    $.fn.initChatFrame = function(cfg){
        host = cfg.host;
        if (cfg.rowCount !== undefined) {
            rowCount = cfg.rowCount;
        }
        dataContainer       = this.find('#chat-data-container');
        dataInput           = this.find('#chat-data-input');
        connectButton       = this.find('#chat-connect-button');
        disconnectButton    = this.find('#chat-disconnect-button');
        submitButton        = this.find('#chat-submit-button');

        updateButtonsView();

        // data input field
        dataInput.keydown(function(event){
            if (event.which === 13) {
                submitData();
            }
        });

        // connection button
        connectButton.click(function(){
            if (isConnected) {
                return this;
            }
            window.WebSocket = window.WebSocket || window.MozWebSocket;
            if (!window.WebSocket) {
                alert('Sorry, but your browser doesn\'t support WebSockets.');
                return;
            }
            connection = new WebSocket('ws://' + host);
            connection.onopen = function() {
                userName = prompt('Enter your name, please');
                this.send(JSON.stringify({
                    type:"auth",
                    data:userName
                }));
                console.log('Open connection with ' + host);
                isConnected = true;
                updateButtonsView();
            };
            connection.onerror = function(error){
                console.log('Connection error');
                console.log(error);
            };
            connection.onmessage = function(message){
                console.log('Receive message:');
                console.log(message);
                updateChatView(message);
            };
            connection.onclose = function(){
                isConnected = false;
                updateButtonsView();
                console.log('Close connection');
            };
        });

        // disconnect button
        disconnectButton.click(function(){
            try {
                connection.close();
                isConnected = false;
                updateButtonsView();
            } catch (e) {}
        });

        // submit button
        submitButton.click(function(){
            submitData();
        });

        function submitData(){
            if (isConnected) {
                var data = $.trim(dataInput.val());
                if (data) {
                    connection.send(JSON.stringify({
                        type: "spick",
                        data: data
                    }));
                    dataInput.val('');
                }
            } else {
                console.log('Cant submit data');
            }
        }

        function updateChatView(message){
            var msg;
            try {
                msg = JSON.parse(message.data);
            } catch (e) {
                console.log("Error");
                console.log(e);
                return;
            }
            var str = '<p>' + formateDateTime(new Date(message.timeStamp)) + ' <span class="user">' +
                msg.user + ':</span> ' + msg.data + '</p>';
            if (msgQueue.length >= rowCount) {
                msgQueue.splice(0, 1);
            }
            msgQueue.push(str);
            dataContainer.text('');
            msgQueue.forEach(function(entry){
                dataContainer.append(entry);
            });
        }

        function updateButtonsView(){
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
        }

        function formateDateTime(date) {
            hours   = date.getHours()   < 10 ? '0' + date.getHours()   : date.getHours();
            minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
            seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
            return '[' + hours + ':' + minutes + ':' + seconds + ']';
        }

        return this;
    };
})(jQuery);
