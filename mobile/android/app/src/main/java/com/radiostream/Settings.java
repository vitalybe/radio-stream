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
    private String mAddress = null;
    private String mUser = null;
    private String mPassword = null;

    @Inject
    public Settings() {
    }

    public void update(String address, String user, String password) {
        Timber.i("updating settings. new address: %s", address);

        mAddress = address;
        if(!mAddress.endsWith("/")) {
            Timber.i("adding missing '/' at the end of address: %s", address);
            mAddress += "/";
        }

        mUser = user;
        mPassword = password;
    }

    public String getAddress() {
        return mAddress;
    }

    public String getUser() {
        return mUser;
    }

    public String getPassword() {
        return mPassword;
    }
}
