var port = 8080;

var parser = require('./parser');

if (typeof process.env['PORT'] !== 'undefined') {
    port = process.env['PORT'];
}

console.log(process.cwd());

var server = require('express')();

server.get('/', function(req, res){
    res.sendFile(
        'index.html',
        {
            "root": process.cwd()
        }
    );
});

server.post('/calc', function(req, res){
    req.on('data', function (a, b){
        var data = a.toString();
        res.setHeader("Content-Type", "application/json");
        var json = {
            success: true,
            result: 0,
            message: ''
        };
        try {
            json.result = parser.parse(data);
        } catch (err) {
            console.log(err);
            json.success = false;
            json.message = err.message;
        }
        res.send(JSON.stringify(json));
    });

});

server.listen(port);