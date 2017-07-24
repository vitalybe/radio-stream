package com.radiostream.player;

import android.app.PendingIntent;
import android.app.Service;
import android.bluetooth.BluetoothClass;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.media.MediaMetadata;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.os.Binder;
import android.os.IBinder;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v7.app.NotificationCompat;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import android.view.KeyEvent;

import com.facebook.react.bridge.WritableMap;
import com.radiostream.MainActivity;
import com.radiostream.R;
import com.radiostream.di.components.DaggerPlayerServiceComponent;
import com.radiostream.di.components.PlayerServiceComponent;
import com.radiostream.di.modules.ContextModule;
import com.radiostream.di.modules.MetadataBackendModule;
import com.radiostream.javascript.bridge.PlayerBridge;
import com.radiostream.javascript.bridge.PlayerEventsEmitter;
import com.radiostream.javascript.bridge.SongBridge;
import com.radiostream.javascript.proxy.PlayerJsProxy;
import com.radiostream.util.SetTimeout;

import org.jdeferred.DoneCallback;
import org.jdeferred.Promise;

import java.util.Date;

import javax.inject.Inject;

import hugo.weaving.DebugLog;
import timber.log.Timber;


@DebugLog
public class PlayerService extends Service implements PlaylistControls {

    private final int mStopPausedServiceAfterMs = 10 * 60 * 1000;
    private final int mStopPausedServiceRetryAfterMs = 3 * 60 * 1000;
    private final int mNotificationId = 1;
    private final String mParamExit = "mParamExit";
    private final PlayerServiceBinder mBinder = new PlayerServiceBinder();

    private boolean mServiceAlive = true;
    private Date mPausedDate = null;
    private boolean mPausedDuePhoneState = false;
    private boolean mIsBoundToActivity = false;

    MediaSession mMediaSession = null;

    @Inject
    Player mPlayer;
    @Inject
    PlayerEventsEmitter mPlayerEventsEmitter;
    @Inject
    SetTimeout mSetTimeout;


