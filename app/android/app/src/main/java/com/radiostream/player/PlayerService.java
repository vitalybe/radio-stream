package com.radiostream.player;

import android.app.Service;
import android.bluetooth.BluetoothClass;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.os.Binder;
import android.os.IBinder;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import android.view.KeyEvent;

import com.facebook.react.bridge.WritableMap;
import com.radiostream.di.components.DaggerPlayerServiceComponent;
import com.radiostream.di.components.PlayerServiceComponent;
import com.radiostream.di.modules.ContextModule;
import com.radiostream.di.modules.PlayerServiceModule;
import com.radiostream.javascript.bridge.PlayerEventsEmitter;
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

    public final String PARAM_EXIT = "mParamExit";

    private final int mStopPausedServiceAfterMs = 10 * 60 * 1000;
    private final int mStopPausedServiceRetryAfterMs = 3 * 60 * 1000;

    private final PlayerServiceBinder mBinder = new PlayerServiceBinder();
    MediaSession mMediaSession = null;
    @Inject
    Player mPlayer;
    @Inject
    PlayerEventsEmitter mPlayerEventsEmitter;
    @Inject
    SetTimeout mSetTimeout;

    Player2 mPlayer2 = new Player2();

    private boolean mIsBoundToActivity = false;
    private boolean mServiceAlive = true;
    private Date mPausedDate = null;
    private boolean mPausedDuePhoneState = false;
    private BroadcastReceiver mReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            Timber.i("function start");
            if (intent.getAction().equals(BluetoothDevice.ACTION_ACL_DISCONNECTED)) {
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
                if (mPlayer.getIsPlaying()) {
                    Timber.i("pausing due to telephone state");
                    PlayerService.this.pause();
                    mPausedDuePhoneState = true;
                }
            } else if (state == TelephonyManager.CALL_STATE_IDLE) {
                Timber.i("telehpone idle state");
                if (mPausedDuePhoneState) {
                    Timber.i("resuming pause music");
                    PlayerService.this.play();
                    mPausedDuePhoneState = false;
                }
            }

            super.onCallStateChanged(state, incomingNumber);
        }
    };

//    private PlayerEventsEmitter.EventCallback onPlaylistPlayerEvent = new PlayerEventsEmitter.EventCallback() {
//        @Override
//        public void onEvent(PlayerBridge playerBridge) {
//            Timber.i("onPlaylistPlayerEvent - function start");
//
//            if (playerBridge.playlistPlayerBridge != null) {
//                changeBluetoothMetadata(playerBridge);
//            }
//        }
//    };

//    private void changeBluetoothMetadata(PlayerBridge playerBridge) {
//        Timber.i("Function start");
//
//        if(playerBridge.playlistPlayerBridge != null && playerBridge.playlistPlayerBridge.songBridge != null) {
//            SongBridge song = playerBridge.playlistPlayerBridge.songBridge;
//            Timber.i("setting bluetooth information of song: %s - %s", song.title, song.artist);
//
//            MediaMetadata metadata = new MediaMetadata.Builder()
//                    .putString(MediaMetadata.METADATA_KEY_TITLE, song.title)
//                    .putString(MediaMetadata.METADATA_KEY_ARTIST, song.artist)
//                    .putString(MediaMetadata.METADATA_KEY_ALBUM, song.album)
//                    .build();
//
//            mMediaSession.setMetadata(metadata);
//        }
//
//    }

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

    @Override
    public void onCreate() {
        super.onCreate();
        Timber.i("function start");

        PlayerServiceComponent component = DaggerPlayerServiceComponent.builder()
            .jsProxyComponent(PlayerJsProxy.JsProxyComponent())
            .contextModule(new ContextModule(this))
            .playerServiceModule(new PlayerServiceModule(this))
            .build();

        component.inject(this);

        Timber.i("registering to bluetooth events");
        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(BluetoothDevice.ACTION_ACL_DISCONNECTED);
        registerReceiver(mReceiver, intentFilter);

        Timber.i("registering to telephony events");
        TelephonyManager mgr = (TelephonyManager) getSystemService(TELEPHONY_SERVICE);
        if (mgr != null) {
            mgr.listen(phoneStateListener, PhoneStateListener.LISTEN_CALL_STATE);
        }

        mMediaSession = new MediaSession(this, "PlayerService");
        mMediaSession.setCallback(mMediaSessionCallback);
        mMediaSession.setFlags(MediaSession.FLAG_HANDLES_MEDIA_BUTTONS | MediaSession.FLAG_HANDLES_TRANSPORT_CONTROLS);

        Timber.i("registering to player events");
        scheduleStopSelfOnPause();
    }

    private void playPause() {
        Timber.i("function start");

        if (this.mPlayer.getIsPlaying()) {
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
        Timber.i("function start");

        mPlayer.close();
        mPlayer = null;
        unregisterReceiver(mReceiver);

        TelephonyManager mgr = (TelephonyManager) getSystemService(TELEPHONY_SERVICE);
        if (mgr != null) {
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

    @Override
    public void skipToSongByIndex(int index) {
        this.mPlayer.skipToSongByIndex(index);
    }

    public void test() {
        mPlayer2.test();
    }

    public boolean getIsBoundToAcitivity() {
        return mIsBoundToActivity;
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
