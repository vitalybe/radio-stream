package com.radiostream.player;

import com.radiostream.javascript.bridge.PlaylistPlayerBridge;

import org.jdeferred.Promise;

import javax.inject.Inject;

import timber.log.Timber;

/**
 * Created by vitaly on 18/11/2016.
 */

public class Player implements PlaylistControls {
    private PlaylistPlayerFactory mPlaylistPlayerFactory;

    private PlaylistPlayer mCurrentPlaylistPlayer = null;

    @Inject
    public Player(PlaylistPlayerFactory playlistPlayerFactory) {
        mPlaylistPlayerFactory = playlistPlayerFactory;
    }

    public void changePlaylist(String playlistName) {
        Timber.i("function start");

        if(mCurrentPlaylistPlayer != null) {
            mCurrentPlaylistPlayer.close();
        }

        mCurrentPlaylistPlayer = mPlaylistPlayerFactory.build(playlistName);
    }

    @Override
    public Promise<Song, Exception, Void> play() {
        Timber.i("function start");

        if(mCurrentPlaylistPlayer == null) {
            throw new IllegalStateException("playlist must be set");
        }

        mCurrentPlaylistPlayer.play();
        return null;
    }

    @Override
    public void pause() {
        Timber.i("function start");

        if(mCurrentPlaylistPlayer == null) {
            throw new IllegalStateException("playlist must be set");
        }

        mCurrentPlaylistPlayer.pause();
    }

    @Override
    public void playPause() {
        if(mCurrentPlaylistPlayer == null) {
            throw new IllegalStateException("playlist must be set");
        }

        mCurrentPlaylistPlayer.playPause();
    }

    @Override
    public void playNext() {
        Timber.i("function start");

        if(mCurrentPlaylistPlayer == null) {
            throw new IllegalStateException("playlist must be set");
        }

        mCurrentPlaylistPlayer.playNext();
    }

    public void close() {
        Timber.i("function start");

        if(mCurrentPlaylistPlayer != null) {
            mCurrentPlaylistPlayer.close();
        }
    }

    public PlaylistPlayerBridge toBridgeObject() {
        if(mCurrentPlaylistPlayer != null) {
            return mCurrentPlaylistPlayer.toBridgeObject();
        } else {
            return null;
        }
    }
}
