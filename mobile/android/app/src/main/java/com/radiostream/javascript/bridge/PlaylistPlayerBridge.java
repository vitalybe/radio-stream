package com.radiostream.javascript.bridge;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

/**
 * Created by vitaly on 27/11/2016.
 */

public class PlaylistPlayerBridge {
    private final String fieldIsPlaying = "isPlaying";
    private final String fieldIsLoading = "isLoading";
    private final String fieldPlaylist = "playlist";
    private final String fieldSong = "song";

    private final WritableMap mBackingMap;

    public PlaylistPlayerBridge() {
        mBackingMap = Arguments.createMap();
    }


    public WritableMap asMap() {
        return mBackingMap;
    }

    public boolean getIsPlaying() {
        return mBackingMap.getBoolean(fieldIsPlaying);
    }

    public void setIsPlaying(boolean value) {
        mBackingMap.putBoolean(fieldIsPlaying, value);
    }

    public boolean getIsLoading() {
        return mBackingMap.getBoolean(fieldIsLoading);
    }

    public void setIsLoading(boolean value) {
        mBackingMap.putBoolean(fieldIsLoading, value);
    }

    public ReadableMap getPlaylist() {
        return mBackingMap.getMap(fieldPlaylist);
    }

    public void setPlaylist(PlaylistBridge value) {

        mBackingMap.putMap(fieldPlaylist, value.asMap());
    }

    public ReadableMap getSong() {
        return mBackingMap.getMap(fieldSong);
    }

    public void setSong(SongBridge song) {
        mBackingMap.putMap(fieldSong, song.asMap());
    }
}
