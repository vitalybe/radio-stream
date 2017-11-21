package com.radiostream.player

import android.app.Service
import android.bluetooth.BluetoothClass
import android.bluetooth.BluetoothDevice
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.MediaMetadata
import android.media.session.MediaSession
import android.media.session.PlaybackState
import android.os.Binder
import android.os.IBinder
import android.telephony.PhoneStateListener
import android.telephony.TelephonyManager
import android.view.KeyEvent
import com.facebook.react.bridge.WritableMap
import com.radiostream.di.components.DaggerPlayerServiceComponent
import com.radiostream.di.modules.ContextModule
import com.radiostream.di.modules.PlayerServiceModule
import com.radiostream.javascript.bridge.PlayerEventsEmitter
import com.radiostream.javascript.proxy.PlayerJsProxy
import hugo.weaving.DebugLog
import kotlinx.coroutines.experimental.CommonPool
import kotlinx.coroutines.experimental.async
import kotlinx.coroutines.experimental.delay
import kotlinx.coroutines.experimental.launch
import timber.log.Timber
import java.util.*
import javax.inject.Inject


@DebugLog
class PlayerService : Service(), PlaylistControls {

    val PARAM_EXIT = "mParamExit"

    private val mStopPausedServiceAfterMs = 10 * 60 * 1000
    private val mStopPausedServiceRetryAfterMs: Long = 3 * 60 * 1000

    private val mBinder = PlayerServiceBinder()
    internal var mMediaSession: MediaSession? = null

    @Inject
    lateinit var mPlayer: Player

    @Inject
    lateinit var mPlayerEventsEmitter: PlayerEventsEmitter

    var isBoundToAcitivity = false
        private set

