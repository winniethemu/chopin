from flask import Flask
from flask import render_template
from instagram.client import InstagramAPI


app = Flask(__name__)
app.config.from_object('config')

api = InstagramAPI(
    client_id=app.config['CLIENT_ID'],
    client_secret=app.config['CLIENT_SECRET'],
)


@app.route('/')
def index():
    # Retrieve geo location of a post
    user = api.user_search('foodmaap')[0]
    user_id = user.id
    accounts = api.user_follows(user_id)[0]

    posts = list()
    for account in accounts:
        posts += list(api.user_recent_media(user_id=account.id, count=10))
    posts = posts[0]

    post = posts[0]
    latitude = post.location.point.latitude
    longitude = post.location.point.longitude

    return render_template('nocturne.html')

if __name__ == '__main__':
    app.debug = True
    app.run()
