package com.radiostream.player;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.radiostream.javascript.bridge.PlayerEventsEmitter;

import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;

import javax.inject.Inject;

import timber.log.Timber;

public class Player implements PlaylistControls {
    private PlaylistPlayerFactory mPlaylistPlayerFactory;
    private PlayerEventsEmitter mPlayerEventsEmitter;

    private PlaylistPlayer mCurrentPlaylistPlayer = null;

    @Inject
    public Player(PlaylistPlayerFactory playlistPlayerFactory, PlayerEventsEmitter playerEventsEmitter) {
        mPlaylistPlayerFactory = playlistPlayerFactory;
        mPlayerEventsEmitter = playerEventsEmitter;
    }

    public void changePlaylist(String playlistName) {
        Timber.i("function start");

        if(mCurrentPlaylistPlayer != null) {
            mCurrentPlaylistPlayer.close();
        }

        mCurrentPlaylistPlayer = mPlaylistPlayerFactory.build(playlistName, new StatusProvider() {
            @Override
            public void sendStatus() {
                mPlayerEventsEmitter.sendPlayerStatus(toBridgeObject());
            }
        });
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

    @Override
    public void skipToSongByIndex(int index) {
        Timber.i("function start");

        if(mCurrentPlaylistPlayer == null) {
            throw new IllegalStateException("playlist must be set");
        }

        mCurrentPlaylistPlayer.skipToSongByIndex(index);
    }

    public void close() {
        Timber.i("function start");

        if(mCurrentPlaylistPlayer != null) {
            mCurrentPlaylistPlayer.close();
        }
    }

    public WritableMap toBridgeObject() {
        WritableMap map = Arguments.createMap();
        map.putMap("playlistPlayer", mCurrentPlaylistPlayer != null ? mCurrentPlaylistPlayer.toBridgeObject() : null);

        return map;
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
