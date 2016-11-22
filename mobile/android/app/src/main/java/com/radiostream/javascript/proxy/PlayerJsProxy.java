package com.radiostream.javascript.proxy;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.radiostream.di.components.DaggerJsProxyComponent;
import com.radiostream.di.components.JsProxyComponent;
import com.radiostream.di.modules.ReactContextModule;
import com.radiostream.player.PlayerService;
import com.radiostream.player.PlaylistControls;

import java.util.HashMap;
import java.util.Map;

import hugo.weaving.DebugLog;
import timber.log.Timber;

import static android.content.Context.BIND_AUTO_CREATE;

/**
 * Created by vitaly on 11/11/2016.
 */

@DebugLog
public class PlayerJsProxy extends ReactContextBaseJavaModule implements LifecycleEventListener, PlaylistControls {

    private static JsProxyComponent mJsProxyComponent = null;
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
        Activity activity = this.getCurrentActivity();
        Timber.i("activity: %s", activity.toString());

        Intent musicServiceIntent = new Intent(activity, PlayerService.class);
        activity.bindService(musicServiceIntent, mServiceConnection, BIND_AUTO_CREATE);
        activity.startService(musicServiceIntent);
    }

    @Override
    public void onHostPause() {
        this.getCurrentActivity().unbindService(mServiceConnection);
    }

    @ReactMethod
    @Override
    public void onHostDestroy() {

    }

    @ReactMethod
    public void changePlaylist(String playlistName) {
        mPlayerService.getPlayer().changePlaylist(playlistName);
    }

    @ReactMethod
    @Override
    public void play() {
        mPlayerService.getPlayer().play();
    }

    @ReactMethod
    @Override
    public void pause() {
        mPlayerService.getPlayer().pause();
    }

    @Override
    public void playNext() {
        mPlayerService.getPlayer().playNext();

    }
}