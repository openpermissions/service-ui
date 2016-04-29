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
      PropTypes = require('../prop-types'),
      actions = require('../actions'),
      consts = require('../constants');


const RequestRow = React.createClass({
  displayName: 'Request',

  mixins: [PureRenderMixin],

  propTypes: {
    viewUser: PropTypes.Immutable.Map.isRequired,
    viewOrg: PropTypes.Immutable.Map.isRequired,
    user: PropTypes.Immutable.Map.isRequired,
    showUser: PropTypes.func.isRequired
  },

  _showDetails: function () {
    return event => {
      if (event) { event.preventDefault(); }
      return this.props.showUser(this.props.viewUser);
    };
  },

  _approveRequest: function () {
    actions.updateJoinOrganisation.push({
      'organisationId': this.props.viewOrg.get('id'),
      'userId': this.props.viewUser.get('id'),
      'joinState': consts.joinStates.approved
    });
  },

  _rejectRequest: function () {
    actions.updateJoinOrganisation.push({
      'organisationId': this.props.viewOrg.get('id'),
      'userId': this.props.viewUser.get('id'),
      'joinState': consts.joinStates.rejected
    });
  },

  render: function() {
    const viewUser = this.props.viewUser.toJS();
    const viewOrg = this.props.viewOrg.toJS();
    return (
    /* jshint ignore:start */
      <tr key={this.props.viewUser}>
        <td>
          {viewUser['first_name']} {viewUser['last_name']} wants to join {viewOrg['name']}</td>
        <td><a href='#' onClick={this._approveRequest}> Approve </a>
          <a href='#' onClick={this._rejectRequest}> Reject </a>
          <a href='#' onClick={this._showDetails()}> Details </a></td>
      </tr>
    /* jshint ignore:end*/
    );
  }
});

const RequestsList = React.createClass({
  displayName: 'Requests',

  mixins: [PureRenderMixin],

  propTypes: {
    user: PropTypes.Immutable.Map.isRequired,
    filterOrg: PropTypes.string.isRequired,
    users: PropTypes.Immutable.List.isRequired,
    organisations: PropTypes.Immutable.List.isRequired,
    showUser: PropTypes.func.isRequired
  },

  /**
   * returns an array of users that belong to the given organisation and have join state pending.
   */
  _getPendingUsers: function(orgId) {
    const users = this.props.users.toArray();
    if (orgId!=='all') {
      return (
        _.filter(users,
          user => {
            return(
              user.get('organisations').get(orgId)!==undefined &&
              user.get('organisations').get(orgId).get('join_state')===consts.joinStates.pending);
          }
        )
      );
    } else {
      return (
        _.filter(users,
          user=>{
            const userOrgs = user.get('organisations').toJS();
            for (const orgId in userOrgs) {
              if (userOrgs[orgId].join_state===consts.joinStates.pending) {
                return true;
              }
            }
            return false;
          }
        )
      );
    }
  },

  /**
   * Get organisation for given orgId
   */
  getOrgById: function (orgId) {
    return (
      _.find(this.props.organisations.toArray(), function(usr) {
        return usr.get('id')===orgId;})
    );
  },


  /**
   * Render a list of requests
   *
   */
  render: function () {
    const orgUsers = this._getPendingUsers(this.props.filterOrg);
    const filterOrg = this.props.filterOrg;

    const rows = [];

    /* jshint ignore:start */
    //TODO: Is there a neater way to do this?
    _.map(orgUsers,
      user => {
        if (filterOrg==='all') {
          _.map(Object.keys(user.get('organisations').toJS()), orgId => {
            const orgInfo = user.get('organisations').toJS()[orgId];
            const viewOrg = this.getOrgById(orgId);
            if (viewOrg && orgInfo.join_state===consts.joinStates.pending) {
              rows.push(
                <RequestRow
                  key={user.get('id')+' '+viewOrg.get('id')}
                  user={this.props.user}
                  viewUser={user}
                  viewOrg={viewOrg}
                  showUser={this.props.showUser}
                />
              );
            }
          });
        } else {
          const viewOrg = this.getOrgById(filterOrg);
          rows.push(
            <RequestRow
              key={user.get('id')+' '+viewOrg.get('id')}
              user={this.props.user}
              viewUser={user}
              viewOrg={viewOrg}
              showUser={this.props.showUser}
            />
          );
        }
      }
    );

    return(
        <table className='users table'>
          <thead>
            <tr>
              <th>Requests</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
    );
    /* jshint ignore:end */
  }
});

module.exports = RequestsList;
