 package com.radiostream.player;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.radiostream.networking.metadata.MetadataBackendGetter;
import com.radiostream.ui.PlayerNotification;
import com.radiostream.util.SetTimeout;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import static com.radiostream.player.Utils.resolvedPromise;
import static org.mockito.Matchers.anyInt;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(PowerMockRunner.class)
@PrepareForTest({Arguments.class, android.util.Log.class})
public class PlaylistPlayerTest {

    @Mock
    Song mockFirstSong;

    @Mock
    Song mockSecondSong;

    @Mock
    Playlist mockPlaylist;

    @Mock
    PlaylistFactory mockPlaylistFactory;

    @Mock
    MetadataBackendGetter mockMetadataBackendGetter;

    @Mock
    SetTimeout mockSetTimeout;

    @Mock
    StatusProvider mockStatusProvider;

    @Mock
    PlayerNotification mockPlayerNotifcation;


    @Before
    public void setUp() throws Exception {
        Utils.initTestLogging();
        Utils.mockAndroidStatics();

        final WritableMap dummyFirstSongBridge = Arguments.createMap();
        dummyFirstSongBridge.putString("title", "mockFirstSong");
        when(mockFirstSong.toBridgeObject()).thenReturn(dummyFirstSongBridge);

        final WritableMap dummySecondSongBridge = Arguments.createMap();
        dummyFirstSongBridge.putString("title", "mockSecondSong");
        when(mockSecondSong.toBridgeObject()).thenReturn(dummySecondSongBridge);

        when(mockFirstSong.preload()).thenReturn(resolvedPromise(mockFirstSong));
        when(mockSecondSong.preload()).thenReturn(resolvedPromise(mockSecondSong));
        when(mockFirstSong.waitForMarkedAsPlayed()).thenReturn(resolvedPromise(true));
        when(mockSecondSong.waitForMarkedAsPlayed()).thenReturn(resolvedPromise(true));

        when(mockPlaylist.peekCurrentSong())
            .thenReturn(resolvedPromise(mockFirstSong));

        when(mockPlaylist.peekNextSong())
            .thenReturn(resolvedPromise(mockSecondSong));

        when(mockPlaylist.isCurrentSong(mockFirstSong)).thenReturn(true);

        final WritableMap dummyPlaylistBridge = Arguments.createMap();
        dummyFirstSongBridge.putString("name", "x");
        when(mockPlaylist.toBridgeObject()).thenReturn(dummyPlaylistBridge);
    }

    @Test
    public void play_playSongIfSongAvailable() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist, mockSetTimeout, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation);
        playlistPlayer.play();

        verify(mockPlaylist, atLeastOnce()).peekCurrentSong();
        verify(mockFirstSong, atLeastOnce()).play();

        playlistPlayer.play();
        verify(mockFirstSong, Mockito.times(1)).preload();

    }

    @Test
    public void playNext_playingSecondSong() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist, mockSetTimeout, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation);
        playlistPlayer.playNext();

        verify(mockPlaylist, times(1)).nextSong();
        verify(mockFirstSong, times(1)).play();
    }

    @Test
    public void playNext_playFirstSong() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist, mockSetTimeout, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation);
        playlistPlayer.playNext();

        verify(mockFirstSong, times(1)).play();
    }

    @Test(expected=IllegalStateException.class)
    public void pause_throwsExceptionIfNoSong() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist, mockSetTimeout, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation);
        playlistPlayer.pause();
    }

    @Test
    public void close_closesPlaylist() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist, mockSetTimeout, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation);
        playlistPlayer.close();
    }

    @Test
    public void close_closesSongIfExists() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist, mockSetTimeout, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation);
        playlistPlayer.play();
        playlistPlayer.close();

        verify(mockFirstSong, times(1)).close();
    }

    @Test
    public void playNext_retriesOnFailure() throws Exception {
        when(mockFirstSong.preload())
            .thenReturn(Utils.<Song>rejectedPromise(new Exception()))
            .thenReturn(Utils.resolvedPromise(mockFirstSong));

        when(mockSetTimeout.run(anyInt())).thenReturn(resolvedPromise((Void)null));

        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist, mockSetTimeout, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation);
        playlistPlayer.play();

        // song will be loaded if preloading the first one failed
        verify(mockFirstSong, times(1)).play();
    }
}