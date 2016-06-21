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

var React = require('react'),
    PureRenderMixin = require('react-addons-pure-render-mixin'),
    AuthorizationMixin = require('./mixins/authorization-mixin'),
    _ = require('lodash'),
    PropTypes = require('../prop-types'),
    util = require('../util'),
    consts = require('../constants');

var OrgRoles = React.createClass({
  displayName: 'Roles for Organization',

  mixins: [PureRenderMixin,AuthorizationMixin],

  propTypes: {
    currentUser: PropTypes.Immutable.Map.isRequired,
    roles: PropTypes.Immutable.List.isRequired,
    organisations: PropTypes.Immutable.List.isRequired,
    orgId: PropTypes.string.isRequired,
    changeOrgRoles: PropTypes.func.isRequired,
    currentRole: PropTypes.string.isRequired
  },

  _getRoleOptions: function(roles, org){
    return _.map(roles, (role) => {
      var roleId = org + '-' + role.get('id');
      return <option key={roleId} value={role.get('id')}>{role.get('name')}</option>;
    });
  },

  changeOrgRoles: function () {
    return this.props.changeOrgRoles(
        this.props.orgId,
        this.refs.dropdownInput.value
    );
  },

  renderPolicy: function () {
    return util.isOrgAdmin(this.props.currentUser.toJS(), this.props.orgId);
  },

  render: function () {
    const roles = this.props.roles.toArray();
    const orgId = this.props.orgId;
    let orgName;

    if (orgId === consts.globalRole) {
      orgName = orgId.charAt(0).toUpperCase() + orgId.substring(1);
    } else {
      orgName = this.props.organisations.find(org => org.get('id') == orgId).toJS().name;
    }
    return (
      <div key={this.props.orgId} className={'form-group col col-xs-12'}>
        <label key={this.props.orgId} className={'label--big'}>{orgName}</label>
        <select
          value={this.props.currentRole}
          onChange={this.changeOrgRoles}
          ref = 'dropdownInput'
          className={'form-control'}>
            {this._getRoleOptions(roles,this.props.orgId)}
        </select>
      </div>
    );
  }
});


module.exports = OrgRoles;
