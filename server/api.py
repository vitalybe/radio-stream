import log_config
from datetime import datetime
import logging
import random
import flask
from flask import Flask
import itunes

music_dir = 'c:\Users\Vitaly\Dropbox\iTunes Media\Music\X Dream\We Interface'

app = Flask(__name__)
logger = logging.getLogger(__name__)


@app.route('/music/<path:filename>')
def music(filename):
    return flask.send_from_directory(music_dir, filename)


@app.route('/playlist/<name>')
def playlist(name):
    tracks = itunes.playlist_tracks(name)
    if tracks is None:
        logger.warn("unknown playlist: %s", name)
        flask.abort(404)

    return flask.jsonify(tracks=tracks)


@app.route('/playlist/<name>/next')
def next_song(name):
    tracks = itunes.playlist_tracks(name)
    if tracks is None:
        logger.warn("unknown playlist: %s", name)
        flask.abort(404)

    # This constant seed is used to always return the same next song, as long as the playlist didn't change
    random.seed(42)
    random.shuffle(tracks)
    print tracks[0].__repr__()
    return flask.jsonify(next=tracks[0].__repr__())

@app.route('/song/<id>/last-played', methods=["POST"])
def update_last_played(id):
    track = itunes.track_by_id(id)
    track.last_played = datetime.utcnow()
    logger.info("Updating track '%s' played date to: %s", track, datetime.utcnow())


    return "", 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
