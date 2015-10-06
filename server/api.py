import os
import log_config
from datetime import datetime
import logging
import random
import flask
from flask import Flask
import itunes

music_dir = 'c:\Users\Vitaly\Dropbox\iTunes Media\Music'

app = Flask(__name__)
logger = logging.getLogger(__name__)


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

@app.route('/song/<id>/stream')
def stream_song(id):
    logger.info("Streaming song: %s", id)
    track = itunes.track_by_id(id)
    logger.info("Track: %s", track)

    full_path = os.path.join(music_dir, track.location)
    logger.info("Track path: %s", full_path)
    return flask.send_from_directory(os.path.dirname(full_path), os.path.basename(full_path))

@app.route('/song/<id>/last-played', methods=["POST"])
def update_last_played(id):
    track = itunes.track_by_id(id)
    track.play_count += 1
    track.last_played = datetime.utcnow()
    logger.info("Updating track '%s' played date to: %s", track, datetime.utcnow())

    return "", 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
