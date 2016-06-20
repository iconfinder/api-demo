import flask
import requests as rq

app = flask.Flask(__name__)

CLIENT_ID = 'wWNVskb4hnvfOyIyVeQoUKbg0NpnRaq9C6TLQ4HlWTsbmpD0R6EsVbFP8rQsBFdC'
CLIENT_SECRET = '2tGQQImXoijycRXx2ZlhJ1a5vhoE5DndEGcTwzIN8WVPb10rIK5WeAprLJq1d6x8'
AUTH_TOKEN_URL = "https://iconfinder.com/api/v2/oauth2/token"


@app.route('/token')
def token():

    # POST data
    data = {
        'grant_type': 'jwt_bearer',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }
    response = rq.post(AUTH_TOKEN_URL, data)

    # handle response
    if response.status_code == 200:
        jwt = response.json()['access_token']
        # return token in JSON
        return flask.jsonify({'access_token': jwt})
    else:
        return flask.jsonify({'error': 'bad request'})

if __name__ == '__main__':
    app.run()
