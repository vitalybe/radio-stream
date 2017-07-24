package com.radiostream.di.modules;

import com.facebook.react.bridge.ReactContext;
import com.radiostream.BuildConfig;
import com.radiostream.Settings;
import com.radiostream.networking.metadata.MetadataBackend;
import com.radiostream.networking.metadata.MetadataBackendImpl;
import com.radiostream.networking.metadata.MetadataBackendMock;

import dagger.Module;
import dagger.Provides;

@Module
public class MetadataBackendModule {
    @Provides
    MetadataBackend provideReactContext(Settings settings) {
        if (Boolean.parseBoolean(BuildConfig.MOCK_MODE)) {
            return new MetadataBackendMock();
        } else {
            return new MetadataBackendImpl(settings);
        }

    }
}
