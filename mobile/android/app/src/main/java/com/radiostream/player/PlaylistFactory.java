package com.radiostream.player;

import com.radiostream.networking.metadata.MetadataBackendGetter;

import javax.inject.Inject;

/**
 * Created by vitaly on 17/11/2016.
 */

public class PlaylistFactory {

    private MetadataBackendGetter mMetadataBackendGetter;
    private SongFactory mSongFactory;

    @Inject
    public PlaylistFactory(MetadataBackendGetter metadataBackend, SongFactory songFactory) {

        mMetadataBackendGetter = metadataBackend;
        mSongFactory = songFactory;
    }

    public Playlist buildPlaylist(String playlistName) {
        return new Playlist(playlistName, mMetadataBackendGetter, mSongFactory);
    }
}
