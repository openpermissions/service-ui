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

var _ = require('lodash'),
    sinon = require('sinon'),
    should = require('should'),
    Bacon = require('baconjs'),
    Store = require('../scripts/src/store');

var streams = _.transform([
    'loggedIn',
    'logout',
    'authenticated',
    'verified',
    'users',
    'updatedUser',
    'roles',
    'selectOrganisation',
    'deletedOrganisation',
    'updatedOrganisation',
    'organisations',
    'services',
    'orgServices',
    'serviceTypes',
    'service',
    'deletedService',
    'navigate',
    'secrets',
    'passwordChanged',
    'orgRepositories',
    'repository',
    'deletedRepository',
    'repositories',
    'offerJSON',
    'savedOffer',
    'offers'
  ], (result, k) => result[k] = new Bacon.Bus(), {});

var pages = {
  '/login': {page: 'login'},
  '/account': {page: 'account'},
  '/unverified': {page: 'unverified'},
  defaultPaths: {
    login: '/login',
    unverified: '/unverified',
    loggedIn: '/account'
  }
};

var store = new Store(streams, pages);

describe('store', () => {
  var dispose;
  afterEach(() => {
    dispose && dispose();
  });

  describe('application data store', () => {
    it('should initally contain the page, organisations, services, repositories, users, roles and serviceTypes', done => {
      dispose = store.app.map('.toJS').onValue(data => {
        data.should.eql({page: {component: pages['/login'], path: '/login', queryParams: {}},
                         organisations: [], services: [], offers: [], repositories: [], users: [], roles: [], serviceTypes: [],
                         loggedIn: false});
        done();
      });
    });

    it('should only contain the page, organisations, services, users, roles and serviceTypes on "logout"', done => {
      dispose = store.app.changes().map('.toJS').onValue(data => {
        data.should.eql({page: {component: pages['/login'], path: '/login', queryParams: {}},
                         organisations: [], services: [], offers: [], repositories: [], users: [], roles:[], serviceTypes: [],
                         loggedIn: false});
        done();
      });
      streams.logout.push();
    });

    it('should have a user on "authenticated"', done => {
      var data = {};

      dispose = store.app.changes().map('.toJS').onValue(data => {
        data.should.eql(data);
        done();
      });
      streams.authenticated.push(data);
    });

    it('should set users on "users"', done => {
      var data = [{"first_name": "Harry",
                     "last_name": "Porter",
                     "email": "harry@example.com",
                     "id": "174018a615105866d01fa495540007da",
                     "organisations": {"global": {"role": "user", "state": "approved"}}}];
      dispose = store.app.changes().map('.toJS').map('.users')
        .onValue(users => {
          users.should.eql(data);
          done();
      });
      streams.users.push(data);
    });

    it('should set roles on "roles"', done => {
    var data = [{"id": "001",
                 "name": "role1"
                },
                {
                  "id": "002",
                  "name": "role2"
                }];
    dispose = store.app.changes().map('.toJS').map('.roles')
      .onValue(roles => {
        roles.should.eql(data);
        done();
    });
    streams.roles.push(data);
    });

    it('should update user on "updatedUser" when user is current user', done => {
      var origData = {
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "id": "67890",
        "organisations": {
          "global": {"role": "user", "state": "approved"},
          "org1": {"role": "user", "state": "pending"}
        }
      };

      streams.authenticated.push(origData);

      var newUser = {
          "first_name": "Test",
          "last_name": "User",
          "email": "test@example.com",
          "id": "67890",
          "organisations": {
            "global": {"role": "user", "state": "approved"},
            "org1": {"role": "user", "state": "approved"}}};


      dispose = store.app.changes().map('.toJS').map('.user').onValue(data => {
        data.should.eql(newUser);
        done();
      });

      streams.updatedUser.push(newUser);
    });

    it('should not update user on "updatedUser" when user is not current user', done => {
      var origData = {
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "id": "67890",
        "organisations": {
          "global": {"role": "user", "state": "approved"},
          "org1": {"role": "user", "state": "pending"}
        }
      };

      streams.authenticated.push(origData);

      var newUser = {
          "first_name": "Another",
          "last_name": "User",
          "email": "test@example.com",
          "id": "12345",
          "organisations": {
            "global": {"role": "user", "state": "approved"},
            "org1": {"role": "user", "state": "approved"}}};


      dispose = store.app.changes().map('.toJS').map('.user').onValue(data => {
        data.should.not.eql(newUser);
        done();
      });

      streams.updatedUser.push(newUser);
    });

    it('should set the currentOrganisation object on "selectOrganisation"', done => {
      streams.organisations.push([{'id': 'org1', 'name': 'test1'}, {'id': 'org2', 'name': 'test2'}]);

      dispose = store.app.changes().map('.toJS').map('.currentOrganisation')
        .onValue(org => {
          org.should.eql({id: 'org1', 'name': 'test1'});
          done();
        });

      streams.selectOrganisation.push('org1');
    });

    it('should remove the currentOrganisation on "deletedOrganisation" if org is currentOrganisation', done => {
      streams.authenticated.push({
        'user': {'organisation_id': 'org_id', 'id': 'user_id'}
      });
      streams.organisations.push([{'id': 'org1', 'name': 'test1'}, {'id': 'org2', 'name': 'test2'}]);
      streams.selectOrganisation.push('org1');

      dispose = store.app.changes().map('.toJS').map('.currentOrganisation')
        .onValue(organisation => {
          organisation.should.eql({id: undefined});
          done();
        });

      streams.deletedOrganisation.push('org1');
    });

    it('should not remove the currentOrganisation on "deletedOrganisation" if org is not currentOrganisation', done => {
      streams.authenticated.push({
        'user': {'organisation_id': 'org_id', 'id': 'user_id'}
      });
      streams.organisations.push([{'id': 'org1', 'name': 'test1'}, {'id': 'org2', 'name': 'test2'}]);
      streams.selectOrganisation.push('org2');

      dispose = store.app.changes().map('.toJS').map('.currentOrganisation')
        .onValue(organisation => {
          organisation.should.eql({'id': 'org2', 'name': 'test2'});
          done();
        });

      streams.deletedOrganisation.push('org1');
    });


    it('should update the currentOrganisation on "updateOrganisation" if org is currentOrganisation', done => {
      streams.authenticated.push({
        'user': {'organisation_id': 'org_id', 'id': 'user_id'}
      });
      streams.organisations.push([{'id': 'org1', 'name': 'test1'}, {'id': 'org2', 'name': 'test2'}]);
      streams.selectOrganisation.push('org1');

      dispose = store.app.changes().map('.toJS').map('.currentOrganisation')
        .onValue(organisation => {
          organisation.should.eql({'id': 'org1', 'name': 'test3'});
          done();
        });

      streams.updatedOrganisation.push({'id': 'org1', 'name': 'test3'});
    });

    it('should not update the currentOrganisation on "updateOrganisation" if org is not currentOrganisation', done => {
      streams.authenticated.push({
        'user': {'organisation_id': 'org_id', 'id': 'user_id'}
      });
      streams.organisations.push([{'id': 'org1', 'name': 'test1'}, {'id': 'org2', 'name': 'test2'}]);
      streams.selectOrganisation.push('org2');

      dispose = store.app.changes().map('.toJS').map('.currentOrganisation')
        .onValue(organisation => {
          organisation.should.eql({'id': 'org2', 'name': 'test2'});
          done();
        });

      streams.updatedOrganisation.push({'id': 'org1', 'name': 'test3'});
    });


    it('should set the organisations on "organisations"', done => {
      var data = [
        {'id': 'org1', 'name': 'org 1'}, {'id': 'org2', 'name': 'org 2'}
      ];

      dispose = store.app.changes().map('.toJS').map('.organisations')
        .onValue(organisations => {
          organisations.should.eql(data);
          done();
        });

      streams.organisations.push(data);
    });

    it ('should set the service types on "serviceTypes"', done => {
      var data = ['index', 'repository'];

      dispose = store.app.changes().map('.toJS').map('.serviceTypes')
        .onValue(serviceTypes => {
          serviceTypes.should.eql(data);
          done();
        });

      streams.serviceTypes.push(data);
    });

    it ('should set the services on "services"', done => {
      var data = [
        {'id': 'service1', 'name': 'service 1', 'location': 'http://test.com/1'},
        {'id': 'service2', 'name': 'service 2', 'location': 'http://test.com/2'}
      ];

      dispose = store.app.changes().map('.toJS').map('.services')
        .onValue(services => {
          services.should.eql(data);
          done();
        });

      streams.services.push(data);
    });

    it('should set the organisation services on "orgServices"', done => {
      var data = [
        {'id': 'service1', 'name': 'service 1', 'location': 'http://test.com/1'},
        {'id': 'service2', 'name': 'service 2', 'location': 'http://test.com/2'}
      ];
      streams.authenticated.push({
        'user': {'organisation_id': 'org_id', 'id': 'user_id'}
      });

      dispose = store.app.changes().map('.toJS').map('.currentOrganisation.services')
        .onValue(orgServices => {
          orgServices.should.eql(_.transform(data, (result, d) => result[d.id] = d, {}));
          done();
        });

      streams.orgServices.push(data);
    });

    it('should replace existing organisation services on "orgServices"', done => {
      var data = [
        {'id': 'service1', 'name': 'service 1', 'location': 'http://test.com/1'},
        {'id': 'service2', 'name': 'service 2', 'location': 'http://test.com/2'},
        {'id': 'service3', 'name': 'service 3', 'location': 'http://test.com/3'},
        {'id': 'service4', 'name': 'service 4', 'location': 'http://test.com/4'}
      ];
      streams.authenticated.push({
        'user': {'organisation_id': 'org_id', 'id': 'user_id'}
      });
      streams.orgServices.push(data.slice(0, 2));

      dispose = store.app.changes().map('.toJS').map('.currentOrganisation.services')
        .onValue(orgServices => {
          orgServices.should.eql(_.transform(data.slice(2, 4), (result, d) => result[d.id] = d, {}));
          done();
        });

      streams.orgServices.push(data.slice(2, 4));
    });

    it('should append to existing organisation services on "service"', done => {
      var data = [
        {'id': 'service1', 'name': 'service 1', 'location': 'http://test.com/1'},
        {'id': 'service2', 'name': 'service 2', 'location': 'http://test.com/2'},
        {'id': 'service3', 'name': 'service 3', 'location': 'http://test.com/3'}
      ];
      streams.authenticated.push({
        'user': {'organisation_id': 'org_id', 'id': 'user_id'}
      });
      streams.orgServices.push(data.slice(0, 2));


      dispose = store.app.changes().map('.toJS').map('.currentOrganisation.services')
        .onValue(orgServices => {
          orgServices.should.eql(_.transform(data, (result, d) => result[d.id] = d, {}));
          done();
        });

      streams.service.push(data[2]);
    });

    it('should set organisation services on "service" if none already', done => {
      var data = {'id': 'service3', 'name': 'service 3', 'location': 'http://test.com/3'};
      streams.authenticated.push({
        'user': {'organisation_id': 'org_id', 'id': 'user_id'}
      });

      dispose = store.app.changes().map('.toJS').map('.currentOrganisation.services')
        .onValue(orgServices => {
          orgServices.should.eql({'service3': data});
          done();
        });

      streams.service.push(data);
    });

    it('should replace service on "service" if it already exists', done => {
      var data = [
        {'id': 'service1', 'name': 'service 1', 'location': 'http://test.com/1'},
        {'id': 'service2', 'name': 'service 2', 'location': 'http://test.com/2'},
        {'id': 'service3', 'name': 'service 3', 'location': 'http://test.com/3'}
      ];
      streams.authenticated.push({
        'user': {'organisation_id': 'org_id', 'id': 'user_id'}
      });
      streams.orgServices.push(data);

      dispose = store.app.changes().map('.toJS').map('.currentOrganisation.services')
        .onValue(orgServices => {
          orgServices.should.eql({
            service1: {'id': 'service1', 'name': 'service 1', 'location': 'http://test.com/1'},
            service2: {'id': 'service2', 'name': 'service 2', 'location': 'http://test.com/2'},
            service3: {'id': 'service3', 'name': 'new service name', 'location': 'http://test.com/3'}
          });
          done();
        });

      var newData = {'id': 'service3', 'name': 'new service name', 'location': 'http://test.com/3'};
      streams.service.push(newData);
    });

    it('should remove a service on "deletedService"', done => {
      var data = [
        {'id': 'service1', 'name': 'service 1', 'location': 'http://test.com/1'},
        {'id': 'service2', 'name': 'service 2', 'location': 'http://test.com/2'},
        {'id': 'service3', 'name': 'service 3', 'location': 'http://test.com/3'},
        {'id': 'service4', 'name': 'service 4', 'location': 'http://test.com/4'}
      ];
      streams.authenticated.push({
        'user': {'organisation_id': 'org_id', 'id': 'user_id'}
      });
      streams.orgServices.push(data);

      dispose = store.app.changes().map('.toJS').map('.currentOrganisation.services')
        .onValue(orgServices => {
          orgServices.should.eql(_.transform(data.slice(1), (result, d) => result[d.id] = d, {}));
          done();
        });

      streams.deletedService.push(data[0].id);
    });

    it ('should set the repositories on "repositories"', done => {
      var data = [
        {id: 'id', name: 'test', 'service_id': 'service_id'},
        {id: 'id2', name: 'test2', 'service_id': 'service_id2'}
      ];

      dispose = store.app.changes().map('.toJS').map('.repositories')
        .onValue(repositories => {
          repositories.should.eql(data);
          done();
        });

      streams.repositories.push(data);
    });


    it('should set the organisation repositories on "orgRepositories"', done => {
      var data = [
        {'id': 'rep1', 'name': 'rep 1', 'service_id': 'service id1'},
        {'id': 'rep2', 'name': 'rep 2', 'service_id': 'service id2'},
      ];
      streams.authenticated.push({
        'user': {'organisation_id': 'org_id', 'id': 'user_id'}
      });

      dispose = store.app.changes().map('.toJS').map('.currentOrganisation.repositories')
        .onValue(orgRepositories => {
          orgRepositories.should.eql(_.transform(data, (result, d) => result[d.id] = d, {}));
          done();
        });

      streams.orgRepositories.push(data);
    });

    it('should replace existing organisation repositories on "orgRepositories"', done => {
      var data = [
        {'id': 'rep1', 'name': 'rep 1', 'service_id': 'service id1'},
        {'id': 'rep2', 'name': 'rep 2', 'service_id': 'service id2'},
        {'id': 'rep3', 'name': 'rep 3', 'service_id': 'service id3'},
        {'id': 'rep4', 'name': 'rep 4', 'service_id': 'service id4'}
      ];
      streams.authenticated.push({
        'user': {'organisation_id': 'org_id', 'id': 'user_id'}
      });
      streams.orgRepositories.push(data.slice(0, 2));

      dispose = store.app.changes().map('.toJS').map('.currentOrganisation.repositories')
        .onValue(orgRepositories => {
          orgRepositories.should.eql(_.transform(data.slice(2, 4), (result, d) => result[d.id] = d, {}));
          done();
        });

      streams.orgRepositories.push(data.slice(2, 4));
    });

    it('should append to existing organisation repositories on "repository"', done => {
      var data = [
        {'id': 'rep1', 'name': 'rep 1', 'service_id': 'service id1'},
        {'id': 'rep2', 'name': 'rep 2', 'service_id': 'service id2'},
        {'id': 'rep3', 'name': 'rep 3', 'service_id': 'service id3'}
      ];
      streams.authenticated.push({
        'user': {'organisation_id': 'org_id', 'id': 'user_id'}
      });
      streams.orgRepositories.push(data.slice(0, 2));


      dispose = store.app.changes().map('.toJS').map('.currentOrganisation.repositories')
        .onValue(orgRepositories => {
          orgRepositories.should.eql(_.transform(data, (result, d) => result[d.id] = d, {}));
          done();
        });

      streams.repository.push(data[2]);
    });

    it('should set organisation repositories on "repository" if none already', done => {
      var data = {
        'id': 'rep3', 'name': 'rep 3', 'service_id': 'service id3'
      };
      streams.authenticated.push({
        'user': {'organisation_id': 'org_id', 'id': 'user_id'}
      });

      dispose = store.app.changes().map('.toJS').map('.currentOrganisation.repositories')
        .onValue(orgRepositories => {
          orgRepositories.should.eql({'rep3': data});
          done();
        });

      streams.repository.push(data);
    });


    it('should replace repository on "repository" if it already exists', done => {
      var data = [
        {'id': 'rep1', 'name': 'rep 1', 'service_id': 'service id1'},
        {'id': 'rep2', 'name': 'rep 2', 'service_id': 'service id2'},
        {'id': 'rep3', 'name': 'rep 3', 'service_id': 'service id3'}
      ];
      streams.authenticated.push({
        'user': {'organisation_id': 'org_id', 'id': 'user_id'}
      });
      streams.orgRepositories.push(data);

      dispose = store.app.changes().map('.toJS').map('.currentOrganisation.repositories')
        .onValue(orgRepositories => {
          orgRepositories.should.eql({
            rep1: {'id': 'rep1', 'name': 'rep 1', 'service_id': 'service id1'},
            rep2: {'id': 'rep2', 'name': 'rep 2', 'service_id': 'service id2'},
            rep3: {'id': 'rep3', 'name': 'new rep name', 'service_id': 'service id3'}
          });
          done();
        });

      var newData = {'id': 'rep3', 'name': 'new rep name', 'service_id': 'service id3'};
      streams.repository.push(newData);

    });

    it('should remove a repository on "deletedRepository"', done => {
      var data = [
        {id: 'id', name: 'test', 'service_id': 'service_id'},
        {id: 'id2', name: 'test2', 'service_id': 'service_id2'},
        {id: 'id3', name: 'test3', 'service_id': 'service_id3'},
        {id: 'id4', name: 'test4', 'service_id': 'service_id4'}
      ];
      streams.authenticated.push({
        'user': {'organisation_id': 'org_id', 'id': 'user_id'}
      });
      streams.orgRepositories.push(data);

      dispose = store.app.changes().map('.toJS').map('.currentOrganisation.repositories')
        .onValue(orgRepositories => {
          orgRepositories.should.eql(_.transform(data.slice(1), (result, d) => result[d.id] = d, {}));
          done();
        });

      streams.deletedRepository.push(data[0].id);
    });

    it('should set secrets on "secrets"', done => {
      var data = {
        serviceId: 'service_id',
        secrets: ['1234', '5678']
      };

      dispose = store.app.changes().map('.toJS').map('.currentOrganisation.services.service_id.secrets')
        .onValue(secrets => {
          secrets.should.eql(['1234', '5678']);
        done();
      });
      streams.secrets.push(data);
    });

    it('should set empty list for secrets on "secrets" if none provided', done => {
      var data = {
        serviceId: 'service_id',
        secrets: []
      };

      dispose = store.app.changes().map('.toJS').map('.currentOrganisation.services.service_id.secrets')
        .onValue(secrets => {
          secrets.should.eql([]);
          done();
      });
      streams.secrets.push(data);
    });


    it('should navigate to the account page when "/account" is received', done => {
      dispose = store.app.changes().map('.toJS').map('.page').onValue(page => {
        page.component.should.eql(pages['/account']);
        done();
      });

      streams.navigate.push('/account');

    });

    it('should navigate to the default login page when an unrecognised path is received', done => {
      dispose = store.app.changes().map('.toJS').map('.page').onValue(page => {
        page.component.should.eql(pages['/login']);
        done();
      });

      streams.navigate.push('/unknown');
    });
  });

  describe('password change', () => {
    it('should pass on the passwordChanged event', done => {
      dispose = store.passwordChanged.onValue(err => {
        err.should.eql(true);
        done();
      });

      streams.passwordChanged.push(true);
    });
  });

  describe('errors', () => {
    it('should extract an error message from an API response', done => {
      var expected = 'test';
      dispose = store.errors.onValue(err => {
        err.should.eql([expected]);
        done();
      });

      streams.authenticated.error({response: {body: {errors: [expected]}}});
    });

    it('should extract the message from an Error object', done => {
      var expected = 'test';
      dispose = store.errors.onValue(err => {
        err.should.eql([expected]);
        done();
      });

      streams.authenticated.error(new Error(expected));
    });

    it('password change 401 errors should look like a validation error', done => {
      dispose = store.errors.onValue(err => {
        err.should.eql([{message: 'Incorrect password', field: 'current_password'}]);
        done();
      });

      streams.passwordChanged.error({response: {status: 401}});
    });
  });
});
