from flask import Flask
from flask import render_template
from instagram.client import InstagramAPI


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
    response = list()
    posts = list()

    for account in follows:
        response += list(
            api.user_recent_media(user_id=account.id, count=10))
    posts = response[0]

    # Way to get the geo info of a post:
    # latitude = post.location.point.latitude
    # longitude = post.location.point.longitude

    return render_template('nocturne.html')

if __name__ == '__main__':
    app.debug = True
    app.run()
