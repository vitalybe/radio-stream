package com.vitalyb.android_music_stream.backend;

import android.app.Activity;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.vitalyb.android_music_stream.Consts;
import com.vitalyb.android_music_stream.SongModel;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by vitaly on 15/03/2016.
 */
public class MusicBackendImpl implements MusicBackend {

    RequestQueue mRequestQueue;
    private Context mContext;

    public MusicBackendImpl(Context context) {
        mContext = context;
        mRequestQueue = Volley.newRequestQueue(context);
    }


    @Override
    public void FetchPlaylists(final OnResultListener<List<String>> listener) {
        String url = Consts.URL_API + "/playlists";
        StringRequest stringRequest = new StringRequest(Request.Method.GET, url,
                new Response.Listener<String>() {
                    @Override
                    public void onResponse(String json) {
                        try {
                            JSONArray playlistsArray = new JSONObject(json).getJSONArray("playlists");

                            List<String> playlists = new ArrayList<>();
                            for (int i = 0; i < playlistsArray.length(); i++) {
                                playlists.add(playlistsArray.getString(i));
                            }

                            listener.OnResult(new ArrayList<String>(playlists));
                        } catch (Exception e) {
                            throw new RuntimeException(e);
                        }
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        throw new RuntimeException(error);
                    }
                });

        mRequestQueue.add(stringRequest);
    }

    @Override
    public void FetchPlaylistSongs(String playlistName, final OnResultListener<List<SongModel>> listener) {
        String url = Consts.URL_API + "/playlists/" + playlistName;
        StringRequest stringRequest = new StringRequest(Request.Method.GET, url,
                new Response.Listener<String>() {
                    @Override
                    public void onResponse(String json) {
                        try {
                            JSONArray playlistTracksJson = null;
                            playlistTracksJson = new JSONObject(json).getJSONArray("results");

                            List<SongModel> songs = new ArrayList<>();
                            for (int i = 0; i < playlistTracksJson.length(); i++) {
                                SongModel song = new SongModel(playlistTracksJson.getJSONObject(i));
                                songs.add(song);
                            }

                            listener.OnResult(songs);
                        } catch (Exception e) {
                            throw new RuntimeException(e);
                        }
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        throw new RuntimeException(error);
                    }
                });

        mRequestQueue.add(stringRequest);
    }

    @Override
    public void MarkAsPlayed(SongModel song) {
        String url = Consts.URL_API + "/item/" + song.getId() + "/last-played";
        StringRequest stringRequest = new StringRequest(Request.Method.POST, url,
                new Response.Listener<String>() {
                    @Override
                    public void onResponse(String json) {
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        throw new RuntimeException(error);
                    }
                });

        mRequestQueue.add(stringRequest);
    }

    @Override
    public void fetchArt(String artist, final OnResultListener<Bitmap> listener) {
        // TODO: Creds
        try {
            String encodedArtist = URLEncoder.encode(artist, "UTF-8");
            String url = "http://ws.audioscrobbler.com/2.0/?artist="+encodedArtist+"&autocorrect=1&method=artist.getInfo&api_key=9e46560f972eb8300c78c0fc837d1c13&format=json";

            StringRequest stringRequest = new StringRequest(Request.Method.POST, url,
                    new Response.Listener<String>() {
                        @Override
                        public void onResponse(String jsonString) {
                            try {
                                JSONObject jsonObject = new JSONObject(jsonString);
                                JSONObject value = jsonObject.getJSONObject("artist");
                                final String artistArtUrl = value.getJSONArray("image").getJSONObject(3).getString("#text");

                                new Thread() {
                                    @Override
                                    public void run() {
                                        try {
                                            InputStream in = new java.net.URL(artistArtUrl).openStream();
                                            final Bitmap bitmap = BitmapFactory.decodeStream(in);

                                            ((Activity)mContext).runOnUiThread(new Runnable() {
                                                @Override
                                                public void run() {
                                                    listener.OnResult(bitmap);
                                                }
                                            });

                                        } catch (IOException e) {
                                            e.printStackTrace();
                                        }
                                    }
                                }.start();

                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    },
                    new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            error.printStackTrace();
                        }
                    });

            mRequestQueue.add(stringRequest);

        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
    }
}
