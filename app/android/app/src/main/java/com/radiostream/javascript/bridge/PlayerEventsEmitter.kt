package com.radiostream.javascript.bridge

import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.radiostream.player.Player
import com.radiostream.wrapper.ReactContextContainer

import javax.inject.Inject
import javax.inject.Singleton

import timber.log.Timber

@Singleton
class PlayerEventsEmitter @Inject
constructor(private val mContextContainer: ReactContextContainer) {
    private val playerStatusEvent = "PLAYLIST_PLAYER_STATUS_EVENT"
    private val playerChangedListeners: ArrayList<(Player) -> Unit> = ArrayList()

    init {
        Timber.i("creating new instance of PlayerEventsEmitter (%h) with reactContext: %h", this, mContextContainer.reactContext)
    }

    fun sendPlayerStatus(player: Player) {
        sendToJavascript(playerStatusEvent, player.toBridgeObject())
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
        val reactContext = mContextContainer.reactContext;

        if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
            val jsModule: DeviceEventManagerModule.RCTDeviceEventEmitter
            jsModule = reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            jsModule.emit(event, params)
        } else {
            Timber.e("event was not sent - No active catalyst")
        }
    }
}
