package com.radiostream.player;

import android.accounts.NetworkErrorException;
import android.content.Context;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.PowerManager;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.radiostream.Settings;
import com.radiostream.javascript.bridge.SongBridge;
import com.radiostream.networking.MetadataBackend;
import com.radiostream.networking.models.SongResult;
import com.radiostream.util.SetTimeout;

import org.jdeferred.DoneCallback;
import org.jdeferred.DonePipe;
import org.jdeferred.FailCallback;
import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Locale;

import timber.log.Timber;

public class Song {

    public static final int markPlayedAfterMs = 30000;
    public static final int markPlayedRetryMs = 15000;

    private final String mArtist;
    private final String mAlbum;
    private final String mTitle;
    private final String mPath;
    private final int mId;
    private SetTimeout mSetTimeout;
    private MetadataBackend mMetadataBackend;
    private Promise<Song, Exception, Void> mSongLoadingPromise = null;
    private MediaPlayer mMediaPlayer;
    private Settings mSettings;
    private EventsListener mEventsListener;

    private boolean mMarkAsPlayedScheduled = false;
    private Promise<Boolean, Exception, Void> markedAsPlayedPromise = null;

    public Song(SongResult songResult, MediaPlayer mediaPlayer,
                Context context, Settings settings, SetTimeout setTimeout, MetadataBackend metadataBackend) {
        this.mArtist = songResult.artist;
        this.mAlbum = songResult.album;
        this.mTitle = songResult.title;
        this.mId = songResult.id;
        this.mSetTimeout = setTimeout;
        this.mMetadataBackend = metadataBackend;

        String pathBuilder = "";
        String[] pathParts = songResult.path.split("/");
        for (String pathPart : pathParts) {
            try {
                pathBuilder += "/" + URLEncoder.encode(pathPart, "UTF-8").replace("+", "%20");
            } catch (UnsupportedEncodingException e) {
                Timber.e(e, "failed to encode path part: %s", pathPart);
            }
        }

        this.mPath = pathBuilder.substring(1);
        mMediaPlayer = mediaPlayer;
        mSettings = settings;

        // NOTE: Wake lock will only be relevant when a song is playing
        mMediaPlayer.setWakeMode(context, PowerManager.PARTIAL_WAKE_LOCK);
        mMediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);

