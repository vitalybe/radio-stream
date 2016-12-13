package com.radiostream.player;

import android.app.PendingIntent;
import android.app.Service;
import android.bluetooth.BluetoothClass;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Binder;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.support.v7.app.NotificationCompat;

import com.radiostream.MainActivity;
import com.radiostream.R;
import com.radiostream.di.components.DaggerPlayerServiceComponent;
import com.radiostream.di.components.PlayerServiceComponent;
import com.radiostream.di.modules.ContextModule;
import com.radiostream.javascript.bridge.PlayerBridge;
import com.radiostream.javascript.bridge.PlaylistPlayerBridge;
import com.radiostream.javascript.bridge.PlaylistPlayerEventsEmitter;
import com.radiostream.javascript.bridge.SongBridge;
import com.radiostream.javascript.proxy.PlayerJsProxy;
import com.radiostream.util.SetTimeout;

import org.jdeferred.DoneCallback;
import org.jdeferred.Promise;

import java.util.Date;
import java.util.Objects;

import javax.inject.Inject;

import hugo.weaving.DebugLog;
import timber.log.Timber;


@DebugLog
public class PlayerService extends Service implements PlaylistControls {

    private final int mStopPausedServiceAfterMs = 10 * 60 * 1000;
    private final int mStopPausedServiceRetryAfterMs = 30 * 1000;
    private final int mNotificationId = 1;
    private final String mParamExit = "mParamExit";
    private final PlayerServiceBinder mBinder = new PlayerServiceBinder();
    @Inject
    Player mPlayer;
    @Inject
    PlaylistPlayerEventsEmitter mPlaylistPlayerEventsEmitter;
    @Inject
    SetTimeout mSetTimeout;
    private boolean mServiceAlive = true;
    private Date mPausedDate = null;


    private BroadcastReceiver mReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            Timber.i("function start");
            if(intent.getAction().equals(BluetoothDevice.ACTION_ACL_DISCONNECTED)) {
                Timber.i("bluetooth disconnected");
                BluetoothDevice btDevice = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                if (btDevice.getBluetoothClass().getMajorDeviceClass() == BluetoothClass.Device.Major.AUDIO_VIDEO) {
                    Timber.i("pausing music due to bluetooth disconnection");
                    mPlayer.pause();
                }
            }
        }
    };

    private PlaylistPlayerEventsEmitter.EventCallback onPlaylistPlayerEvent = new PlaylistPlayerEventsEmitter.EventCallback() {
        @Override
        public void onEvent(PlaylistPlayerBridge playlistPlayerBridge) {
            Timber.i("onPlaylistPlayerEvent - function start");

            if (playlistPlayerBridge != null) {
                if (playlistPlayerBridge.isLoading) {
                    Timber.i("showing loading notification");
                    showLoadingNotification();
                } else if (playlistPlayerBridge.isPlaying) {
                    Timber.i("showing song notification");
                    showSongNotification(playlistPlayerBridge.songBridge);
                }
            }
        }
    };

    private void showSongNotification(SongBridge currentSong) {
        Timber.i("function start - show song notification for: %s - %s", currentSong.title, currentSong.artist);
        startWithNotificaiton(currentSong.title, currentSong.artist, true);
    }

    private void showLoadingNotification() {
        Timber.i("function start - show loading notification");
        startWithNotificaiton("Radio Stream", "Loading...", false);
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Timber.i("function start");

        PlayerServiceComponent component = DaggerPlayerServiceComponent.builder()
            .jsProxyComponent(PlayerJsProxy.JsProxyComponent())
            .contextModule(new ContextModule(this))
            .build();

        component.inject(this);

        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(BluetoothDevice.ACTION_ACL_DISCONNECTED);
        registerReceiver(mReceiver, intentFilter);

        mPlaylistPlayerEventsEmitter.subscribe(onPlaylistPlayerEvent);
        scheduleStopSelfOnPause();
    }

    private void scheduleStopSelfOnPause() {
        Timber.i("function start");

        // We're retrying even after stopping a service because a stopped service might still be bound to activity
        if (mServiceAlive) {
            if (mPausedDate != null) {
                final long currentTime = new Date().getTime();
                final long timePaused = currentTime - mPausedDate.getTime();
                Timber.i("time in paused state: %dms out of %dms", timePaused, mStopPausedServiceAfterMs);

                if (mPausedDate != null && timePaused > mStopPausedServiceAfterMs) {
                    Timber.i("stopping service");
                    mPausedDate = null;
                    stop();
                } else {
                    Timber.i("not enough time has passed in paused mode");
                }
            } else {
                Timber.i("currently not paused");
            }

            Timber.i("sleeping and retrying in %dms...", mStopPausedServiceRetryAfterMs);
            mSetTimeout.run(mStopPausedServiceRetryAfterMs).then(new DoneCallback<Void>() {
                @Override
                public void onDone(Void result) {
                    scheduleStopSelfOnPause();
                }
            });
        } else {
            Timber.i("service is dead - will not retry again");
        }
    }

    private void startWithNotificaiton(String title, String contentText, boolean isHeadsUp) {
        Timber.i("function start");

        // Open main UI activity
        Intent activityIntent = new Intent(getApplication().getApplicationContext(), MainActivity.class);
        PendingIntent activityPendingIntent = PendingIntent.getActivity(this, 0, activityIntent, PendingIntent.FLAG_UPDATE_CURRENT);

        // Stop intent
        Intent stopIntent = new Intent(this, PlayerService.class);
        stopIntent.putExtra(mParamExit, true);
        PendingIntent stopPendingIntent = PendingIntent.getService(this, 0, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(getApplication().getApplicationContext());
        mBuilder.setSmallIcon(R.drawable.image_note)
            .setContentTitle(title)
            .setContentText(contentText)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setContentIntent(activityPendingIntent);

        if (isHeadsUp) {
            mBuilder.setVibrate(new long[0]);
        }

        this.startService(new Intent(this, PlayerService.class));
        startForeground(mNotificationId, mBuilder.build());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            boolean toExit = intent.getBooleanExtra(mParamExit, false);
            if (toExit) {
                stopForeground(true);
                stopSelf();
            }
        }

        return super.onStartCommand(intent, flags, startId);
    }

    @Override
    public void onDestroy() {
        Timber.i("function start");

        mPlayer.close();
        mPlayer = null;
        unregisterReceiver(mReceiver);

        mServiceAlive = false;
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

    @Override
    public Promise<Song, Exception, Void> play() {
        mPausedDate = null;
        Timber.i("player unpaused");
        return this.mPlayer.play();
    }

    @Override
    public void pause() {
        mPausedDate = new Date();
        Timber.i("player paused on: %s", mPausedDate);
        this.mPlayer.pause();
    }

    @Override
    public void playNext() {
        this.mPlayer.playNext();
    }

    public void changePlaylist(String playlistName) {
        this.mPlayer.changePlaylist(playlistName);
    }

    public PlayerBridge getPlayerBridgeObject() {
        return mPlayer.toBridgeObject();
    }

    public void stop() {
        Timber.i("function start");
        stopSelf();
        stopForeground(true);
    }

    public class PlayerServiceBinder extends Binder {
        public PlayerService getService() {
            return PlayerService.this;
        }
    }
}
