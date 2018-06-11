var process = require('process');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var fs = require('fs');
var history = require('connect-history-api-fallback'); // handle refresh for SPA

app.use(history({verbose: true}));
app.use(express.static('.'));
app.use(bodyParser.json());
const port = 3854;
console.log('listen on port ' + port);
app.listen(port);

app.get('/get/:echostr/echo.api', function (req, res) {
	const echostr = req.params.echostr;
	res.json({"echo string": echostr});

});

process.on( 'SIGINT', function() {
	console.log('');
	console.log('Bye bye.');
	process.exit( );
})
