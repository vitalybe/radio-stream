package com.radiostream.javascript.proxy;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.radiostream.networking.MetadataBackend;
import com.radiostream.networking.models.PlaylistsResult;

import java.util.HashMap;
import java.util.Map;

import hugo.weaving.DebugLog;
import timber.log.Timber;

/**
 * Created by vitaly on 11/11/2016.
 */

@DebugLog
public class MetadataBackendProxy extends ReactContextBaseJavaModule {

    public MetadataBackendProxy(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "MetadataBackendProxy";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        return constants;
    }

    @ReactMethod
    public void fetchPlaylists(Promise promise) {
        MetadataBackend metadataBackend = new MetadataBackend();
        try {
            PlaylistsResult playlistResult = metadataBackend.fetchPlaylists();

            WritableArray result = Arguments.createArray();
            for(String playlist : playlistResult.playlists) {
                result.pushString(playlist);
            }

            promise.resolve(result);
        } catch (Exception e) {
            Timber.e(e);
            promise.reject("FetchPlaylists failed", e);
        }
    }
}