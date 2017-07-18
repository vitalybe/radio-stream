package com.radiostream.javascript.bridge;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import javax.inject.Inject;
import javax.inject.Singleton;

import timber.log.Timber;

@Singleton
public class PlayerEventsEmitter {

    private ReactContext mContext;
    private final String playerStatusEvent = "PLAYLIST_PLAYER_STATUS_EVENT";
    private EventCallback mCallback;

    @Inject
    public PlayerEventsEmitter(ReactContext context) {
        Timber.i("creating new instance of PlayerEventsEmitter (%h) with reactContext: %h", this, context);
        mContext = context;
    }

    public void sendPlayerStatus(WritableMap status) {
        sendToJavascript(playerStatusEvent, status);
        // TODO: Fix notifications
        // sendToSubscribers(playerBridge);
    }

    public void subscribe(EventCallback callback) {
        mCallback = callback;
    }

    private void sendToSubscribers(PlayerBridge playerBridge) {
        if(mCallback != null) {
            mCallback.onEvent(playerBridge);
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
        void onEvent(PlayerBridge playerBridge);
    }
}
