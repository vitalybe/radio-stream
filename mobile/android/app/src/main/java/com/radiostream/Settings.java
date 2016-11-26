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
    private String mAddress = "***REMOVED***/5f707e4f-97cc-438e-90d8-1e5e35bd558a/";
    private String mUser = "radio";
    private String mPassword = "myman";

    @Inject
    public Settings() {
    }

    public void updateSettings(String address, String user, String password) {

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
