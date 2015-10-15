import fetch from 'isomorphic-fetch'

export const INCREMENT = 'INCREMENT';
export const FETCH_NEXT_SONG_DETAILS_ASYNC = 'FETCH_NEXT_SONG_DETAILS_ASYNC';

const SERVER_ADDRESS = "http://localhost:5000";

export function fetchNextSongDetails(playlistName) {
    return function (dispatch) {
        dispatch({type: FETCH_NEXT_SONG_DETAILS_ASYNC, inProgress: true});

        let fullUrl = SERVER_ADDRESS + "/playlist/" + playlistName + "/next";
        return fetch(fullUrl)
            .then(response => response.json().then(json => ({json, response})))
            .then(({ json, response }) => {
                dispatch({type: FETCH_NEXT_SONG_DETAILS_ASYNC, ok: response.ok, json })
            })
            .catch((ex) => {
                dispatch({type: FETCH_NEXT_SONG_DETAILS_ASYNC, ok: false, json: {error: "Connection error"} })
            });
    }
}