
export function login(password) {

    return backendMetadataApi.authenticate(password).
    then(response => response.json().then(json => json))

}
