package com.radiostream.networking.metadata;

import com.radiostream.networking.models.PlaylistListResult;
import com.radiostream.networking.models.SongResult;

import org.jdeferred.Promise;

import java.io.IOException;
import java.util.List;

/**
 * Created by vitaly on 23/07/2017.
 */

public interface MetadataBackend {
    Promise<List<SongResult>, Exception, Void> fetchPlaylist(String playlistName);

    Promise<Void, Exception, Void> markAsPlayed(Integer songId);

    Promise<Void, Exception, Void> updateSongRating(int songId, int newRating);
}