    private var mServiceAlive = true
    private var mPausedDate: Date? = null
    private var mPausedDuePhoneState = false
    private val mReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            Timber.i("function start")
            if (intent.action == BluetoothDevice.ACTION_ACL_DISCONNECTED) {
                Timber.i("bluetooth disconnected")
                val btDevice = intent.getParcelableExtra<BluetoothDevice>(BluetoothDevice.EXTRA_DEVICE)
                if (btDevice.bluetoothClass.majorDeviceClass == BluetoothClass.Device.Major.AUDIO_VIDEO) {
                    Timber.i("pausing music due to bluetooth disconnection")
                    this@PlayerService.pause()
                }
            }
        }
    }

    private val phoneStateListener = object : PhoneStateListener() {
        override fun onCallStateChanged(state: Int, incomingNumber: String) {
            async(CommonPool) {
                try {
                    Timber.i("function start")
                    if (state == TelephonyManager.CALL_STATE_RINGING || state == TelephonyManager.CALL_STATE_OFFHOOK) {
                        Timber.i("telephone busy state: %d", state)
                        if (mPlayer!!.isPlaying) {
                            Timber.i("pausing due to telephone state")
                            this@PlayerService.pause()
                            mPausedDuePhoneState = true
                        }
                    } else if (state == TelephonyManager.CALL_STATE_IDLE) {
                        Timber.i("telehpone idle state")
                        if (mPausedDuePhoneState) {
                            Timber.i("resuming pause music")
                            this@PlayerService.play()
                            mPausedDuePhoneState = false
                        }
                    }

                    super.onCallStateChanged(state, incomingNumber)
                } catch (e: Exception) {
                    Timber.e(e, "onCallStateChanged error: ${e}")
                }
            }
        }
    }

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

    private val mMediaSessionCallback = object : MediaSession.Callback() {

        override fun onMediaButtonEvent(mediaButtonIntent: Intent): Boolean {
            Timber.i("function start")

            val ke = mediaButtonIntent.getParcelableExtra<KeyEvent>(Intent.EXTRA_KEY_EVENT)
            if (ke != null && ke.action == KeyEvent.ACTION_DOWN) {
                when (ke.keyCode) {
                    KeyEvent.KEYCODE_MEDIA_PLAY -> {
                        Timber.i("play media button")
                        async(CommonPool) {
                            try {
                                this@PlayerService.play()
                            } catch (e: Exception) {
                                Timber.e(e, "Error: ${e}")
                            }
                        }
                        return true
                    }
                    KeyEvent.KEYCODE_MEDIA_PAUSE -> {
                        Timber.i("pause media button")
                        async(CommonPool) {
                            try {
                                this@PlayerService.pause()
                            } catch (e: Exception) {
                                Timber.e(e, "Error: ${e}")
                            }
                        }
                        return true
                    }
                    KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE -> {
                        Timber.i("play/pause media button")
                        async(CommonPool) {
                            try {
                                this@PlayerService.playPause()
                            } catch (e: Exception) {
                                Timber.e(e, "Error: ${e}")
                            }
                        }
                        return true
                    }
                }
            }

            return false
        }
    }

    val playerBridgeObject: WritableMap
        get() = mPlayer!!.toBridgeObject()

    override fun onCreate() {
        super.onCreate()
        Timber.i("function start")

        val component = DaggerPlayerServiceComponent.builder()
                .jsProxyComponent(PlayerJsProxy.JsProxyComponent())
                .contextModule(ContextModule(this))
                .playerServiceModule(PlayerServiceModule(this))
                .build()

        component.inject(this)

        Timber.i("registering to bluetooth events")
        val intentFilter = IntentFilter()
        intentFilter.addAction(BluetoothDevice.ACTION_ACL_DISCONNECTED)
        registerReceiver(mReceiver, intentFilter)

        Timber.i("registering to telephony events")
        val mgr = getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
        mgr?.listen(phoneStateListener, PhoneStateListener.LISTEN_CALL_STATE)

        mMediaSession = MediaSession(this, "PlayerService")
        mMediaSession!!.setCallback(mMediaSessionCallback)
        mMediaSession!!.setFlags(MediaSession.FLAG_HANDLES_MEDIA_BUTTONS or MediaSession.FLAG_HANDLES_TRANSPORT_CONTROLS)

        Timber.i("scheduling to stop on pause")
        launch(CommonPool) {
            scheduleStopSelfOnPause()
        }
    }

    private suspend fun playPause() {
        Timber.i("function start")

        if (this.mPlayer!!.isPlaying) {
            this@PlayerService.pause()
        } else {
            this@PlayerService.play()
        }
    }

    private suspend fun scheduleStopSelfOnPause() {
        Timber.i("function start")

        // We're retrying even after stopping a service because a stopped service might still be bound to activity
        if (mServiceAlive) {
            if (mPausedDate != null) {
                val currentTime = Date().time
                val timePaused = currentTime - mPausedDate!!.time
                Timber.i("time in paused state: %dms out of %dms", timePaused, mStopPausedServiceAfterMs)

                if (mPausedDate != null && timePaused > mStopPausedServiceAfterMs) {
                    Timber.i("stopping service")
                    mPausedDate = null
                    stop()
                } else {
                    Timber.i("not enough time has passed in paused mode")
                }
            } else {
                Timber.i("currently not paused")
            }

            Timber.i("sleeping and retrying in %dms...", mStopPausedServiceRetryAfterMs)
            delay(mStopPausedServiceRetryAfterMs)
            scheduleStopSelfOnPause()
        } else {
            Timber.i("service is dead - will not retry again")
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent != null) {
            val toExit = intent.getBooleanExtra(PARAM_EXIT, false)
            if (toExit) {
                stopForeground(true)
                stopSelf()
            }
        }

        return super.onStartCommand(intent, flags, startId)
    }

    override fun onDestroy() {
        Timber.i("function start")

        mPlayer!!.close()
        unregisterReceiver(mReceiver)

        val mgr = getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
        mgr?.listen(phoneStateListener, PhoneStateListener.LISTEN_NONE)

        mMediaSession!!.release()

        mServiceAlive = false
        super.onDestroy()
    }

    override fun onBind(intent: Intent): IBinder? {
        Timber.i("function start")
        isBoundToAcitivity = true
        return mBinder
    }

    override fun onUnbind(intent: Intent): Boolean {
        Timber.i("function start")
        isBoundToAcitivity = false

        return true
    }

    override fun onRebind(intent: Intent) {
        Timber.i("function start")
        isBoundToAcitivity = true
    }

    override suspend fun play() {
        Timber.i("function start")

        Timber.i("updating media session")
        mMediaSession!!.isActive = true
        val actions = PlaybackState.ACTION_PLAY_PAUSE or PlaybackState.ACTION_PLAY or PlaybackState.ACTION_PAUSE
        val state = PlaybackState.Builder().setActions(actions).setState(PlaybackState.STATE_PLAYING, 3000, 1f).build()
        mMediaSession!!.setPlaybackState(state)

        val metadata = MediaMetadata.Builder()
                .putString(MediaMetadata.METADATA_KEY_TITLE, "Vitaly")
                .putString(MediaMetadata.METADATA_KEY_ARTIST, "Artist")
                .putString(MediaMetadata.METADATA_KEY_ALBUM, "Album")
                .putLong(MediaMetadata.METADATA_KEY_DURATION, 60000)
                .build();

        mMediaSession!!.setMetadata(metadata);
        Timber.i("setting media metadata")


        mPausedDate = null
        Timber.i("player unpaused")
        return this.mPlayer!!.play()
    }

    override fun pause() {
        mPausedDate = Date()
        Timber.i("player paused on: %s", mPausedDate)
        this.mPlayer!!.pause()
    }

    override suspend fun playNext() {
        this.mPlayer!!.playNext()
    }

    override suspend fun skipToSongByIndex(index: Int) {
        this.mPlayer!!.skipToSongByIndex(index)
    }


    fun changePlaylist(playlistName: String) {
        this.mPlayer!!.changePlaylist(playlistName)
    }

    fun stop() {
        Timber.i("function start")
        stopSelf()
        stopForeground(true)
    }

    suspend fun updateSongRating(songId: Int, newRating: Int) {
        return mPlayer!!.updateSongRating(songId, newRating)
    }

    inner class PlayerServiceBinder : Binder() {
        val service: PlayerService
            get() = this@PlayerService
    }
}
