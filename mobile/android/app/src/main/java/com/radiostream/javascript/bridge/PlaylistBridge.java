package com.radiostream.javascript.bridge;

import com.facebook.react.bridge.WritableNativeMap;

/**
 * Created by vitaly on 27/11/2016.
 */
public class PlaylistBridge extends WritableNativeMap {
    private final String fieldName = "name";

    public String getName() {
        return this.getString(fieldName);
    }

    public void setName(String value) {
        this.putString(fieldName, value);
    }

}
