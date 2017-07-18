package com.radiostream.javascript.bridge;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by vitaly on 27/11/2016.
 */
public class PlaylistBridge {
    public String name;
    public Integer currentIndex;
    private List<SongBridge> mSongBridgeCollection = new ArrayList<>();

    public WritableMap asMap() {
        WritableMap map = Arguments.createMap();
        map.putString("name", name);

        WritableArray songsArray = Arguments.createArray();
        for (SongBridge songBridge : mSongBridgeCollection) {
            songsArray.pushMap(songBridge.asMap());
        }
        map.putArray("songs", songsArray);

        return map;
    }
}
