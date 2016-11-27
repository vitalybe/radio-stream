package com.radiostream.player;

import com.radiostream.BuildConfig;
import com.radiostream.networking.MetadataBackend;
import com.radiostream.networking.models.SongResult;

import org.jdeferred.DoneCallback;
import org.jdeferred.Promise;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentMatcher;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.junit.MockitoJUnit;
import org.mockito.junit.MockitoRule;
import org.mockito.stubbing.Answer;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;
import org.robolectric.shadows.ShadowLog;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import timber.log.Timber;

import static com.radiostream.player.Utils.resolvedPromise;
import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(RobolectricTestRunner.class)
@Config(constants = BuildConfig.class)
public class PlaylistTest {

    private final String mPlaylistName = "X";

    @Rule
    public MockitoRule mockitoRule = MockitoJUnit.rule();
    @Mock
    MetadataBackend mockMetadataBackend;
    @Mock
    SongFactory mockSongFactory;
    @Mock
    SongResult mockLoadedSongs1_Song1;
    @Mock
    SongResult mockLoadedSongs1_Song2;
    @Mock
    SongResult mockLoadedSongs2_Song1;
    @Mock
    SongResult mockLoadedSongs2_Song2;

    @Before
    public void setUp() throws Exception {
        ShadowLog.stream = System.out;

        mockLoadedSongs1_Song1.title = "mockLoadedSongs1_Song1";
        mockLoadedSongs1_Song2.title = "mockLoadedSongs1_Song2";
        mockLoadedSongs2_Song1.title = "mockLoadedSongs2_Song1";
        mockLoadedSongs2_Song2.title = "mockLoadedSongs2_Song2";

        List<SongResult> songResults = new ArrayList<>(Arrays.asList(mockLoadedSongs1_Song1, mockLoadedSongs1_Song2));
        Promise<List<SongResult>, Exception, Void> loadedSongs1Promise = resolvedPromise(songResults);

        songResults = new ArrayList<>(Arrays.asList(mockLoadedSongs2_Song1, mockLoadedSongs2_Song2));
        Promise<List<SongResult>, Exception, Void> loadedSongs2Promise = resolvedPromise(songResults);

        when(mockMetadataBackend.fetchPlaylist(anyString()))
            .thenReturn(loadedSongs1Promise).thenReturn(loadedSongs2Promise);

        when(mockSongFactory.build((SongResult) ArgumentMatchers.any())).thenAnswer(new Answer<Song>() {
            @Override
            public Song answer(InvocationOnMock invocation) throws Throwable {
                SongResult songResult = invocation.getArgument(0);

                Song mockSong = mock(Song.class);
                when(mockSong.getTitle()).thenReturn(songResult.title);

                return mockSong;
            }
        });
    }

    @Test
    public void nextSong_returnsNextSong() throws Exception {
        Playlist playlist = new Playlist(mPlaylistName, mockMetadataBackend, mockSongFactory);
        playlist.nextSong().then(new DoneCallback<Song>() {
            @Override
            public void onDone(Song result) {
                assertEquals(result.getTitle(), mockLoadedSongs1_Song1.title);
            }
        });

        playlist.nextSong().then(new DoneCallback<Song>() {
            @Override
            public void onDone(Song result) {
                assertEquals(result.getTitle(), mockLoadedSongs1_Song2.title);
            }
        });
    }

    @Test
    public void nextSong_reloadsPlaylistIfFinished() throws Exception {
        Playlist playlist = new Playlist(mPlaylistName, mockMetadataBackend, mockSongFactory);
        playlist.nextSong().then(new DoneCallback<Song>() {
            @Override
            public void onDone(Song result) {
                assertEquals(result.getTitle(), mockLoadedSongs1_Song1.title);
            }
        });

        playlist.nextSong();
        playlist.nextSong();
        playlist.nextSong().then(new DoneCallback<Song>() {
            @Override
            public void onDone(Song result) {
                assertEquals(result.getTitle(), mockLoadedSongs2_Song2.title);
            }
        });
        verify(mockMetadataBackend, times(2)).fetchPlaylist(mPlaylistName);
    }

    @Test
    public void reload_reloadsPlaylistIfFinished() throws Exception {
        Playlist playlist = new Playlist(mPlaylistName, mockMetadataBackend, mockSongFactory);
        playlist.nextSong().then(new DoneCallback<Song>() {
            @Override
            public void onDone(Song result) {
                assertEquals(result.getTitle(), mockLoadedSongs1_Song1.title);
            }
        });

        playlist.nextSong();
        playlist.nextSong();
        playlist.nextSong().then(new DoneCallback<Song>() {
            @Override
            public void onDone(Song result) {
                assertEquals(result.getTitle(), mockLoadedSongs2_Song2.title);
            }
        });
        verify(mockMetadataBackend, times(2)).fetchPlaylist(mPlaylistName);
    }

    @Test
    public void peekNextSong_previewsNextSong() throws Exception {
        Playlist playlist = new Playlist(mPlaylistName, mockMetadataBackend, mockSongFactory);
        playlist.peekNextSong().then(new DoneCallback<Song>() {
            @Override
            public void onDone(Song result) {
                assertEquals(result.getTitle(), mockLoadedSongs1_Song1.title);
            }
        });

        playlist.peekNextSong().then(new DoneCallback<Song>() {
            @Override
            public void onDone(Song result) {
                assertEquals(result.getTitle(), mockLoadedSongs1_Song1.title);
            }
        });

        verify(mockMetadataBackend, times(1)).fetchPlaylist(mPlaylistName);
    }

}