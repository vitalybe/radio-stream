package com.radiostream.javascript.proxy;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.radiostream.Settings;
import com.radiostream.di.components.DaggerJsProxyComponent;
import com.radiostream.di.components.JsProxyComponent;
import com.radiostream.di.modules.ReactContextModule;
import com.radiostream.javascript.bridge.PlayerBridge;
import com.radiostream.javascript.bridge.PlaylistPlayerBridge;
import com.radiostream.networking.MetadataBackend;
import com.radiostream.networking.models.PlaylistListResult;
import com.radiostream.player.PlayerService;
import com.radiostream.player.PlaylistControls;
import com.radiostream.player.Song;

import org.jdeferred.DoneCallback;
import org.jdeferred.FailCallback;

import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;

import timber.log.Timber;

import static android.content.Context.BIND_AUTO_CREATE;

/**
 * Created by vitaly on 11/11/2016.
 */

public class PlayerJsProxy extends ReactContextBaseJavaModule implements LifecycleEventListener, PlaylistControls {

    private static JsProxyComponent mJsProxyComponent = null;
    @Inject
    Settings mSettings;
    private PlayerService mPlayerService = null;
    private ServiceConnection mServiceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            Timber.i("Function start");
            PlayerService.PlayerServiceBinder binder = (PlayerService.PlayerServiceBinder) service;
            mPlayerService = binder.getService();
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            Timber.i("Function start");
            mPlayerService = null;
        }
    };

    public PlayerJsProxy(ReactApplicationContext reactContext) {
        super(reactContext);
        Timber.i("creating new instance of PlayerJsProxy (%h) with reactContext: %h", this, reactContext);

        reactContext.addLifecycleEventListener(this);

        mJsProxyComponent = DaggerJsProxyComponent.builder().reactContextModule(new ReactContextModule(reactContext)).build();
        mJsProxyComponent.inject(this);
    }

    public static JsProxyComponent JsProxyComponent() {
        if (mJsProxyComponent == null) {
            throw new RuntimeException("Remote service was not initialized");
        }

        return mJsProxyComponent;
    }

    @Override
    public String getName() {
        return "PlayerJsProxy";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        return constants;
    }

    @Override
    public void onHostResume() {
        Timber.i("function start");

        Activity activity = this.getCurrentActivity();
        Timber.i("activity: %s", activity.toString());

        activity.bindService(new Intent(activity, PlayerService.class), mServiceConnection, BIND_AUTO_CREATE);
    }

    @Override
    public void onHostPause() {
        Timber.i("function start");

        this.getCurrentActivity().unbindService(mServiceConnection);
        mPlayerService = null;
    }

    @ReactMethod
    @Override
    public void onHostDestroy() {
        Timber.i("function start");

    }

    @ReactMethod
    public void fetchPlaylists(final Promise promise) {
        MetadataBackend metadataBackend = new MetadataBackend(mSettings);
        try {
            metadataBackend.fetchAllPlaylist().then(new DoneCallback<PlaylistListResult>() {
                @Override
                public void onDone(PlaylistListResult playlistResult) {

                    WritableArray result = Arguments.createArray();
                    for (String playlist : playlistResult.playlists) {
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

    @ReactMethod
    public void changePlaylist(String playlistName) {
        try {
            mPlayerService.getPlayer().changePlaylist(playlistName);
        } catch (Exception e) {
            Timber.e(e);
        }
    }

    @ReactMethod
    @Override
    public org.jdeferred.Promise<Song, Exception, Void> play() {
        try {
            mPlayerService.getPlayer().play();
        } catch (Exception e) {
            Timber.e(e);
        }

        return null;
    }

    @ReactMethod
    @Override
    public void pause() {
        try {
            mPlayerService.getPlayer().pause();
        } catch (Exception e) {
            Timber.e(e);
        }
    }

    @ReactMethod
    @Override
    public void playPause() {
        try {
            mPlayerService.getPlayer().playPause();
        } catch (Exception e) {
            Timber.e(e);
        }
    }

    @ReactMethod
    @Override
    public void playNext() {
        try {
            mPlayerService.getPlayer().playNext();
        } catch (Exception e) {
            Timber.e(e);
        }

    }

    @ReactMethod
    public void getPlayerStatus(final Promise promise) {
        try {
            Timber.i("function start");
            PlayerBridge bridge = mPlayerService.getPlayer().toBridgeObject();
            promise.resolve(bridge.asMap());
        } catch (Exception e) {
            Timber.e(e);
            promise.reject(e);
        }
    }

    @ReactMethod
    public void isPlayerAvailable(final Promise promise) {
        promise.resolve(mPlayerService != null);
    }
}