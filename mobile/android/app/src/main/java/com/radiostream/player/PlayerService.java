package com.radiostream.player;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
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
import com.radiostream.javascript.proxy.PlayerJsProxy;

import javax.inject.Inject;

import hugo.weaving.DebugLog;
import timber.log.Timber;


@DebugLog
public class PlayerService extends Service {

    private final int NOTIFICATION_ID = 1;

    private final PlayerServiceBinder mBinder = new PlayerServiceBinder();
    private final String PARAM_EXIT = "PARAM_EXIT";

    @Inject
    Player mPlayer;

    @Inject
    PlaylistPlayerEventsEmitter mPlaylistPlayerEventsEmitter;
    private PlaylistPlayerEventsEmitter.EventCallback onPlaylistPlayerEvent = new PlaylistPlayerEventsEmitter.EventCallback() {
        @Override
        public void onEvent(PlaylistPlayer playlistPlayer) {
            Timber.i("function start");

            if (playlistPlayer != null && playlistPlayer.getCurrentSong() != null) {
                Timber.i("showing notification for event");

                final Song currentSong = playlistPlayer.getCurrentSong();
                PlayerService.this.showServiceNotification(currentSong.getTitle(), currentSong.getArtist());
            }
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        Timber.i("function start");

        // showServiceNotification("Radio Stream", "Loading...");

        PlayerServiceComponent component = DaggerPlayerServiceComponent.builder()
            .jsProxyComponent(PlayerJsProxy.JsProxyComponent())
            .contextModule(new ContextModule(this))
            .build();

        component.inject(this);
        mPlaylistPlayerEventsEmitter.subscribe(onPlaylistPlayerEvent);
    }

    private void showServiceNotification(String title, String contentText) {
        Timber.i("function start");

        // Open main UI activity
        Intent activityIntent = new Intent(getApplication().getApplicationContext(), MainActivity.class);
        PendingIntent activityPendingIntent = PendingIntent.getActivity(this, 0, activityIntent, PendingIntent.FLAG_UPDATE_CURRENT);

        // Stop intent
        Intent stopIntent = new Intent(this, PlayerService.class);
        stopIntent.putExtra(PARAM_EXIT, true);
        PendingIntent stopPendingIntent = PendingIntent.getService(this, 0, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(getApplication().getApplicationContext());
        mBuilder.setSmallIcon(R.drawable.image_note)
            .setContentTitle(title)
            .setContentText(contentText)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setContentIntent(activityPendingIntent)
            .setVibrate(new long[0]) // required for heads-up notification
            .addAction(R.drawable.image_stop, "Stop", stopPendingIntent);

        startForeground(NOTIFICATION_ID, mBuilder.build());
    }

    public Player getPlayer() {
        return mPlayer;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            boolean toExit = intent.getBooleanExtra(PARAM_EXIT, false);
            if (toExit) {
                stopForeground(true);
                stopSelf();
            }
        }

        return super.onStartCommand(intent, flags, startId);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        mPlayer.close();
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
