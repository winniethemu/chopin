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
    return render_template('nocturne.html')

if __name__ == '__main__':
    app.debug = True
    app.run()
