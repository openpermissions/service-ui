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
 */
'use strict';

const Bacon = require('baconjs'),
      _ = require('lodash'),
      valuesFor = require('../util').valuesFor,
      OfferTemplate = require('./../offer-generator/template');

/**
 * Constructor for an object with instances of Bacon.Bus and Bacon.EventStream
 * used for triggering state changes in the application
 *
 * @constructor
 * @param {object} accountsClient an API client for the accounts service
 * @param {object} repositoryClient an API client for the repository service
 * @name {Action}
 * @property {Bacon.Bus} navigate path to navigate to
 * @property {Bacon.Bus} logout
 * @property {Bacon.Bus} signup -> authenticated
 * @property {Bacon.Bus} login -> authenticated
 * @property {Bacon.Bus} loggedIn
 * @property {Bacon.Bus} verify -> verified
 * @property {Bacon.Bus} updateUser -> user
 * @property {Bacon.Bus} changePassword -> passwordChanged
 * @property {Bacon.Bus} deleteUser -> logout
 * @property {Bacon.Bus} getUsers -> users
 * @property {Bacon.Bus} getRoles -> roles
 * @property {Bacon.Bus} updateUserRole -> updatedUser
 * @property {Bacon.Bus} updateJoinOrganisation -> updatedUser
 * @property {Bacon.Bus} getOrganisations -> organisations
 * @property {Bacon.Bus} selectOrganisation -> organisation & services
 * @property {Bacon.Bus} updateOrganisation -> organisation
 * @property {Bacon.Bus} createOrganisation -> organisation
 * @property {Bacon.Bus} deleteOrganisation -> deletedOrganisation
 * @property {Bacon.Bus} joinOrganisation -> user
 * @property {Bacon.Bus} leaveOrganisation -> user
 * @property {Bacon.Bus} getServices -> array of services
 * @property {Bacon.Bus} getServiceTypes -> array of service types
 * @property {Bacon.Bus} createService -> service
 * @property {Bacon.Bus} updateService -> service
 * @property {Bacon.Bus} deleteService -> deletedService
 * @property {Bacon.Bus} getSecrets -> secrets
 * @property {Bacon.Bus} addSecret -> secret
 * @property {Bacon.Bus} deleteSecret -> deletedSecret
 * @property {Bacon.Bus} deleteSecrets
 * @property {Bacon.EventStream} authenticated stream of authenticated users
 * @property {Bacon.EventStream} user stream of user objects
 * @property {Bacon.EventStream} role stream of role objects
 * @property {Bacon.EventStream} passwordChanged stream of notifications that password changed
 * @property {Bacon.EventStream} organisation stream of organisations
 * @property {Bacon.EventStream} userRoles stream of user Roles
 * @property {Bacon.EventStream} services stream of services
 * @property {Bacon.EventStream} orgServices stream of services for organisation
 * @property {Bacon.EventStream} service stream of created or updated services
 * @property {Bacon.EventStream} deletedService stream of deleted service IDs
 * @property {Bacon.Bus} getRepositories -> array of repositories
 * @property {Bacon.Bus} createRepository -> repository
 * @property {Bacon.Bus} updateRepository -> repository
 * @property {Bacon.Bus} deleteRepository -> deletedRepository
 *
 ** OFFER GENERATOR **
 * @property {Bacon.Bus} getRepoToken -> repoToken
 * @property {Bacon.Bus} newOffer -> offer
 * @property {Bacon.Bus} loadOffer -> offer
 * @property {Bacon.Bus} saveOffer -> offerJSONLD
 * @property {Bacon.Bus} updateAttribute -> offer
 * @property {Bacon.Bus} addOdrlEntity -> offer
 * @property {Bacon.Bus} removeOdrlEntity -> offer
 * @property {Bacon.Bus} updateConstraint -> offer
 */
