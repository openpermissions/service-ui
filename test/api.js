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
var _ = require('lodash'),
    sinon = require('sinon'),
    sinonAsPromised = require('sinon-as-promised');

var mockApi = {
  login: sinon.stub().resolves({body: {data: {token: 'token', user: {id: 'user id'}}}}),
  verify: sinon.stub().resolves({body: { data: {userId: 'user1', verified: true}}}),
  createUser: sinon.stub().resolves({body: {data: {id: 'user_id'}}}),
  updateUser: sinon.stub().resolves({body: {data:
   {id: 'user_id', email: 'user@example.com', first_name: 'test', last_name: 'user'}
  }}),
  deleteUser: sinon.stub().resolves({body: {data: 'user deleted'}}),
  getUsers: sinon.stub().resolves(
    {body: {"data": [{"first_name": "Harry",
                     "last_name": "Porter",
                     "email": "harry@example.com",
                     "id": "174018a615105866d01fa495540007da",
                     "role": "user", 
                     "state": "approved",
                     "organisations": {}}]
           }
    }
  ),
  getRoles: sinon.stub().resolves(
    {body: {"data": [{"id": "001",
                      "name": "role1"},
                     {"id": "002",
                      "name": "role2"}
                    ]
           }
    }
  ),
  updateUserRole: sinon.stub().resolves(
    {body: {"data": {"first_name": "Test",
                     "last_name": "User",
                     "email": "test@example.com",
                     "id": "67890",
                     "role": "user", 
                     "state": "approved",
                     "organisations": {"test": {"role": "user", "state": "approved"}}}
           }
    }
  ),
  updateJoinOrganisation: sinon.stub().resolves(
    {body: {"data": {"first_name": "Test",
                     "last_name": "User",
                     "email": "test@example.com",
                     "id": "67890",
                     "role": "user", 
                     "state": "approved",
                     "organisations": {"org1": {"role": "user", "state": "approved"}}}
           }
    }
  ),
  changePassword: sinon.stub().resolves({body: {data: 'password changed'}}),
  getOrganisation: sinon.stub().resolves(
    {body: {data: {name: 'test', id: 'org_id'}}}
  ),
  updateOrganisation: sinon.stub().resolves(
    {body: {data: {name: 'new name',
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
                           id: 'org_id'}
           }
    }
  ),
  getServices: sinon.stub().resolves({body: {data: [
    {name: 'test', organisation_id: 'org_id', location: 'http://test.com', id: 'service_id'},
    {name: 'other', organisation_id: 'org_id', location: 'http://other.com', id: 'other_id'}
  ]}}),
  getRepositories: sinon.stub().resolves({body: {data: [
    {id: 'id', name: 'test', 'service_id': 'service_id'},
    {id: 'id2', name: 'test2', 'service_id': 'service_id2'}
  ]}}),
  createRepository: sinon.stub().resolves(
    {body: {data:{
      name: 'my new repository',
      service_id: 'serviceId123',
      id: 'repositoryId'
    }}}
  ),
  updateRepository: sinon.stub().resolves(
    {body: {data:{
      name: 'new repository name',
      service_id: 'serviceId123',
      id: 'repositoryId'
    }}}
  ),
  deleteRepository: sinon.stub().resolves(
    {body: {data: 'repository deleted'}}
  ),
  createOrganisation: sinon.stub().resolves(
    {body: {data: {name: 'my new organisation',
                   id: 'org_id',
                   description: 'my new organisation description',
                   address: 'my address',
                   phone: '',
                   email: '',
                   website: '',
                   facebook: '',
                   googlePlus: '',
                   instagram: '',
                   youtube: '',
                   linkedin: '',
                   myspace: '',
                   twitter: 'my twitter',
                   state: 'pending'
                  }}}
  ),
  deleteOrganisation: sinon.stub().resolves(
    {body: {data: 'organisation deleted'}}
  ),
  joinOrganisation: sinon.stub().resolves(
    {body: {data: {
      "id": "user_id",
      "email": "user@example.com",
      "role": "user",
      "state": "approved",
      "organisations": {
        "org_id": {
          "role": "user",
          "state": "pending"
        }
      }
    }}}
  ),
  leaveOrganisation: sinon.stub().resolves(
    {body: {data: {
      "id": "user_id",
      "email": "user@example.com",
      "role": "user",
      "state": "approved",
      "organisations": {}
    }}}
  ),
  removeUserOrganisation: sinon.stub().resolves(
    {body: {data: {id: 'user_id'}}}
  ),
  getOrganisations: sinon.stub().resolves(
    {body: {data: [{id: 'org_id',
                    name: 'org'},
                   {id: 'org_id2',
                    name: 'org2'}]}}
  ),
  getServiceTypes: sinon.stub().resolves(
    {body: {data: ['index', 'repository']}}
  ),
  createService: sinon.stub().resolves(
    {body: {data: {
      name: 'my new service',
      location: 'http://somewhere.com',
      service_type: 'index',
      id: 'service_id'
    }}}
  ),
  updateService: sinon.stub().resolves(
    {body: {data: {
      name: 'new service name',
      location: 'http://somewhere.com',
      service_type: 'index',
      id: 'service_id'
    }}}
  ),
  deleteService: sinon.stub().resolves(
    {body: {data: 'service deleted'}}
  ),
  getSecrets: sinon.stub().resolves(
    {body: {data: ['1234', '5678']}}
  ),
  deleteSecret: sinon.stub().resolves(
    {body: {data: 'client secret deleted'}}
  ),
  deleteSecrets: sinon.stub().resolves(
    {body: {data: {
      message: 'client secrets deleted'
    }}}
  ),
  addSecret: sinon.stub().resolves(
    {body: {data: '1234'}}
  )
};

module.exports = {
  /**
   * Reset the spies on the mocked out API client
   */
  reset: function () {
    _.each(mockApi, spy => {
      if (spy) {
        spy.reset()
      }
    });
  },
  /**
   * API client stubs
   */
  api: mockApi
};
