package com.radiostream.javascript.bridge;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

/**
 * Created by vitaly on 27/11/2016.
 */

public class PlaylistPlayerBridge {
    public boolean isPlaying = false;
    public boolean isLoading = false;
    public Exception loadingError = null;
    public PlaylistBridge playlistBridge = null;
    public SongBridge songBridge = null;

    public WritableMap asMap() {
        WritableMap map = Arguments.createMap();
        map.putBoolean("isLoading", isLoading);
        map.putBoolean("isPlaying", isPlaying);
        map.putMap("playlist", playlistBridge != null ? playlistBridge.asMap() : null);
        map.putMap("song", songBridge != null ? songBridge.asMap() : null);
        map.putString("loadingError", loadingError != null ? loadingError.getMessage() : "");

        return map;
    }
}