        Timber.i("created new song: %s", this.toString());
    }

    private void scheduleMarkAsPlayed() {
        Timber.i("markedAsPlayedPromise: %h", markedAsPlayedPromise);
        if (mMediaPlayer == null) {
            Timber.i("media player is null - song is no longer active - further scheduling cancelled");
        } else if (this.markedAsPlayedPromise != null) {
            Timber.i("mark as played already in progress");
        } else if (mMediaPlayer.getCurrentPosition() >= markPlayedAfterMs) {
            Timber.i("marking song as played since its current position %d is after %d",
                mMediaPlayer.getCurrentPosition(), markPlayedAfterMs);

            this.markedAsPlayedPromise = retryMarkAsPlayed();
        } else {
            Timber.i("this is not the time to mark as played %dms, retrying again in %dms",
                mMediaPlayer.getCurrentPosition(), markPlayedRetryMs);
            
            this.mSetTimeout.run(markPlayedRetryMs).then(new DoneCallback<Void>() {
                @Override
                public void onDone(Void result) {
                    Timber.i("retrying...");
                    scheduleMarkAsPlayed();
                }
            });
        }
    }

    public Promise<Boolean, Exception, Void> waitForMarkedAsPlayed() {
        Timber.i("function start");

        if (markedAsPlayedPromise != null) {
            Timber.i("returning existing promise");
            return markedAsPlayedPromise;
        } else {
            Timber.i("mark as played hasn't started - returning resolved promise");
            return new DeferredObject<Boolean, Exception, Void>().resolve(null).promise();
        }
    }

    private Promise<Boolean, Exception, Void> retryMarkAsPlayed() {
        final DeferredObject<Boolean, Exception, Void> deferredObject = new DeferredObject<>();
        Timber.i("function start");

        mMetadataBackend.markAsPlayed(this.mId)
            .then(new DoneCallback<Void>() {
                @Override
                public void onDone(Void result) {
                    Timber.i("marked as played successfully");
                    deferredObject.resolve(true);
                }
            })
            .fail(new FailCallback<Exception>() {
                @Override
                public void onFail(Exception result) {
                    Timber.i(result, "failed to mark as read");
                    deferredObject.resolve(false);
                }
            });

        return deferredObject.promise().then(new DonePipe<Boolean, Boolean, Exception, Void>() {
            @Override
            public Promise<Boolean, Exception, Void> pipeDone(Boolean result) {
                if (result) {
                    Timber.i("returning resolved promise");
                    return deferredObject.promise();
                } else {
                    Timber.i("retrying again after sleep");
                    return Song.this.mSetTimeout.run(markPlayedRetryMs).then(new DonePipe<Void, Boolean, Exception, Void>() {
                        @Override
                        public Promise<Boolean, Exception, Void> pipeDone(Void result) {
                            Timber.i("sleep done - trying to mark again");
                            return retryMarkAsPlayed();
                        }
                    });
                }
            }
        });
    }

    public void subscribeToEvents(EventsListener eventsListener) {
        Timber.i("function start");
        mEventsListener = eventsListener;
    }

    public Promise<Song, Exception, Void> preload() {
        Timber.i("function start");

        if (mSongLoadingPromise == null || mSongLoadingPromise.isRejected()) {
            Timber.i("creating a new promise");
            final DeferredObject<Song, Exception, Void> deferredObject = new DeferredObject<>();
            mSongLoadingPromise = deferredObject.promise();

            mMediaPlayer.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
                @Override
                public void onPrepared(MediaPlayer mp) {
                    Timber.i("setOnPreparedListener callback for song: %s", Song.this.toString());
                    deferredObject.resolve(Song.this);
                }
            });
            mMediaPlayer.setOnErrorListener(new MediaPlayer.OnErrorListener() {
                @Override
                public boolean onError(MediaPlayer mp, int what, int extra) {
                    Timber.w("setOnErrorListener callback for song: %s", Song.this.toString());

                    String errorMessage = String.format(Locale.ENGLISH,
                        "MediaPlayer failed to preload song: %d/%d", what, extra);
                    deferredObject.reject(new NetworkErrorException(errorMessage));

                    return true;
                }
            });

            String url = mSettings.getAddress() + "music/" + this.mPath;
            Timber.i("loading song from url: %s", url);
            try {
                mMediaPlayer.setDataSource(url);
                mMediaPlayer.prepareAsync();
            } catch (IOException e) {
                deferredObject.reject(new NetworkErrorException("Failed to set data source", e));
            }
        } else {
            Timber.i("preload for this song already started. returning existing promise");
        }

        return mSongLoadingPromise;
    }


    public void play() {
        Timber.i("function start");

        if (!mMarkAsPlayedScheduled) {
            Timber.i("this is the first play - schedule song to be marked as played");
            mMarkAsPlayedScheduled = true;
            scheduleMarkAsPlayed();
        }

        mMediaPlayer.setOnErrorListener(new MediaPlayer.OnErrorListener() {
            @Override
            public boolean onError(MediaPlayer mp, int what, int extra) {
                Timber.e("song error - %d, %d", what, extra);
                String errorMessage = String.format(Locale.ENGLISH, "Exception during playblack: %d/%d", what, extra);
                mEventsListener.onSongError(new Exception(errorMessage));

                return true;
            }
        });

        mMediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
            @Override
            public void onCompletion(MediaPlayer mp) {
                mEventsListener.onSongFinish(Song.this);
            }
        });

        Timber.i("starting song...");
        mMediaPlayer.start();
    }

    public void pause() {
        if (mMediaPlayer.isPlaying()) {
            mMediaPlayer.pause();
        }
    }

    public void close() {
        Timber.i("function start: %s", this.toString());

        pause();

        Timber.i("resetting and releasing the media player");
        mMediaPlayer.reset();
        mMediaPlayer.release();
        mMediaPlayer = null;
    }

    public boolean isPlaying() {
        if (mMediaPlayer != null) {
            return mMediaPlayer.isPlaying();
        } else {
            // if released
            return false;
        }
    }


    public String getTitle() {
        return mTitle;
    }

    public SongBridge toBridgeObject() {
        SongBridge bridge = new SongBridge();

        bridge.artist = mArtist;
        bridge.album = mAlbum;
        bridge.title = mTitle;

        return bridge;
    }

    @Override
    public String toString() {
        return String.format("[%s - %s]", mArtist, mTitle);
    }

    public String getArtist() {
        return mArtist;
    }

    public interface EventsListener {
        void onSongFinish(Song song);

        void onSongError(Exception error);
    }
}
