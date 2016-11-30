package com.radiostream.javascript.bridge;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.radiostream.player.PlaylistPlayer;

import javax.inject.Inject;
import javax.inject.Singleton;

import timber.log.Timber;

@Singleton
public class PlayerEventsEmitter {

    private ReactContext mContext;
    private final String playerStatusEvent = "PLAYER_STATUS_EVENT";

    @Inject
    public PlayerEventsEmitter(ReactContext context) {
        Timber.i("function start");
        mContext = context;
    }

    public void sendPlayerStatus(PlaylistPlayerBridge bridge) {
        send("PLAYER_STATUS_EVENT", bridge.asMap());
    }

    private void send(String event, Object params) {
        Timber.i("function start - %s - %s", event, params.toString());

        if (mContext.hasActiveCatalystInstance()) {
            DeviceEventManagerModule.RCTDeviceEventEmitter jsModule;
            jsModule = mContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
            jsModule.emit(event, params);
        } else {
            Timber.e("event was not sent - No active catalyst");
        }
    }

}
