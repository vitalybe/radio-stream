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
    private EventCallback mCallback;

    @Inject
    public PlaylistPlayerEventsEmitter(ReactContext context) {
        Timber.i("creating new instance of PlaylistPlayerEventsEmitter (%h) with reactContext: %h", this, context);
        mContext = context;
    }

    public void sendPlaylistPlayerStatus(PlaylistPlayerBridge playlistPlayerBridge) {
        sendToJavascript(playlistPlayerStatusEvent, playlistPlayerBridge.asMap());
        sendToSubscribers(playlistPlayerBridge);
    }

    public void subscribe(EventCallback callback) {
        mCallback = callback;
    }

    private void sendToSubscribers(PlaylistPlayerBridge playlistPlayerBridge) {
        if(mCallback != null) {
            mCallback.onEvent(playlistPlayerBridge);
        }
    }

    private void sendToJavascript(String event, Object params) {
        Timber.i("function start - %s - %s", event, params.toString());

        if (mContext.hasActiveCatalystInstance()) {
            DeviceEventManagerModule.RCTDeviceEventEmitter jsModule;
            jsModule = mContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
            jsModule.emit(event, params);
        } else {
            Timber.e("event was not sent - No active catalyst");
        }
    }

    public interface EventCallback {
        void onEvent(PlaylistPlayerBridge playlistPlayerBridge);
    }
}
