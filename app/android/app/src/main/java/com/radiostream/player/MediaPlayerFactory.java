package com.radiostream.player;

import android.media.MediaPlayer;

import javax.inject.Inject;

/**
 * Created by vitaly on 17/11/2016.
 */

public class MediaPlayerFactory {

    @Inject
    public MediaPlayerFactory() {
    }

    public MediaPlayer build() {
        return new MediaPlayer();
    }
}
