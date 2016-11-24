package com.radiostream.player;

import com.radiostream.networking.models.SongResult;

import javax.inject.Inject;

public class SongFactory {

    @Inject
    public SongFactory() {

    }

    public Song build(SongResult songResult) {
        return new Song(songResult);
    }
}
