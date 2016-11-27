package com.radiostream.player;

import org.jdeferred.AlwaysCallback;
import org.jdeferred.DonePipe;
import org.jdeferred.FailCallback;
import org.jdeferred.Promise;

import javax.inject.Inject;

import hugo.weaving.DebugLog;
import timber.log.Timber;

@DebugLog
public class PlaylistPlayer implements Song.EventsListener, PlaylistControls {
    private Playlist mPlaylist;
    private Song mCurrentSong;

    private boolean mIsCurrentSongLoading = false;
    private boolean mIsClosed = false;

    @Inject
    public PlaylistPlayer(Playlist playlist) {
        mPlaylist = playlist;
    }

    @Override
    public void play() {
        if (mCurrentSong != null) {
            mCurrentSong.subscribeToEvents(this);
            mCurrentSong.play();
        } else if(!mIsCurrentSongLoading) {
            playNext();
        } else {
            throw new IllegalStateException("invalid request. song already loading");
        }
    }

    @Override
    public void pause() {
        if (!mIsCurrentSongLoading || mCurrentSong == null) {
            throw new IllegalStateException("no song was loaded yet");
        }

        if (mCurrentSong != null) {
            mCurrentSong.pause();
        }
    }

    @Override
    public void playNext() {
        if (mIsCurrentSongLoading) {
            String message = String.format("invalid state. current song already loading");
            throw new IllegalStateException(message);
        }

        mIsCurrentSongLoading = true;

        if (mCurrentSong != null) {
            mCurrentSong.pause();
            mCurrentSong.close();
        }

        mPlaylist.nextSong().then(new DonePipe<Song, Song, Exception, Void>() {
            @Override
            public Promise<Song, Exception, Void> pipeDone(Song song) {
                return song.preload();
            }
        }).then(new DonePipe<Song, Song, Exception, Void>() {
            @Override
            public Promise<Song, Exception, Void> pipeDone(Song song) {
                mCurrentSong = song;
                mIsCurrentSongLoading = false;

                // We won't be playing any new music if playlistPlayer is closed
                if(!mIsClosed) {
                    PlaylistPlayer.this.play();
                }

                return mPlaylist.peekNextSong();
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
        }).always(new AlwaysCallback<Song, Exception>() {
            @Override
            public void onAlways(Promise.State state, Song resolved, Exception rejected) {
                mIsCurrentSongLoading = false;
            }
        });
    }

    void close() {
        mIsClosed = true;

        if (mCurrentSong != null) {
            mCurrentSong.close();
        }
    }

    @Override
    public void onSongFinish(Song song) {
        this.playNext();
    }

    @Override
    public void onSongError(Exception error) {
        Timber.e("error occured in song '%s': %s", mCurrentSong, error);
        // TODO: Error handling
        throw new RuntimeException("TODO");
    }
}
