package com.radiostream.javascript.proxy

import android.app.Activity
import android.content.ComponentName
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder

import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.radiostream.Settings
import com.radiostream.di.components.DaggerJsProxyComponent
import com.radiostream.di.components.JsProxyComponent
import com.radiostream.di.modules.ReactContextModule
import com.radiostream.player.PlayerService

import java.util.HashMap

import javax.inject.Inject

import timber.log.Timber

import android.content.Context.BIND_AUTO_CREATE
import kotlinx.coroutines.experimental.CommonPool
import kotlinx.coroutines.experimental.async

class PlayerJsProxy(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

    @Inject
    lateinit var mSettings: Settings

    private var mPlayerService: PlayerService? = null
    private val mServiceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName, service: IBinder) {
            Timber.i("Function start")
            val binder = service as PlayerService.PlayerServiceBinder
            mPlayerService = binder.service
        }

        override fun onServiceDisconnected(name: ComponentName) {
            Timber.i("Function start")
            mPlayerService = null
        }
    }

    init {
        Timber.i("creating new instance of PlayerJsProxy (%h) with reactContext: %h", this, reactContext)

        reactContext.addLifecycleEventListener(this)

        mJsProxyComponent = DaggerJsProxyComponent.builder().reactContextModule(ReactContextModule(reactContext)).build()
        mJsProxyComponent!!.inject(this)
    }

    override fun getName(): String {
        return "PlayerJsProxy"
    }

    override fun getConstants(): Map<String, Any>? {
        return HashMap()
    }

    override fun onHostResume() {
        Timber.i("function start")

        val activity = this.currentActivity
        Timber.i("activity: %s", activity!!.toString())

        activity.bindService(Intent(activity, PlayerService::class.java), mServiceConnection, BIND_AUTO_CREATE)
    }

    override fun onHostPause() {
        Timber.i("function start")

        Timber.i("unbinding service")
        this.currentActivity!!.unbindService(mServiceConnection)
        mPlayerService = null
    }

    @ReactMethod
    override fun onHostDestroy() {
        Timber.i("function start")

    }

    @ReactMethod
    fun updateSettings(host: String?, user: String?, password: String?, isMockMode: Boolean, promise: Promise) {
        Timber.i("function start")

        mSettings!!.update(host ?: "", user ?: "", password ?: "", isMockMode)
        promise.resolve(null)
    }

    @ReactMethod
    fun updateSongRating(songId: Int, newRating: Int, promise: Promise) {
        async(CommonPool) {
            try {
                mPlayerService!!.updateSongRating(songId, newRating)
            } catch (e: Exception) {
                Timber.e(e)
                promise.reject("updateSongRating failed", e)
            }
        }
    }

    @ReactMethod
    fun changePlaylist(playlistName: String) {
        try {
            mPlayerService!!.changePlaylist(playlistName)
        } catch (e: Exception) {
            Timber.e(e)
        }

    }

    @ReactMethod
    fun play() {
        async(CommonPool) {
            try {
                mPlayerService!!.play()
            } catch (e: Exception) {
                Timber.e(e)
            }
        }
    }

    @ReactMethod
    fun pause() {
        try {
            mPlayerService!!.pause()
        } catch (e: Exception) {
            Timber.e(e)
        }

    }

    @ReactMethod
    fun playNext() {
        async(CommonPool) {
            try {
                mPlayerService!!.playNext()
            } catch (e: Exception) {
                Timber.e(e)
            }
        }
    }

    @ReactMethod
    fun playIndex(index: Int) {
        async(CommonPool) {
            try {
                mPlayerService!!.skipToSongByIndex(index)
            } catch (e: Exception) {
                Timber.e(e)
            }
        }
    }

    @ReactMethod
    fun getPlayerStatus(promise: Promise) {
        try {
            Timber.i("function start")
            promise.resolve(mPlayerService!!.playerBridgeObject)
        } catch (e: Exception) {
            Timber.e(e)
            promise.reject(e)
        }

    }

    @ReactMethod
    fun isPlayerAvailable(promise: Promise) {
        try {
            promise.resolve(mPlayerService != null)
        } catch (e: Exception) {
            Timber.e(e)
        }

    }

    @ReactMethod
    fun stopPlayer() {
        try {
            Timber.i("stopping service")
            mPlayerService!!.stop()
        } catch (e: Exception) {
            Timber.e(e)
        }

    }


    companion object {

        private var mJsProxyComponent: JsProxyComponent? = null

        fun JsProxyComponent(): JsProxyComponent {
            if (mJsProxyComponent == null) {
                throw RuntimeException("Remote service was not initialized")
            }

            return mJsProxyComponent!!
        }
    }

}