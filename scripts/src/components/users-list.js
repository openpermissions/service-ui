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
      _ = require('lodash'),
      PropTypes = require('../prop-types');

const UserRow = React.createClass({
  displayName: 'UserRow',

  mixins: [PureRenderMixin],

  propTypes: {
    editUser: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired
  },

  _edit: function (userId) {
    return event => {
      if (event) { event.preventDefault(); }
      return this.props.editUser(userId);
    };
  },

  render: function() {
    return (
      <tr key={this.props.userId}>
        <td>{this.props.userName}</td>
        <td><a href='#' onClick={this._edit(this.props.userId)}>Edit</a></td>
      </tr>
    );
  }
});

const Users = React.createClass({
  displayName: 'Users',

  mixins: [PureRenderMixin],

  propTypes: {
    editUser: PropTypes.func.isRequired,
    filterName: PropTypes.string.isRequired,
    filterOrg: PropTypes.string.isRequired,
    organisations: PropTypes.Immutable.List.isRequired
  },

  _userRow: function(orgArray, user) {
    const orgs = _.filter(Object.keys(user.organisations), value => user.organisations[value]['state'] == 'approved');
    const userName = user.first_name + ' ' + user.last_name;
    if (orgs.indexOf(this.props.filterOrg) == -1 && this.props.filterOrg != 'all') {
      return;
    }
    if (userName.toLowerCase().indexOf(this.props.filterName.toLowerCase())===-1) {
      return;
    }
    return (
      <UserRow
        key = {user.id}
        userId = {user.id}
        editUser={this.props.editUser}
        userName = {userName} />
    );
  },

  /**
   * Render a list of users
   *
   */
  render: function () {
    /* jshint ignore:start */
    const usersArray = this.props.users.toJS(),
          orgArray = _.map(this.props.organisations.toArray(),
                     org => org.toJS()
                     );

    return(
      <table className='users table'>
        <thead>
          <tr>
            <th>User</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {_.map(usersArray, user => this._userRow(orgArray,user))}
        </tbody>
      </table>
    );
    /* jshint ignore:end */
  }

});

module.exports=Users;
