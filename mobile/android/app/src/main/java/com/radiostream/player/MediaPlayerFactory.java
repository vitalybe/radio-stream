package com.radiostream.player;

import android.media.MediaPlayer;

import com.radiostream.javascript.bridge.PlayerEventsEmitter;

import javax.inject.Inject;

import timber.log.Timber;

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
