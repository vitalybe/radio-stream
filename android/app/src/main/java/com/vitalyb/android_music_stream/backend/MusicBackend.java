package com.vitalyb.android_music_stream.backend;

import android.graphics.Bitmap;

import com.vitalyb.android_music_stream.SongModel;

import java.io.InputStream;
import java.util.List;

public interface MusicBackend {

    void fetchArt(String artist, OnResultListener<Bitmap> listener);

    interface OnResultListener<T> {
        void OnResult(T result);
    }

    void FetchPlaylists(OnResultListener<List<String>> listener);

    void FetchPlaylistSongs(String playlistName, OnResultListener<List<SongModel>> listener);

    void MarkAsPlayed(SongModel song);
}
