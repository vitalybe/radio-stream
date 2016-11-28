package com.radiostream.player;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
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
        if (value != mIsCurrentSongLoading) {
            Timber.i("changing loading to: %b", value);
            mIsCurrentSongLoading = value;
            mPlayerEventsEmitter.sendPlayerStatus(this.toBridgeObject());
        }
    }

    private Song getCurrentSong() {
        return mCurrentSong;
    }

    private void setCurrentSong(Song value) {
        if (value != mCurrentSong) {
            Timber.i("changing current song to: %s", value.toString());
            mCurrentSong = value;
            mPlayerEventsEmitter.sendPlayerStatus(this.toBridgeObject());
        }
    }

    @Override
    public void play() {
        Timber.i("function start");
        if (getIsCurrentSongLoading()) {
            Timber.i("invalid request. song already loading");
            throw new IllegalStateException("invalid request. song already loading");
        }

        if (getCurrentSong() == null) {
            Timber.i("no song is available - load next one");
            playNext();
        } else {
            Timber.i("playing paused song");
            getCurrentSong().subscribeToEvents(this);
            getCurrentSong().play();

                mPlayerEventsEmitter.sendPlayerStatus(this.toBridgeObject());
        }
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

    private Promise<Song, Exception, Void> retryPreloadAndPlayNextSong() {
        Timber.i("function start");

        // Due to: https://github.com/jdeferred/jdeferred/issues/20
        // To convert a failed promise to a resolved one, we must create a new deferred object
        final DeferredObject<Song, Exception, Void> deferredObject = new DeferredObject<>();

        if (getCurrentSong() != null) {
            getCurrentSong().pause();
            getCurrentSong().close();
        }

        setIsCurrentSongLoading(true);
        mPlaylist.nextSong().then(new DonePipe<Song, Song, Exception, Void>() {
            @Override
            public Promise<Song, Exception, Void> pipeDone(Song song) {
                Timber.i("preloading song: %s", song.toString());
                setCurrentSong(song);
                return song.preload();
            }
        }).then(new DoneCallback<Song>() {
            @Override
            public void onDone(Song song) {
                setIsCurrentSongLoading(false);

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
                Timber.e(exception, "exception occured during next song loading");
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
        if (getIsCurrentSongLoading()) {
            String message = String.format("invalid state. current song already loading");
            throw new IllegalStateException(message);
        }

        Timber.i("current song loading = true");
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
                    setIsCurrentSongLoading(false);
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
        playNext();
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
