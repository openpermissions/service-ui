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
/*global describe, it*/
/*jshint -W030 */
var should = require('should'),
    util = require('../scripts/src/util');

describe('util', function () {
  describe('valuesFor', function () {
    it('should return values from the object', function () {
      var obj = {'a': 1, 'c': 2, 'b': 3, 'd': 4};
      var func = util.valuesFor(['a', 'b', 'c']);
      func(obj).should.eql([1, 3, 2]);
    });

    it('should return undefined if a key is missing', function () {
      var obj = {'a': 1, 'c': 2, 'b': 3, 'd': 4};
      var func = util.valuesFor(['a', 'b', 'e']);
      func(obj).should.eql([1, 3, undefined]);
    });

    it('should return an empty list if no keys given', function () {
      var obj = {'a': 1, 'c': 2, 'b': 3, 'd': 4};
      var func = util.valuesFor([]);
      func(obj).should.eql([]);
    });
  });
  describe('isAdmin', function() {
    it ('should return true if user is global admin and org is provided', function() {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'administrator',
            'join_state': 'approved'
          }
        }
      };
      var result = util.isAdmin(user, 'org1');
      result.should.eql(true);
    });

    it ('should return true if user is global admin and org is not provided', function() {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'administrator',
            'join_state': 'approved'
          }
        }
      };
      var result = util.isAdmin(user);
      result.should.eql(true);
    });

    it ('should return false if user is not global admin and org is not provided', function() {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'user',
            'join_state': 'approved'
          }
        }
      };
      var result = util.isAdmin(user);
      result.should.eql(false);
    });

    it ('should return true if user is admin for given organisation', function() {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'user',
            'join_state': 'approved'
          },
          'org1': {
            'role': 'administrator',
            'join_state': 'approved'
          }
        }
      };
      var result = util.isAdmin(user, 'org1');
      result.should.eql(true);
    });
    it ('should return false if user is not admin for given organisation', function() {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'user',
            'join_state': 'approved'
          },
          'org1': {
            'role': 'user',
            'join_state': 'approved'
          }
        }
      };
      var result = util.isAdmin(user, 'org1');
      result.should.eql(false);
    });
    it ('should return false if user does not belong to given organisation', function() {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'user',
            'join_state': 'approved'
          },
          'org2': {
            'role': 'administrator',
            'join_state': 'approved'
          }
        }
      };
      var result = util.isAdmin(user, 'org1');
      result.should.eql(false);
    });

  });

  describe('hasRole', function () {
    it('should return true if user has global role', function () {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'administrator',
            'join_state': 'approved'
          },
          org1: {
            'role': 'user',
            'join_state': 'approved'
          }
        }
      };
      var result = util.hasRole(user, 'administrator');
      result.should.eql(true);
    });
    it('should return true if user has role for any organisation', function () {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'user',
            'join_state': 'approved'
          },
          org1: {
            'role': 'administrator',
            'join_state': 'approved'
          }
        }
      };
      var result = util.hasRole(user, 'administrator');
      result.should.eql(true);
    });
    it('should return false if user does not have global role or role for any organisation', function () {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'user',
            'join_state': 'approved'
          },
          org1: {
            'role': 'user',
            'join_state': 'approved'
          }
        }
      };
      var result = util.hasRole(user, 'administrator');
      result.should.eql(false);
    });
    it('should return false if user does not have global role or approved role for any organisation', function () {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'user',
            'join_state': 'approved'
          },
          org1: {
            'role': 'administrator',
            'join_state': 'pending'
          }
        }
      };
      var result = util.hasRole(user, 'administrator');
      result.should.eql(false);
    });
    it('should return false if querying invalid role', function () {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'user',
            'join_state': 'approved'
          },
          org1: {
            'role': 'administrator',
            'join_state': 'approved'
          }
        }
      };
      var result = util.hasRole(user, 'invalid_role');
      result.should.eql(false);
    });
  });
  describe('hasRole with org', function () {
    it('should return true if user has global role and belongs to org', function () {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'administrator',
            'join_state': 'approved'
          },
          org1: {
            'role': 'user',
            'join_state': 'approved'
          }
        }
      };
      var result = util.hasRole(user, 'administrator', 'org1');
      result.should.eql(true);
    });
    it('should return false if user has global role but does not belong to org', function () {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'administrator',
            'join_state': 'approved'
          },
          org1: {
            'role': 'user',
            'join_state': 'approved'
          }
        }
      };
      var result = util.hasRole(user, 'administrator', 'org2');
      result.should.eql(false);
    });
    it('should return false if user does not belong to specific organisation', function () {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'user',
            'join_state': 'approved'
          },
          org1: {
            'role': 'user',
            'join_state': 'approved'
          }
        }
      };
      var result = util.hasRole(user, 'administrator', 'org2');
      result.should.eql(false);
    });
    it('should return false if user has not been approved for specific organisation', function () {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'user',
            'join_state': 'approved'
          },
          org1: {
            'role': 'administrator',
            'join_state': 'pending'
          }
        }
      };
      var result = util.hasRole(user, 'administrator', 'org2');
      result.should.eql(false);
    });
    it('should return true if user has role for specific organisation', function () {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'user',
            'join_state': 'approved'
          },
          org1: {
            'role': 'administrator',
            'join_state': 'approved'
          },
          org2: {
            'role': 'user',
            'join_state': 'approved'
          }
        }
      };
      var result = util.hasRole(user, 'administrator', 'org1');
      result.should.eql(true);
    });
    it('should return false if user does not have global role or role for specific organisation', function () {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'user',
            'join_state': 'approved'
          },
          org1: {
            'role': 'administrator',
            'join_state': 'approved'
          },
          org2: {
            'role': 'user',
            'join_state': 'approved'
          }
        }
      };
      var result = util.hasRole(user, 'administrator', 'org2');
      result.should.eql(false);
    });

    it('should return false if invalid role', function () {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'user',
            'join_state': 'approved'
          },
          org1: {
            'role': 'administrator',
            'join_state': 'approved'
          }
        }
      };
      var result = util.hasRole(user, 'invalid_role', 'org1');
      result.should.eql(false);
    });
  });
  
  describe('getOrganisationIdsByRole', function() {
    it('should return an array of one organisation id if user has given role for one organisation', function() {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'user',
            'join_state': 'approved'
          },
          org1: {
            'role': 'administrator',
            'join_state': 'approved'
          }
        }
      };
      var role = 'user';
      var result = util.getOrganisationIdsByRole(user, role);
      result.should.eql(['global']);
    });
    it('should return an array of multiple organisation ids if user has given role for multiple organisations', function() {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'user',
            'join_state': 'approved'
          },
          org1: {
            'role': 'administrator',
            'join_state': 'approved'
          },
          org2: {
            'role': 'user',
            'join_state': 'approved'
          }
        }
      };
      var role = 'user';
      var result = util.getOrganisationIdsByRole(user, role);
      result.should.eql(['global', 'org2']);
    });
    it('should return an empty array if user does not have given role', function() {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'administrator',
            'join_state': 'approved'
          },
          org1: {
            'role': 'administrator',
            'join_state': 'approved'
          }
        }
      };
      var role = 'user';
      var result = util.getOrganisationIdsByRole(user, role);
      result.should.eql([]);
    });
  });

  describe('getOrganisationIdsByJoinState', function() {
    it('should return an array of one organisation id if user has given join state for one organisation', function() {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'administrator',
            'join_state': 'approved'
          },
          org1: {
            'role': 'administrator',
            'join_state': 'pending'
          }
        }
      };
      var joinState = 'approved';
      var result = util.getUserOrgsByState(user, joinState);
      result.should.eql(['global']);
    });
    it('should return an array of multiple organisation ids if user has given join state for multiple organisations', function() {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'user',
            'join_state': 'approved'
          },
          org1: {
            'role': 'administrator',
            'join_state': 'pending'
          },
          org2: {
            'role': 'user',
            'join_state': 'approved'
          }
        }
      };
      var joinState = 'approved';
      var result = util.getUserOrgsByState(user, joinState);
      result.should.eql(['global', 'org2']);
    });
    it('should return an empty array if user does not have given join state', function() {
      var user = {
        id: 'user_id',
        'organisations': {
          'global': {
            'role': 'administrator',
            'join_state': 'approved'
          },
          org1: {
            'role': 'administrator',
            'join_state': 'approved'
          }
        }
      };
      var joinState = 'pending';
      var result = util.getUserOrgsByState(user, joinState);
      result.should.eql([]);
    });
  });
});
