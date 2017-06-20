package com.radiostream.javascript.bridge;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.radiostream.player.PlaylistPlayer;

/**
 * Created by vitaly on 27/11/2016.
 */
public class PlayerBridge {

    public PlaylistPlayerBridge playlistPlayerBridge;

    public WritableMap asMap() {
        WritableMap map = Arguments.createMap();
        map.putMap("playlistPlayer", playlistPlayerBridge != null ? playlistPlayerBridge.asMap() : null);

        return map;
    }

}