    private BroadcastReceiver mReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            Timber.i("function start");
            if(intent.getAction().equals(BluetoothDevice.ACTION_ACL_DISCONNECTED)) {
                Timber.i("bluetooth disconnected");
                BluetoothDevice btDevice = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                if (btDevice.getBluetoothClass().getMajorDeviceClass() == BluetoothClass.Device.Major.AUDIO_VIDEO) {
                    Timber.i("pausing music due to bluetooth disconnection");
                    PlayerService.this.pause();
                }
            }
        }
    };

    private PhoneStateListener phoneStateListener = new PhoneStateListener() {
        @Override
        public void onCallStateChanged(int state, String incomingNumber) {
            Timber.i("function start");
            if (state == TelephonyManager.CALL_STATE_RINGING || state == TelephonyManager.CALL_STATE_OFFHOOK) {
                Timber.i("telephone busy state: %d", state);
                if(mPlayer.getIsPlaying()) {
                    Timber.i("pausing due to telephone state");
                    PlayerService.this.pause();
                    mPausedDuePhoneState = true;
                }
            } else if(state == TelephonyManager.CALL_STATE_IDLE) {
                Timber.i("telehpone idle state");
                if(mPausedDuePhoneState) {
                    Timber.i("resuming pause music");
                    PlayerService.this.play();
                    mPausedDuePhoneState = false;
                }
            }

            super.onCallStateChanged(state, incomingNumber);
        }
    };

    private PlayerEventsEmitter.EventCallback onPlaylistPlayerEvent = new PlayerEventsEmitter.EventCallback() {
        @Override
        public void onEvent(PlayerBridge playerBridge) {
            Timber.i("onPlaylistPlayerEvent - function start");

            if (playerBridge.playlistPlayerBridge != null) {
                if (playerBridge.playlistPlayerBridge.isLoading) {
                    Timber.i("showing loading notification");
                    showLoadingNotification();
                } else if (playerBridge.playlistPlayerBridge.isPlaying) {
                    Timber.i("showing song notification");
                    showSongNotification(playerBridge.playlistPlayerBridge.songBridge);
                }

                changeBluetoothMetadata(playerBridge);
            }
        }
    };

    private void changeBluetoothMetadata(PlayerBridge playerBridge) {
        Timber.i("Function start");

        if(playerBridge.playlistPlayerBridge != null && playerBridge.playlistPlayerBridge.songBridge != null) {
            SongBridge song = playerBridge.playlistPlayerBridge.songBridge;
            Timber.i("setting bluetooth information of song: %s - %s", song.title, song.artist);

            MediaMetadata metadata = new MediaMetadata.Builder()
                    .putString(MediaMetadata.METADATA_KEY_TITLE, song.title)
                    .putString(MediaMetadata.METADATA_KEY_ARTIST, song.artist)
                    .putString(MediaMetadata.METADATA_KEY_ALBUM, song.album)
                    .build();

            mMediaSession.setMetadata(metadata);
        }

    }

    private MediaSession.Callback mMediaSessionCallback = new MediaSession.Callback() {

        @Override
        public boolean onMediaButtonEvent(@NonNull Intent mediaButtonIntent) {
            Timber.i("function start");

            KeyEvent ke = mediaButtonIntent.getParcelableExtra(Intent.EXTRA_KEY_EVENT);
            if (ke != null && ke.getAction() == KeyEvent.ACTION_DOWN) {
                switch (ke.getKeyCode()) {
                    case KeyEvent.KEYCODE_MEDIA_PLAY:
                        Timber.i("play media button");
                        PlayerService.this.play();
                        return true;
                    case KeyEvent.KEYCODE_MEDIA_PAUSE:
                        Timber.i("pause media button");
                        PlayerService.this.pause();
                        return true;
                    case KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE:
                        Timber.i("play/pause media button");
                        PlayerService.this.playPause();
                        return true;
                }
            }

            return false;
        }
    };

    private void showSongNotification(SongBridge currentSong) {
        Timber.i("function start - show song notification for: %s - %s", currentSong.title, currentSong.artist);
        boolean showHeadsUpNotification = !mIsBoundToActivity;
        startWithNotificaiton(currentSong.title, currentSong.artist, showHeadsUpNotification);
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
            .metadataBackendModule(new MetadataBackendModule())
            .build();

        component.inject(this);

        Timber.i("registering to bluetooth events");
        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(BluetoothDevice.ACTION_ACL_DISCONNECTED);
        registerReceiver(mReceiver, intentFilter);

        Timber.i("registering to telephony events");
        TelephonyManager mgr = (TelephonyManager) getSystemService(TELEPHONY_SERVICE);
        if(mgr != null) {
            mgr.listen(phoneStateListener, PhoneStateListener.LISTEN_CALL_STATE);
        }

        mMediaSession = new MediaSession(this, "PlayerService");
        mMediaSession.setCallback(mMediaSessionCallback);
        mMediaSession.setFlags(MediaSession.FLAG_HANDLES_MEDIA_BUTTONS | MediaSession.FLAG_HANDLES_TRANSPORT_CONTROLS);

        Timber.i("registering to player events");
        mPlayerEventsEmitter.subscribe(onPlaylistPlayerEvent);
        scheduleStopSelfOnPause();
    }

    private void playPause() {
        Timber.i("function start");

        if(this.mPlayer.getIsPlaying()) {
            PlayerService.this.pause();
        } else {
            PlayerService.this.play();
        }
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

        TelephonyManager mgr = (TelephonyManager) getSystemService(TELEPHONY_SERVICE);
        if(mgr != null) {
            mgr.listen(phoneStateListener, PhoneStateListener.LISTEN_NONE);
        }

        mMediaSession.release();

        mServiceAlive = false;
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        Timber.i("function start");
        mIsBoundToActivity = true;
        return mBinder;
    }

    @Override
    public boolean onUnbind(Intent intent) {
        Timber.i("function start");
        mIsBoundToActivity = false;

        return true;
    }

    @Override
    public void onRebind(Intent intent) {
        Timber.i("function start");
        mIsBoundToActivity = true;
    }

    @Override
    public Promise<Song, Exception, Void> play() {
        Timber.i("function start");

        Timber.i("updating media session");
        mMediaSession.setActive(true);
        final long actions = PlaybackState.ACTION_PLAY_PAUSE | PlaybackState.ACTION_PLAY | PlaybackState.ACTION_PAUSE;
        PlaybackState state = new PlaybackState.Builder().setActions(actions).build();
        mMediaSession.setPlaybackState(state);

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

    public WritableMap getPlayerBridgeObject() {
        return mPlayer.toBridgeObject();
    }

    public void stop() {
        Timber.i("function start");
        stopSelf();
        stopForeground(true);
    }

    public Promise<Void, Exception, Void> updateSongRating(int songId, int newRating) {
        return mPlayer.updateSongRating(songId, newRating);
    }

    public class PlayerServiceBinder extends Binder {
        public PlayerService getService() {
            return PlayerService.this;
        }
    }
}
