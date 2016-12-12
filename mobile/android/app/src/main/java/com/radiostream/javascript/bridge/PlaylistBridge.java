package com.radiostream.javascript.bridge;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

/**
 * Created by vitaly on 27/11/2016.
 */
public class PlaylistBridge {
    public String name;

    public WritableMap asMap() {
        WritableMap map = Arguments.createMap();
        map.putString("name", name);

        return map;
    }
}
