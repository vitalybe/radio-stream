package com.radiostream.player;

import com.radiostream.networking.MetadataBackend;
import com.radiostream.networking.models.SongResult;

import org.jdeferred.DoneFilter;
import org.jdeferred.DonePipe;
import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;

import java.util.ArrayList;
import java.util.List;

public class Playlist {
    private String mPlaylistName;
    private MetadataBackend mMetadataBackend;
    private SongFactory mSongFactory;

    private List<Song> mSongs = new ArrayList<Song>();
    private int mIndex = -1;

    public Playlist(String playlistName, MetadataBackend metadataBackend, SongFactory songFactory) {
        mPlaylistName = playlistName;
        mMetadataBackend = metadataBackend;
        mSongFactory = songFactory;
    }

    public Promise<Void, Exception, Void> load() {
        mSongs.clear();
        mIndex = -1;

        return mMetadataBackend.fetchPlaylist(mPlaylistName).then(new DoneFilter<List<SongResult>, Void>() {
            @Override
            public Void filterDone(List<SongResult> result) {
                if(result.size() == 0) {
                    throw new RuntimeException("Empty playlists are currently unhandled");
                }

                for(SongResult songResult : result) {
                    mSongs.add(mSongFactory.build(songResult));
                }

                return null;
            }
        });
    }


    public Promise<Song, Exception, Void> nextSong() {
        return peekNextSong().then(new DoneFilter<Song, Song>() {
            @Override
            public Song filterDone(Song result) {
                mIndex++;

                return result;
            }
        });
    }

    public Promise<Song, Exception, Void> peekNextSong() {
        if(mIndex+1 < mSongs.size()) {
            DeferredObject<Song, Exception, Void> deferredObject = new DeferredObject<>();

            Song resolve = mSongs.get(mIndex + 1);
            return deferredObject.resolve(resolve).promise();
        } else {
            return load().then(new DonePipe<Void, Song, Exception, Void>() {
                @Override
                public Promise<Song, Exception, Void> pipeDone(Void result) {
                    return peekNextSong();
                }
            });
        }
    }
}
