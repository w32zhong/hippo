const express_auth_path = '../tkcloud/auth/express-auth.js';
const enable_authentication = true;

var process = require('process');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var fs = require('fs');
var history = require('connect-history-api-fallback'); // handle refresh for SPA
var expAuth = {"middleware": function (req, res, next) {return next();}};

if (enable_authentication) {
	var expAuth = require(express_auth_path);

	/* setup authentication module */
	expAuth.init(app, {
		loginRoute: '/auth/login',
		verifyUrl: 'http://127.0.0.1/auth/token_verify',
		keyName: 'tk-auth'
	});
}

app.use(history({verbose: true}));
app.use('/hippo', express.static('.'))
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

app.get('/index.html', function (req, res) {
	console.log(req.originalUrl);
	if (req.originalUrl.indexOf('auth/login') == -1) {
		res.sendFile('index.html', {root: './'});
	} else {
		/* avoid infinite redirections */
		console.log('Infinite redirections avoided !!!');
		res.status(404).send('Not found');
	}
}).get('/hippo/get/*dir.model', expAuth.middleware, function (req, res) {
	var ret = {
		'dirs': [],
		'cats': [],
		'error': ''
	};
	var request_dir = req.params[0];
	request_dir = './' + request_dir;

	/* safe guard to avoid visiting unexpected folder */
	if (request_dir.indexOf('hippo') == -1) {
		ret.error = 'not under ./hippo directory.';
		res.json(ret);
		return;
	}

	request_dir = path.resolve(request_dir);
	console.log('visit: ' + request_dir);

	if (is_dir(request_dir)) {
		var files = fs.readdirSync(request_dir);
		files.forEach(file => {
			const fpath = request_dir + '/' + file;
			const exten = file.split('.').pop();
			if (exten == 'swp') return;
			if (!is_dir(fpath)) {
				if (exten != 'json') {
					var content = fs.readFileSync(fpath).toString();
					content = path.basename(fpath) + "\n" + content;
					ret.cats.push(content + "\n");
				} else {
					const content = fs.readFileSync(fpath).toString();
					ret.cats.push(content);
				}
			}
			ret.dirs.push(file);
		});
	} else if (fs.existsSync(request_dir)) {
		const content = fs.readFileSync(request_dir).toString();
		ret.cats.push(content);
	}

	res.json(ret);
});

process.on( 'SIGINT', function() {
	console.log('');
	console.log('Bye bye.');
	process.exit( );
})
