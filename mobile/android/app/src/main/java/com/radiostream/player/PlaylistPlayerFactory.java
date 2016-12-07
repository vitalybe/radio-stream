package com.radiostream.player;

import com.radiostream.javascript.bridge.PlayerEventsEmitter;
import com.radiostream.util.SetTimeout;

import javax.inject.Inject;

/**
 * Created by vitaly on 17/11/2016.
 */

public class PlaylistPlayerFactory {

    private PlaylistFactory mPlaylistFactory;
    private PlayerEventsEmitter mPlayerEventsEmitter;
    private SetTimeout mSetTimeout;

    @Inject
    public PlaylistPlayerFactory(PlaylistFactory playlistFactory, PlayerEventsEmitter playerEventsEmitter, SetTimeout setTimeout) {

        mPlaylistFactory = playlistFactory;
        mPlayerEventsEmitter = playerEventsEmitter;
        mSetTimeout = setTimeout;
    }

    public PlaylistPlayer build(String playlistName) {
        Playlist playlist = mPlaylistFactory.buildPlaylist(playlistName);

        return new PlaylistPlayer(playlist, mPlayerEventsEmitter, mSetTimeout);
    }
}
