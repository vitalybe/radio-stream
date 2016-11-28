package com.radiostream.javascript.bridge;

import com.facebook.react.bridge.WritableNativeMap;

public class SongBridge extends WritableNativeMap {
    private final String fieldTitle = "title";
    private final String fieldArtist = "artist";
    private final String fieldAlbum = "album";

    public String getTitle() {
        return this.getString(fieldTitle);
    }

    public void setTitle(String value) {
        this.putString(fieldTitle, value);
    }

    public String getArtist() {
        return this.getString(fieldArtist);
    }

    public void setArtist(String value) {
        this.putString(fieldArtist, value);
    }

    public String getAlbum() {
        return this.getString(fieldAlbum);
    }

    public void setAlbum(String value) {
        this.putString(fieldAlbum, value);
    }


}
