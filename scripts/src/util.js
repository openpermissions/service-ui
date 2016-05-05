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

const _ = require('lodash');
const consts = require('./constants');

/**
 * Return a function that picks the values from an object in the same order as
 * keys
 *
 * @param {array} keys - a list of object keys
 * @return {function}
 */
function valuesFor(keys) {
  return obj => _.map(keys, key => obj[key]);
}

function mapObject(obj, func) {
  const attrs = _.keys(obj);
  return _.zipObject(attrs, _.map(attrs, func));
}

/**
 * Find duplicates in an array
 *
 * @param {array} items
 * @return {array}
 */

function findDuplicates(items) {
  const duplicates = _.reduce(_.countBy(items), (result, v, k) => { 
    if (v > 1)  { result.push(k); } 
    return result;
  }, []);
  return duplicates;
}


function isAdmin(user) {
  /**
   * Returns whether user is a system administrator
   */
  return user[consts.role] == consts.roles.admin && user[consts.state] == consts.states.approved;
}

function isOrgAdmin(user, orgId) {
  /**
 * Returns whether user is administrator for organisation
 * @param user
 * @param orgId
 * @returns {bool}
 */
  if (!orgId) {
    throw new Error('Must provide an organisation id')
  }

  if (isAdmin(user)) {
    return true;
  }

  return hasRole(user, consts.roles.admin, orgId);
}

/**
 * Returns whether user has role
 * If org is specified, returns whether user has role for that organisation
 * @param user
 * @param role
 * @param org
 * @returns {bool}
 */
function hasRole(user, role, org) {
  const orgs = user.organisations;

  if (org !== undefined) {
    if (!(org in orgs)) {
      return false;
    }

    return (orgs[org][consts.role] === role &&
      orgs[org][consts.state] === consts.states.approved) ||
      (user[consts.role] === role && user[consts.state] === consts.states.approved);
  }

  if (user[consts.role] === role && user[consts.state] === consts.states.approved) {
    return true;
  }

  for (var key in orgs) {
    if (orgs[key][consts.role] === role &&
        orgs[key][consts.state] === consts.states.approved)
    {
      return true;
    }
  }
  return false;
}

/**
 * Returns array of organisation ids that a user has specified role for
 * @param user
 * @param role
 * @returns Array of organisation Ids
 */
function getOrganisationIdsByRole(user, role) {
  const organisations = user.organisations;
  return _.filter(Object.keys(organisations),
      value => organisations[value][consts.role] === role &&
      organisations[value][consts.state] === consts.states.approved);
}

/**
* Returns array of organisations that a user has specified state for
* @param user
* @param state
* @returns array of organisation Ids
*/
function getOrganisationIdsByState(user, state) {
  const organisations = user.organisations;
  return _.filter(Object.keys(organisations),
      value => organisations[value][consts.state] === state);
}


module.exports = {
  valuesFor: valuesFor,
  mapObject: mapObject,
  isAdmin: isAdmin,
  isOrgAdmin: isOrgAdmin,
  hasRole: hasRole,
  getOrganisationIdsByRole: getOrganisationIdsByRole,
  getOrganisationIdsByState: getOrganisationIdsByState,
  findDuplicates: findDuplicates
};
