package com.radiostream.player;

import javax.inject.Inject;

/**
 * Created by vitaly on 17/11/2016.
 */

public class PlaylistFactory {

    @Inject
    public PlaylistFactory() {

    }

    public Playlist buildPlaylist(String playlistName) {
        return new Playlist(playlistName);
    }
}
