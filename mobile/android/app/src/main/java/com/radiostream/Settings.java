package com.radiostream;

import javax.inject.Inject;
import javax.inject.Singleton;

import hugo.weaving.DebugLog;
import timber.log.Timber;

/**
 * Created by vitaly on 25/11/2016.
 */

@DebugLog
@Singleton
public class Settings {
    private String mHost = null;
    private String mUser = null;
    private String mPassword = null;
    private boolean mIsMockMode;

    @Inject
    public Settings() {
    }

    public void update(String host, String user, String password, boolean isMockMode) {
        Timber.i("updating settings. new host: %s", host);

        mHost = host;
        mUser = user;
        mPassword = password;
        mIsMockMode = isMockMode;
    }

    public String getHost() {
        return mHost;
    }

    public String getAddress() {
        return "http://" + this.mHost + "/radio-stream/";
    }

    public String getUser() {
        return mUser;
    }

    public String getPassword() {
        return mPassword;
    }

    public boolean getMockMode() {
        return mIsMockMode;
    }
}
