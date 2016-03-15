package com.vitalyb.android_music_stream.backend;

import com.vitalyb.android_music_stream.SongModel;

import java.util.List;

public interface MusicBackend {

    interface OnResultListener<T> {
        void OnResult(T result);
    }

    void FetchPlaylists(OnResultListener<List<String>> listener);

    void FetchPlaylistSongs(String playlistName, OnResultListener<List<SongModel>> listener);

    void MarkAsPlayed(SongModel song);
}
