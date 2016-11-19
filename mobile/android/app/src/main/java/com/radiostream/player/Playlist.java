package com.radiostream.player;

import org.jdeferred.Promise;

/**
 * Created by vitaly on 15/11/2016.
 */
public class Playlist {
    public Playlist(String playlistName) {

    }

    public Promise<Void, Exception, Void> load() {
        return null;
    }


    public Promise<Song, Exception, Void> nextSong() {
        return null;
    }

    public Promise<Song, Exception, Void> peekSong() {
        return null;
    }

    public void close() {

    }
}
