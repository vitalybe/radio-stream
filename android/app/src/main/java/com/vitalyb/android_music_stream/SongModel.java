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
    private String id;

    /* {
        artist: "System Of A Down",
                id: "1970929903_1993818436",
            itunes_lastplayed: ???,
            location: "System Of A Down\System Of A Down\03 Sugar.mp3",
            name: "Sugar",
            itunes_playcount: 34,
            itunes_rating: 80
    } */
    public SongModel(JSONObject source) throws JSONException {
        artist = source.getString("artist");
        name = source.getString("title");
        id = source.getString("id");

        int rating = source.getInt("itunes_rating");
        stars = rating/20;
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

    public String getUrl() { return Consts.URL_API + "/item/" + id + "/file"; }

    public String getId() {
        return id;
    }
}