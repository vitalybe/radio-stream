package com.radiostream.javascript.bridge

import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.radiostream.player.Player

import javax.inject.Inject
import javax.inject.Singleton

import timber.log.Timber

@Singleton
class PlayerEventsEmitter @Inject
constructor(private val mContext: ReactContext) {
    private val playerStatusEvent = "PLAYLIST_PLAYER_STATUS_EVENT"

    init {
        Timber.i("creating new instance of PlayerEventsEmitter (%h) with reactContext: %h", this, mContext)
    }

    fun sendPlayerStatus(player: Player) {
        sendToJavascript(playerStatusEvent, player.toBridgeObject())
        // TODO: Fix notifications
        // sendToSubscribers(playerBridge);
    }

    private fun sendToJavascript(event: String, params: Any) {
        Timber.i("function start - %s - %s", event, params.toString())

        if (mContext.hasActiveCatalystInstance()) {
            val jsModule: DeviceEventManagerModule.RCTDeviceEventEmitter
            jsModule = mContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            jsModule.emit(event, params)
        } else {
            Timber.e("event was not sent - No active catalyst")
        }
    }
}
