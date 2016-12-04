package com.radiostream.player;

import org.jdeferred.Promise;

/**
 * Created by vitaly on 18/11/2016.
 */
public interface PlaylistControls {
    Promise<Song, Exception, Void> play();

    void pause();

    void playPause();

    void playNext();
}
