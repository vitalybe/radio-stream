package com.radiostream.networking;

import com.radiostream.networking.models.PlaylistsResult;

import org.jdeferred.Deferred;
import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;

import java.io.IOException;
import java.util.Locale;

import hugo.weaving.DebugLog;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.http.GET;

@DebugLog
public class MetadataBackend {

    // TOOD: baseUrl, user, pass from injected Settings class
    String baseUrl = "***REMOVED***/5f707e4f-97cc-438e-90d8-1e5e35bd558a/";
    String user = "radio";
    String pass = "myman";

    public Promise<PlaylistsResult, Exception, Void> fetchPlaylists() throws IOException {
        final Deferred<PlaylistsResult, Exception, Void> deferred = new DeferredObject<>();

        BackendMetadataClient client = HttpServiceFactory.createService(BackendMetadataClient.class, baseUrl, user, pass);
        Call<PlaylistsResult> playlistsCall = client.playlists();
        playlistsCall.enqueue(new Callback<PlaylistsResult>() {
            @Override
            public void onResponse(Call<PlaylistsResult> call, Response<PlaylistsResult> response) {
                if (response.isSuccessful()) {
                    deferred.resolve(response.body());
                    return;
                } else {
                    deferred.reject(new IOException(String.format(Locale.ENGLISH,
                        "Playlist call failed - Returned status: %d", response.code())));
                }
            }

            @Override
            public void onFailure(Call<PlaylistsResult> call, Throwable t) {
                deferred.reject(new IOException(String.format(Locale.ENGLISH,
                    "Playlist call failed - %s", t.toString())));
            }
        });

        return deferred.promise();
    }

    interface BackendMetadataClient {
        @GET("api/playlists")
        Call<PlaylistsResult> playlists();
    }
}
