package com.radiostream.player;

import com.radiostream.networking.MetadataBackend;
import com.radiostream.util.SetTimeout;

import javax.inject.Inject;

/**
 * Created by vitaly on 17/11/2016.
 */

public class PlaylistPlayerFactory {

    private PlaylistFactory mPlaylistFactory;
    private SetTimeout mSetTimeout;
    MetadataBackend mMetadataBackend;

    @Inject
    public PlaylistPlayerFactory(PlaylistFactory playlistFactory,
                                 SetTimeout setTimeout, MetadataBackend metadataBackend) {

        mPlaylistFactory = playlistFactory;
        mSetTimeout = setTimeout;
        mMetadataBackend = metadataBackend;
    }

    public PlaylistPlayer build(String playlistName, StatusProvider statusProvider) {
        Playlist playlist = mPlaylistFactory.buildPlaylist(playlistName);

        return new PlaylistPlayer(playlist, mSetTimeout, mMetadataBackend, statusProvider);
    }
}
