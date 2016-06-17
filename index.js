var express = require('express');
var app = express();
var request = require('request');


app.use(express.static('./public'));

app.get('/refresh', function (req, res) {

  	const nf_token_url = "http://iconfinder.dev/api/v2/oauth2/token";

  	request.post(
    		nf_token_url,
    		{ form:{ 
			grant_type:'jwt_bearer',
			client_id: '<< INSERT YOUR OWN CLIENT_ID HERE >>',
			client_secret: '<< INSERT YOUR OWN CLIENT_SECRET HERE >>'
		}},
    		function (error, response, body) {
        		if (!error && response.statusCode == 200) {
            			console.log(body);
				delete body["token_type"];
				res.send(body);
        		} else {
				console.log('error');
			}
    	}
	);

});

app.listen(3334, function () {
  console.log('Example app listening on port 3334!');
});
