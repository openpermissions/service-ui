/**
 * Copyright 2016 Open Permissions Platform Coalition
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
'use strict';

const Immutable = require('immutable'),
      Bacon = require('baconjs'),
      _ = require('lodash'),
      OfferTemplate = require('./offer-generator/template');

//Copied from page.js. Should work with history.location polyfill https://github.com/devote/HTML5-History-API
const location = ('undefined' !== typeof window) && (window.history.location || window.location);

/**
 * Get the application state from sessionStorage
 */
function getAppData () {
  if (typeof sessionStorage !== 'undefined') {
    let data = Immutable.fromJS(JSON.parse(sessionStorage.getItem('appData')));
    if (!data) {return;}

    //TODO: DO WE WANT TO GET AND STORE TEMPLATE?
    delete data.get('template');
    delete data.get('offer');


    const servicePath = ['currentOrganisation', 'services'];
    if (data.hasIn(servicePath)) {
      const services = Immutable.OrderedMap(data.getIn(servicePath).map(s => [s.get('id'), s]));
      data = data.setIn(servicePath, Immutable.fromJS(services));
    }

    const repoPath = ['currentOrganisation', 'repositories'];
    if (data.hasIn(repoPath)) {
      const repositories = Immutable.OrderedMap(data.getIn(repoPath).map(s => [s.get('id'), s]));
      data = data.setIn(repoPath, Immutable.fromJS(repositories));
    }

    return data;
  }
}

/**
 * Store the application state in sessionStorage
 */
function storeAppData (data) {
  if (typeof sessionStorage !== 'undefined') {
    const services = data.getIn(['currentOrganisation', 'services']);
    const repositories = data.getIn(['currentOrganisation', 'repositories']);
    const jsData = data.toJS();

    //TODO: DO WE WANT TO GET AND STORE TEMPLATE?
    delete jsData['template'];
    delete jsData['offer'];

    if (services) {
      jsData.currentOrganisation.services = services.toList().toJS();
    }
    if (repositories) {
      jsData.currentOrganisation.repositories = repositories.toList().toJS();
    }
    sessionStorage.setItem('appData', JSON.stringify(jsData));

  }
}

/**
 * Update the current browser location
 */
function pushState(path) {
  if (typeof history !== 'undefined') {
    history.pushState({path: path}, document.title, path);
  }
}

/**
 * Handle popstate event.
 *
 * Return either the path stored in the state or the current path
 */
function popState(event) {
  return event.state ? event.state.path : location.pathname + location.hash;
}

/**
 * Get the initial path from history.state or location.pathname
 */
function initialPath() {
  return typeof history !== 'undefined' ? popState(history) : location.pathname;
}

/**
 * Converts the query string of url to an object of query keys and values
 */
function queryUrls() {
  let tmp = [];
  const values = {};

  if (!location.search) {
    return values;
  }

  location.search
      .substr(1)
      .split('&')
      .forEach(function (item) {
        if (item) {
          tmp = item.split('=');
          values[tmp[0]] = decodeURIComponent(tmp[1]);
        }
      });
  return values;
}

/**
 * Change the current page
 *
 * @param {object} routes a mapping of paths to a page
 * @param {Immutable.Map} appData
 * @param {string} path
 */
function changePage(routes, appData, path) {
  const loggedIn = appData.get('loggedIn');
  let verified = false;
  if (appData.has('user')) {
    verified = appData.get('user').get('verified');
  }

  if (!routes.hasOwnProperty(path)) {
    path = routes.defaultPaths.login;
  }

  let page = routes[path];

  if (page.loginRequired && !loggedIn) {
    path = routes.defaultPaths.login;
    page = routes[path];
    pushState(path);
  } else if (page.onlyUnauthenticated && loggedIn) {
    if (verified) {
      path = routes.defaultPaths.loggedIn;
      page = routes[path];
      pushState(path);
    } else {
      path = routes.defaultPaths.unverified;
      page = routes[path];
      pushState(path);
    }
  } else if (page.verificationRequired && !verified) {
    path = routes.defaultPaths.unverified;
    page = routes[path];
    pushState(path);
  } else if (page.onlyUnverified && verified) {
    path = routes.defaultPaths.loggedIn;
    page = routes[path];
    pushState(path);
  }

  return appData.set('page', {component: page, path: path, queryParams: queryUrls()});
}

/**
 * Create a new object with the provided data
 *
 * @param {object} prev - the previous Property value
 * @param {object} user - a user object
 */
function authenticated(prev, user) {
  const data = {
    loggedIn: true,
    user: user,
    organisations: [],
    services: [],
    offers: [],
    repositories: [],
    users: [],
    roles: [],
    serviceTypes: [],
    currentOrganisation: {id: undefined}
  };

  return Immutable.fromJS(data);
}

