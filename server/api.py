import log_config
import os
import flask
import itunes
from flask import Flask, request, render_template

music_dir = 'c:\Users\Vitaly\Dropbox\iTunes Media\Music\X Dream\We Interface'

app = Flask(__name__)


@app.route('/music/<path:filename>')
def music(filename):
    return flask.send_from_directory(music_dir, filename)

@app.route('/playlist/<name>')
def playlist(name):
    playlist = itunes.find_playlist(name)
    if playlist:
        tracks = [itunes.Track(track).name for track in itunes.find_playlist(name).Tracks]
        return flask.jsonify(tracks=tracks)
    else:
        flask.abort(404)

if __name__ == '__main__':
    app.run(host = '0.0.0.0', debug = True)