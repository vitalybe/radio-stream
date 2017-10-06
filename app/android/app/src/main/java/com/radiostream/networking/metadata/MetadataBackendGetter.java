package com.radiostream.networking.metadata;

import com.radiostream.Settings;

import javax.inject.Inject;

public class MetadataBackendGetter {

    private final Settings mSettings;
    private MetadataBackend real = null;
    private MetadataBackend mock = null;

    @Inject
    public MetadataBackendGetter(Settings settings) {
        mSettings = settings;
        real = new MetadataBackendImpl(mSettings);
        mock = new MetadataBackendMock();
    }

    public MetadataBackend get() {
        if(mSettings.getMockMode()) {
            return mock;
        } else {
            return real;
        }
    }

}
