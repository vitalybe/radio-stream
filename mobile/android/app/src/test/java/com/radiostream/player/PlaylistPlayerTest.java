package com.radiostream.player;

import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;
import org.junit.Rule;
import org.junit.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnit;
import org.mockito.junit.MockitoRule;
import org.mockito.stubbing.VoidAnswer1;

import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Created by vitaly on 17/11/2016.
 */
public class PlaylistPlayerTest {

    @Mock
    PlaylistFactory mockPlaylistFactory;

    @Rule
    public MockitoRule mockitoRule = MockitoJUnit.rule();

    public <D> Promise<D, Exception, Void> resolvedPromise(D result) {
        return new DeferredObject<D, Exception, Void>().resolve(result).promise();
    }

    @Test
    public void playPlaylist() throws Exception {
        Song mockSong = mock(Song.class);
        when(mockSong.preload()).thenReturn(resolvedPromise(mockSong));

        Playlist mockPlaylist = mock(Playlist.class);
        when(mockPlaylist.load()).thenReturn(new DeferredObject<Void, Exception, Void>().resolve(null).promise());
        when(mockPlaylist.nextSong()).thenReturn(resolvedPromise(mockSong));
        when(mockPlaylist.peekSong()).thenReturn(resolvedPromise(mockSong)); // a new song mock

        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist);
        playlistPlayer.play();

        verify(mockSong, times(1)).play();
    }

    @Test
    public void play() throws Exception {

    }

    @Test
    public void pause() throws Exception {

    }

    @Test
    public void nextSong() throws Exception {

    }

    @Test
    public void close() throws Exception {

    }

}