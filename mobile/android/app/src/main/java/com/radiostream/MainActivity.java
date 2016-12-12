package com.radiostream;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.support.v4.content.LocalBroadcastManager;

import com.facebook.react.ReactActivity;

import timber.log.Timber;

public class MainActivity extends ReactActivity {

    public static final String ACTION_STOP_MUSIC_ACTIVITY = "ACTION_STOP_ACTIVITY";

    private BroadcastReceiver mMessageReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            Timber.i("function start");
            if (intent.getAction().equals(ACTION_STOP_MUSIC_ACTIVITY)) {
                Timber.i("finishing activity");
                finish();
            }
        }
    };

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "RadioStream";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Timber.i("function start");
        LocalBroadcastManager.getInstance(this).registerReceiver(
            mMessageReceiver, new IntentFilter(ACTION_STOP_MUSIC_ACTIVITY));
    }

    @Override
    protected void onDestroy() {
        Timber.i("function start");

        LocalBroadcastManager.getInstance(this).unregisterReceiver(mMessageReceiver);

        super.onDestroy();
    }
}
