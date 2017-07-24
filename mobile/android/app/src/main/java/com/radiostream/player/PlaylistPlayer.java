package com.radiostream.player;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.radiostream.networking.metadata.MetadataBackendGetter;
import com.radiostream.util.SetTimeout;

import org.jdeferred.DoneCallback;
import org.jdeferred.DonePipe;
import org.jdeferred.FailCallback;
import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;

import javax.inject.Inject;

import timber.log.Timber;

public class PlaylistPlayer implements Song.EventsListener, PlaylistControls {
    private final StatusProvider mStatusProvider;
    private SetTimeout mSetTimeout;
    private Playlist mPlaylist;
    private Song mCurrentSong;
    private MetadataBackendGetter mMetadataBackendGetter;

    private boolean mIsLoading = false;
    private Exception mLastLoadingError = null;

    private boolean mIsClosed = false;


    @Inject
    public PlaylistPlayer(Playlist playlist, SetTimeout setTimeout,
                          MetadataBackendGetter metadataBackendGetter, StatusProvider statusProvider) {

        mPlaylist = playlist;
        mStatusProvider = statusProvider;
        mSetTimeout = setTimeout;
        mMetadataBackendGetter = metadataBackendGetter;
    }

    private void setSongLoadingStatus(boolean isLoading, Exception error) {
        Timber.i("change loading to: %b and error to: %s", isLoading, error != null ? error.toString() : "NULL");
        if (isLoading != mIsLoading || mLastLoadingError != error) {
            Timber.i("value changed");
            mIsLoading = isLoading;
            mLastLoadingError = error;
            mStatusProvider.sendStatus();
        } else {
            Timber.i("value didn't change");
        }
    }

    public Song getCurrentSong() {
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
            mStatusProvider.sendStatus();
        }
    }

    @Override
    public Promise<Song, Exception, Void> play() {
        Timber.i("function start");
        if (mIsLoading) {
            Timber.i("invalid request. song already loading");
            throw new IllegalStateException("invalid request. song already loading");
        }

        Promise<Song, Exception, Void> promise;

        if (getCurrentSong() != null && mPlaylist.isCurrentSong(getCurrentSong())) {
            Timber.i("playing paused song");
            getCurrentSong().subscribeToEvents(PlaylistPlayer.this);
            getCurrentSong().play();

            mStatusProvider.sendStatus();

            promise = new DeferredObject<Song, Exception, Void>().resolve(getCurrentSong()).promise();
        } else {
            Timber.i("loading different song from playlist");
            promise = retryPreloadAndPlaySong()
                .then(new DonePipe<Song, Song, Exception, Void>() {
                    @Override
                    public Promise<Song, Exception, Void> pipeDone(Song result) {
                        return PlaylistPlayer.this.preloadPeekedSong();
                    }
                });
        }

        return promise;
    }

    @Override
    public void pause() {
        Timber.i("function start");

        if (mIsLoading || getCurrentSong() == null) {
            throw new IllegalStateException("no song was loaded yet");
        }

        getCurrentSong().pause();
        mStatusProvider.sendStatus();
    }

    public boolean getIsPlaying() {
        if (getCurrentSong() == null) {
            return false;
        } else {
            return getCurrentSong().isPlaying();
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

        // NOTE: the last error to the function is sent since merely retrying
        // the function doesn't clear the erro
        setSongLoadingStatus(true, mLastLoadingError);
        mStatusProvider.sendStatus();

        waitForCurrentSongMarkedAsPlayed().then(new DonePipe<Boolean, Song, Exception, Void>() {
            @Override
            public Promise<Song, Exception, Void> pipeDone(Boolean result) {
                return mPlaylist.peekCurrentSong();
            }
        }).then(new DonePipe<Song, Song, Exception, Void>() {
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
                    setSongLoadingStatus(false, null);

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
                setSongLoadingStatus(true, exception);
                deferredObject.resolve(null);
            }
        });

        return deferredObject.promise().then(new DonePipe<Song, Song, Exception, Void>() {
            @Override
            public Promise<Song, Exception, Void> pipeDone(Song song) {
                if (song == null) {
                    Timber.i("no song was loaded - waiting and retrying");
                    return mSetTimeout.run(10000).then(new DonePipe<Void, Song, Exception, Void>() {
                        @Override
                        public Promise<Song, Exception, Void> pipeDone(Void result) {
                            Timber.i("timeout finished - retrying");
                            return PlaylistPlayer.this.retryPreloadAndPlaySong();
                        }
                    });
                } else {
                    Timber.i("song preloaded successfully");
                    return new DeferredObject<Song, Exception, Void>().resolve(song).promise();
                }
            }
        });
    }

    private Promise<Boolean, Exception, Void> waitForCurrentSongMarkedAsPlayed() {
        Timber.i("function start");
        if (getCurrentSong() != null) {
            return getCurrentSong().waitForMarkedAsPlayed();
        } else {
            Timber.i("no current song found - not waiting");
            return new DeferredObject<Boolean, Exception, Void>().resolve(true).promise();
        }
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

        if (mPlaylist != null) {
            mPlaylist.close();
            mPlaylist = null;
        }
    }

    @Override
    public void onSongFinish(Song song) {
        Timber.i("function start");
        this.playNext();
    }

    @Override
    public void onSongMarkedAsPlayed() {
        mStatusProvider.sendStatus();
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

    public WritableMap toBridgeObject() {
        WritableMap map = Arguments.createMap();
        map.putBoolean("isLoading", mIsLoading);
        map.putBoolean("isPlaying", getIsPlaying());
        map.putMap("playlist", mPlaylist != null ? mPlaylist.toBridgeObject() : null);
        map.putString("loadingError", mLastLoadingError != null ? mLastLoadingError.getMessage() : "");

        return map;
    }

    public Promise<Void, Exception, Void> updateSongRating(int songId, final int newRating) {
        Timber.i("function start");
        final Song updatedSong = getCurrentSong();
        if (updatedSong.getId() == songId) {
            return mMetadataBackendGetter.get().updateSongRating(songId, newRating).then(new DoneCallback<Void>() {
                @Override
                public void onDone(Void result) {
                    updatedSong.setRating(newRating);

                    Timber.i("song rating updated - sending status update");
                    mStatusProvider.sendStatus();
                }
            });
        } else {
            Timber.w("tried to update id %d even though current song %s has id %d",
                songId, updatedSong.toString(), updatedSong.getId());

            return new DeferredObject<Void, Exception, Void>().reject(null);
        }
    }
}
