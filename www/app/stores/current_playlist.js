import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action } from "mobx";

import { Song } from "./song"
import * as backendMetadataApi from '../utils/backend_metadata_api'

export class CurrentPlaylist {
    @observable name = null;
    songs = [];
    currentIndex = -1;

    constructor(name) {
        this.name = name;
    }

    _loadSongs() {
        return new Promise(function (resolve) {
            if (this.songs.length > 0 && this.currentIndex + 1 < this.songs.length) {
                // playlist songs already loaded
                resolve();
            } else {
                return backendMetadataApi.playlistSongs().then(songsData => {
                    this.songs = songsData.map(songData => new Song(songData))
                });
            }
        });
    };

    nextSong() {
        return this.peekNextSong().then((song) => {
            this.currentIndex++;

            return song;
        })
    }

    peekNextSong() {
        this._loadSongs()
            .then(() => {
                return this.songs[this.currentIndex]
            })
    }
}
