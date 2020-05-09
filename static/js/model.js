// Exports
export { Model };

// Imports
import { sortArrayDescending, makeGetRequest, makePostRequest } from './util.js';

import { constants } from './constants.js';

/* 
 * Model class to support the Citizen Science application
 * this class provides an interface to the web API and a local
 * store of data that the application can refer to.
 * The API generates two different events:
 *   "modelChanged" event when new data has been retrieved from the API
 *   "observationAdded" event when a request to add a new observation returns
*/

const Model = {

  observations_url: '/api/observations',
  users_url: '/api/users',
  // this will hold the data stored in the model
  data: {
    observations: [
      // {
      //     "id": number,
      //     "participant": number, user id of submitter
      //     "timestamp": string, format: "2020-04-05T01:11:52.659941"
      //     "temperature": number,
      //     "weather": string, enum
      //     "wind": string, enum
      //     "location": string,
      //     "height": number,
      //     "girth": number,
      //     "leaf_size": string,
      //     "leaf_shape": string,
      //     "bark_colour": string,
      //     "bark_texture": string
      // }

    ],
    users: [
      // {
      //     "id": number,
      //     "first_name": string,
      //     "last_name": string,
      //     "email": string,
      //     "avatar": string
      // }
    ]
  },

  // update_users - retrieve the latest list of users
  //    from the server API
  // when the request is resolved, creates a "modelUpdated" event
  // with the model as the event detail
  // @param userId: string (optional)
  // @returns Promise with response data
  update_users: function (userId = '') {
    // Ideally I would have renamed this function to fetchUsers.
    //  The requirements state to keep the file structure.
    const requestUrl = userId ? `${this.users_url}/${userId}` : this.users_url;
    makeGetRequest(requestUrl).then((result) => {
      this.data.users = result;
      const modelUpdatedEvent = new CustomEvent(constants.events.modelUpdated, { detail: this });
      window.dispatchEvent(modelUpdatedEvent);
    }).catch((err) => {
      console.error('An error occurred fetching:', requestUrl);
      console.error(err);
    });
  },

  // update_observations - retrieve the latest list of observations
  //   from the server API
  // when the request is resolved, creates a "modelUpdated" event
  // with the model as the event detail
  // @param observationId: string (optional)
  // @returns Promise with response data
  update_observations: function (observationId = '') {
    // Ideally I would have renamed this function to fetchObservations.
    //  The requirements state to keep the file structure.
    const requestUrl = observationId ? `${this.observations_url}/${observationId}` : this.observations_url;
    makeGetRequest(requestUrl).then((result) => {
      this.data.observations = result;
      const modelUpdatedEvent = new CustomEvent(constants.events.modelUpdated, { detail: this });
      window.dispatchEvent(modelUpdatedEvent);
    }).catch((err) => {
      console.error('An error occurred fetching:', requestUrl);
      console.error(err);
    });
  },

  // get_observations - return an array of observation objects
  get_observations: function () {
    return this.data.observations;
  },

  // get_observation - return a single observation given its id
  get_observation: function (observationid) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
    this.data.observations.find(observation => observation.id === observationid);
  },

  set_observations: function (observations) {
    this.data.observations = observations;
  },

  // add_observation - add a new observation by submitting a request
  //   to the server API
  //   formdata is a FormData object containing all fields in the observation object
  // when the request is resolved, creates an "observationAdded" event
  //  with the response from the server as the detail
  add_observation: function (formdata) {
    const body = formdata;
    makePostRequest(this.observations_url, body)
      .then((result) => {
        if(result.status === 'success') {
          const observationAddedEvent = new CustomEvent(constants.events.observationAdded, { detail: result });
          window.dispatchEvent(observationAddedEvent);
          this.set_observations([...this.data.observations, JSON.parse(result["obersvation"])])
        } else {
          const observationAddedEvent = new CustomEvent(constants.events.observationAdded, { detail: result });
          window.dispatchEvent(observationAddedEvent);
        }
      }).catch((err) => {
        console.error('Error creating new observation', err);
      });

  },

  // get_user_observations - return just the observations for
  //   one user as an array
  get_user_observations: function (userid) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
    return sortArrayDescending(this.data.observations.filter(observation => observation.participant === userid))
  },

  // get_recent_observations - return the N most recent
  //  observations, ordered by timestamp, most recent first
  // @param N: number, number of returned entries.
  // @returns array of objects
  get_recent_observations: function (N) {
    return sortArrayDescending((this.data.observations)
      .slice(0, N)); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
  },

  /*
  * Users
  */
  // get_users - return the array of users
  get_users: function () {
    return this.data.users;
  },

  // set_users - set the array of users
  set_users: function (users) {
    this.data.users = users;
  },

  // get_user - return the details of a single user given
  //    the user id
  get_user: function (userid) {
    return this.data.users.find(user => user.id === userid) || null;
  }

};
