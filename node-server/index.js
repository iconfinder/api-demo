/***
 * Demo Application for the Iconfinder API.
 *
 * Insert the Client Credentials you got when you registered your app.
 * If you haven't registered an app yet, go to https://www.iconfinder.com/account/applications
 */

var express = require('express');
var app = express();
var request = require('request');

var CLIENT_ID = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET;

app.use(express.static('../public'));

app.get('/token', function (req, res) {
	var nf_token_url = "https://www.iconfinder.com/api/v3/oauth2/token";

  	request.post(nf_token_url, {
	        form: {
			grant_type:'jwt_bearer',
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET
		    }
	}, function (error, response, body) {
        	if (!error && response.statusCode == 200) {
			console.log(body);
			delete body.token_type;
			res.send(body);
		} else {
			console.log(error, response, body);
		}
	});
});

app.listen(3334, function () {
	console.log('Example app listening on port 3334!');
});
