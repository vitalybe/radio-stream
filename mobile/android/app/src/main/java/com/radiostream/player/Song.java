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
import com.radiostream.networking.models.SongResult;

import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;

import java.io.IOException;
import java.util.Locale;

import timber.log.Timber;

public class Song {

    private final String mArtist;
    private final String mAlbum;
    private final String mTitle;

    private final String mPath;
    private Promise<Song,Exception,Void> mSongLoadingPromise = null;

    private MediaPlayer mMediaPlayer;
    private Settings mSettings;
    private EventsListener mEventsListener;

    public Song(SongResult songResult, MediaPlayer mediaPlayer, Context context, Settings settings) {
        this.mArtist = songResult.artist;
        this.mAlbum = songResult.album;
        this.mTitle = songResult.title;
        this.mPath = songResult.path;

        mMediaPlayer = mediaPlayer;
        mSettings = settings;

        // NOTE: Wake lock will only be relevant when a song is playing
        mMediaPlayer.setWakeMode(context, PowerManager.PARTIAL_WAKE_LOCK);
        mMediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);

        Timber.i("created new song: %s", this.toString());
    }

    public void subscribeToEvents(EventsListener eventsListener) {
        Timber.i("function start");
        mEventsListener = eventsListener;
    }

    public Promise<Song,Exception,Void> preload() {
        Timber.i("function start");

        if(mSongLoadingPromise == null || mSongLoadingPromise.isRejected()) {
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
        if(mMediaPlayer.isPlaying()) {
            mMediaPlayer.pause();
        }
    }

    public void close() {
        Timber.i("function start");

        pause();

        Timber.i("resetting and releasing the media player");
        mMediaPlayer.reset();
        mMediaPlayer.release();
        mMediaPlayer = null;
    }

    public boolean isPlaying() {
        if(mMediaPlayer != null) {
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

        bridge.setArtist(mArtist);
        bridge.setAlbum(mAlbum);
        bridge.setTitle(mTitle);

        return bridge;
    }

    public interface EventsListener {
        void onSongFinish(Song song);
        void onSongError(Exception error);
    }

    @Override
    public String toString() {
        return String.format("[%s - %s]", mArtist, mTitle);
    }
}
