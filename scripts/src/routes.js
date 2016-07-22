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
 * Map routes to page components
 */
const OrganisationInformation = require('./pages/organisation-info'),
      Login = require('./pages/login'),
      Signup = require('./pages/signup'),
      Account = require('./pages/account'),
      Requests = require('./pages/requests'),
      Unverified = require('./pages/unverified'),
      Verify = require('./pages/verify'),
      OfferGenerator = require('./pages/offer-generator');


module.exports = {
  '/organisation': OrganisationInformation,
  '/login': Login,
  '/signup': Signup,
  '/account': Account,
  '/unverified': Unverified,
  '/verify': Verify,
  '/requests': Requests,
  '/offers': OfferGenerator,
  defaultPaths: {
    login: '/login',
    unverified: '/unverified',
    loggedIn: '/organisation'
  }
};
