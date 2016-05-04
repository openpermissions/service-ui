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
      AuthorizationMixin = require('./mixins/authorization-mixin'),
      _ = require('lodash'),
      PropTypes = require('../prop-types'),
      actions = require('../actions'),
      ErrorMessages = require('./error-messages'),
      OrgRoles = require('./org-roles-dropdown'),
      consts = require('../constants');

const UserForm = React.createClass({
  displayName: 'Create User form',

  mixins: [PureRenderMixin, AuthorizationMixin],

  propTypes: {
    currentUser: PropTypes.Immutable.Map.isRequired,
    onClose: React.PropTypes.func.isRequired,
    editUser: React.PropTypes.object,
    validationErrors: React.PropTypes.object,
    roles: PropTypes.Immutable.List.isRequired,
    organisations: PropTypes.Immutable.List.isRequired
  },

  _getRoleOptions: function(roles, org){
    return _.map(roles, (role) => {
      const roleId = org + '-' + role.get('id');
      return <option key={roleId} value={role.get('id')}>{role.get('name')}</option>;
    });
  },

  getInitialState: function() {
    const initialState = {};
    const organisations = this.props.editUser.organisations;
    for (const org in organisations) {
      if (organisations[org]['state'] == consts.states.approved) {
        initialState[org] = this.props.editUser.organisations[org]['role'];
      }
    }
    initialState.changes = 0;
    initialState.errors = {};
    return initialState;
  },

  componentWillReceiveProps: function(nextProps) {
    const validationErrors = nextProps.validationErrors;

    if (_.isEmpty(validationErrors)) {
      this.state.changes--;
      if (this.state.changes == 0) {
        this.props.onClose();
      }
    } else {
      this.setState({
        errors: validationErrors
      });
    }
  },

  _onSubmit: function(event) {
    event.preventDefault();
    const organisations = this.props.editUser.organisations;
    const updatedRoles = _.omit(this.state, ['changes', 'errors']);
    for (const org in updatedRoles) {
      if (updatedRoles[org] !== organisations[org]['role'] ) {
        this.state.changes++;
        const role = {
          userId: this.props.editUser.id,
          role: updatedRoles[org],
          organisationId: org == consts.globalRole ? null : org
        };
        actions.updateUserRole.push(role);
      }
    }
    if (this.state.changes == 0) {
      this.props.onClose();
    }
  },

  /**
   * Change user role for specified organization
   */
  _editOrgRoles: function(orgId, newRole) {
    const newState = {};
    newState[orgId] = newRole;
    this.setState(newState);
  },

  renderPolicy: function () {
    return true;
  },

  render: function () {
    const rows = [];

    rows.push(<OrgRoles
      currentUser={this.props.currentUser}
      key={consts.globalRole}
      organisations={this.props.organisations}
      orgId={consts.globalRole}
      roles={this.props.roles}
      currentRole={this.state[consts.globalRole]}
      changeOrgRoles={this._editOrgRoles}
    />);

    for (const org in _.omit(this.state, [consts.globalRole, 'changes', 'errors'])) {
      rows.push(
        <OrgRoles
          currentUser={this.props.currentUser}
          key={org}
          organisations={this.props.organisations}
          orgId={org}
          roles={this.props.roles}
          currentRole={this.state[org]}
          changeOrgRoles={this._editOrgRoles} />
      );
    }
    return (
      /* jshint ignore:start */
      <div id="crhu_user_edit_form_section">
        <h1>Edit user roles</h1>
        <p className={'sub-heading'}>User: {this.props.editUser.first_name} {this.props.editUser.last_name}</p>
        <form id='crhu_form' className="pure-form pure-form-stacked form row" onSubmit={this._onSubmit}>
          {rows}
          <ErrorMessages errors={this.state.errors['msgs']} />

          <div className={'form-group col col-xs-12'}>
            <button type='submit' className='btn btn-primary'>Save</button>

            <button className='btn btn-default' id='crhu_button_cancel'
              onClick={this.props.onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
      /* jshint ignore:end */
  }
});

module.exports = UserForm;
