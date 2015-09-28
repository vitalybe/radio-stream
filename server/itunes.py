from win32com import client
import pythoncom
import logging
from datetime import datetime

logger = logging.getLogger('itunes')

def is_itunes_running():
    for proc in psutil.process_iter():
        if proc.name().lower() == "itunes.exe": 
            logger.info("iTunes running")
            return True
    logger.info("iTunes not running")
    return False

def get_lib():

    try:
      pythoncom.CoInitializeEx(pythoncom.COINIT_MULTITHREADED)
    except pythoncom.com_error:
      # already initialized.
      pass

    itunes = client.Dispatch("iTunes.Application")
    lib = itunes.LibraryPlaylist

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

class Track:
    def __init__(self, track_com):
        self.artist = track_com.Artist
        self.name = track_com.Name
        self.rating = track_com.Rating
        self.play_count = track_com.PlayedCount
        self.com_obj = track_com

        if float(track_com.PlayedDate):
            self.last_played = datetime.fromtimestamp(int(track_com.PlayedDate))
        else:
            self.last_played = None

    def __str__(self):
        return "%s - %s" % (self.artist, self.name)

    def __repr__(self):
        return str(self.__dict__)