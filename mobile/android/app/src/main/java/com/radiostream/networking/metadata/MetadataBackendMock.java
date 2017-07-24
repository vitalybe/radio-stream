package com.radiostream.networking.metadata;

import com.radiostream.R;
import com.radiostream.Settings;
import com.radiostream.networking.HttpServiceFactory;
import com.radiostream.networking.models.PlaylistListResult;
import com.radiostream.networking.models.PlaylistResult;
import com.radiostream.networking.models.SongResult;

import org.jdeferred.Deferred;
import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
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
class MetadataBackendMock implements MetadataBackend {

    private int lastId = 0;

    private SongResult createMockSong(String title, String artist, String album, Integer rating) {
        final SongResult songResult = new SongResult();
        songResult.id = this.lastId++;
        songResult.title = title;
        songResult.artist = artist;
        songResult.album = album;
        songResult.rating = rating;
        songResult.path = "android.resource://com.radiostream/" + R.raw.mock;

        return songResult;
    }

    @Override
    public Promise<List<SongResult>, Exception, Void> fetchPlaylist(String playlistName) {
        final Deferred<List<SongResult>, Exception, Void> deferred = new DeferredObject<>();

        final List<SongResult> songResults = new ArrayList<>(Arrays.asList(
            this.createMockSong("title", "artist", "album", 80),
            this.createMockSong("title", "artist", "album", 80)));

        deferred.resolve(songResults);

        return deferred.promise();
    }

    @Override
    public Promise<Void, Exception, Void> markAsPlayed(Integer songId) {
        Timber.i("function start for song id: %d", songId);
        final Deferred<Void, Exception, Void> deferred = new DeferredObject<>();

        deferred.resolve(null);

        return deferred.promise();
    }

    @Override
    public Promise<Void, Exception, Void> updateSongRating(int songId, int newRating) {
        Timber.i("updateSongRating for song %d with new rating: %d", songId, newRating);
        final Deferred<Void, Exception, Void> deferred = new DeferredObject<>();

        deferred.resolve(null);

        return deferred.promise();
    }
}
