package com.radiostream.player;

import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Binder;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.support.v7.app.NotificationCompat;

import com.radiostream.MainActivity;
import com.radiostream.R;
import com.radiostream.di.components.DaggerPlayerServiceComponent;
import com.radiostream.di.components.PlayerServiceComponent;
import com.radiostream.di.modules.ContextModule;
import com.radiostream.javascript.bridge.PlaylistPlayerBridge;
import com.radiostream.javascript.bridge.PlaylistPlayerEventsEmitter;
import com.radiostream.javascript.bridge.SongBridge;
import com.radiostream.javascript.proxy.PlayerJsProxy;
import com.radiostream.util.SetTimeout;

import org.jdeferred.DoneCallback;

import java.util.Date;

import javax.inject.Inject;

import hugo.weaving.DebugLog;
import timber.log.Timber;


@DebugLog
public class PlayerService extends Service {

    private boolean mServiceAlive = true;

    private final int mStopPausedServiceAfterMs = 5 * 1000;
    private final int mStopPausedServiceRetryAfterMs = 5 * 1000;

    private final int mNotificationId = 1;
    private final String mParamExit = "mParamExit";

    private final PlayerServiceBinder mBinder = new PlayerServiceBinder();
    @Inject
    Player mPlayer;
    @Inject
    PlaylistPlayerEventsEmitter mPlaylistPlayerEventsEmitter;
    @Inject
    SetTimeout mSetTimeout;


    private Date mPausedDate = null;
    private PlaylistPlayerEventsEmitter.EventCallback onPlaylistPlayerEvent = new PlaylistPlayerEventsEmitter.EventCallback() {
        @Override
        public void onEvent(PlaylistPlayerBridge playlistPlayerBridge) {
            Timber.i("onPlaylistPlayerEvent - function start");

            if (playlistPlayerBridge != null) {
                if (playlistPlayerBridge.isLoading) {
                    showLoadingNotification();
                } else if (playlistPlayerBridge.isPlaying) {
                    showSongNotification(playlistPlayerBridge.songBridge);
                }

                if (playlistPlayerBridge.isPlaying || playlistPlayerBridge.isLoading) {
                    mPausedDate = null;
                    Timber.i("player unpaused");
                } else if (mPausedDate == null) {
                    mPausedDate = new Date();
                    Timber.i("player paused on: %s", mPausedDate);
                }
            }
        }
    };

    private void stopService() {
        Timber.i("function start");
        stopSelf();
        stopForeground(true);
    }

    private void showSongNotification(SongBridge currentSong) {
        Timber.i("function start - show song notification for: %s - %s", currentSong.title, currentSong.artist);
        showServiceNotification(currentSong.title, currentSong.artist, true);
    }

    private void showLoadingNotification() {
        Timber.i("function start - show loading notification");
        showServiceNotification("Radio Stream", "Loading...", false);
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

        Timber.i("player: %h", this.mPlayer);
        mPlaylistPlayerEventsEmitter.subscribe(onPlaylistPlayerEvent);
        scheduleStopSelfOnPause();
    }

    private void scheduleStopSelfOnPause() {
        Timber.i("function start");

        if (mPausedDate != null) {
            final long currentTime = new Date().getTime();
            final long timePaused = currentTime - mPausedDate.getTime();
            Timber.i("time in paused state: %dms out of %dms", timePaused, mStopPausedServiceAfterMs);

            if (mPausedDate != null && timePaused > mStopPausedServiceAfterMs) {
                Timber.i("stopping service");
                mPausedDate = null;
                stopService();
            } else {
                Timber.i("not enough time has passed in paused mode");
            }
        } else {
            Timber.i("currently not paused");
        }

        // We're retrying even after stopping a service because a stopped service might still be bound to activity
        if(mServiceAlive) {
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

    private void showServiceNotification(String title, String contentText, boolean isHeadsUp) {
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
            .setContentIntent(activityPendingIntent)
            .addAction(R.drawable.image_stop, "Stop", stopPendingIntent);

        if (isHeadsUp) {
            mBuilder.setVibrate(new long[0]);
        }

        this.startService(new Intent(this, PlayerService.class));
        startForeground(mNotificationId, mBuilder.build());
    }

    public Player getPlayer() {
        return mPlayer;
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

        super.onDestroy();
        mPlayer.close();
        mPlayer = null;

        mServiceAlive = false;
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

    public class PlayerServiceBinder extends Binder {
        public PlayerService getService() {
            return PlayerService.this;
        }
    }
}
