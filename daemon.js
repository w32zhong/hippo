const express_auth_path = '../auth/express-auth.js';

var process = require('process');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var fs = require('fs');
var history = require('connect-history-api-fallback'); // handle refresh for SPA
var expAuth = require(express_auth_path);

/* setup authentication module */
expAuth.init(app, {
	loginRoute: '/auth/login',
	verifyUrl: 'http://localhost/auth/token_verify',
	keyName: 'tk-auth'
});

app.use(history({verbose: true}));
app.use(express.static('.'));
app.use(bodyParser.json());
const port = 3854;
console.log('listen on port ' + port);
app.listen(port);

function is_dir(path) {
	if (fs.existsSync(path)) {
		const lstat = fs.lstatSync(path);
		if (lstat.isSymbolicLink() || lstat.isDirectory())
			return true;
	}
	return false;
}

app.get('/get/*dir.model', expAuth.middleware, function (req, res) {
	var ret = {
		'dirs': [],
		'cats': '',
		'error': ''
	};
	var request_dir = req.params[0];
	request_dir = './' + request_dir;

	request_dir = path.resolve(request_dir);
	console.log('visit: ' + request_dir);

	if (is_dir(request_dir)) {
		var files = fs.readdirSync(request_dir);
		files.forEach(file => {
			const fpath = request_dir + '/' + file;
			const exten = file.split('.')[1];
			if (!is_dir(fpath)) {
				if (exten != 'json')
					ret.cats += "\n === " + fpath + " ===\n";
				else
					ret.cats += fs.readFileSync(fpath) + ',';
			}
			ret.dirs.push(file);
		});
	} else if (fs.existsSync(request_dir)) {
		ret.cats += fs.readFileSync(request_dir);
	}

	res.json(ret);
});

process.on( 'SIGINT', function() {
	console.log('');
	console.log('Bye bye.');
	process.exit( );
})
