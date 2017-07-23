package com.radiostream.player;

import com.radiostream.networking.metadata.MetadataBackend;

import javax.inject.Inject;

/**
 * Created by vitaly on 17/11/2016.
 */

public class PlaylistFactory {

    private MetadataBackend mMetadataBackend;
    private SongFactory mSongFactory;

    @Inject
    public PlaylistFactory(MetadataBackend metadataBackend, SongFactory songFactory) {

        mMetadataBackend = metadataBackend;
        mSongFactory = songFactory;
    }

    public Playlist buildPlaylist(String playlistName) {
        return new Playlist(playlistName, mMetadataBackend, mSongFactory);
    }
}
