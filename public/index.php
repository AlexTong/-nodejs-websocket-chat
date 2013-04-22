<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Test nodejs chat server</title>
    <link rel="stylesheet" href="css/main.css">
    <script src="js/jquery-2.0.0.min.js" type="text/javascript"></script>
    <script src="js/improve.js" type="text/javascript"></script>
</head>
<body>
    <script type="text/javascript">
    $(document).ready(function(){
        $('#chat').WebSocketChat({
            "host":"127.0.0.1",
            "port":"5000",
        });
    });
    </script>
    <div id="chat">
        <div id="chat-error-container" calss="error-container"></div>
        <div id="chat-data-container" calss="data-container"></div>
        <textarea id="chat-data-input" class="input"></textarea>
        <input type="button" id="chat-connect-button" value="connect" />
        <input type="button" id="chat-disconnect-button" value="disconnect" />
        <input type="button" id="chat-submit-button" value="submit" />
    </div>
</body>
</html>
