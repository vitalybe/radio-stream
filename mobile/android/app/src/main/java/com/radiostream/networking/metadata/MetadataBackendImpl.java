package com.radiostream.networking.metadata;

import com.radiostream.Settings;
import com.radiostream.networking.HttpServiceFactory;
import com.radiostream.networking.models.PlaylistListResult;
import com.radiostream.networking.models.PlaylistResult;
import com.radiostream.networking.models.SongResult;

import org.jdeferred.Deferred;
import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

import javax.inject.Inject;

import hugo.weaving.DebugLog;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;
import timber.log.Timber;

@DebugLog
public class MetadataBackendImpl implements MetadataBackend {

    private Settings mSettings;

    @Inject
    public MetadataBackendImpl(Settings settings) {
        mSettings = settings;
    }

    private BackendMetadataClient getService() {
        final String address = mSettings.getAddress();
        
        return HttpServiceFactory.createService(BackendMetadataClient.class,
            address, mSettings.getUser(), mSettings.getPassword());
    }

    @Override
    public Promise<List<SongResult>, Exception, Void> fetchPlaylist(String playlistName) {
        final Deferred<List<SongResult>, Exception, Void> deferred = new DeferredObject<>();

        BackendMetadataClient client = getService();
        Call<PlaylistResult> playlistCall = client.playlist(playlistName);
        playlistCall.enqueue(new Callback<PlaylistResult>() {
            @Override
            public void onResponse(Call<PlaylistResult> call, Response<PlaylistResult> response) {
                if (response.isSuccessful()) {
                    deferred.resolve(response.body().results);
                } else {
                    deferred.reject(new IOException(String.format(Locale.ENGLISH,
                        "Playlist call failed - Returned status: %d", response.code())));
                }
            }

            @Override
            public void onFailure(Call<PlaylistResult> call, Throwable t) {
                deferred.reject(new IOException(String.format(Locale.ENGLISH,
                    "Playlist call failed - %s", t.toString())));
            }
        });

        return deferred.promise();
    }

    @Override
    public Promise<Void, Exception, Void> markAsPlayed(Integer songId) {
        Timber.i("function start for song id: %d", songId);
        final Deferred<Void, Exception, Void> deferred = new DeferredObject<>();

        BackendMetadataClient client = getService();
        Call<Void> playlistCall = client.updateLastPlayed(songId);
        playlistCall.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    Timber.i("success");
                    deferred.resolve(null);
                } else {
                    Timber.i("error");
                    deferred.reject(new IOException(String.format(Locale.ENGLISH,
                        "Playlist call failed - Returned status: %d", response.code())));
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                deferred.reject(new IOException(String.format(Locale.ENGLISH,
                    "Playlist call failed - %s", t.toString())));
            }
        });


        return deferred.promise();
    }

    @Override
    public Promise<Void, Exception, Void> updateSongRating(int songId, int newRating) {
        Timber.i("updateSongRating for song %d with new rating: %d", songId, newRating);
        final Deferred<Void, Exception, Void> deferred = new DeferredObject<>();

        BackendMetadataClient.RatingRequest body = new BackendMetadataClient.RatingRequest();
        body.newRating = newRating;

        BackendMetadataClient client = getService();
        Call<Void> playlistCall = client.updateSongRating(songId, body);
        playlistCall.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    Timber.i("success");
                    deferred.resolve(null);
                } else {
                    Timber.i("error");
                    deferred.reject(new IOException(String.format(Locale.ENGLISH,
                        "Playlist call failed - Returned status: %d", response.code())));
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                deferred.reject(new IOException(String.format(Locale.ENGLISH,
                    "Playlist call failed - %s", t.toString())));
            }
        });


        return deferred.promise();
    }

    interface BackendMetadataClient {
        @GET("api/playlists")
        Call<PlaylistListResult> allPlaylists();

        @GET("api/playlists/{playlistName}")
        Call<PlaylistResult> playlist(@Path("playlistName") String playlistName);

        @POST("api/item/{songId}/last-played")
        Call<Void> updateLastPlayed(@Path("songId") Integer songId);

        class RatingRequest {
            int newRating;
        }

        @PUT("api/item/{songId}/rating")
        Call<Void> updateSongRating(@Path("songId") Integer songId, @Body RatingRequest body);
    }
}
