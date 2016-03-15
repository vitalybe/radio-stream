package com.vitalyb.android_music_stream;

import android.app.Service;
import android.content.Intent;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Binder;
import android.os.IBinder;
import android.os.PowerManager;
import android.support.annotation.Nullable;

import com.vitalyb.android_music_stream.backend.MusicBackend;
import com.vitalyb.android_music_stream.backend.MusicBackendImpl;

import java.io.IOException;
import java.util.List;

/**
 * Created by vitaly on 14/03/2016.
 */
public class MusicService extends Service implements MediaPlayer.OnCompletionListener,
        MediaPlayer.OnErrorListener, MediaPlayer.OnPreparedListener {

    public interface OnMusicEventsListener {
        void OnSongPreloading(SongModel song);
        void OnSongPlaying(SongModel song);
        void OnSongPaused(SongModel song);
    }

    private final MusicServiceBinder mBinder = new MusicServiceBinder();
    private MediaPlayer mPlayer;
    private MusicBackend mBackend;

    private List<SongModel> mSongs;
    private int mSongNumber = 0;
    private OnMusicEventsListener mEventListener = null;

    @Override
    public void onCreate() {
        super.onCreate();

        mBackend = new MusicBackendImpl(this);
        mPlayer = new MediaPlayer();
        initMusicPlayer();
    }

    void initMusicPlayer() {
        mPlayer.setWakeMode(getApplicationContext(), PowerManager.PARTIAL_WAKE_LOCK);
        mPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);

        mPlayer.setOnPreparedListener(this);
        mPlayer.setOnCompletionListener(this);
        mPlayer.setOnErrorListener(this);
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return mBinder;
    }

    @Override
    public boolean onUnbind(Intent intent) {
        mPlayer.stop();
        mPlayer.release();

        return false;
    }

    public void subscribeToEvents(OnMusicEventsListener listener) {
        mEventListener = listener;
    }

    public void unsubscribeToEvents() {
        mEventListener = null;
    }

    public void playPlaylist(String name) {
        mSongNumber = -1;

        mBackend.FetchPlaylistSongs(name, new MusicBackend.OnResultListener<List<SongModel>>() {
            @Override
            public void OnResult(List<SongModel> result) {
                mSongs = result;
                playNextSong();
            }
        });
    }

    public void togglePlayPause() {
        if(mPlayer.isPlaying()) {
            mPlayer.pause();
            if(mEventListener != null) {
                mEventListener.OnSongPaused(getCurrentSong());
            }
        } else {
            mPlayer.start();
            if(mEventListener != null) {
                mEventListener.OnSongPlaying(getCurrentSong());
            }
        }
    }

    public void skipToNextSong() {
        mBackend.MarkAsPlayed(getCurrentSong());
        playNextSong();
    }


    private SongModel getCurrentSong() {
        return mSongs.get(mSongNumber);
    }

    private void playNextSong() {
        try {
            mSongNumber++;

            mPlayer.reset();
            String url = getCurrentSong().getUrl();
            mPlayer.setDataSource(url);
            mPlayer.prepareAsync();

            if(mEventListener != null) {
                mEventListener.OnSongPreloading(getCurrentSong());
            }

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void onPrepared(MediaPlayer mp) {
        if(mEventListener != null) {
            mEventListener.OnSongPlaying(getCurrentSong());
        }

        mp.start();
    }

    @Override
    public void onCompletion(MediaPlayer mp) {
        mBackend.MarkAsPlayed(getCurrentSong());
        playNextSong();
    }

    @Override
    public boolean onError(MediaPlayer mp, int what, int extra) {
        return false;
    }

    public class MusicServiceBinder extends Binder {
        public MusicService getService() {
            return MusicService.this;
        }
    }
}
