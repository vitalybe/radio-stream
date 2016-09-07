import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action } from "mobx";

import { Song } from "./song"
import * as backendMetadataApi from '../utils/backend_metadata_api'

export class CurrentPlaylist {
    @observable name = null;
    songs = [];
    currentIndex = 0;

    constructor(name) {
        this.name = name;
    }

    _reloadSongsIfNeeded() {
        let logger = loggerCreator(this._reloadSongsIfNeeded.name, moduleLogger);
        logger.info("start");

        return new Promise((resolve) => {
            logger.info(`songs length: ${this.songs.length}. Current index: ${this.currentIndex}`);
            if (this.songs.length > 0 && this.currentIndex < this.songs.length) {
                // playlist songs already loaded
                logger.info(`not reloading songs`);
                resolve();
            } else {
                logger.info(`reloading songs`);
                return backendMetadataApi.playlistSongs().then(songsData => {
                    logger.info(`loaded songs: ${songsData.length}`);
                    this.songs = songsData.map(songData => new Song(songData));
                    this.currentIndex = 0;

                    resolve();
                });
            }
        });
    };

    nextSong() {
        let logger = loggerCreator(this.nextSong.name, moduleLogger);
        logger.info("start");

        return this.peekNextSong().then((song) => {
            this.currentIndex++;
            logger.info(`new index: ${this.currentIndex}`);

            return song;
        })
    }

    peekNextSong() {
        let logger = loggerCreator(this.peekNextSong.name, moduleLogger);
        logger.info(`start`);

        return this._reloadSongsIfNeeded()
            .then(() => {
                logger.info(`returning song by index: ${this.currentIndex}`);
                let song = this.songs[this.currentIndex];
                logger.info(`returning song: ${song}`);

                return song;
            })
    }
}
