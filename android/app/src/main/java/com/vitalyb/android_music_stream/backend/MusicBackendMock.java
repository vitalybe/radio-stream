package com.vitalyb.android_music_stream.backend;

import android.os.Handler;
import android.os.Looper;

import com.vitalyb.android_music_stream.MockData;
import com.vitalyb.android_music_stream.SongModel;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class MusicBackendMock implements MusicBackend {

    public static final int MOCK_DELAY = 3 * 1000;
    private static final Handler mHandler = new Handler(Looper.getMainLooper());

    @Override
    public void FetchPlaylists(final OnResultListener<List<String>> listener) {
        mHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                listener.OnResult(MockData.getPlaylists());
            }
        }, MOCK_DELAY);
    }

    @Override
    public void FetchPlaylistSongs(String playlistName, final OnResultListener<List<SongModel>> listener) {
        mHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                try {
                    JSONArray playlistTracksJson =
                            new JSONObject(MockData.getPlaylistData()).getJSONArray("tracks");

                    List<SongModel> songs = new ArrayList<>();
                    for(int i = 0; i < playlistTracksJson.length(); i++) {
                        SongModel song = new SongModel(playlistTracksJson.getJSONObject(i));
                        songs.add(song);
                    }

                    listener.OnResult(songs);
                } catch(Exception e) {
                    throw new RuntimeException(e);
                }
            }
        }, MOCK_DELAY);
    }

    public void MarkAsPlayed(SongModel song) {

    }
}
