package com.radiostream.javascript.proxy;

import android.os.Looper;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.radiostream.networking.MetadataBackend;
import com.radiostream.networking.models.PlaylistsResult;

import org.jdeferred.DoneCallback;
import org.jdeferred.FailCallback;

import java.util.HashMap;
import java.util.Map;

import hugo.weaving.DebugLog;
import timber.log.Timber;

/**
 * Created by vitaly on 11/11/2016.
 */

@DebugLog
public class MetadataBackendJsProxy extends ReactContextBaseJavaModule {

    public MetadataBackendJsProxy(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "MetadataBackendJsProxy";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        return constants;
    }

    @ReactMethod
    public void fetchPlaylists(final Promise promise) {
        MetadataBackend metadataBackend = new MetadataBackend();
        try {
            metadataBackend.fetchPlaylists().then(new DoneCallback<PlaylistsResult>() {
                @Override
                public void onDone(PlaylistsResult playlistResult) {

                    WritableArray result = Arguments.createArray();
                    for(String playlist : playlistResult.playlists) {
                        result.pushString(playlist);
                    }

                    promise.resolve(result);
                }
            }).fail(new FailCallback<Exception>() {
                @Override
                public void onFail(Exception error) {
                    promise.reject("fetch playlist failed", error);
                }
            });


        } catch (Exception e) {
            Timber.e(e);
            promise.reject("FetchPlaylists failed", e);
        }
    }
}