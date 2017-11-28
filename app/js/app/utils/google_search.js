import google from "google";

class GoogleSearch {
  async firstHref(query) {
    return new Promise((resolve, reject) => {
      google(query, function(err, res) {
        if (err) {
          reject(err);
        }

        if (res.links.length) {
          resolve(res.links[0].href);
        } else {
          resolve(null);
        }
      });
    });
  }
}

export const googleSearch = new GoogleSearch();