/**
 * Update the array of available roles
 *
 * @param {object} prev - the previous Property value
 * @param {object} roles - an array of role objects
 */
function setRoles(prev, roles) {
  return prev.set('roles', Immutable.fromJS(roles));
}

/**
 * Update the array of available organisations
 *
 * @param {object} prev - the previous Property value
 * @param {object} orgs - an array of organisation objects
 */
function setOrgs(prev, orgs) {
  return prev.set('organisations', Immutable.fromJS(orgs));
}

/**
 * Change the current organisation
 *
 * @param {object} prev - the previous Property value
 * @param {object} org - an organisation object
 */
function selectOrg(prev, orgId) {
  let organisation = _.find(prev.get('organisations').toJS(), function(org) {
    return org.id === orgId;
  });
  if (organisation == undefined) {
    organisation = {id: undefined};
  }
  return prev.set('currentOrganisation', Immutable.fromJS(organisation));
}

/**
 * If given organisation is current organisation,
 * update current organisation.
 *
 * @param {object} prev - the previous Property value
 * @param {object} org - an organisation object
 */
function updateOrg(prev, org) {
  if (prev.get('currentOrganisation').get('id') == org['id']) {
    return prev.set('currentOrganisation', Immutable.fromJS(org));
  }
  return prev;
}

/**
 * If given organisation is current organisation,
 * clear current organisation.
 *
 * @param {object} prev - the previous Property value
 * @param {string} orgId - an organisation Id
 */
function removeOrg(prev, orgId) {
  if (prev.get('currentOrganisation').get('id') == orgId) {
    return prev.set('currentOrganisation', Immutable.fromJS({id: undefined}));
  }
  return prev;
}

/**
 * Set the list of valid services
 *
 * @param {object} prev - the previous Property value
 * @param {array} servicesTypes - an array of valid service types
 */
function setServiceTypes(prev, serviceTypes) {
  return prev.set('serviceTypes', Immutable.fromJS(serviceTypes));
}

/**
 * Set the list of services
 *
 * @param {object} prev - the previous Property value
 * @param {array} services - an array of service objects
 */
function setServices(prev, services) {
  return prev.set('services', Immutable.fromJS(services));
}

/**
 * Set the organisation services
 *
 * @param {object} prev - the previous Property value
 * @param {array} services - an array of service objects
 */
function setOrgServices(prev, services) {
  return prev.setIn(['currentOrganisation', 'services'],
                    Immutable.OrderedMap(_.map(services, service => [service.id, Immutable.fromJS(service)])));
}

/**
 * Push a new service onto the end of the services list
 *
 * @param {object} prev - the previous Property value
 * @param {object} service - a service object
 */
function addService(prev, service) {
  return prev.updateIn(['currentOrganisation', 'services'],
                       Immutable.OrderedMap(),
                       m => m.set(service.id, Immutable.fromJS(service)));
}

/**
 * Remove a service
 *
 * @param {object} prev - the previous Property value
 * @param {object} serviceId - a service object
 */
function removeService(prev, serviceId) {
  return prev.deleteIn(['currentOrganisation', 'services', serviceId]);
}

/**
 * Set a service's client secrets
 *
 * @param {object} prev - the previous Property value
 * @param {object} secrets - array of secret strings
 */
function addSecrets(prev, data) {
  const serviceId = data.serviceId;
  const secrets = data.secrets;
  return prev.setIn(['currentOrganisation', 'services', serviceId, 'secrets'],
                    Immutable.fromJS(secrets));
}

/**
 * Set all users
 *
 * @param {object} prev - the previous Property value
 * @param {object} users - an array of user objects
 */
function setUsers(prev, users) {
  return prev.set('users', Immutable.fromJS(users));

}

/**
 * If user being updated is current user,
 * update current user.
 *
 * @param {object} prev - the previous Property value
 * @param {object} user - a user object
 */
function updateUser(prev, user) {
  if (user['id'] == prev.get('user').get('id')) {
    return prev.set('user', Immutable.fromJS(user));
  }
  return prev;
}

/**
 * Set the list of repositories
 *
 * @param {object} prev - the previous Property value
 * @param {array} repositories - an array of repository objects
 */
function setRepositories(prev, repositories) {
  return prev.set('repositories', Immutable.fromJS(repositories));
}

/**
 * Get repositories for organisation
 * @param {object} prev - the previous Property value
 * @param {array} repositories - an array of repository objects
 */
function setOrgRepositories(prev, repositories) {
  return prev.setIn(
    ['currentOrganisation', 'repositories'],
    Immutable.OrderedMap(_.map(
      repositories, repository => [repository.id, Immutable.fromJS(repository)])
    )
  );
}

