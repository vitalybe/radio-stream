package com.radiostream.javascript.bridge;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableNativeMap;

/**
 * Created by vitaly on 27/11/2016.
 */

public class PlaylistPlayerBridge extends WritableNativeMap {
    private final String fieldIsPlaying = "isPlaying";
    private final String fieldIsLoading = "isLoading";
    private final String fieldPlaylist = "playlist";
    private final String fieldSong = "song";

    public boolean getIsPlaying() {
        return this.getBoolean(fieldIsPlaying);
    }

    public void setIsPlaying(boolean value) {
        this.putBoolean(fieldIsPlaying, value);
    }

    public boolean getIsLoading() {
        return this.getBoolean(fieldIsLoading);
    }

    public void setIsLoading(boolean value) {
        this.putBoolean(fieldIsLoading, value);
    }

    public ReadableMap getPlaylist() {
        return this.getMap(fieldPlaylist);
    }

    public void setPlaylist(PlaylistBridge value) {

        this.putMap(fieldPlaylist, value);
    }

    public void setSong(SongBridge song) {
        this.putMap(fieldSong, song);

    }
}
