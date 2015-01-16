import json
import logging
import os
import sys
import urllib

from flask import (
    Flask,
    jsonify,
    render_template,
    request,
)
from flask.ext import assets
from instagram.bind import InstagramAPIError
from instagram.client import InstagramAPI

import data


API_BASE_URL = '/api/v1/'

app = Flask(__name__, static_folder='static', static_url_path='')

app.logger.addHandler(logging.StreamHandler(sys.stdout))
app.logger.setLevel(logging.ERROR)

# Import Instagram config variables depending on environment
try:
    app.config.from_object('config')
except ImportError:
    # Production
    CLIENT_ID = os.environ.get('CLIENT_ID')
    CLIENT_SECRET = os.environ.get('CLIENT_SECRET')
else:
    # Local
    CLIENT_ID = app.config['CLIENT_ID']
    CLIENT_SECRET = app.config['CLIENT_SECRET']

env = assets.Environment(app)

# Tell flask-assets where to look for JS and CSS files
env.load_path = [
    os.path.join(os.path.dirname(__file__), 'assets'),
    os.path.join(os.path.dirname(__file__), 'bower_components'),
]

env.register(
    'script',
    assets.Bundle(
        'jquery/dist/jquery.min.js',
        'leaflet/dist/leaflet.js',
        'doT/doT.min.js',
        'dot_settings.js',
        'nocturne.js',
        output='script.js',
    ),
)

env.register(
    'style',
    assets.Bundle(
        'font-awesome/css/font-awesome.min.css',
        'leaflet/dist/leaflet.css',
        'reset.css',
        'nocturne.css',
        output='style.css',
    ),
)

api = InstagramAPI(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
)

accounts = []


@app.route('/')
def index():
    def get_city(ip_address):
        return 'toronto'

    def get_accounts(account_ids):
        accounts = []
        for account_id in account_ids:
            account = api.user_search(account_id)[0]
            accounts.append(account)
        return accounts

    global accounts
    ip_address = request.remote_addr
    city = get_city(ip_address)
    account_ids = data.ACCOUNTS.get(city)
    accounts = get_accounts(account_ids)
    return render_template('nocturne.html')


@app.route(API_BASE_URL + 'locations', methods=['GET'])
def get_locations():
    response = list()
    posts = list()

    for account in accounts:
        response += list(
            api.user_recent_media(user_id=account.id, count=10))
    if response:
        posts = response[0]

    locations = list()
    for post in posts:
        d = {
            'author': post.user.username,
            'caption': post.caption.text,
            'image_url': post.images['low_resolution'].url,
            'latitude': post.location.point.latitude,
            'like_count': post.like_count,
            'link': post.link,
            'longitude': post.location.point.longitude,
            'name': post.location.name,
            'recent_posts': [],
        }

        try:
            recent_posts= api.location_recent_media(
                count=3, max_id=None, location_id=post.location.id)[0]
        except InstagramAPIError:
            recent_posts = None

        if recent_posts:
            for recent_post in recent_posts:
                if recent_post.id != post.id:
                    d['recent_posts'].append({
                        'image_url': recent_post.images['thumbnail'].url,
                        'link': recent_post.link,
                    })

        locations.append(d)

    return jsonify(data=locations)


if __name__ == '__main__':
    app.debug = True
    app.run()
