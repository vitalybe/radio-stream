package com.radiostream.player;

import com.radiostream.javascript.bridge.PlayerEventsEmitter;
import com.radiostream.javascript.bridge.PlaylistPlayerBridge;

import org.jdeferred.AlwaysCallback;
import org.jdeferred.DoneCallback;
import org.jdeferred.DonePipe;
import org.jdeferred.FailCallback;
import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;

import javax.inject.Inject;

import timber.log.Timber;

public class PlaylistPlayer implements Song.EventsListener, PlaylistControls {
    private PlayerEventsEmitter mPlayerEventsEmitter;
    private Playlist mPlaylist;
    private Song mCurrentSong;

    private boolean mIsCurrentSongLoading = false;
    private boolean mIsClosed = false;

    @Inject
    public PlaylistPlayer(Playlist playlist, PlayerEventsEmitter playerEventsEmitter) {

        mPlaylist = playlist;
        mPlayerEventsEmitter = playerEventsEmitter;
    }

    private boolean getIsCurrentSongLoading() {
        return mIsCurrentSongLoading;
    }

    private void setIsCurrentSongLoading(boolean value) {
        Timber.i("change loading to: %b", value);
        if (value != mIsCurrentSongLoading) {
            Timber.i("value changed");
            mIsCurrentSongLoading = value;
            mPlayerEventsEmitter.sendPlayerStatus(this.toBridgeObject());
        } else {
            Timber.i("value didn't change");
        }
    }

    private Song getCurrentSong() {
        return mCurrentSong;
    }

    private void setCurrentSong(Song value) {
        if (value != getCurrentSong()) {
            if (getCurrentSong() != null) {
                getCurrentSong().pause();
                getCurrentSong().close();
            }

            Timber.i("changing current song to: %s", value.toString());
            mCurrentSong = value;
            mPlayerEventsEmitter.sendPlayerStatus(this.toBridgeObject());
        }
    }

    @Override
    public Promise<Song, Exception, Void> play() {
        Timber.i("function start");
        if (getIsCurrentSongLoading()) {
            Timber.i("invalid request. song already loading");
            throw new IllegalStateException("invalid request. song already loading");
        }

        return mPlaylist.peekCurrentSong().then(new DonePipe<Song, Song, Exception, Void>() {
            @Override
            public Promise<Song, Exception, Void> pipeDone(Song playlistCurrentSong) {
                try {
                    Promise<Song, Exception, Void> promise;

                    if (getCurrentSong() == null || getCurrentSong() != playlistCurrentSong) {
                        Timber.i("loading different song from playlist: %s", playlistCurrentSong.toString());
                        promise = retryPreloadAndPlaySong()
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
                                    setIsCurrentSongLoading(false);
                                }
                            });
                    } else {
                        Timber.i("playing paused song");
                        getCurrentSong().subscribeToEvents(PlaylistPlayer.this);
                        getCurrentSong().play();

                        mPlayerEventsEmitter.sendPlayerStatus(PlaylistPlayer.this.toBridgeObject());

                        promise = new DeferredObject<Song, Exception, Void>().resolve(getCurrentSong()).promise();
                    }

                    return promise;
                } catch (Exception e) {
                    return new DeferredObject<Song, Exception, Void>().reject(e).promise();
                }
            }
        });
    }

    @Override
    public void pause() {
        Timber.i("function start");

        if (getIsCurrentSongLoading() || getCurrentSong() == null) {
            throw new IllegalStateException("no song was loaded yet");
        }

        getCurrentSong().pause();
        mPlayerEventsEmitter.sendPlayerStatus(this.toBridgeObject());
    }

    private boolean getIsPlaying() {
        if (getCurrentSong() == null) {
            return false;
        } else {
            return getCurrentSong().isPlaying();
        }
    }

    @Override
    public void playPause() {
        if (getIsCurrentSongLoading()) {
            throw new IllegalStateException("no song was loaded yet");
        }

        if (this.getIsPlaying()) {
            this.pause();
        } else {
            this.play();
        }
    }

    @Override
    public void playNext() {
        Timber.i("function start");
        this.mPlaylist.nextSong();
        this.play();
    }

    private Promise<Song, Exception, Void> retryPreloadAndPlaySong() {
        Timber.i("function start");

        // Due to: https://github.com/jdeferred/jdeferred/issues/20
        // To convert a failed promise to a resolved one, we must create a new deferred object
        final DeferredObject<Song, Exception, Void> deferredObject = new DeferredObject<>();

        setIsCurrentSongLoading(true);

        mPlaylist.peekCurrentSong().then(new DonePipe<Song, Song, Exception, Void>() {
            @Override
            public Promise<Song, Exception, Void> pipeDone(Song song) {
                try {
                    Timber.i("preloading song: %s", song.toString());
                    setCurrentSong(song);
                    return song.preload();
                } catch (Exception e) {
                    return new DeferredObject<Song, Exception, Void>().reject(e).promise();
                }
            }
        }).then(new DonePipe<Song, Song, Exception, Void>() {
            @Override
            public Promise<Song, Exception, Void> pipeDone(Song song) {
                try {
                    setIsCurrentSongLoading(false);

                    // We won't be playing any new music if playlistPlayer is closed
                    if (!mIsClosed) {
                        PlaylistPlayer.this.play();
                    } else {
                        Timber.i("playlist player was already closed - not playing loaded song");
                    }

                    deferredObject.resolve(song);

                    return deferredObject.promise();
                } catch (Exception e) {
                    return new DeferredObject<Song, Exception, Void>().reject(e).promise();
                }
            }
        }).fail(new FailCallback<Exception>() {
            @Override
            public void onFail(Exception exception) {
                Timber.e(exception, "exception occured during next song loading");
                deferredObject.resolve(null);
            }
        });

        return deferredObject.promise().then(new DonePipe<Song, Song, Exception, Void>() {
            @Override
            public Promise<Song, Exception, Void> pipeDone(Song song) {
                if (song == null) {
                    Timber.i("no song was loaded - retrying");
                    return PlaylistPlayer.this.retryPreloadAndPlaySong();
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

    void close() {
        Timber.i("function start");
        mIsClosed = true;

        if (getCurrentSong() != null) {
            Timber.i("closing current song");
            getCurrentSong().close();
        }
    }

    @Override
    public void onSongFinish(Song song) {
        Timber.i("function start");
        this.playNext();
    }

    @Override
    public void onSongError(Exception error) {
        Timber.e(error, "error occured in song '%s'", getCurrentSong());
        if (getCurrentSong() != null) {
            Timber.i("pausing existing song");
            getCurrentSong().pause();
        }

        Timber.i("trying to play next song");
        play();
    }

    public PlaylistPlayerBridge toBridgeObject() {
        PlaylistPlayerBridge bridge = new PlaylistPlayerBridge();
        bridge.setIsLoading(getIsCurrentSongLoading());
        bridge.setIsPlaying(getIsPlaying());
        bridge.setPlaylist(mPlaylist.toBridgeObject());

        if (getCurrentSong() != null) {
            bridge.setSong(mCurrentSong.toBridgeObject());
        }

        return bridge;
    }
}
