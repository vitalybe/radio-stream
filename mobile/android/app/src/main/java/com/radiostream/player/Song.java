package com.radiostream.player;

import android.accounts.NetworkErrorException;
import android.content.Context;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.PowerManager;

import com.radiostream.Settings;
import com.radiostream.networking.models.SongResult;

import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;

import java.io.IOException;
import java.util.Locale;

import hugo.weaving.DebugLog;
import timber.log.Timber;

@DebugLog
public class Song {

    private final Object mArtist;
    private final String mTitle;
    private final String mPath;

    private MediaPlayer mMediaPlayer;
    private Settings mSettings;
    private EventsListener mEventsListener;

    public Song(SongResult songResult, MediaPlayer mediaPlayer, Context context, Settings settings) {
        this.mArtist = songResult.artist;
        this.mTitle = songResult.title;
        this.mPath = songResult.path;

        mMediaPlayer = mediaPlayer;
        mSettings = settings;

        // NOTE: Wake lock will only be relevant when a song is playing
        mMediaPlayer.setWakeMode(context, PowerManager.PARTIAL_WAKE_LOCK);
        mMediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);
    }

    public void subscribeToEvents(EventsListener eventsListener) {
        mEventsListener = eventsListener;
    }
    public Promise<Song,Exception,Void> preload() {
        final DeferredObject<Song,Exception,Void> deferredObject = new DeferredObject<>();

        mMediaPlayer.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
            @Override
            public void onPrepared(MediaPlayer mp) {
                deferredObject.resolve(Song.this);
            }
        });

        mMediaPlayer.setOnErrorListener(new MediaPlayer.OnErrorListener() {
            @Override
            public boolean onError(MediaPlayer mp, int what, int extra) {
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
        } catch (IOException e) {
            deferredObject.reject(new NetworkErrorException("Failed to set data source", e));
        }
        mMediaPlayer.prepareAsync();
        return deferredObject.promise();
    }


    public void play() {
        mMediaPlayer.setOnErrorListener(new MediaPlayer.OnErrorListener() {
            @Override
            public boolean onError(MediaPlayer mp, int what, int extra) {
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

        mMediaPlayer.start();
    }

    public void pause() {
        mMediaPlayer.pause();
    }

    public void close() {
        mMediaPlayer.pause();
        mMediaPlayer.release();
        mMediaPlayer = null;
    }


    public String getTitle() {
        return mTitle;
    }

    public interface EventsListener {
        void onSongFinish(Song song);
        void onSongError(Exception error);
    }
}
