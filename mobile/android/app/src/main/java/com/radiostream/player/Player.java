package com.radiostream.player;

import javax.inject.Inject;

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
        if(mCurrentPlaylistPlayer != null) {
            mCurrentPlaylistPlayer.close();
        }

        mCurrentPlaylistPlayer = mPlaylistPlayerFactory.build(playlistName);
    }

    @Override
    public void play() {
        if(mCurrentPlaylistPlayer == null) {
            throw new IllegalStateException("playlist must be set");
        }

        mCurrentPlaylistPlayer.play();
    }

    @Override
    public void pause() {
        if(mCurrentPlaylistPlayer == null) {
            throw new IllegalStateException("playlist must be set");
        }

        mCurrentPlaylistPlayer.pause();
    }

    @Override
    public void playNext() {
        if(mCurrentPlaylistPlayer == null) {
            throw new IllegalStateException("playlist must be set");
        }

        mCurrentPlaylistPlayer.playNext();
    }

    public void close() {
        if(mCurrentPlaylistPlayer != null) {
            mCurrentPlaylistPlayer.close();
        }
    }
}
