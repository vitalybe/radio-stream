package com.radiostream.networking.metadata

import com.radiostream.networking.models.PlaylistListResult
import com.radiostream.networking.models.SongResult

import org.jdeferred.Promise

import java.io.IOException

/**
 * Created by vitaly on 23/07/2017.
 */

interface MetadataBackend {
    suspend fun fetchPlaylist(playlistName: String): List<SongResult>

    suspend fun markAsPlayed(songId: Int?)

    suspend fun updateSongRating(songId: Int, newRating: Int)
}
