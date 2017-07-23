package com.radiostream.di.modules;

import com.facebook.react.bridge.ReactContext;
import com.radiostream.Settings;
import com.radiostream.networking.metadata.MetadataBackend;
import com.radiostream.networking.metadata.MetadataBackendImpl;
import com.radiostream.networking.metadata.MetadataBackendMock;

import dagger.Module;
import dagger.Provides;

@Module
public class MetadataBackendModule {

    private MetadataBackend mMetadataBackend;

    public MetadataBackendModule(Settings settings) {
        // mMetadataBackend = new MetadataBackendImpl(settings);
        mMetadataBackend = new MetadataBackendMock();
    }

    @Provides
    MetadataBackend provideReactContext() {
        return mMetadataBackend;
    }
}
