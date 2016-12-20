package com.radiostream.javascript.bridge;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

public class SongBridge {

    public int id;
    public String title;
    public String artist;
    public String album;
    public int rating;

    public SongBridge() {

    }

    public WritableMap asMap() {
        WritableMap map = Arguments.createMap();
        map.putInt("id", id);
        map.putString("artist", artist);
        map.putString("title", title);
        map.putString("album", album);
        map.putInt("rating", rating);

        return map;
    }
}
