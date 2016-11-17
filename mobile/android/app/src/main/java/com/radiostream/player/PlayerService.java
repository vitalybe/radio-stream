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
import com.radiostream.javascript.proxy.PlayerJsProxy;

import javax.inject.Inject;

import hugo.weaving.DebugLog;


@DebugLog
public class PlayerService extends Service {

    private final int NOTIFICATION_ID = 1;

    private final PlayerServiceBinder mBinder = new PlayerServiceBinder();
    private final String PARAM_EXIT = "PARAM_EXIT";

    @Inject
    PlaylistPlayer mPlaylistPlayer;

    @Override
    public void onCreate() {
        super.onCreate();

        showServiceNotification("Radio Stream", "Loading...");

        PlayerServiceComponent component = DaggerPlayerServiceComponent.builder()
            .jsProxyComponent(PlayerJsProxy.JsProxyComponent())
            .contextModule(new ContextModule(this))
            .build();

        component.inject(this);
    }

    private void showServiceNotification(String title, String contentText) {

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
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(activityPendingIntent)
            .addAction(R.drawable.image_stop, "Stop", stopPendingIntent);

        startForeground(NOTIFICATION_ID, mBuilder.build());
    }

    public PlaylistPlayer getPlaylistPlayer() {
        return mPlaylistPlayer;
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

        mPlaylistPlayer.close();
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
