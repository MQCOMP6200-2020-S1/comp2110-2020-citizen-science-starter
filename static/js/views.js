import {Model} from './model.js';
import {split_hash} from './util.js';

// Location polyfill for ie, ff < 21.0 and safari
if (typeof window.location.origin === 'undefined') {
  window.location.origin = window.location.protocol + '//' + window.location.host;
}

// Utility (helper) functions
let utils = {

  // Finds a handlebars template by id.
  // Populates it with the passed in data
  // Appends the generated html to div#order-page-container
  renderPageTemplate: async function (templateId, _data) {
    let data = Model.data;
    if (templateId === '#home-page-template') {
      renderHomePage(data);
    } else if (templateId === '#observations-list-view-container') {
      renderObservationList();

    } else if (templateId === '#user-list-view-container') {
      renderUserList();
    } else if (templateId === '#user-detail-view-container') {
      renderUserDetails(parseInt(_data, 10));
    } else if (templateId === '#observation-details-view-container') {
      renderObservationDetails(parseInt(_data, 10));
    } else if (templateId === '#observation-form-view-container') {
      renderObservationForm();
    }
  },

  // If a hash can not be found in routes
  // then this function gets called to show the 404 error page
  pageNotFoundError: function () {

    var data = {
      errorMessage: '404 - Page Not Found'
    };
    this.renderPageTemplate('#error-page-template', data);
  },

  // Fetch json data from the given url
  // @return promise
  fetch: function (url, data) {
    var _data = data || {};
    return $.ajax({
      context: this,
      url: window.location.origin + '/' + url,
      data: _data,
      method: 'GET',
      dataType: 'JSON'
    });
  }
};

const renderObservationForm = () => {
  $('formErrors').text('');
  const templateId = '#observation-form-view-container';
  let templateScript = $(templateId).html();
  let template = Handlebars.compile(templateScript);
  $('#page-container').empty();

  // Empty the container and append new content
  $('#page-container').append(template);

  const observationForm = $('#observation-details-form');
  observationForm.on('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const formData = observationForm.serialize();
    const values = formData.split('&');
    const data = values.reduce((dataObj, value) => {
      const keyValue = value.split('=');
      dataObj[keyValue[0]] = keyValue[1]
      return dataObj
    }, {})
    data['participant'] = 0; // todo fix, hard-coded for now
    let _formData = new FormData();
    for (let key in data) {
      _formData.append(key, data[key])
    }
    Model.add_observation(_formData);
  })


  function handler(event) {
    if (event.detail.status === 'success') {
      window.location.hash = `!/users/0`;
    } else {
      $('#formErrors').html(event.detail.errors.map(error =>
        `<div class="col-md-6 text text-danger font-weight-bold">${error}</div>`).join(''))
    }
  }

  window.addEventListener('observationAdded', handler);

}

const renderPage = (template) => {
  $('#page-container').empty();

  // Empty the container and append new content
  $('#page-container').append(template);
  // setTimeout(() => readyChartContainer(topUsers), 10)
}

const renderObservationDetails = async (observationId) => {
  const templateId = '#observation-details-view-container'
  let templateScript = $(templateId).html();
  const observation = Model.get_observation(observationId);
  let template = Handlebars.compile(templateScript)({observation: observation});
  // Empty the container and append new content
  renderPage(template);
}

const renderUserDetails = async (userId) => {
  const templateId = '#user-detail-view-container'
  let user = Model.get_user(userId);
  let userObservations = Model.get_user_observations(userId);
  let recentObservations = Handlebars.compile($('#recent-observations').html())({observations: userObservations});
  let templateScript = $(templateId).html().replace('#recent-obs', recentObservations)

  // user-list-view-container
  Handlebars.registerHelper('inc', function (value, options) {
    return parseInt(value) + 1;
  });
  let template = Handlebars.compile(templateScript)({user: user});
  renderPage(template);
}


const renderUserList = async () => {
  const templateId = '#user-list-view-container'
  // user-list-view-container
  Handlebars.registerHelper('inc', function (value, options) {
    return parseInt(value) + 1;
  });

  await Model.update_users();
  await Model.update_observations();
  const topUsers = Model.get_top_users().map(user => {
    user.name = user['last_name']
    return user
  });
  const leaderBoard = Handlebars.compile($('#leader-board-view-container').html())({users: topUsers});
  let templateScript = $(templateId).html().replace('#users', leaderBoard);
  let template = Handlebars.compile(templateScript);
  renderPage(template);
}


const renderObservationList = async () => {
  const templateId = '#observations-list-view-container';
  await Model.update_users();
  await Model.update_observations()
  const observation = JSON.parse(JSON.stringify(Model.get_observations()));
  const users = JSON.parse(JSON.stringify(Model.get_users()))
  let observationData = observation.map(observation => {
    const tempObj = JSON.parse(JSON.stringify(observation));
    tempObj.timestamp = new Date(observation.timestamp).toLocaleString();
    tempObj.participant = users.find(user => user.id === +observation.participant)['last_name'];
    return tempObj;
  });
  let recentObservations = Handlebars.compile($('#recent-observations').html())({observations: observationData});
  let templateScript = $(templateId).html().replace('#observations', recentObservations);
  let template = Handlebars.compile(templateScript);
  renderPage(template);
}


const renderHomePage = async (data) => {
  const templateId = '#home-page-template';
  let recentObservations = '';
  Handlebars.registerHelper('inc', function (value, options) {
    return parseInt(value) + 1;
  });
  const observation = JSON.parse(JSON.stringify(Model.get_recent_observations(50)))
  data.mappedData = observation.map(observation => {
    const tempObj = JSON.parse(JSON.stringify(observation));
    tempObj.timestamp = new Date(observation.timestamp).toLocaleString();
    tempObj.participant = data.users.find(user => user.id === +observation.participant)['last_name'];
    return tempObj;
  });
  recentObservations = Handlebars.compile($('#recent-observations').html())({observations: data.mappedData});
  const topUsers = Model.get_top_users(10).map(user => {
    user.name = user['last_name']
    return user
  });

  const leaderBoard = Handlebars.compile($('#leader-board-view-container').html())({users: topUsers});
  let templateScript = $(templateId).html().replace('#recent-obs', recentObservations).replace('#leader-board', leaderBoard);
  let template = Handlebars.compile(templateScript);
  renderPage(template);
}

/**
 *  Router - Handles routing and rendering for the order pages
 *
 *  Summary:
 *      - url hash changes
 *      - render function checks routes for the hash changes
 *      - function for that hash gets called and loads page content
 */

export const appInit = async () => {
  const readyState = await Promise.all([Model.update_observations(), Model.update_users()]);
  checkAndRenderRoute();

  $(window).on('hashchange', function (e) {
    checkAndRenderRoute();
  });
  return readyState;
}



const checkAndRenderRoute = () => {
  const location = split_hash(window.location.hash);
  switch (location.path) {
    case '':
      return utils.renderPageTemplate('#home-page-template');
      break;
    case 'observations':
      if (!location.id) {
        utils.renderPageTemplate('#observations-list-view-container');
      } else {
        utils.renderPageTemplate('#observation-details-view-container', location.id);
      }
      break;
    case 'users':
      if (!location.id) {
        utils.renderPageTemplate('#user-list-view-container');
      } else {

        utils.renderPageTemplate('#user-detail-view-container', location.id);
      }
      break;
    case 'submit':
      utils.renderPageTemplate('#observation-form-view-container');
      break;
    default:
      window.location.hash = ''
      break;
  }
}