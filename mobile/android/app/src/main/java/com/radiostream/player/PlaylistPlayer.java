package com.radiostream.player;

import com.radiostream.networking.models.PlaylistsResult;

import org.jdeferred.DoneCallback;
import org.jdeferred.DonePipe;
import org.jdeferred.FailCallback;
import org.jdeferred.Promise;

import javax.inject.Inject;

import timber.log.Timber;

public class PlaylistPlayer implements Song.Events {

    private Playlist mPlaylist;
    private Song mCurrentSong;

    @Inject
    public PlaylistPlayer() {

    }

    void playPlaylist(String playlistName) {
        mPlaylist = new Playlist(playlistName);
        this.nextSong();
    }

    public void play() {
        if(mCurrentSong != null) {
            mCurrentSong.subscribeToEvents(this);
            mCurrentSong.play();
        }
    }

    public void pause() {
        if(mCurrentSong != null) {
            mCurrentSong.pause();
        }
    }

    public Promise<Song, Exception, Void> nextSong() {
        return mPlaylist.load().then(new DonePipe<Void, Song, Exception, Void>() {
            @Override
            public Promise<Song, Exception, Void> pipeDone(Void result) {
                if(mCurrentSong != null) {
                    mCurrentSong.pause();
                    mCurrentSong.close();
                }

                return mPlaylist.nextSong();
            }
        }).then(new DonePipe<Song, Song, Exception, Void>() {
            @Override
            public Promise<Song, Exception, Void> pipeDone(Song song) {
                return song.preload();
            }
        }).then(new DonePipe<Song, Song, Exception, Void>() {
            @Override
            public Promise<Song, Exception, Void> pipeDone(Song song) {
                mCurrentSong = song;
                PlaylistPlayer.this.play();

                return mPlaylist.peekSong();
            }
        }).then(new DonePipe<Song, Song, Exception, Void>() {
            @Override
            public Promise<Song, Exception, Void> pipeDone(Song peekedSong) {
                return peekedSong.preload();
            }
        }).fail(new FailCallback<Exception>() {
            @Override
            public void onFail(Exception error) {
                Timber.w("failed to preload song: %s", error.toString());
            }
        });
    }

    void close() {
        mPlaylist.close();
        if(mCurrentSong != null) {
            mCurrentSong.close();
        }
    }

    @Override
    public void onSongFinish(Song song) {
        this.nextSong();
    }
}
