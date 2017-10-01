package com.radiostream.player

import android.util.Log
import com.radiostream.Settings
import com.radiostream.networking.HttpServiceFactory
import com.radiostream.networking.metadata.MetadataBackend
import com.radiostream.networking.models.PlaylistListResult
import com.radiostream.networking.models.PlaylistResult
import com.radiostream.networking.models.SongResult
import hugo.weaving.DebugLog
import timber.log.Timber
import kotlinx.coroutines.experimental.*
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.http.*
import java.io.IOException
import java.util.*
import javax.inject.Inject
import kotlin.coroutines.experimental.suspendCoroutine

/**
 * Created by vitaly on 29/09/2017.
 */
class Player2 @Inject constructor(private val settings: Settings) {

    private val metadataBackend = MetadataBackendImpl(settings)

    fun test() {
        Timber.i("I am kotlin!")

        launch(CommonPool) {
            Timber.i("delaying for a while...")
            delay(1000)
            Timber.i("I was delayed!")
            Timber.i("waiting for playlist details...")
            val results = metadataBackend.fetchPlaylist("Peaceful")
            Timber.i("got results: ${results.size}")
        }
    }

}

@DebugLog
internal class MetadataBackendImpl @Inject constructor(private val mSettings: Settings) {

    private val service: BackendMetadataClient
        get() {
            val address = mSettings.address

            return HttpServiceFactory.createService(BackendMetadataClient::class.java,
                    address, mSettings.user, mSettings.password)
        }

    suspend fun fetchPlaylist(playlistName: String): List<SongResult> = suspendCoroutine { cont ->

        val client = service
        Timber.i("fetchings songs for playlist: " + playlistName)
        val playlistCall = client.playlist(playlistName)
        playlistCall.enqueue(object : Callback<PlaylistResult> {
            override fun onResponse(call: Call<PlaylistResult>, response: Response<PlaylistResult>) {
                if (response.isSuccessful) {
                    Timber.i("success")
                    cont.resume(response.body().results)
                } else {
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

//    override fun markAsPlayed(songId: Int?): Promise<Void, Exception, Void> {
//        Timber.i("function start for song id: %d", songId)
//        val deferred = DeferredObject<Void, Exception, Void>()
//
//        val client = service
//        val playlistCall = client.updateLastPlayed(songId)
//        playlistCall.enqueue(object : Callback<Void> {
//            override fun onResponse(call: Call<Void>, response: Response<Void>) {
//                if (response.isSuccessful) {
//                    Timber.i("success")
//                    deferred.resolve(null)
//                } else {
//                    Timber.i("error")
//                    deferred.reject(IOException(String.format(Locale.ENGLISH,
//                            "Playlist call failed - Returned status: %d", response.code())))
//                }
//            }
//
//            override fun onFailure(call: Call<Void>, t: Throwable) {
//                deferred.reject(IOException(String.format(Locale.ENGLISH,
//                        "Playlist call failed - %s", t.toString())))
//            }
//        })
//
//
//        return deferred.promise()
//    }
//
//    override fun updateSongRating(songId: Int, newRating: Int): Promise<Void, Exception, Void> {
//        Timber.i("updateSongRating for song %d with new rating: %d", songId, newRating)
//        val deferred = DeferredObject<Void, Exception, Void>()
//
//        val body = BackendMetadataClient.RatingRequest()
//        body.newRating = newRating
//
//        val client = service
//        val playlistCall = client.updateSongRating(songId, body)
//        playlistCall.enqueue(object : Callback<Void> {
//            override fun onResponse(call: Call<Void>, response: Response<Void>) {
//                if (response.isSuccessful) {
//                    Timber.i("success")
//                    deferred.resolve(null)
//                } else {
//                    Timber.i("error")
//                    deferred.reject(IOException(String.format(Locale.ENGLISH,
//                            "Playlist call failed - Returned status: %d", response.code())))
//                }
//            }
//
//            override fun onFailure(call: Call<Void>, t: Throwable) {
//                deferred.reject(IOException(String.format(Locale.ENGLISH,
//                        "Playlist call failed - %s", t.toString())))
//            }
//        })
//
//
//        return deferred.promise()
//    }
//
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