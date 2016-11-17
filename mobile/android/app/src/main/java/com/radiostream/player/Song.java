package com.radiostream.player;

import org.jdeferred.Promise;

/**
 * Created by vitaly on 15/11/2016.
 */
public class Song {

    private EventsListener mEventsListener;

    public void subscribeToEvents(EventsListener eventsListener) {

        mEventsListener = eventsListener;
    }

    public void play() {
    }

    public void pause() {
    }

    public void close() {
    }

    public Promise<Song,Exception,Void> preload() {
        return null;
    }

    public interface EventsListener {
        void onSongFinish(Song song);
    }
}
