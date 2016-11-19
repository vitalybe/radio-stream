package com.radiostream.player;

import javax.inject.Inject;

/**
 * Created by vitaly on 17/11/2016.
 */

public class PlaylistPlayerFactory {

    private PlaylistFactory mPlaylistFactory;

    @Inject
    public PlaylistPlayerFactory(PlaylistFactory playlistFactory) {
        mPlaylistFactory = playlistFactory;
    }

    public PlaylistPlayer build(String playlistName) {
        Playlist playlist = mPlaylistFactory.buildPlaylist(playlistName);

        return new PlaylistPlayer(playlist);
    }
}
