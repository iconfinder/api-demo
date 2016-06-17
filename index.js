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
			client_id: 'wWNVskb4hnvfOyIyVeQoUKbg0NpnRaq9C6TLQ4HlWTsbmpD0R6EsVbFP8rQsBFdC',
			client_secret: '2tGQQImXoijycRXx2ZlhJ1a5vhoE5DndEGcTwzIN8WVPb10rIK5WeAprLJq1d6x8'
		}},
    		function (error, response, body) {
        		if (!error && response.statusCode == 200) {
            			console.log(body);
				delete body["token_type"];
				res.send(body);
        		} else {
				console.log('error');
				console.log(response);
			}
    		}
	);

});

app.listen(3334, function () {
  console.log('Example app listening on port 3334!');
});
