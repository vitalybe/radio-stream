package com.vitalyb.android_music_stream;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by vitaly on 11/03/2016.
 */
public class SongModel {

    private String artist;
    private String name;
    private int stars;
    private String albumUrl;
    private final String location;
    private String id;

    /* {
        artist: "System Of A Down",
                id: "1970929903_1993818436",
            lastPlayed: 1441116210,
            location: "System Of A Down\System Of A Down\03 Sugar.mp3",
            name: "Sugar",
            playCount: 34,
            rating: 80
    } */
    public SongModel(JSONObject source) throws JSONException {
        artist = source.getString("artist");
        name = source.getString("name");
        id = source.getString("id");

        int rating = source.getInt("rating");
        stars = rating/20;

        location = source.getString("location").replace('\\', '/');
    }

    public String getArtist() {
        return artist;
    }

    public String getName() {
        return name;
    }

    public int getStars() {
        return stars;
    }

    public String getAlbumUrl() {
        return albumUrl;
    }

    public String getUrl() { return Consts.URL_MUSIC + "/" + location; }

    public String getId() {
        return id;
    }
}
