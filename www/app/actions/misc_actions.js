import * as backendMetadataApi from '../utils/backend_metadata_api'

export function login(password) {

    return backendMetadataApi.authenticate(password).
    then(response => response.json().then(json => json))

}
