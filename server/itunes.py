import psutil as psutil
from win32com import client
import pythoncom
import logging
from datetime import datetime

logger = logging.getLogger('itunes')


class Track(object):
    def __init__(self, track_com):
        self.com_obj = track_com

    @property
    def id(self):
        return self.com_obj.Name

    @property
    def name(self):
        return self.com_obj.Name

    @property
    def artist(self):
        return self.com_obj.Artist

    @property
    def rating(self):
        return self.com_obj.Rating

    @property
    def play_count(self):
        return self.com_obj.PlayedCount

    @property
    def last_played(self):
        if float(self.com_obj.PlayedDate):
            return datetime.fromtimestamp(int(self.com_obj.PlayedDate))
        else:
            return None

    @last_played.setter
    def last_played(self, value):
        self.com_obj.PlayedDate = value
        logger.info("track %s updated PlayedDate to: %s", self, datetime.utcnow())

    @property
    def id(self):
        id_parts = get_itunes().GetITObjectPersistentIDs(self.com_obj)
        return "%s_%s" % id_parts

    def __str__(self):
        return "%s - %s" % (self.artist, self.name)

    def __repr__(self):
        return {
            "id": self.id,
            "artist": self.artist,
            "name": self.name,
            "rating": self.rating,
            "play_count": self.play_count
        }


def is_itunes_running():
    for proc in psutil.process_iter():
        if proc.name().lower() == "itunes.exe":
            logger.info("iTunes running")
            return True
    logger.info("iTunes not running")
    return False


def get_itunes():
    try:
        pythoncom.CoInitializeEx(pythoncom.COINIT_MULTITHREADED)
    except pythoncom.com_error:
        # already initialized.
        pass

    return client.Dispatch("iTunes.Application")


def get_lib():
    lib = get_itunes().LibraryPlaylist

    return lib


def first_or_default(collection, predicate):
    for item in collection:
        if predicate(item):
            return item

    return None


def find_playlist(name):
    lib = get_lib()
    playlists = [playlist for playlist in lib.Source.Playlists if playlist.Name == name]
    if playlists:
        logger.info("Playlist found: %s", name)
        return playlists[0]
    else:
        logger.warn("Playlist not found: %s", name)
        return None


def playlist_tracks(name):
    playlist = find_playlist(name)
    if playlist:
        return [Track(track) for track in find_playlist(name).Tracks]
    else:
        return None

def track_by_id(id):
    track_com = get_lib().Tracks.ItemByPersistentID(*id.split("_"))
    return Track(track_com)