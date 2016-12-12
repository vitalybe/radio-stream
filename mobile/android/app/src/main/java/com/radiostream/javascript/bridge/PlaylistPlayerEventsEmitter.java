package com.radiostream.javascript.bridge;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.radiostream.player.PlaylistPlayer;

import javax.inject.Inject;
import javax.inject.Singleton;

import timber.log.Timber;

@Singleton
public class PlaylistPlayerEventsEmitter {

    private ReactContext mContext;
    private final String playlistPlayerStatusEvent = "PLAYLIST_PLAYER_STATUS_EVENT";

    @Inject
    public PlaylistPlayerEventsEmitter(ReactContext context) {
        Timber.i("creating new instance of PlaylistPlayerEventsEmitter (%h) with reactContext: %h", this, context);
        mContext = context;
    }

    public void sendPlaylistPlayerStatus(PlaylistPlayerBridge bridge) {
        send(playlistPlayerStatusEvent, bridge.asMap());
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
