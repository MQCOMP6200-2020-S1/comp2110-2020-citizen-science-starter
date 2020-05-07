export { split_hash };
export { sortArrayDescending };


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
function sortArrayDescending(array) {
    return array.sort((a, b) => {
        return (new Date(b.timestamp) - new Date(a.timestamp))
    })
} 
