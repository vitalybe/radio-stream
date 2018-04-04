package com.radiostream.networking.metadata

import com.radiostream.Settings
import com.radiostream.networking.HttpServiceFactory
import com.radiostream.networking.models.PlaylistListResult
import com.radiostream.networking.models.PlaylistResult
import com.radiostream.networking.models.SongResult

import java.io.IOException
import java.util.Locale

import javax.inject.Inject

import hugo.weaving.DebugLog
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import timber.log.Timber
import kotlin.coroutines.experimental.suspendCoroutine

@DebugLog
internal class MetadataBackendImpl @Inject
constructor(private val mSettings: Settings) : MetadataBackend {

    private val service: BackendMetadataClient
        get() {
            val address = mSettings.address

            return HttpServiceFactory.createService(BackendMetadataClient::class.java,
                    address, mSettings.user, mSettings.password)
        }

    override suspend fun fetchPlaylist(playlistName: String): List<SongResult>  = suspendCoroutine { cont ->
        val client = service
        Timber.i("fetchings songs for playlist: " + playlistName)
        val playlistCall = client.playlist(playlistName)
        playlistCall.enqueue(object : Callback<PlaylistResult> {
            override fun onResponse(call: Call<PlaylistResult>, response: Response<PlaylistResult>) {
                if (response.isSuccessful) {
                    Timber.i("success")
                    cont.resume(response.body().results)
                } else {
                    Timber.i("failed")
                    cont.resumeWithException(IOException(String.format(Locale.ENGLISH,
                            "Playlist call failed - Returned status: %d", response.code())))
                }
            }

            override fun onFailure(call: Call<PlaylistResult>, t: Throwable) {
                cont.resumeWithException(IOException(String.format(Locale.ENGLISH,
                        "Playlist call failed - %s", t.toString())))
            }
        })
    }

    override suspend fun markAsPlayed(songId: Int?): Unit = suspendCoroutine { cont ->
        Timber.i("function start for song id: %d", songId)

        val client = service
        val playlistCall = client.updateLastPlayed(songId)
        playlistCall.enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Timber.i("success")
                    cont.resume(Unit)
                } else {
                    Timber.i("error")
                    cont.resumeWithException(IOException(String.format(Locale.ENGLISH,
                            "Playlist call failed - Returned status: %d", response.code())))
                }
            }

            override fun onFailure(call: Call<Void>, t: Throwable) {
                cont.resumeWithException(IOException(String.format(Locale.ENGLISH,
                        "Playlist call failed - %s", t.toString())))
            }
        })
    }

    override suspend fun updateSongRating(songId: Int, newRating: Int): Unit = suspendCoroutine { cont ->
        Timber.i("updateSongRating for song %d with new rating: %d", songId, newRating)

        val body = BackendMetadataClient.RatingRequest()
        body.newRating = newRating

        val client = service
        val playlistCall = client.updateSongRating(songId, body)
        playlistCall.enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Timber.i("success")
                    cont.resume(Unit)
                } else {
                    Timber.i("error")
                    cont.resumeWithException(IOException(String.format(Locale.ENGLISH,
                            "Playlist call failed - Returned status: %d", response.code())))
                }
            }

            override fun onFailure(call: Call<Void>, t: Throwable) {
                cont.resumeWithException(IOException(String.format(Locale.ENGLISH,
                        "Playlist call failed - %s", t.toString())))
            }
        })
    }

    internal interface BackendMetadataClient {
        @GET("api/playlists")
        fun allPlaylists(): Call<PlaylistListResult>

        @GET("api/playlists/{playlistName}")
        fun playlist(@Path("playlistName") playlistName: String): Call<PlaylistResult>

        @POST("api/item/{songId}/last-played")
        fun updateLastPlayed(@Path("songId") songId: Int?): Call<Void>

        class RatingRequest {
            internal var newRating: Int = 0
        }

        @PUT("api/item/{songId}/rating")
        fun updateSongRating(@Path("songId") songId: Int?, @Body body: RatingRequest): Call<Void>
    }
}
