package com.radiostream.javascript.proxy;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.radiostream.Settings;
import com.radiostream.di.components.DaggerJsProxyComponent;
import com.radiostream.di.components.JsProxyComponent;
import com.radiostream.di.modules.ReactContextModule;
import com.radiostream.player.PlayerService;

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

public class PlayerJsProxy extends ReactContextBaseJavaModule implements LifecycleEventListener {

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

        Timber.i("unbinding service");
        this.getCurrentActivity().unbindService(mServiceConnection);
        mPlayerService = null;
    }

    @ReactMethod
    @Override
    public void onHostDestroy() {
        Timber.i("function start");

    }

    @ReactMethod
    public void updateSettings(String host, String user, String password, Promise promise) {
        Timber.i("function start");

        mSettings.update(host, user, password);
        promise.resolve(null);
    }

    @ReactMethod
    public void updateSongRating(int songId, int newRating, final Promise promise) {
        try {
            mPlayerService.updateSongRating(songId, newRating).then(new DoneCallback<Void>() {
                @Override
                public void onDone(Void playlistResult) {
                    promise.resolve(null);
                }
            }).fail(new FailCallback<Exception>() {
                @Override
                public void onFail(Exception error) {
                    promise.reject("update song rating failed", error);
                }
            });
        } catch (Exception e) {
            Timber.e(e);
            promise.reject("updateSongRating failed", e);
        }
    }

    @ReactMethod
    public void changePlaylist(String playlistName) {
        try {
            mPlayerService.changePlaylist(playlistName);
        } catch (Exception e) {
            Timber.e(e);
        }
    }

    @ReactMethod
    public void play() {
        try {
            mPlayerService.play();
        } catch (Exception e) {
            Timber.e(e);
        }
    }

    @ReactMethod
    public void pause() {
        try {
            mPlayerService.pause();
        } catch (Exception e) {
            Timber.e(e);
        }
    }

    @ReactMethod
    public void playNext() {
        try {
            mPlayerService.playNext();
        } catch (Exception e) {
            Timber.e(e);
        }

    }

    @ReactMethod
    public void getPlayerStatus(final Promise promise) {
        try {
            Timber.i("function start");
            promise.resolve(mPlayerService.getPlayerBridgeObject());
        } catch (Exception e) {
            Timber.e(e);
            promise.reject(e);
        }
    }

    @ReactMethod
    public void isPlayerAvailable(final Promise promise) {
        try {
            promise.resolve(mPlayerService != null);
        } catch (Exception e) {
            Timber.e(e);
        }
    }

    @ReactMethod
    public void stopPlayer() {
        try {
            Timber.i("stopping service");
            mPlayerService.stop();
        } catch (Exception e) {
            Timber.e(e);
        }
    }
}