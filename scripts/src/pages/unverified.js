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

const React = require('react'),
      PropTypes = require('../prop-types');

var Unverified = React.createClass({
  displayName: 'Unverified User',

  propTypes: {
    loggedIn: PropTypes.bool.isRequired,
    verified: PropTypes.bool.isRequired
  },

  statics: {
    loginRequired: true,
    onlyUnverified: true
  },

  render: function () {
    return (
      <div className='container'>
        <p className={'sub-heading'}>
          Thank you for registering with the Open Permissions Platform.
        </p>
        In order to proceed you will need to verify your account.{" "}
        You should receive an email from us shortly with details on how to do this.<br/>
        If you haven't received an email from us, please contact {" "}
        <a href="mailto:support@openpermissions.org?Subject=Account%20Validation%20Issue" target="_top">
          support@openpermissions.org
        </a>
        {" "}for assistance.
      </div>
    );
  }
});

module.exports = Unverified;
