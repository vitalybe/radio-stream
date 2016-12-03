package com.radiostream.player;

import com.facebook.react.bridge.Arguments;
import com.radiostream.networking.MetadataBackend;
import com.radiostream.networking.models.SongResult;

import org.jdeferred.DoneCallback;
import org.jdeferred.Promise;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.junit.MockitoJUnit;
import org.mockito.junit.MockitoRule;
import org.mockito.stubbing.Answer;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static com.radiostream.player.Utils.resolvedPromise;
import static org.junit.Assert.*;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(PowerMockRunner.class)
@PrepareForTest({Arguments.class, android.util.Log.class})
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
        Utils.initTestLogging();
        Utils.mockAndroidStatics();

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

        when(mockSongFactory.build((SongResult)any())).thenAnswer(new Answer<Song>() {
            @Override
            public Song answer(InvocationOnMock invocation) throws Throwable {
                SongResult songResult = (SongResult)invocation.getArguments()[0];

                Song mockSong = mock(Song.class);
                when(mockSong.getTitle()).thenReturn(songResult.title);

                return mockSong;
            }
        });
    }

    @Test
    public void nextSong_movesToNextSong() throws Exception {
        Playlist playlist = new Playlist(mPlaylistName, mockMetadataBackend, mockSongFactory);
        playlist.peekCurrentSong().then(new DoneCallback<Song>() {
            @Override
            public void onDone(Song result) {
                assertEquals(result.getTitle(), mockLoadedSongs1_Song1.title);
            }
        });

        playlist.nextSong();
        playlist.peekCurrentSong().then(new DoneCallback<Song>() {
            @Override
            public void onDone(Song result) {
                assertEquals(result.getTitle(), mockLoadedSongs1_Song2.title);
            }
        });
    }

    @Test
    public void peekCurrentSong_reloadsPlaylistIfFinished() throws Exception {
        Playlist playlist = new Playlist(mPlaylistName, mockMetadataBackend, mockSongFactory);
        playlist.peekCurrentSong().then(new DoneCallback<Song>() {
            @Override
            public void onDone(Song result) {
                assertEquals(result.getTitle(), mockLoadedSongs1_Song1.title);
            }
        });
        playlist.nextSong();

        playlist.peekCurrentSong();
        playlist.nextSong();

        playlist.peekCurrentSong().then(new DoneCallback<Song>() {
            @Override
            public void onDone(Song result) {
                assertEquals(result.getTitle(), mockLoadedSongs2_Song1.title);
            }
        });
        verify(mockMetadataBackend, times(2)).fetchPlaylist(mPlaylistName);
    }

    @Test
    public void peekNextSong_returnsNextSong() throws Exception {
        Playlist playlist = new Playlist(mPlaylistName, mockMetadataBackend, mockSongFactory);
        playlist.peekNextSong().then(new DoneCallback<Song>() {
            @Override
            public void onDone(Song result) {
                assertEquals(mockLoadedSongs1_Song2.title, result.getTitle());
            }
        });

        playlist.peekNextSong().then(new DoneCallback<Song>() {
            @Override
            public void onDone(Song result) {
                assertEquals(mockLoadedSongs1_Song2.title, result.getTitle());
            }
        });

        verify(mockMetadataBackend, times(1)).fetchPlaylist(mPlaylistName);
    }

}