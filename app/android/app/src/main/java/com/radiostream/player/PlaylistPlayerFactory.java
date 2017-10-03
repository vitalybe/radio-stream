package com.radiostream.player;

import com.radiostream.javascript.bridge.ArgumentsWrapper;
import com.radiostream.networking.metadata.MetadataBackendGetter;
import com.radiostream.ui.PlayerNotification;

import javax.inject.Inject;

/**
 * Created by vitaly on 17/11/2016.
 */

public class PlaylistPlayerFactory {

    private PlaylistFactory mPlaylistFactory;
    MetadataBackendGetter mMetadataBackendGetter;
    private PlayerNotification mPlayerNotification;
    private ArgumentsWrapper mArgumentsWrapper;

    @Inject
    public PlaylistPlayerFactory(PlaylistFactory playlistFactory,
                                 MetadataBackendGetter metadataBackend, PlayerNotification playerNotification, ArgumentsWrapper argumentsWrapper) {

        mPlaylistFactory = playlistFactory;
        mMetadataBackendGetter = metadataBackend;
        mPlayerNotification = playerNotification;
        mArgumentsWrapper = argumentsWrapper;
    }

    public PlaylistPlayer build(String playlistName, StatusProvider statusProvider) {
        Playlist playlist = mPlaylistFactory.buildPlaylist(playlistName);

        return new PlaylistPlayer(playlist, mMetadataBackendGetter, statusProvider, mPlayerNotification, mArgumentsWrapper);
    }
}
