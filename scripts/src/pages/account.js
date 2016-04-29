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
      PureRenderMixin = require('react-addons-pure-render-mixin'),
      PropTypes = require('../prop-types'),
      util = require('../util'),
      consts = require('../constants'),
      Tabs = require('react-simpletabs'),
      ManageUsersSection = require('../components/manage-users-section'),
      ManageAccountSection = require('../components/manage-account-section');

const Manage = React.createClass({
  displayName: 'Manage Account / Users Page',

  propTypes: {
    loggedIn: PropTypes.bool.isRequired,
    verified: PropTypes.bool.isRequired
  },

  statics: {
    loginRequired: true,
    verificationRequired: true
  },

  mixins: [PureRenderMixin],

  render: function () {
    let manageUsers = (<div/>);
    if (util.hasRole(this.props.user.toJS(), consts.roles.admin)) {
      manageUsers=(
        <Tabs.Panel title='Manage Users'>
          <div className='manageUsers'>
            <ManageUsersSection
              currentUser={this.props.user}
              organisations={this.props.organisations}
              users={this.props.users}
              roles={this.props.roles}
              validationErrors={this.props.validationErrors} />
          </div>
        </Tabs.Panel>
      )
    }
    return (
      <Tabs>
        <Tabs.Panel title='Manage Account'>
          <div className='account container'>
            <ManageAccountSection
              currentUser={this.props.user}
              validationErrors={this.props.validationErrors}
              passwordChanged={this.props.passwordChanged}/>
           </div>
        </Tabs.Panel>
        {manageUsers}
      </Tabs>
    );
  }
});

module.exports = Manage;
