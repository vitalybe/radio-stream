package com.radiostream.javascript.bridge;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

public class SongBridge {

    private final String fieldTitle = "title";
    private final String fieldArtist = "artist";
    private final String fieldAlbum = "album";

    private final WritableMap mBackingMap;

    public SongBridge() {
        mBackingMap = Arguments.createMap();
    }

    public String getTitle() {
        return mBackingMap.getString(fieldTitle);
    }

    public void setTitle(String value) {
        mBackingMap.putString(fieldTitle, value);
    }

    public String getArtist() {
        return mBackingMap.getString(fieldArtist);
    }

    public void setArtist(String value) {
        mBackingMap.putString(fieldArtist, value);
    }

    public String getAlbum() {
        return mBackingMap.getString(fieldAlbum);
    }

    public void setAlbum(String value) {
        mBackingMap.putString(fieldAlbum, value);
    }

    public WritableMap asMap() {
        return mBackingMap;
    }
}
