package com.radiostream.player;

import com.radiostream.javascript.bridge.PlaylistPlayerEventsEmitter;
import com.radiostream.networking.MetadataBackend;
import com.radiostream.util.SetTimeout;

import javax.inject.Inject;

/**
 * Created by vitaly on 17/11/2016.
 */

public class PlaylistPlayerFactory {

    private PlaylistFactory mPlaylistFactory;
    private PlaylistPlayerEventsEmitter mPlayerEventsEmitter;
    private SetTimeout mSetTimeout;
    MetadataBackend mMetadataBackend;

    @Inject
    public PlaylistPlayerFactory(PlaylistFactory playlistFactory, PlaylistPlayerEventsEmitter playerEventsEmitter,
                                 SetTimeout setTimeout, MetadataBackend metadataBackend) {

        mPlaylistFactory = playlistFactory;
        mPlayerEventsEmitter = playerEventsEmitter;
        mSetTimeout = setTimeout;
        mMetadataBackend = metadataBackend;
    }

    public PlaylistPlayer build(String playlistName) {
        Playlist playlist = mPlaylistFactory.buildPlaylist(playlistName);

        return new PlaylistPlayer(playlist, mPlayerEventsEmitter, mSetTimeout, mMetadataBackend);
    }
}
