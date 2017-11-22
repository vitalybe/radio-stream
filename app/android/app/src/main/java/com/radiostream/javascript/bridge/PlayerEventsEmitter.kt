package com.radiostream.javascript.bridge

import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.radiostream.player.Player

import javax.inject.Inject
import javax.inject.Singleton

import timber.log.Timber

@Singleton
class PlayerEventsEmitter @Inject
constructor(private val mContext: ReactContext) {
    private val playerStatusEvent = "PLAYLIST_PLAYER_STATUS_EVENT"
    private val playerChangedListeners: ArrayList<(Player) -> Unit> = ArrayList()

    init {
        Timber.i("creating new instance of PlayerEventsEmitter (%h) with reactContext: %h", this, mContext)
    }

    fun sendPlayerStatus(player: Player) {
        sendToJavascript(playerStatusEvent, player.toBridgeObject())
        // TODO: Fix notifications
        sendToSubscribers(player);
    }

    private fun sendToSubscribers(player: Player) {
        Timber.i("function start")
        playerChangedListeners.forEach { it(player) }
    }

    fun subscribePlayerChanges(listener: (Player) -> Unit) {
        Timber.i("subscribing to player changes")
        playerChangedListeners.add(listener)
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
