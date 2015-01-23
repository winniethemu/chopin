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

import const


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
        'const.js',
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


@app.route('/')
def index():
    def get_city(ip_address):
        # Use hostip.info as our IP lookup API
        url = 'http://api.hostip.info/get_json.php?position=true&ip={}'.format(
            ip_address)

        # NYC
        # url = 'http://api.hostip.info/get_json.php?position=true&ip=67.221.255.55'

        # Richmond Hill
        # url = 'http://api.hostip.info/get_json.php?position=true&ip=99.247.0.170'

        response = urllib.urlopen(url)
        data = json.loads(response.read())
        city = data.get('city')
        lat = data.get('lat')
        lng = data.get('lng')
        if city and not 'unknown' in city.lower() and lat and lng:
            city = city.split(',')[0].replace(' ', '_').lower()
            return city
        return 'toronto'

    ip_address = request.remote_addr
    home = get_city(ip_address)
    if not const.ACCOUNTS.get(home):
        home = 'toronto'
    return render_template('nocturne.html', city=home)


@app.route(API_BASE_URL + 'locations', methods=['GET'])
def get_locations():
    def get_accounts(handles):
        if not handles:
            return []
        accounts = []
        for handle in handles:
            try:
                account = api.user_search(handle)[0]
            except:
                pass
            else:
                accounts.append(account)
        return accounts

    city = request.args.get('city')
    accounts = get_accounts(const.ACCOUNTS.get(city))
    response = list()
    posts = list()

    for account in accounts:
        response += list(
            api.user_recent_media(user_id=account.id, count=10))[0]
    if response:
        posts = response

    locations = list()
    for post in posts:
        try:
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
        except AttributeError:
            continue

        try:
            recent_posts= api.location_recent_media(
                count=3, max_id=None, location_id=post.location.id)[0]
        except Exception:
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
    app.run()
