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
      ReactCSSTransitionGroup = require('react-addons-css-transition-group'),
      PureRenderMixin = require('react-addons-pure-render-mixin'),
      _ = require('lodash'),
      PropTypes = require('../prop-types'),
      actions = require('../actions'),
      Modal = require('./modal'),
      UserForm = require('./user-edit-form'),
      Users = require('./users-list'),
      UserListFilter = require('./users-filter'),
      util = require('../util'),
      consts = require('../constants');

const UsersSection = React.createClass({
  displayName: 'Manage Users Section',
  mixins: [PureRenderMixin],

  propTypes: {
    currentUser: PropTypes.Immutable.Map.isRequired,
    validationErrors: PropTypes.object,
    users: PropTypes.Immutable.List.isRequired,
    roles: PropTypes.Immutable.List.isRequired,
    organisations: PropTypes.Immutable.List.isRequired
  },

  /**
  * push a Users object
  */
  componentWillMount: function() {
    //TODO: Investigate whether we actually need this!
    actions.getUsers.push();
    actions.getRoles.push();
    actions.getOrganisations.push();
  },

  getInitialState: function () {
    return {showForm: false, editUserId: undefined, filterName: '', filterOrg:'all'};
  },

  /**
   * Change internal showForm state to false
   */
  _closeModal: function(event) {
    if (event) { event.preventDefault(); }
    this.setState({showForm: false, editUserId: undefined});
  },

  /**
   * Change internal showForm state to true and set the user that should be edited
   */
  _editUser: function(userId) {
    this.setState({showForm: true, editUserId: userId});
  },

  /**
   * Change filterName state
   */
  _changeFilterName: function(text) {
    this.setState({filterName: text});
  },

  /**
   * Change filterOrg state
   */
  _changeFilterOrg: function(orgName) {
    this.setState({filterOrg: orgName});
  },

  getOrganisations: function(user) {
    if (util.isAdmin(user)) {
      return this.props.organisations.filter(function(org) {
        return org.get('state')===consts.states.approved;
      });
    }

    let orgIds = util.getOrganisationIdsByRole(user, consts.roles.admin);
    return this.props.organisations.filter(function(org) {
      return orgIds.indexOf(org.get('id')) != -1;
    });
  },

  getUsers: function(user) {
    if (util.isAdmin(user)) {
      return this.props.users;
    }

    let orgIds = util.getOrganisationIdsByRole(user, consts.roles.admin);

    return this.props.users.filter(function(user) {
      const orgs = user.get('organisations').toJS();
      const userOrgs = _.filter(Object.keys(orgs),
          org => orgs[org]['state'] == consts.states.approved);
      return _.intersection(orgIds, userOrgs).length != 0;
    });
  },

  render: function () {
    const organisations = this.getOrganisations(this.props.currentUser.toJS()),
          users = this.getUsers(this.props.currentUser.toJS());

    const self = this;
    const editUser = users.find(function(user) {
      return user.get('id') === self.state.editUserId;
    });

    /* jshint ignore:start */
    return (
      <div className={'container users'}>
        <section>
          <h1>Users</h1>
          <p className='intro' />
          <UserListFilter
            filterName={this.state.filterName}
            filterOrg={this.state.filterOrg}
            changeFilterName={this._changeFilterName}
            changeFilterOrg={this._changeFilterOrg}
            organisations={organisations}
          />
          <Users
            filterName={this.state.filterName}
            filterOrg={this.state.filterOrg}
            users={users}
            editUser={this._editUser}
            organisations={organisations}
          />
          {this.props.children}
        </section>

        <ReactCSSTransitionGroup transitionName='modal'
         transitionLeaveTimeout={500} transitionEnterTimeout={500}>
          {this.state.showForm &&
            <Modal onClose={this._closeModal} key='modal'>
              <UserForm
               currentUser={this.props.currentUser}
               editUser={editUser.toJS()}
               organisations={this.props.organisations}
               onClose={this._closeModal}
               roles={this.props.roles}
               key='form'
               validationErrors={this.props.validationErrors}/>
            </Modal>
          }
        </ReactCSSTransitionGroup>

      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = UsersSection;
