import os
import flask
from flask import Flask, request, render_template

music_dir = 'c:\Users\Vitaly\Dropbox\iTunes Media\Music\X Dream\We Interface\\'

app = Flask(__name__)


@app.route('/music/<path:filename>')
def music(filename):
    return flask.send_from_directory(music_dir, filename)

@app.route('/')
@app.route('/home')
def index():
    response = make_response(csv)
    # This is the key: Set the right header for the response
    # to be downloaded, instead of just printed on the browser
    response.headers["Content-Disposition"] = "attachment; filename=books.csv"
    return response

if __name__ == '__main__':
    app.run(host = '0.0.0.0', debug = True)