package com.radiostream.player;

import com.radiostream.networking.metadata.MetadataBackendGetter;
import com.radiostream.ui.PlayerNotification;
import com.radiostream.util.SetTimeout;

import javax.inject.Inject;

/**
 * Created by vitaly on 17/11/2016.
 */

public class PlaylistPlayerFactory {

    private PlaylistFactory mPlaylistFactory;
    private SetTimeout mSetTimeout;
    MetadataBackendGetter mMetadataBackendGetter;
    private PlayerNotification mPlayerNotification;

    @Inject
    public PlaylistPlayerFactory(PlaylistFactory playlistFactory,
                                 SetTimeout setTimeout, MetadataBackendGetter metadataBackend, PlayerNotification playerNotification) {

        mPlaylistFactory = playlistFactory;
        mSetTimeout = setTimeout;
        mMetadataBackendGetter = metadataBackend;
        mPlayerNotification = playerNotification;
    }

    public PlaylistPlayer build(String playlistName, StatusProvider statusProvider) {
        Playlist playlist = mPlaylistFactory.buildPlaylist(playlistName);

        return new PlaylistPlayer(playlist, mSetTimeout, mMetadataBackendGetter, statusProvider, mPlayerNotification);
    }
}
