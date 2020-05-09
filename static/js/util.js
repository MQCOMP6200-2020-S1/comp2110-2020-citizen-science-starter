// String manipulation exports
export { split_hash };

// Array manipulation exports
export { sortArrayDescending };

// HTTP exports
export { makeGetRequest };
export { makePostRequest };

// split_hash - given a hash path like "#!/observations/2" 
//   return an object with properties `path` ("observations") and `id` (2)
function split_hash(hash) {

    const regex = "#!/([^/]*)/?(.*)?";
    const match = hash.match(regex);
    if (match) {
        return {
            path: match[1],
            id: match[2]
        }
    } else {
        return { path: "" }
    }
}

// copied code (read 'took inspiration') from the following article
// https://flaviocopes.com/how-to-sort-array-by-date-javascript/
// @param array: array of objects with 'timestamp' key
// @returns array of objects
function sortArrayDescending(array) {
    return array.sort((a, b) => {
        return (new Date(b.timestamp) - new Date(a.timestamp))
    })
}
// creates an HTTP GET request and formats to response to a JSON object.
// @param URL: string
// @returns Promise with data
function makeGetRequest(url) {
    return fetch(url).then(response => response.json());
}
// Function encapsulates boilerplate for creating a POST request.
// code copied (read inspired) from https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// @param url: string
// @returns Promise with response data
function makePostRequest(url, data) {
    return fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        body: data // body data type must match "Content-Type" header
    }).then(response => response.json());
}
