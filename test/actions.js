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
/*global describe, it, before, beforeEach, after, afterEach*/
/*jshint -W030 */

var should = require('should'),
    mockApi = require('./api'),
    Actions = require('../scripts/src/actions/actions');

var actions = new Actions(mockApi.api);

describe('actions', function () {
  describe('logout', function () {
    var result;
    var dispose;

    before(function () {
      dispose = actions.logout.onValue(v => result = v);
      actions.logout.push('test');
    });

    after(function () {
      dispose();
      mockApi.reset();
    });

    it('should be passed through untouched', function () {
      result.should.equal('test');
    });
  });

  describe('login', function () {
    var result;
    var dispose;

    before(function () {
      dispose = actions.authenticated.onValue(v => result = v);
      // MUT
      actions.login.push({email: 'user@example.com', password: 'password'});
    });

    after(function () {
      dispose();
      mockApi.reset();
    });

    it('should trigger a login API request', function () {
      mockApi.api.login.calledOnce.should.be.true;
      mockApi.api.login.calledWith('user@example.com', 'password').should.be.true;
    });

    it('should pass the user to the "authenticated" event stream', function () {
      result.should.eql({id: 'user id'});
    });
  });

  describe('verify', function () {
    var result;
    var dispose;

    before(function () {
      dispose = actions.verified.onValue(v => result = v);
      // MUT
      actions.verify.push({userId: 'user1', verificationHash: '12345'});
    });

    after(function () {
      dispose();
      mockApi.reset();
    });

    it('should trigger a verify API request', function () {
      mockApi.api.verify.calledOnce.should.be.true;
      mockApi.api.verify.calledWith('user1', '12345').should.be.true;
    });

    it('should pass the verified boolean to the "verified" event stream', function () {
      result.should.eql(true);
    });
  });
  describe('signup', function () {
    var result;
    var dispose;

    before(function () {
      dispose = actions.authenticated.onValue(v => result = v);
      // MUT
      actions.signup.push({
        'email': 'user@example.com',
        'password': 'password',
        'firstName': 'test',
        'lastName': 'user',
        'hasAgreedToTerms': true
      });
    });

    after(function () {
      dispose();
      mockApi.reset();
    });

    it('should trigger a createUser API request', function () {
      mockApi.api.createUser.calledOnce.should.be.true;
      var args = ['user@example.com', 'password', true, 'test', 'user'];
      mockApi.api.createUser.calledWith(...args).should.be.true;
    });

    it('should trigger a login API request', function () {
      mockApi.api.login.calledOnce.should.be.true;
      mockApi.api.login.calledWith('user@example.com', 'password').should.be.true;
    });

    it('should pass the user to the "authenticated" event stream', function () {
      result.should.eql({id: 'user id'});
    });
  });

  describe('updateUser', function () {
    var users, result;
    var dispose, disposeUpdatedUser;

    before(function () {
      disposeUpdatedUser = actions.updatedUser.onValue(v => result = v);
      dispose = actions.users.onValue(v => users = v);
      // MUT
      actions.updateUser.push({
        userId: 'user1',
        email: 'user@example.com',
        firstName: 'test',
        lastName: 'user'
      });
    });

    after(function () {
      dispose();
      disposeUpdatedUser();
      mockApi.reset();
    });

    it('should trigger a updateUser API request', function () {
      mockApi.api.updateUser.calledOnce.should.be.true;
      var args = ['user1', 'user@example.com', 'test', 'user'];
      mockApi.api.updateUser.calledWith(...args).should.be.true;
    });

    it('should pass the updated user to the updatedUser event stream', function () {
      result.should.eql({id: 'user_id', email: 'user@example.com', first_name: 'test', last_name: 'user'});
    });

    it('should make a getUsers api request', function () {
      mockApi.api.getUsers.calledOnce.should.be.true;
    });

    it('should pass the users to the users event stream', function () {
      users.should.eql([{"first_name": "Harry",
                     "last_name": "Porter",
                     "email": "harry@example.com",
                     "id": "174018a615105866d01fa495540007da",
                     "organisations": {"global": {"role": "user", "state": "approved"}}}]);
    });
  });

  describe('deleteUser', function () {
    var result;
    var dispose;

    before(function () {
      dispose = actions.logout.onValue(v => result = v);;
      // MUT
      actions.deleteUser.push({
        userId: 'user1'
      });
    });

    after(function () {
      dispose();
      mockApi.reset();
    });

    it('should trigger a deleteUser API request', function () {
      mockApi.api.deleteUser.calledOnce.should.be.true;
      mockApi.api.deleteUser.calledWith('user1').should.be.true;
    });
  });

  describe('getUsers without parameter', function () {
    var users, disposeUsers;

    before(function () {
      disposeUsers = actions.users.onValue(v => users = v);
      //MUT
      actions.getUsers.push();
    });

    after(function () {
      disposeUsers();
      mockApi.reset();
    });

    it('should make a getUsers api request', function () {
      mockApi.api.getUsers.calledOnce.should.be.true;
    });

    it('should pass the users to the users event stream', function () {
      users.should.eql([{"first_name": "Harry",
                     "last_name": "Porter",
                     "email": "harry@example.com",
                     "id": "174018a615105866d01fa495540007da",
                     "organisations": {"global": {"role": "user", "state": "approved"}}}]);
    });
  });

  describe('getUsers with organisation id', function () {
    var users, disposeUsers;

    before(function () {
      disposeUsers = actions.users.onValue(v => users = v);
      //MUT
      actions.getUsers.push('org_id');
    });

    after(function () {
      disposeUsers();
      mockApi.reset();
    });

    it('should make a getUsers api request', function () {
      mockApi.api.getUsers.calledOnce.should.be.true;
      mockApi.api.getUsers.calledWith('org_id').should.be.true;
    });

    it('should pass the users to the users event stream', function () {
      users.should.eql([{"first_name": "Harry",
                     "last_name": "Porter",
                     "email": "harry@example.com",
                     "id": "174018a615105866d01fa495540007da",
                     "organisations": {"global": {"role": "user", "state": "approved"}}}]);
    });
  });

  describe('getRoles', function () {
    var roles, disposeRoles;

    before(function () {
      disposeRoles = actions.roles.onValue(v => roles = v);
      //MUT
      actions.getRoles.push();
    });

    after(function () {
      disposeRoles();
      mockApi.reset();
    });

    it('should make a getRoles api request', function () {
      mockApi.api.getRoles.calledOnce.should.be.true;
    });

    it('should pass the roles to the roles event stsream', function () {
      roles.should.eql([{"id": "001",
                         "name": "role1"},
                        {"id": "002",
                         "name": "role2"}
                          ]);
    });
  });

  describe('updateUserRole with organisation', function () {
    var users, result;
    var dispose, disposeUpdatedUser;

    before(function () {
      disposeUpdatedUser = actions.updatedUser.onValue(v => result = v);
      dispose = actions.users.onValue(v => users = v);
      // MUT
      actions.updateUserRole.push({
        userId: 'user1',
        organisationId: 'org1',
        roleId: 'role1'
      });
    });

    after(function () {
      dispose();
      disposeUpdatedUser();
      mockApi.reset();
    });

    it('should trigger a updateUserRole API request', function () {
      mockApi.api.updateUserRole.calledOnce.should.be.true;
      var args = ['user1', 'role1', 'org1'];
      mockApi.api.updateUserRole.calledWith(...args).should.be.true;
    });

    it('should pass the updatedUser to the "updatedUser" event stream', function () {
      result.should.eql({"first_name": "Test",
                         "last_name": "User",
                         "email": "test@example.com",
                         "id": "67890",
                         "organisations": {"global": {"role": "user", "state": "approved"},
                                           "test": {"role": "user", "state": "approved"}}});
    });

    it('should make a getUsers api request', function () {
      mockApi.api.getUsers.calledOnce.should.be.true;
    });

    it('should pass the users to the users event stream', function () {
      users.should.eql([{"first_name": "Harry",
                     "last_name": "Porter",
                     "email": "harry@example.com",
                     "id": "174018a615105866d01fa495540007da",
                     "organisations": {"global": {"role": "user", "state": "approved"}}}]);
    });
  });

  describe('updateUserRole without organisation', function () {
    var users, result;
    var dispose, disposeUpdatedUser;

    before(function () {
      disposeUpdatedUser = actions.updatedUser.onValue(v => result = v);
      dispose = actions.users.onValue(v => users = v);
      // MUT
      actions.updateUserRole.push({
        userId: 'user1',
        organisationId: null,
        roleId: 'role1'
      });
    });

    after(function () {
      dispose();
      disposeUpdatedUser();
      mockApi.reset();
    });

    it('should trigger a updateUserRole API request', function () {
      mockApi.api.updateUserRole.calledOnce.should.be.true;
      var args = ['user1', 'role1', null];
      mockApi.api.updateUserRole.calledWith(...args).should.be.true;
    });

    it('should pass the updated user to the "updatedUser" event stream', function () {
      result.should.eql({"first_name": "Test",
                         "last_name": "User",
                         "email": "test@example.com",
                         "id": "67890",
                         "organisations": {"global": {"role": "user", "state": "approved"},
                                           "test": {"role": "user", "state": "approved"}}});
    });

    it('should make a getUsers api request', function () {
      mockApi.api.getUsers.calledOnce.should.be.true;
    });

    it('should pass the users to the users event stream', function () {
      users.should.eql([{"first_name": "Harry",
                     "last_name": "Porter",
                     "email": "harry@example.com",
                     "id": "174018a615105866d01fa495540007da",
                     "organisations": {"global": {"role": "user", "state": "approved"}}}]);
    });
  });

  describe('updateJoinOrganisation', function () {
    var users, result;
    var dispose, disposeUpdatedUser;

    before(function () {
      disposeUpdatedUser = actions.updatedUser.onValue(v => result = v);
      dispose = actions.users.onValue(v => users = v);
      // MUT
      actions.updateJoinOrganisation.push({
        userId: 'user1',
        organisationId: 'org1',
        joinState: 'approved'
      });
    });

    after(function () {
      dispose();
      disposeUpdatedUser();
      mockApi.reset();
    });

    it ('should trigger an updateJoinOrganisation API request', function () {
      mockApi.api.updateJoinOrganisation.calledOnce.should.be.true;
      var args = ['org1', 'user1', 'approved'];
      mockApi.api.updateJoinOrganisation.calledWith(...args).should.be.true;
    });

    it('should pass the updated user to the "updatedUser" event stream', function () {
      result.should.eql({"first_name": "Test",
                         "last_name": "User",
                         "email": "test@example.com",
                         "id": "67890",
                         "organisations": {"global": {"role": "user", "state": "approved"},
                                           "org1": {"role": "user", "state": "approved"}}})
    });

    it('should make a getUsers api request', function () {
      mockApi.api.getUsers.calledOnce.should.be.true;
    });

    it('should pass the users to the users event stream', function () {
      users.should.eql([{"first_name": "Harry",
                     "last_name": "Porter",
                     "email": "harry@example.com",
                     "id": "174018a615105866d01fa495540007da",
                     "organisations": {"global": {"role": "user", "state": "approved"}}}]);
    });
  });

  describe('selectOrganisation', function () {
    var organisation, orgServices, orgRepositories,
        disposeOrgRepositories, disposeOrganisation, disposeOrgServices;

    before(function () {
      disposeOrganisation = actions.selectOrganisation.onValue(v => organisation = v);
      disposeOrgServices = actions.orgServices.onValue(v => orgServices = v);
      disposeOrgRepositories = actions.orgRepositories.onValue(v => orgRepositories = v);
      // MUT
      actions.selectOrganisation.push('org_id');
    });

    after(function () {
      disposeOrganisation();
      disposeOrgServices();
      disposeOrgRepositories();
      mockApi.reset();
    });

    it('should trigger a getServices API request', function () {
      mockApi.api.getServices.calledOnce.should.be.true;
      mockApi.api.getServices.calledWith('org_id').should.be.true;
    });

    it('should trigger a getRepositories API request', function () {
      mockApi.api.getRepositories.calledOnce.should.be.true;
      mockApi.api.getRepositories.calledWith('org_id').should.be.true;
    });

    it('should pass the org services to the "orgServices" event stream', function () {
      orgServices.should.eql([
        {name: 'test', organisation_id: 'org_id', location: 'http://test.com', id: 'service_id'},
        {name: 'other', organisation_id: 'org_id', location: 'http://other.com', id: 'other_id'}
      ]);
    });

    it('should pass the org repositories to the "orgRepositories" event stream', function () {
      orgRepositories.should.eql([
        {id: 'id', name: 'test', 'service_id': 'service_id'},
        {id: 'id2', name: 'test2', 'service_id': 'service_id2'}
      ]);
    });
  });

  describe('getOrganisations without parameter', function() {
    var disposeOrganisations;
    var organisations = [];

    before(function() {
      disposeOrganisations = actions.organisations.onValue(v => organisations = v);
      actions.getOrganisations.push();
    });

    after(function() {
      disposeOrganisations();
      mockApi.reset();
    });

    it('should trigger a getOrganisations API request', function() {
      mockApi.api.getOrganisations.calledOnce.should.be.true;
    });

    it('should pass a list of organisations to the "organisations" event stream', function () {
      organisations.should.eql([{id: 'org_id', name: 'org'}, {id: 'org_id2', name: 'org2'}]);
    });
  });

  describe('getOrganisations with user id', function() {
    var disposeOrganisations;
    var organisations = [];

    before(function() {
      disposeOrganisations = actions.organisations.onValue(v => organisations = v);
      actions.getOrganisations.push('a_user_id');
    });

    after(function() {
      disposeOrganisations();
      mockApi.reset();
    });

    it('should trigger a getOrganisations API request', function() {
      mockApi.api.getOrganisations.calledOnce.should.be.true;
      mockApi.api.getOrganisations.calledWith('a_user_id').should.be.true;
    });

    it('should pass a list of organisations to the "organisations" event stream', function() {
      organisations.should.eql([{id: 'org_id', name: 'org'}, {id: 'org_id2', name: 'org2'}]);
    });
  });

  describe('updateOrganisation', function () {
    var orgs, disposeOrganisations;
    var result, dispose;

    before(function () {
      dispose = actions.updatedOrganisation.onValue(v => result = v);
      disposeOrganisations = actions.organisations.onValue(v => orgs = v);
      // MUT
      actions.updateOrganisation.push({name: 'new name',
                                       description: 'new description',
                                       address: 'new address',
                                       phone: '',
                                       email: '',
                                       website: '',
                                       facebook: '',
                                       twitter: 'new twitter',
                                       googlePlus: '',
                                       instagram: '',
                                       youtube: '',
                                       linkedin: '',
                                       myspace: '',
                                       organisationId: 'org_id'});
    });

    after(function () {
      disposeOrganisations();
      dispose();
      mockApi.reset();
    });

    it('should trigger a updateOrganisation API request', function () {
      mockApi.api.updateOrganisation.calledOnce.should.be.true;
      mockApi.api.updateOrganisation.calledWith(
        'org_id',
        {name: 'new name',
        description: 'new description',
        address: 'new address',
        phone: '',
        email: '',
        website: '',
        facebook: '',
        twitter: 'new twitter',
        googlePlus: '',
        instagram: '',
        youtube: '',
        linkedin: '',
        myspace: ''}).should.be.true;
    });

    it('should pass the updated organisation to the "updatedOrganisation" event stream', function () {
      var org = {
        name: 'new name',
        description: 'new description',
        address: 'new address',
        phone: '',
        email: '',
        website: '',
        facebook: '',
        twitter: '',
        googlePlus: '',
        instagram: '',
        youtube: '',
        linkedin: '',
        myspace: '',
        id: 'org_id'};
      result.should.eql(org);
    });

    it('should trigger a getOrganisations API request', function() {
      mockApi.api.getOrganisations.calledOnce.should.be.true;
      mockApi.api.getOrganisations.calledWith().should.be.true;
    });

    it('should pass a list of organisations to the "organisations" event stream', function () {
      orgs.should.eql([{id: 'org_id', name: 'org'}, {id: 'org_id2', name: 'org2'}]);
    });
  });

  describe('deleteOrganisation', function () {
    var result;
    var orgs;
    var dispose;
    var disposeOrgs;

    before(function () {
      dispose = actions.deletedOrganisation.onValue(v => result = v);
      disposeOrgs = actions.organisations.onValue(v => orgs = v);
      // MUT
      actions.deleteOrganisation.push({organisationId: 'org1'});
    });

    after(function () {
      dispose();
      disposeOrgs();
      mockApi.reset();
    });

    it('should trigger a deleteOrganisation API request', function () {
      mockApi.api.deleteOrganisation.calledOnce.should.be.true;
      mockApi.api.deleteOrganisation.calledWith('org1').should.be.true;
    });

    it('should pass the organisation id to the "deletedOrganisation" event stream', function () {
      result.should.eql('org1');
    });

    it('should trigger a getOrganisations API request', function() {
      mockApi.api.getOrganisations.calledOnce.should.be.true;
      mockApi.api.getOrganisations.calledWith().should.be.true;
    });

    it('should pass a list of organisations to the "organisations" event stream', function () {
      orgs.should.eql([{id: 'org_id', name: 'org'}, {id: 'org_id2', name: 'org2'}]);
    });
  });


  describe('joinOrganisation', function () {
    var users, result;
    var dispose, disposeUpdatedUser;

    before(function () {
      disposeUpdatedUser = actions.updatedUser.onValue(v => result = v);
      dispose = actions.users.onValue(v => users = v);
      // MUT
      actions.joinOrganisation.push({organisationId: 'org_id',
                                     userId: 'user_id'});
    });

    after(function () {
      dispose();
      disposeUpdatedUser();
      mockApi.reset();
    });

    it('should trigger a joinOrganisation API request', function () {
      mockApi.api.joinOrganisation.calledOnce.should.be.true;
      var args = ['org_id', 'user_id'];
      mockApi.api.joinOrganisation.calledWith(...args).should.be.true;
    });

    it('should pass the updated user to the updatedUser event stream', function () {
      result.should.eql({
        "id": "user_id",
        "email": "user@example.com",
        "organisations": {
          "global": {
            "role": "user",
            "join_state": "approved"
          },
          "org_id": {
            "role": "user",
            "join_state": "pending"
          }
        }
      });
    });

    it('should make a getUsers api request', function () {
      mockApi.api.getUsers.calledOnce.should.be.true;
    });

    it('should pass the users to the users event stream', function () {
      users.should.eql([{"first_name": "Harry",
                     "last_name": "Porter",
                     "email": "harry@example.com",
                     "id": "174018a615105866d01fa495540007da",
                     "organisations": {"global": {"role": "user", "state": "approved"}}}]);
    });
  });

  describe('leaveOrganisation', function () {
    var users, result;
    var dispose, disposeUpdatedUser;

    before(function () {
      disposeUpdatedUser = actions.updatedUser.onValue(v => result = v);
      dispose = actions.users.onValue(v => users = v);
      // MUT
      actions.leaveOrganisation.push({orgId: 'org_id',
                                     userId: 'user_id'});
    });

    after(function () {
      dispose();
      disposeUpdatedUser();
      mockApi.reset();
    });

    it('should trigger a leaveOrganisation API request', function () {
      mockApi.api.leaveOrganisation.calledOnce.should.be.true;
      var args = ['user_id', 'org_id'];
      mockApi.api.leaveOrganisation.calledWith(...args).should.be.true;
    });

    it('should pass the updated user to the updatedUser event stream', function () {
      result.should.eql({
        "id": "user_id",
        "email": "user@example.com",
        "organisations": {
          "global": {
            "role": "user",
            "join_state": "approved"
          }
        }
      });
    });

    it('should make a getUsers api request', function () {
      mockApi.api.getUsers.calledOnce.should.be.true;
    });

    it('should pass the users to the users event stream', function () {
      users.should.eql([{"first_name": "Harry",
                     "last_name": "Porter",
                     "email": "harry@example.com",
                     "id": "174018a615105866d01fa495540007da",
                     "organisations": {"global": {"role": "user", "state": "approved"}}}]);
    });
  });

  describe('createOrganisation', function () {
    var result;
    var dispose;

    before(function () {
      dispose = actions.organisations.onValue(v => result = v);
      // MUT
      actions.createOrganisation.push({
        name: 'my new organisation',
        description: 'my new organisation description',
        address: 'my address',
        phone: '',
        email: '',
        website: '',
        facebook: '',
        twitter: 'my twitter',
        googlePlus: '',
        instagram: '',
        youtube: '',
        linkedin: '',
        myspace: ''
      });
    });

    after(function () {
      dispose();
      mockApi.reset();
    });


    it('should trigger a createOrganisation API request', function () {
      mockApi.api.createOrganisation.calledOnce.should.be.true;
      mockApi.api.createOrganisation.calledWith({
        name: 'my new organisation',
        description: 'my new organisation description',
        address: 'my address',
        phone: '',
        email: '',
        website: '',
        facebook: '',
        twitter: 'my twitter',
        googlePlus: '',
        instagram: '',
        youtube: '',
        linkedin: '',
        myspace: '',
      }).should.be.true;
    });

    it('should trigger a getOrganisations API request', function() {
      mockApi.api.getOrganisations.calledOnce.should.be.true;
      mockApi.api.getOrganisations.calledWith().should.be.true;
    });

    it('should pass a list of organisations to the "organisations" event stream', function () {
      result.should.eql([{id: 'org_id', name: 'org'}, {id: 'org_id2', name: 'org2'}]);
    });
  });

  describe('getServices', function () {
    var result;
    var dispose;

    before(function () {
      dispose = actions.services.onValue(v => result = v);
      // MUT
      actions.getServices.push();
    });

    after(function () {
      dispose();
      mockApi.reset();
    });

    it('should trigger a getServices API request', function () {
      mockApi.api.getServices.calledOnce.should.be.true;
    });

    it('should pass the services to the "services" event stream', function () {
      result.should.eql([
        {name: 'test', organisation_id: 'org_id', location: 'http://test.com', id: 'service_id'},
        {name: 'other', organisation_id: 'org_id', location: 'http://other.com', id: 'other_id'}]);
    });
  });

  describe('getServiceTypes', function () {
    var result;
    var dispose;

    before(function () {
      dispose = actions.serviceTypes.onValue(v => result = v);
      // MUT
      actions.getServiceTypes.push();
    });

    after(function () {
      dispose();
      mockApi.reset();
    });

    it('should trigger a getServiceTypes API request', function () {
      mockApi.api.getServiceTypes.calledOnce.should.be.true;
    });

    it('should pass the service types to the "serviceTypes" event stream', function () {
      result.should.eql(['index', 'repository']);
    });
  });

  describe('createService', function () {
    var result;
    var dispose;
    var services;
    var disposeServices;

    before(function () {
      dispose = actions.service.onValue(v => result = v);
      disposeServices = actions.services.onValue(v => services = v);

      // MUT
      actions.createService.push({
        name: 'my new service',
        location: 'http://somewhere.com',
        serviceType: 'index',
        orgId: 'org_id'
      });
    });

    after(function () {
      dispose();
      disposeServices();
      mockApi.reset();
    });

    it('should trigger a createService API request', function () {
      mockApi.api.createService.calledOnce.should.be.true;
      var args = ['my new service', 'http://somewhere.com', 'index',
                  'org_id'];
      mockApi.api.createService.calledWith(...args).should.be.true;
    });

    it('should pass the service to the "service" event stream', function () {
      result.should.eql({
        name: 'my new service',
        location: 'http://somewhere.com',
        service_type: 'index',
        id: 'service_id'
      });
    });

    it('should trigger a getServices API request', function () {
      mockApi.api.getServices.calledOnce.should.be.true;
    });

    it('should pass the services to the "services" event stream', function () {
      services.should.eql([
        {name: 'test', organisation_id: 'org_id', location: 'http://test.com', id: 'service_id'},
        {name: 'other', organisation_id: 'org_id', location: 'http://other.com', id: 'other_id'}]);
    });


  });

  describe('updateService', function () {
    var result;
    var dispose;
    var services;
    var disposeServices;

    before(function () {
      dispose = actions.service.onValue(v => result = v);
      disposeServices = actions.services.onValue(v => services = v);
      // MUT
      actions.updateService.push({
        serviceId: 'service_id',
        name: 'new service name',
        serviceType: 'index',
        location: 'http://somewhere.com'
      });
    });

    after(function () {
      dispose();
      disposeServices();
      mockApi.reset();
    });

    it('should trigger a updateService API request', function () {
      mockApi.api.updateService.calledOnce.should.be.true;
      var args = ['service_id', 'new service name', 'http://somewhere.com', 'index'];
      mockApi.api.updateService.calledWith(...args).should.be.true;
    });

    it('should pass the service to the "service" event stream', function () {
      result.should.eql({
        name: 'new service name',
        location: 'http://somewhere.com',
        service_type: 'index',
        id: 'service_id'
      });
    });

    it('should trigger a getServices API request', function () {
      mockApi.api.getServices.calledOnce.should.be.true;
    });

    it('should pass the services to the "services" event stream', function () {
      services.should.eql([
        {name: 'test', organisation_id: 'org_id', location: 'http://test.com', id: 'service_id'},
        {name: 'other', organisation_id: 'org_id', location: 'http://other.com', id: 'other_id'}]);
    });

  });

  describe('deleteService', function () {
    var result;
    var dispose;
    var services;
    var disposeServices;

    before(function () {
      dispose = actions.deletedService.onValue(v => result = v);
      disposeServices = actions.services.onValue(v => services = v);
      // MUT
      actions.deleteService.push({
        serviceId: 'service1'
      });
    });

    after(function () {
      dispose();
      disposeServices();
      mockApi.reset();
    });

    it('should trigger a deleteService API request', function () {
      mockApi.api.deleteService.calledOnce.should.be.true;
      mockApi.api.deleteService.calledWith('service1').should.be.true;
    });

    it('should pass the service id to the "deletedService" event stream', function () {
      result.should.eql('service1');
    });

    it('should trigger a getServices API request', function () {
      mockApi.api.getServices.calledOnce.should.be.true;
    });

    it('should pass the services to the "services" event stream', function () {
      services.should.eql([
        {name: 'test', organisation_id: 'org_id', location: 'http://test.com', id: 'service_id'},
        {name: 'other', organisation_id: 'org_id', location: 'http://other.com', id: 'other_id'}]);
    });
  });

  describe('getSecrets', function () {
    var result;
    var dispose;

    before(function () {
      dispose = actions.secrets.onValue(v => result = v);
      // MUT
      actions.getSecrets.push({
        serviceId: 'service_id'
      });
    });

    after(function () {
      dispose();
      mockApi.reset();
    });


    it('should trigger a getSecrets API request', function () {
      mockApi.api.getSecrets.calledOnce.should.be.true;
      mockApi.api.getSecrets.calledWith('service_id').should.be.true;
    });

    it('should pass a list of secrets to the "secrets" event stream', function () {
      result.should.eql({
        serviceId: 'service_id',
        secrets: ['1234', '5678']
      });
    });
  });

  describe('addSecret', function () {
    var result;
    var dispose;

    before(function () {
      dispose = actions.secrets.onValue(v => result = v);
      // MUT
      actions.addSecret.push({
        serviceId: 'service_id'
      });
    });

    after(function () {
      dispose();
      mockApi.reset();
    });


    it('should trigger a addSecret API request', function () {
      mockApi.api.addSecret.calledOnce.should.be.true;
      mockApi.api.addSecret.calledWith('service_id').should.be.true;
    });

    it('should trigger a getSecrets API request', function() {
      mockApi.api.getSecrets.calledOnce.should.be.true;
      mockApi.api.getSecrets.calledWith('service_id').should.be.true;
    });

    it('should pass a list of secrets to the "secrets" event stream', function () {
      result.should.eql({
        serviceId: 'service_id',
        secrets: ['1234', '5678']
      });
    });
  });

  describe('deleteSecret', function () {
    var result;
    var dispose;

    before(function () {
      dispose = actions.secrets.onValue(v => result = v);
      // MUT
      actions.deleteSecret.push({
        serviceId: 'service_id',
        secret: '1234'
      });
    });

    after(function () {
      dispose();
      mockApi.reset();
    });


    it('should trigger a deleteSecret API request', function () {
      mockApi.api.deleteSecret.calledOnce.should.be.true;
      mockApi.api.deleteSecret.calledWith('service_id', '1234').should.be.true;
    });

    it('should trigger a getSecrets API request', function() {
      mockApi.api.getSecrets.calledOnce.should.be.true;
      mockApi.api.getSecrets.calledWith('service_id').should.be.true;
    });

    it('should pass a list of secrets to the "secrets" event stream', function () {
      result.should.eql({
        serviceId: 'service_id',
        secrets: ['1234', '5678']
      });
    });
  });

  describe('deleteSecrets', function () {
    var result;
    var dispose;

    before(function () {
      dispose = actions.secrets.onValue(v => result = v);
      // MUT
      actions.deleteSecrets.push({
        serviceId: 'service_id'
      });
    });

    after(function () {
      dispose();
      mockApi.reset();
    });


    it('should trigger a deleteSecrets API request', function () {
      mockApi.api.deleteSecrets.calledOnce.should.be.true;
      mockApi.api.deleteSecrets.calledWith('service_id').should.be.true;
    });

    it('should trigger a getSecrets API request', function() {
      mockApi.api.getSecrets.calledOnce.should.be.true;
      mockApi.api.getSecrets.calledWith('service_id').should.be.true;
    });

    it('should pass a list of secrets to the "secrets" event stream', function () {
      result.should.eql({
        serviceId: 'service_id',
        secrets: ['1234', '5678']
      });
    });
  });

  describe('getRepositories', function () {
    var result;
    var dispose;

    before(function () {
      dispose = actions.repositories.onValue(v => result = v);
      // MUT
      actions.getRepositories.push();
    });

    after(function () {
      dispose();
      mockApi.reset();
    });

    it('should trigger a getRepositories API request', function () {
      mockApi.api.getRepositories.calledOnce.should.be.true;
    });

    it('should pass the repositories to the "repositories" event stream', function () {
      result.should.eql([
        {id: 'id', name: 'test', 'service_id': 'service_id'},
        {id: 'id2', name: 'test2', 'service_id': 'service_id2'}]);
    });
  });

  describe('createRepository', function () {
    var result;
    var dispose;
    var repositories;
    var disposeRepositories;

    before(function () {
      dispose = actions.repository.onValue(v => result = v);
      disposeRepositories = actions.repositories.onValue(v => repositories = v);

      // MUT
      actions.createRepository.push({
        name: 'my new repository',
        serviceId: 'serviceId123',
        organisationId: 'orgId'
      });
    });

    after(function () {
      dispose();
      disposeRepositories();
      mockApi.reset();
    });

    it('should trigger a createRepository API request', function () {
      mockApi.api.createRepository.calledOnce.should.be.true;
      var args = ['orgId', 'my new repository', 'serviceId123'];
      mockApi.api.createRepository.calledWith(...args).should.be.true;
    });

    it('should pass the repository to the "repository" event stream', function () {
      result.should.eql({
        name: 'my new repository',
        service_id: 'serviceId123',
        id: 'repositoryId'
      });
    });

    it('should trigger a getRepositories API request', function () {
      mockApi.api.getRepositories.calledOnce.should.be.true;
    });

    it('should pass the repositories to the "repositories" event stream', function () {
      repositories.should.eql([
        {id: 'id', name: 'test', 'service_id': 'service_id'},
        {id: 'id2', name: 'test2', 'service_id': 'service_id2'}]);
    });
  });

  describe('updateRepository', function () {
    var result;
    var dispose;
    var repositories;
    var disposeRepositories;

    before(function () {
      dispose = actions.repository.onValue(v => result = v);
      disposeRepositories = actions.repositories.onValue(v => repositories = v);

      // MUT
      actions.updateRepository.push({
        repositoryId: 'repositoryId',
        name: 'new repository name',
        state: 'approved'
      });
    });

    after(function () {
      dispose();
      disposeRepositories();
      mockApi.reset();
    });

    it('should trigger a updateRepository API request', function () {
      mockApi.api.updateRepository.calledOnce.should.be.true;
      var args = ['repositoryId', 'new repository name', undefined, 'approved'];
      mockApi.api.updateRepository.calledWith(...args).should.be.true;
    });

    it('should pass the repository to the "repository" event stream', function () {
      result.should.eql({
        name: 'new repository name',
        service_id: 'serviceId123',
        id: 'repositoryId'
      });
    });

    it('should trigger a getRepositories API request', function () {
      mockApi.api.getRepositories.calledOnce.should.be.true;
    });

    it('should pass the repositories to the "repositories" event stream', function () {
      repositories.should.eql([
        {id: 'id', name: 'test', 'service_id': 'service_id'},
        {id: 'id2', name: 'test2', 'service_id': 'service_id2'}]);
    });
  });

  describe('deleteRepository', function () {
    var result;
    var dispose;
    var repositories;
    var disposeRepositories;

    before(function () {
      dispose = actions.deletedRepository.onValue(v => result = v);
      disposeRepositories = actions.repositories.onValue(v => repositories = v);
      // MUT
      actions.deleteRepository.push({
        repositoryId: 'repo1'
      });
    });

    after(function () {
      dispose();
      disposeRepositories();
      mockApi.reset();
    });

    it('should trigger a deleteRepository API request', function () {
      mockApi.api.deleteRepository.calledOnce.should.be.true;
      mockApi.api.deleteRepository.calledWith('repo1').should.be.true;
    });

    it('should pass the repository id to the "deletedRepository" event stream', function () {
      result.should.eql('repo1');
    });

    it('should trigger a getRepositories API request', function () {
      mockApi.api.getRepositories.calledOnce.should.be.true;
    });

    it('should pass the repositories to the "repositories" event stream', function () {
      repositories.should.eql([
        {id: 'id', name: 'test', 'service_id': 'service_id'},
        {id: 'id2', name: 'test2', 'service_id': 'service_id2'}]);
    });
  });

  describe('passwordChange', function () {
    var result;
    var dispose;

    before(function () {
      dispose = actions.passwordChanged.onValue(v => result = v);
      // MUT
      actions.changePassword.push({
        oldPassword: 'password1',
        newPassword: 'password2',
        userId: 'user1'
      });
    });

    after(function () {
      dispose();
      mockApi.reset();
    });

    it('should trigger a changePassword API request', function () {
      mockApi.api.changePassword.calledOnce.should.be.true;
      var args = ['user1', 'password1', 'password2'];
      mockApi.api.changePassword.calledWith(...args).should.be.true;
    });

    it('changedPassword should be true', function () {
      result.should.eql(true);
    });
  });
});
