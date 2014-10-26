from flask import (
    Flask,
    jsonify,
    render_template,
)
from instagram.client import InstagramAPI

API_BASE_URL = '/api/v1/'

app = Flask(__name__)
app.config.from_object('config')

api = InstagramAPI(
    client_id=app.config['CLIENT_ID'],
    client_secret=app.config['CLIENT_SECRET'],
)

myself = api.user_search('foodmaap')[0]
follows = api.user_follows(myself.id)[0]


@app.route('/')
def index():
    return render_template('nocturne.html')


@app.route(API_BASE_URL + 'locations', methods=['GET'])
def get_locations():
    response = list()
    posts = list()

    for account in follows:
        response += list(
            api.user_recent_media(user_id=account.id, count=10))
    posts = response[0]

    # Way to get the geo info of a post:
    # latitude = post.location.point.latitude
    # longitude = post.location.point.longitude

    locations = list()
    for post in posts:
        locations.append({
            'latitude': post.location.point.latitude,
            'longitude': post.location.point.longitude,
        })

    return jsonify(data=locations)


if __name__ == '__main__':
    app.debug = True
    app.run()
