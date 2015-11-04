import os
import log_config
from datetime import datetime
import logging
import random
import flask
from flask import Flask, session, request, g
import itunes
import json
from datetime import timedelta
from flask import make_response, request, current_app
from functools import update_wrapper
from flaskext.auth import Auth, AuthUser, login_required, logout

music_dir = 'c:\Users\Vitaly\Dropbox\iTunes Media\Music'

app = Flask(__name__)
auth = Auth(app)
app.auth.user_timeout = 0
logger = logging.getLogger(__name__)

def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            h['Access-Control-Allow-Credentials'] = 'true'
            h['Access-Control-Allow-Headers'] = "content-type"
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator


@app.before_request
def init_users():
    print "initiating users"
    admin = AuthUser(username='admin')
    admin.set_and_encrypt_password('check this auth pass')
    g.users = {'admin': admin}


# Authentication per: https://github.com/thedekel/flask-auth/blob/master/examples/no_db_persistence.py
@app.route('/access-token', methods=["POST", "OPTIONS"])
@crossdomain(origin='http://whoisvitaly.ddns.net:3000')
def request_access_token():
    success = g.users['admin'].authenticate(request.get_json()['password'])
    
    return flask.jsonify(success=success)

@app.route('/playlist/<name>')
@crossdomain(origin='http://whoisvitaly.ddns.net:3000')
def playlist(name):
    tracks = itunes.playlist_tracks(name)
    if tracks is None:
        logger.warn("unknown playlist: %s", name)
        flask.abort(404)

    tracksJson = [json.loads(tracks[0].__repr__()) for track in tracks]

    return flask.jsonify(tracks=tracksJson)


@app.route('/playlist/<name>/next')
@crossdomain(origin='http://whoisvitaly.ddns.net:3000')
@login_required()
def next_song(name):
    tracks = itunes.playlist_tracks(name)
    if tracks is None:
        logger.warn("unknown playlist: %s", name)
        flask.abort(404)

    # This constant seed is used to always return the same next song, as long as the playlist didn't change
    random.seed(42)
    random.shuffle(tracks)

    resp = make_response((flask.jsonify(next=json.loads(tracks[0].__repr__())), 200))
    return resp

@app.route('/song/<id>/last-played', methods=["POST"])
@crossdomain(origin='http://whoisvitaly.ddns.net:3000')
def update_last_played(id):
    track = itunes.track_by_id(id)
    track.play_count += 1
    track.last_played = datetime.utcnow()
    logger.info("Updating track '%s' played date to: %s", track, datetime.utcnow())

    return "", 200


if __name__ == '__main__':
    app.secret_key = 'A0Zra98j/3zYaR~XHaH!jmN]LWX/,?RT'
    app.run(host='0.0.0.0', debug=True, threaded=True)
