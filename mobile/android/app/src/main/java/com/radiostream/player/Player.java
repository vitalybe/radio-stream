package com.radiostream.player;

import com.radiostream.javascript.bridge.PlayerBridge;
import com.radiostream.javascript.bridge.PlaylistPlayerBridge;

import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;

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

    public PlayerBridge toBridgeObject() {
        PlayerBridge bridge = new PlayerBridge();

        bridge.id = this.hashCode();
        if(mCurrentPlaylistPlayer != null) {
            bridge.playlistPlayerBridge = mCurrentPlaylistPlayer.toBridgeObject();
        }

        return bridge;
    }

    public boolean getIsPlaying() {
        Timber.i("function start");

        if(mCurrentPlaylistPlayer != null) {
            Timber.i("returning value based on current song, if any");
            return mCurrentPlaylistPlayer.getIsPlaying();
        } else {
            Timber.i("no playlist selected - not playing");
            return false;
        }
    }

    public Promise<Void, Exception, Void> updateSongRating(int songId, int newRating) {
        Timber.i("function start");
        if(mCurrentPlaylistPlayer != null) {
            return mCurrentPlaylistPlayer.updateSongRating(songId, newRating);
        } else {
            Timber.w("playlist unavailable - song rating is unavailable");
            return new DeferredObject<Void, Exception, Void>().reject(null);
        }
    }
}
