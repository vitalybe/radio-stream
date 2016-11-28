package com.radiostream.player;

import com.radiostream.javascript.bridge.PlayerEventsEmitter;

import javax.inject.Inject;

/**
 * Created by vitaly on 17/11/2016.
 */

public class PlaylistPlayerFactory {

    private PlaylistFactory mPlaylistFactory;
    private PlayerEventsEmitter mPlayerEventsEmitter;

    @Inject
    public PlaylistPlayerFactory(PlaylistFactory playlistFactory, PlayerEventsEmitter playerEventsEmitter) {

        mPlaylistFactory = playlistFactory;
        mPlayerEventsEmitter = playerEventsEmitter;
    }

    public PlaylistPlayer build(String playlistName) {
        Playlist playlist = mPlaylistFactory.buildPlaylist(playlistName);

        return new PlaylistPlayer(playlist, mPlayerEventsEmitter);
    }
}
