package com.vitalyb.android_music_stream;

import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Binder;
import android.os.IBinder;
import android.os.PowerManager;
import android.support.annotation.Nullable;
import android.support.v4.content.LocalBroadcastManager;
import android.support.v7.app.NotificationCompat;

import com.vitalyb.android_music_stream.backend.MusicBackend;
import com.vitalyb.android_music_stream.backend.MusicBackendImpl;

import java.io.IOException;
import java.util.List;

/**
 * Created by vitaly on 14/03/2016.
 */
public class MusicService extends Service implements MediaPlayer.OnCompletionListener,
        MediaPlayer.OnErrorListener, MediaPlayer.OnPreparedListener {

    private final Logger mLogger = Logger.getLogger();
    private String mPlaylistName;

    public void forceInfoUpdate() {
        updateActivityInfo();
    }

    public interface OnMusicEventsListener {
        void OnMusicStateChanged(boolean isPreparing, boolean isPlaying, SongModel song);
    }

    private final MusicServiceBinder mBinder = new MusicServiceBinder();
    private MediaPlayer mPlayer;
    private MusicBackend mBackend;

    private List<SongModel> mSongs;
    private int mSongNumber = 0;
    private OnMusicEventsListener mEventListener = null;
    private boolean mIsPreparing = true;

    private final int NOTIFICATION_ID = 1;
    private final String PARAM_EXIT = "PARAM_EXIT";

    @Override
    public void onCreate() {
        super.onCreate();

        mBackend = new MusicBackendImpl(this);
        mPlayer = new MediaPlayer();
        initMusicPlayer();
        showServiceNotification("Music Stream", "Loading...");
    }

    private void showServiceNotification(String title, String contentText) {

        // Open main UI activity
        Intent activityIntent = new Intent(getApplication().getApplicationContext(), MainActivity.class);
        PendingIntent activityPendingIntent = PendingIntent.getActivity(this, 0, activityIntent, PendingIntent.FLAG_UPDATE_CURRENT);

        // Stop intent
        Intent stopIntent = new Intent(this, MusicService.class);
        stopIntent.putExtra(PARAM_EXIT, true);
        PendingIntent stopPendingIntent = PendingIntent.getService(this, 0, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(getApplication().getApplicationContext());
        mBuilder.setSmallIcon(R.drawable.image_note)
                .setContentTitle(title)
                .setContentText(contentText)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setContentIntent(activityPendingIntent)
                .addAction(R.drawable.image_stop, "Stop", stopPendingIntent);

        startForeground(NOTIFICATION_ID, mBuilder.build());
    }

    void initMusicPlayer() {
        mPlayer.setWakeMode(getApplicationContext(), PowerManager.PARTIAL_WAKE_LOCK);
        mPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);

        mPlayer.setOnPreparedListener(this);
        mPlayer.setOnCompletionListener(this);
        mPlayer.setOnErrorListener(this);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        mLogger.i("Function start");
        if(intent != null) {
            boolean toExit = intent.getBooleanExtra(PARAM_EXIT, false);
            mLogger.i("ToExit: " + toExit);
            if (toExit) {
                LocalBroadcastManager.getInstance(this).sendBroadcast(new Intent(MainActivity.ACTION_STOP_MUSIC_ACTIVITY));
                stopForeground(true);
                stopSelf();

                mLogger.i("Stopping service");
            }
        }

        return super.onStartCommand(intent, flags, startId);
    }

    @Override
    public void onDestroy() {
        mLogger.i("Function start");
        mPlayer.stop();
        mPlayer.release();

        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return mBinder;
    }

    @Override
    public boolean onUnbind(Intent intent) {
        return false;
    }

    public void subscribeToEvents(OnMusicEventsListener listener) {
        mEventListener = listener;
    }

    public void unsubscribeToEvents() {
        mEventListener = null;
    }

    public void playPlaylist(String name) {
        mLogger.i("Function start: " + name);
        mPlaylistName = name;
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
        mLogger.i("Function start");
        if(mPlayer.isPlaying()) {
            mPlayer.pause();
        } else {
            mPlayer.start();
        }

        updateActivityInfo();
    }

    public void skipToNextSong() {
        mLogger.i("Function start");
        mBackend.MarkAsPlayed(getCurrentSong());
        playNextSong();
    }

    public SongModel getCurrentSong() {
        if(mSongs != null) {
            return mSongs.get(mSongNumber);
        } else {
            return null;
        }
    }

    private void playNextSong() {
        mLogger.i("Function start");
        try {
            mSongNumber++;

            mPlayer.reset();
            String url = getCurrentSong().getUrl();
            mPlayer.setDataSource(url);
            mPlayer.prepareAsync();
            mIsPreparing = true;

            updateActivityInfo();

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void updateActivityInfo() {
        if(mEventListener != null) {
            mEventListener.OnMusicStateChanged(mIsPreparing, mPlayer.isPlaying(), getCurrentSong());
        }
    }

    @Override
    public void onPrepared(MediaPlayer mp) {
        mLogger.i("Function start");
        mIsPreparing = false;

        SongModel currentSong = getCurrentSong();
        showServiceNotification(currentSong.getName(), currentSong.getArtist());
        mp.start();

        updateActivityInfo();
    }

    @Override
    public void onCompletion(MediaPlayer mp) {
        mLogger.i("Function start");
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

    public String getPlaylistName() {
        return mPlaylistName;
    }


}
