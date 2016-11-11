package com.radiostream.networking;

import com.radiostream.networking.models.PlaylistsResult;

import java.io.IOException;
import java.util.Locale;

import hugo.weaving.DebugLog;
import retrofit2.Call;
import retrofit2.http.GET;

@DebugLog
public class MetadataBackend {

    interface BackendMetadataClient {
        @GET("api/playlists")
        Call<PlaylistsResult> playlists();
    }

    public PlaylistsResult fetchPlaylists() throws IOException {
        // TOOD: baseUrl, user, pass from injected Settings class
        String baseUrl = "***REMOVED***/5f707e4f-97cc-438e-90d8-1e5e35bd558a/";
        String user = "radio";
        String pass = "myman";

        BackendMetadataClient client = HttpServiceFactory.createService(BackendMetadataClient.class, baseUrl, user, pass);
        retrofit2.Response<PlaylistsResult> response = client.playlists().execute();
        if(response.isSuccessful()) {
            return response.body();
        } else {
            throw new IOException(String.format(Locale.ENGLISH,
                    "Playlist call failed - Returned status: %d", response.code()));
        }
    }
}
