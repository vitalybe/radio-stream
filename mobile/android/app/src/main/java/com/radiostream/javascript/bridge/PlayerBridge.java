package com.radiostream.javascript.bridge;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.radiostream.player.PlaylistPlayer;

/**
 * Created by vitaly on 27/11/2016.
 */
public class PlayerBridge {
    private final String fieldPlaylistPlayer = "playlistPlayer";

    private final WritableMap mBackingMap;

    public PlayerBridge() {
        mBackingMap = Arguments.createMap();
    }

    public WritableMap asMap() {
        return mBackingMap;
    }

    public void setPlaylistPlayer(PlaylistPlayer value) {
        mBackingMap.putMap(fieldPlaylistPlayer, null);

        if(value != null) {
            mBackingMap.putMap(fieldPlaylistPlayer, value.toBridgeObject().asMap());
        }
    }

}
