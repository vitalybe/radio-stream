package com.radiostream.player;

import com.radiostream.networking.models.PlaylistsResult;

import org.jdeferred.DoneCallback;
import org.jdeferred.DonePipe;
import org.jdeferred.Promise;

import javax.inject.Inject;

public class Player {

    private Playlist mPlaylist;
    private Song mCurrentSong;
    private Song mNextSong;

    @Inject
    public Player() {

    }

    void playPlaylist(String playlistName) {
/*
        mPlaylist = new Playlist(playlistName);
        mPlaylist.load().then(new DonePipe<Void, Song, Exception, Void>() {
            @Override
            public Promise<Song, Exception, Void> pipeDone(Void result) {
                return mPlaylist.nextSong();
            }
        }).then(new DonePipe<Song, Void, Exception, Void>() {
            @Override
            public Promise<Void, Exception, Void> pipeDone(Song song) {
                Song


            }
        });
*/

    }

    void play() {

    }

    void pause() {

    }

    public void close() {

    }
}
