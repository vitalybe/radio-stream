package com.radiostream.player;

import org.jdeferred.AlwaysCallback;
import org.jdeferred.DoneCallback;
import org.jdeferred.DonePipe;
import org.jdeferred.FailCallback;
import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;

import javax.inject.Inject;

import hugo.weaving.DebugLog;
import timber.log.Timber;

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
        Timber.i("function start");
        if (mIsCurrentSongLoading) {
            Timber.i("invalid request. song already loading");
            throw new IllegalStateException("invalid request. song already loading");
        }

        if (mCurrentSong == null) {
            Timber.i("no song is available - load next one");
            playNext();
        } else {
            Timber.i("playing paused song");
            mCurrentSong.subscribeToEvents(this);
            mCurrentSong.play();
        }
    }

    @Override
    public void pause() {
        Timber.i("function start");

        if (!mIsCurrentSongLoading || mCurrentSong == null) {
            throw new IllegalStateException("no song was loaded yet");
        }

        mCurrentSong.pause();
    }

    private Promise<Song, Exception, Void> retryPreloadAndPlayNextSong() {
        Timber.i("function start");

        // Due to: https://github.com/jdeferred/jdeferred/issues/20
        // To convert a failed promise to a resolved one, we must create a new deferred object
        final DeferredObject<Song, Exception, Void> deferredObject = new DeferredObject<>();

        mPlaylist.nextSong().then(new DonePipe<Song, Song, Exception, Void>() {
            @Override
            public Promise<Song, Exception, Void> pipeDone(Song song) {
                Timber.i("preloading song: %s", song.toString());
                return song.preload();
            }
        }).then(new DoneCallback<Song>() {
            @Override
            public void onDone(Song song) {
                mCurrentSong = song;
                mIsCurrentSongLoading = false;

                // We won't be playing any new music if playlistPlayer is closed
                if (!mIsClosed) {
                    PlaylistPlayer.this.play();
                } else {
                    Timber.i("playlist player was already closed - not playing loaded song");
                }

                deferredObject.resolve(song);
            }
        }).fail(new FailCallback<Exception>() {
            @Override
            public void onFail(Exception exception) {
                Timber.e("exception occured during next song loading", exception);
                deferredObject.resolve(null);
            }
        });

        return deferredObject.promise().then(new DonePipe<Song, Song, Exception, Void>() {
            @Override
            public Promise<Song, Exception, Void> pipeDone(Song song) {
                if (song == null) {
                    Timber.i("no song was loaded - retrying");
                    return PlaylistPlayer.this.retryPreloadAndPlayNextSong();
                } else {
                    Timber.i("song preloaded successfully");
                    return new DeferredObject<Song, Exception, Void>().resolve(song).promise();
                }
            }
        });
    }

    private Promise<Song, Exception, Void> preloadPeekedSong() {
        Timber.i("function start");

        return mPlaylist.peekNextSong()
            .then(new DonePipe<Song, Song, Exception, Void>() {
                @Override
                public Promise<Song, Exception, Void> pipeDone(Song peekedSong) {
                    Timber.i("preloading peeked song: %s", peekedSong.toString());
                    return peekedSong.preload();
                }
            }).fail(new FailCallback<Exception>() {
                @Override
                public void onFail(Exception error) {
                    Timber.w("failed to preload song: %s", error.toString());
                }
            });
    }

    @Override
    public void playNext() {
        if (mIsCurrentSongLoading) {
            String message = String.format("invalid state. current song already loading");
            throw new IllegalStateException(message);
        }

        if (mCurrentSong != null) {
            mCurrentSong.pause();
            mCurrentSong.close();
        }

        Timber.i("current song loading = true");
        mIsCurrentSongLoading = true;
        retryPreloadAndPlayNextSong()
            .then(new DonePipe<Song, Song, Exception, Void>() {
                @Override
                public Promise<Song, Exception, Void> pipeDone(Song result) {
                    return PlaylistPlayer.this.preloadPeekedSong();
                }
            })
            .always(new AlwaysCallback<Song, Exception>() {
                @Override
                public void onAlways(Promise.State state, Song resolved, Exception rejected) {
                    Timber.i("current song loading = false");
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
        if (mCurrentSong != null) {
            Timber.i("pausing existing song");
            mCurrentSong.pause();
        }

        Timber.i("trying to play next song");
        playNext();
    }
}
