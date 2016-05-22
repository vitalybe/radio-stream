package com.vitalyb.android_music_stream;

import android.content.Context;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.ProgressBar;

import com.vitalyb.android_music_stream.backend.MusicBackend;
import com.vitalyb.android_music_stream.backend.MusicBackendImpl;

import java.util.List;

import butterknife.ButterKnife;
import butterknife.InjectView;

public class PlaylistsFragment extends Fragment {

    @InjectView(R.id.list_playlists)
    ListView listPlaylists;
    @InjectView(R.id.progress_playlists)
    ProgressBar progressPlaylists;

    private OnPlaylistSelectedListener mListener;
    private MusicBackend mMusicService;

    public PlaylistsFragment() {
        // Required empty public constructor
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_playlists, container, false);
        ButterKnife.inject(this, view);

        listPlaylists.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                onListPlaylistsItemClick(position);
            }
        });

        mMusicService = new MusicBackendImpl(getActivity());
        mMusicService.FetchPlaylists(new MusicBackend.OnResultListener<List<String>>() {
            @Override
            public void OnResult(List<String> playlists) {
                ArrayAdapter<String> playlistsAdapter = new ArrayAdapter<>(getActivity(),
                        android.R.layout.simple_list_item_1, playlists);

                progressPlaylists.setVisibility(View.GONE);
                listPlaylists.setAdapter(playlistsAdapter);
            }
        });


        return view;
    }

    private void onListPlaylistsItemClick(int position) {
        String selectedPlaylist = (String) listPlaylists.getItemAtPosition(position);
        if (mListener != null) {
            mListener.onPlaylistSelected(selectedPlaylist);
        }
    }

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        if (context instanceof OnPlaylistSelectedListener) {
            mListener = (OnPlaylistSelectedListener) context;
        } else {
            throw new RuntimeException(context.toString() + " must implement OnPlaylistSelectedListener");
        }
    }

    @Override
    public void onDetach() {
        super.onDetach();
        mListener = null;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        ButterKnife.reset(this);
    }

    public interface OnPlaylistSelectedListener {
        void onPlaylistSelected(String playlist);
    }
}