function Actions(accountsClient, repositoryClient, authenticationClient) {
  // wrap accounts API methods with Bacon.fromPromise
  const accountsRequest = _.transform(accountsClient, (result, func, key) => {
    if (_.isFunction(func)) {
      result[key] = _.bind(_.compose(Bacon.fromPromise, func), accountsClient);
    }
  });

  // wrap repository API methods with Bacon.fromPromise
  const repositoryRequest = _.transform(repositoryClient, (result, func, key) => {
    if (_.isFunction(func)) {
      result[key] = _.bind(_.compose(Bacon.fromPromise, func), repositoryClient);
    }
  });

  // wrap authentication API methods with Bacon.fromPromise
  const authenticationRequest = _.transform(authenticationClient, (result, func, key) => {
    if (_.isFunction(func)) {
      result[key] = _.bind(_.compose(Bacon.fromPromise, func), authenticationClient);
    }
  });

  // Bacon.Bus instances that the views can use to send data
  _.each([
    'navigate',
    'logout',
    'login',
    'loggedIn',
    'signup',
    'verify',
    'updateUser',
    'changePassword',
    'deleteUser',
    'getUsers',
    'getRoles',
    'updateUserRole',
    'getOrganisations',
    'updateOrganisation',
    'selectOrganisation',
    'createOrganisation',
    'deleteOrganisation',
    'joinOrganisation',
    'updateJoinOrganisation',
    'leaveOrganisation',
    'getServices',
    'getServiceTypes',
    'createService',
    'updateService',
    'deleteService',
    'deleteRepository',
    'getSecrets',
    'addSecret',
    'deleteSecret',
    'deleteSecrets',
    'getRepositories',
    'updateRepository',
    'createRepository',
    'deleteRepository',
    //** OFFER GENERATOR **//
    'getRepoToken',
    'getOffers',
    'newOffer',
    'loadOffer',
    'saveOffer',
    'updateAttribute',
    'addOdrlEntity',
    'removeOdrlEntity',
    'updateConstraint'
  ], (a) => this[a] = new Bacon.Bus(), this);

  // Bacon.EventStreams that transform data from the buses

  // this.signup -> a new user
  const newUser = this.signup
                    .map(valuesFor(['email', 'password', 'hasAgreedToTerms', 'firstName', 'lastName']))
                    .flatMapLatest(args => accountsRequest.createUser(...args).map(args));

  // this.login + new users -> a user object
  this.authenticated = this.login.map(valuesFor(['email', 'password']))
                           .merge(newUser)
                           .flatMapLatest(args => accountsRequest.login(...args))
                           .map('.body.data')
                           .map(data => {
                             sessionStorage.setItem('token', data.token);
                             return data.user;
                           });

  this.loggedIn.onValue(token => accountsClient.token = token);

  this.verified = this.verify.map(valuesFor(['userId', 'verificationHash']))
                      .flatMapLatest(args => accountsRequest.verify(...args))
                      .map('.body.data.verified');

  // updateUser -> updated user object
  const user = this.updateUser
                 .map(valuesFor(['userId', 'email', 'firstName', 'lastName']))
                 .flatMapLatest(args => accountsRequest.updateUser(...args))
                 .map('.body.data');

  // this.joinOrganisation -> updated user object
  const updateUserJoinOrg = this.joinOrganisation
                              .map(valuesFor(['organisationId', 'userId']))
                              .flatMapLatest(args => accountsRequest.joinOrganisation(...args))
                              .map('.body.data');

  // this.leaveOrganisation -> updated user object
  const updateUserLeaveOrg = this.leaveOrganisation
                               .map(valuesFor(['userId', 'orgId']))
                               .flatMapLatest(args => accountsRequest.leaveOrganisation(...args))
                               .map('.body.data');

  //this.updateUserRole -> updated user object
  const updateUserRoles = this.updateUserRole
                             .map(valuesFor(['userId', 'role', 'organisationId']))
                             .flatMapConcat(args => accountsRequest.updateUserRole(...args))
                             .map('.body.data');

  // this.updateJoinOrganisation -> updated user object
  const updateUserOrgState = this.updateJoinOrganisation
                                .map(valuesFor(['organisationId', 'userId', 'state']))
                                .flatMapLatest(args => accountsRequest.updateJoinOrganisation(...args))
                                .map('.body.data');

  this.updatedUser = Bacon.mergeAll(user, updateUserJoinOrg, updateUserLeaveOrg,
                                    updateUserRoles, updateUserOrgState);

  // changePassword -> notification that password changed
  this.passwordChanged = this.changePassword
                             .map(valuesFor(['userId', 'oldPassword', 'newPassword']))
                             .flatMapLatest(args => accountsRequest.changePassword(...args))
                             .map(true);

  const deletedUser = this.deleteUser.flatMapLatest(args => accountsRequest.deleteUser(args.userId));

  this.logout.plug(deletedUser);
  this.logout.onValue(() => {
    accountsClient.token = null;
    sessionStorage.removeItem('token');
  });

  //this.getUsers -> a list of user objects
  this.users = this.getUsers
                   .merge(this.updatedUser)
                   .flatMapLatest(accountsRequest.getUsers)
                   .map('.body.data');

  //this.getRoles -> a list of role objects
  this.roles = this.getRoles
                   .flatMapLatest(accountsRequest.getRoles)
                   .map('.body.data');

  // this.createOrganisation -> a new organisation connected to the user
  const newOrganisation = this.createOrganisation
                            .flatMapLatest(accountsRequest.createOrganisation)
                            .map('.body.data');

  // this.updateOrganisation -> the updated organisation
  this.updatedOrganisation = this.updateOrganisation
                                 .flatMapLatest(args => accountsRequest.updateOrganisation(
                                   args.organisationId,
                                   _.omit(args, ['organisationId'])))
                                 .map('.body.data');

  this.deletedOrganisation = this.deleteOrganisation
                                .flatMapLatest(args => {
                                  return accountsRequest.deleteOrganisation(args.organisationId)
                                    .map(args.organisationId);
                                });

  // this.getOrganisations -> a list of available organisations
  this.organisations = this.getOrganisations
                           .merge(newOrganisation)
                           .merge(this.updatedOrganisation)
                           .merge(this.deletedOrganisation)
                           .flatMapLatest(accountsRequest.getOrganisations)
                           .map('.body.data');

  // an existing organisation -> the organisation's services
  this.orgServices = this.selectOrganisation
                      .flatMapLatest(orgId => orgId ? accountsRequest.getServices(orgId) : {body:{data:undefined}})
                      .map('.body.data');

  // this.getServiceTypes -> array of valid service types
  this.serviceTypes = this.getServiceTypes
                         .flatMapLatest(() => accountsRequest.getServiceTypes())
                         .map('.body.data');

  // this.createService -> a service
  const newService = this.createService.map(valuesFor(['name', 'location', 'serviceType', 'orgId']))
                        .flatMapLatest(args => accountsRequest.createService(...args))
                        .map('.body.data');

  const updatedService = this.updateService
                           .map(valuesFor(['serviceId', 'name', 'location', 'serviceType', 'permissions', 'state']))
                           .flatMapLatest(args => {
                             return accountsRequest.updateService(...args)
                               .map('.body.data');
                           });

  this.service = Bacon.mergeAll(newService, updatedService);

  // this.deleteService -> deleted service ID
  this.deletedService = this.deleteService
                            .flatMapLatest(args => {
                              return accountsRequest.deleteService(args.serviceId)
                                .map(args.serviceId);
                            });

  // this.getServices -> array of existing services
  this.services = this.getServices
                    .merge(this.deletedService)
                    .merge(this.service)
                    .flatMapLatest(() => accountsRequest.getServices())
                    .map('.body.data');

  //this.addSecret -> a service client secret
  const newSecret = this.addSecret
                            .flatMapLatest(args => {
                              return accountsRequest.addSecret(args.serviceId)
                                .map(args);
                            });

  //this.deleteSecret -> deleted secret
  const deletedSecret = this.deleteSecret
                               .flatMapLatest(args => {
                                 return accountsRequest.deleteSecret(args.serviceId, args.secret)
                                   .map(args);
                               });

    //this.deleteSecrets -> confirmation
  const secretsDeleted = this.deleteSecrets
                               .flatMapLatest(args => {
                                 return accountsRequest.deleteSecrets(args.serviceId)
                                   .map(args);
                               });

  // this.getSecrets -> an object containing service ID & secrets
  this.secrets = this.getSecrets
                          .merge(newSecret)
                          .merge(deletedSecret)
                          .merge(secretsDeleted)
                          .flatMapLatest(args => {
                            return accountsRequest.getSecrets(args.serviceId)
                              .map('.body.data')
                              .map(secrets => {
                                return {
                                  'serviceId': args.serviceId, 'secrets': secrets
                                };
                              });
                          });

  this.orgRepositories = this.selectOrganisation
                          .flatMapLatest(orgId => orgId ? accountsRequest.getRepositories(orgId) : {body:{data:undefined}})
                          .map('.body.data');

 // this.createRepository -> a new repository
  const newRepository = this.createRepository.map(valuesFor(['organisationId', 'name', 'serviceId']))
                        .flatMapLatest(args => accountsRequest.createRepository(...args))
                        .map('.body.data');

  //this.updateRepository -> an updated repository
  const updatedRepository = this.updateRepository
                           .map(valuesFor(['repositoryId', 'name', 'permissions', 'state']))
                           .flatMapLatest(args => {
                             return accountsRequest.updateRepository(...args)
                               .map('.body.data');
                           });

  this.repository = Bacon.mergeAll(newRepository, updatedRepository);

  // this.deleteRepository -> deleted repository ID
  this.deletedRepository = this.deleteRepository
                            .flatMapLatest(args => {
                              return accountsRequest.deleteRepository(args.repositoryId)
                                .map(args.repositoryId);
                            });

  // this.getRepositories -> array of existing repositories
  this.repositories = this.getRepositories
                    .merge(this.deletedRepository)
                    .merge(this.repository)
                    .flatMapLatest(() => accountsRequest.getRepositories())
                    .map('.body.data');


  //** OFFER GENERATOR **//
  this.getRepoToken
       .flatMapLatest(args => {
          return accountsRequest.getSecrets(args.serviceId)
            .map('.body.data')
            .map(secrets => {
              return {scope: args.scope, clientId: args.serviceId, clientSecret: secrets[0]}
            });
        })
       .flatMapLatest(args => authenticationRequest.getToken(args.clientId, args.clientSecret, args.scope))
       .map('.body.access_token')
       .onValue(token => repositoryClient.token = token);

  const newOffer = this.newOffer
                       .map(args => {this.template = new OfferTemplate()})
                       .map(() => this.template.toJS());

  const loadOffer = this.loadOffer
                        .flatMapLatest(args => repositoryRequest.getOffer(args.repositoryId, args.offerId))
                        .map('.body.data')
                        .flatMapLatest(args => {
                          this.template = new OfferTemplate();
                          return Bacon.fromPromise(this.template.loadOffer(args))
                        })
                        .map(() => this.template.toJS());

  const updatedOffer = this.updateAttribute
                           .map(valuesFor(['type', 'key', 'value']))
                           .map(args => this.template.updateAttribute(...args))
                           .map(args => this.template.toJS());

  const addedRule = this.addOdrlEntity
                        .map(valuesFor(['parent', 'type', 'key', 'id']))
                        .map(args => this.template.addEntity(...args))
                        .map(() => this.template.toJS());

  const removedRule = this.removeOdrlEntity
                          .map(valuesFor(['parent', 'key', 'id']))
                          .map(args => this.template.removeEntity(...args))
                          .map(() => this.template.toJS());

  const updatedConstraint = this.updateConstraint
                                .map(valuesFor(['id', 'key', 'type', 'value']))
                                .map(args => this.template.updateConstraint(...args))
                                .map(() => this.template.toJS());


  this.offerJSON = Bacon.mergeAll(newOffer, loadOffer, updatedOffer, addedRule, removedRule, updatedConstraint);

  this.savedOffer = this.saveOffer
                         .map( args => { args.offer = this.template.constructOffer(); return args})
                         .flatMapLatest(args => {
                             return repositoryRequest.saveOffer(args.repositoryId, args.offer)
                               .map('.body.data')
                               .map(offer => {
                                return {
                                  'repositoryId': args.repositoryId, 'offerId': offer['id']
                                };
                              });
                           });

  this.offers = this.getOffers
                  .merge(this.savedOffer)
                  .flatMapLatest(args => args ? repositoryRequest.getOffers(args.repositoryId): {body: {data:{offers:[]}}})
                  .map('.body.data.offers');
}

module.exports = Actions;