/**
 * Push a new repository onto the end of the repositories list
 *
 * @param {object} prev - the previous Property value
 * @param {object} repository - a repository object
 */
function addRepository(prev, repository) {
  return prev.updateIn(['currentOrganisation', 'repositories'],
                       Immutable.OrderedMap(),
                       m => m.set(repository.id, Immutable.fromJS(repository)));
}

/**
 * Remove a repository
 *
 * @param {object} prev - the previous Property value
 * @param {object} repositoryId - a repository object
 */
function removeRepository(prev, repositoryId) {
  return prev.deleteIn(['currentOrganisation', 'repositories', repositoryId]);
}

function setOffer(prev, template) {
  return prev.set('template', Immutable.fromJS(template));
}

function setOffers(prev, offers) {
  return prev.set('offers', Immutable.fromJS(offers));
}

function offerSaved(prev, offer) {
  return prev.setIn(['template', 'offerId'], Immutable.fromJS(offer['offerId']))
}

/**
 * Constructor for an object that stores application data
 *
 * The application state is stored in an Immutable Map:
 *
 * {
 *   loggedIn: bool,
 *   page: {component: object, path: str},
 *   user: {
 *     id: str
 *     email: str
 *     first_name: str,
 *     last_name: str,
 *     phone: str
 *     organisations: {
 *       org_id: {
 *         role: str,
 *         'state': str
 *       }
 *     },
 *     verified: bool
 *   }
 * }
 *
 * NOTE: the user first_name, last_name and phone might not be present if they
 * are not set on the server
 *
 * The data in the object is fetched from multiple end points, so is built
 * up as responses are received.
 *
 * @constructor
 * @param {Action} actions an instance of actions/Actions
 * @param {object} routes a mapping of paths to page components
 * @name {Store}
 * @property {Bacon.Property} app application state, property returns Immutable.Map instances
 * @property {Bacon.EventStream} errors stream of error strings
 */
function Store(actions, routes) {
  // Collect path from "navigate" actions and browser popstate events
  let path;
  if (typeof window !== 'undefined') {
    path = Bacon.mergeAll(
      actions.navigate.doAction(pushState),
      Bacon.fromEventTarget(window, 'popstate').map(popState)
    ).toProperty(initialPath());
  } else {
    path = actions.navigate.doAction(pushState).toProperty(initialPath());
  }

  // Create a Bacon.Property that updates in response to our event streams
  this.app = Bacon.update(
    getAppData() || Immutable.Map({organisations: Immutable.List(),
                                   services: Immutable.List(),
                                   offers: Immutable.List(),
                                   repositories: Immutable.List(),
                                   users: Immutable.List(),
                                   roles: Immutable.List(),
                                   serviceTypes: Immutable.List(),
                                   loggedIn: false}),
    actions.logout, () => Immutable.Map({organisations: Immutable.List(),
                                         services: Immutable.List(),
                                         offers: Immutable.List(),
                                         repositories: Immutable.List(),
                                         users: Immutable.List(),
                                         roles: Immutable.List(),
                                         serviceTypes: Immutable.List(),
                                         loggedIn: false}),
    actions.authenticated, authenticated,
    actions.loggedIn, (prev, loggedIn) => prev.set('loggedIn', loggedIn ? true : false),
    actions.users, setUsers,
    actions.updatedUser, updateUser,
    actions.roles, setRoles,
    actions.organisations, setOrgs,
    actions.selectOrganisation, selectOrg,
    actions.updatedOrganisation, updateOrg,
    actions.deletedOrganisation, removeOrg,
    actions.serviceTypes, setServiceTypes,
    actions.services, setServices,
    actions.orgServices, setOrgServices,
    actions.service, addService,
    actions.deletedService, removeService,
    actions.secrets, addSecrets,
    actions.orgRepositories, setOrgRepositories,
    actions.repository, addRepository,
    actions.repositories, setRepositories,
    actions.deletedRepository, removeRepository,
    //** OFFER GENERATOR **//
    actions.offerJSON, setOffer,
    actions.offers, setOffers,
    actions.savedOffer, offerSaved
  ).combine(path, _.partial(changePage, routes));

  this.app.onValue(storeAppData);
  this.passwordChanged = actions.passwordChanged.skipErrors();
  const passwordErrors = actions.passwordChanged.errors().mapError(
    error => error.response.status === 401 ? [{message: 'Incorrect password', field: 'current_password'}] : error.response.body.errors
  );

  // Not currently storing the error messages - assume they will be discarded
  // whenever the app renders.
  const errors = this.app.errors().mapError(function (error) {
    if (error.hasOwnProperty('response')) {
      return error.response.body.errors;
    } else {
      return [error.message];
    }
  });
  this.errors = Bacon.mergeAll(passwordErrors, errors);
}

module.exports = Store;
