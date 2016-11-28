package com.radiostream.javascript.bridge;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

/**
 * Created by vitaly on 27/11/2016.
 */
public class PlaylistBridge {
    private final String fieldName = "name";

    private final WritableMap mBackingMap;

    public PlaylistBridge() {
        mBackingMap = Arguments.createMap();
    }

    public WritableMap asMap() {
        return mBackingMap;
    }

    public String getName() {
        return mBackingMap.getString(fieldName);
    }

    public void setName(String value) {
        mBackingMap.putString(fieldName, value);
    }

}
