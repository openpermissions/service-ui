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
      LinkedStateMixin = require('react-addons-linked-state-mixin'),
      PropTypes = require('../prop-types'),
      _ = require('lodash'),
      actions = require('../actions'),
      ErrorMessages = require('./error-messages'),
      Immutable = require('immutable');


const Permission = React.createClass({
  displayName: 'Permission Row',

  mixins: [PureRenderMixin, LinkedStateMixin],

  propTypes: {
    entityType: React.PropTypes.string.isRequired,
    serviceTypes: PropTypes.Immutable.List,
    organisations: PropTypes.Immutable.List,
    permission: PropTypes.Immutable.Map,
    toDelete: PropTypes.bool,
    updateState: PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      type: this.props.permission.get('type'),
      value: this.props.permission.get('value'),
      permission: this.props.permission.get('permission'),
      toDelete: this.props.toDelete
    };
  },

  componentDidUpdate: function() {
    this.props.updateState(this.state);
  },

  _toggleRemoval: function(e) {
    e.preventDefault();
    this.setState({toDelete: !this.state.toDelete});
  },

  getValueOptions: function(type) {
    if (type == 'organisation_id') {
      return this.props.organisations.map(org =>
        <option key={org.get('id')} value={org.get('id')}>{org.get('name')}</option>);
    }
    if (type == 'service_type') {
      return this.props.serviceTypes.map(serv =>
        <option key={serv} value={serv}>{_.capitalize(serv)}</option>);
    }
    return (<option key={null} value={null}></option>);
  },

  updateState: function(event){
    const newType = event.target.value;
    const newState = {type: newType};
    if (newType == 'organisation_id') {
      if (this.props.organisations.map(org=>org.get('id')).indexOf(this.state.value) == -1){
        newState.value = null;
      }
    }
    else if (newType == 'service_type') {
      if (this.props.serviceTypes.indexOf(this.state.value) == -1){
        newState.value = null;
      }
    }
    else {
      newState.value = null;
    }


    this.setState(newState);
  },

  render: function () {
    const accessMap = {
      'r': 'Read',
      'w': 'Write',
      'rw': 'Read/Write',
      '-': 'None'
    };

    const accessTypes = {
      'all': 'All',
      'organisation_id': 'Organisation'
    };
    if (this.props.entityType == 'service') {
      accessTypes.service_type = 'Service Type'
    }

    return (
      <tr className={this.state.toDelete? 'disabled': ''}>

        <td>
          <select
            onChange={this.updateState}
            disabled={this.state.toDelete}
            className='org_id form-control'
            value={this.state.type}
            defaultValue='all'>
            {_.map(accessTypes, (name, value) =>
              <option key={value} value={value}>{name}</option>)}
          </select>
        </td>

        <td>
          <select
            disabled={this.state.toDelete || this.state.type == 'all'}
            className='org_id form-control'
            valueLink={this.linkState('value')} defaultValue={null}>
            <option value={null}></option>
            {this.getValueOptions(this.state.type)}
          </select>
        </td>

        <td>
          <select
            disabled={this.state.toDelete}
            className='access form-control' required={true}
            valueLink={this.linkState('permission')} defaultValue='r'>
            {_.map(accessMap,(name, access) =>
              <option key={access} value={access}>{name}</option>)}
          </select>
        </td>
        <td>
          <a href='#' onClick={this._toggleRemoval}>{this.state.toDelete ? 'Undo' : 'Remove'}</a>
        </td>
      </tr>

    );
  }
});

const PermissionForm = React.createClass({
  displayName: 'Update permission form',

  mixins: [PureRenderMixin, LinkedStateMixin],

  propTypes: {
    entity: React.PropTypes.object.isRequired,
    entityType: React.PropTypes.string.isRequired,
    orgId: React.PropTypes.string,
    onClose: React.PropTypes.func,
    serviceTypes: PropTypes.Immutable.List,
    organisations: PropTypes.Immutable.List,
    validationErrors: React.PropTypes.object
  },

  componentWillMount: function () {
    if (this.props.serviceTypes.size === 0) {
      actions.getServiceTypes.push();
    }

    if (this.props.organisations.size === 0) {
      actions.getOrganisations.push();
    }

  },

  _permissionMap: function(permissions) {
    return permissions.map( p =>
        Immutable.fromJS({permission: p, toDelete: false}));
  },

  getInitialState: function () {
    return {
      permissions: this._permissionMap(this.props.entity.get('permissions')),
      errors: {},
      updated: false,
      submitted: false
    };
  },

  componentWillReceiveProps: function(nextProps) {
    const errors = nextProps.validationErrors || {};
    let updated = false;
    if (Object.keys(errors).length == 0) {
      if (this.state.submitted) {
        if (!nextProps.entity.get('permissions').equals(this.props.entity.get('permissions'))) {
          updated=true;
        }
        this.setState({
          permissions: this._permissionMap(nextProps.entity.get('permissions'))
        });
      }
    }

    this.setState({
      errors: errors,
      updated: updated,
      submitted: !updated && this.state.submitted
    });
  },

  /**
   * Push a updateService action
   */
  _update: function () {
    if (this.props.entityType == 'service') {
      const service = {
        serviceId: this.props.entity.get('id'),
        permissions: this.state.permissions
                      .filter(p => !p.get('toDelete'))
                      .map(p => p.get('permission'))
      };
      actions.updateService.push(service);
    } else if (this.props.entityType == 'repository') {
      const repository = {
        repositoryId: this.props.entity.get('id'),
        name: this.props.entity.get('name'),
        permissions: this.state.permissions
                      .filter(p => !p.get('toDelete'))
                      .map(p => p.get('permission'))
      };
      actions.updateRepository.push(repository);
    }
  },

  /**
   * Update service
   *
   * @param {object} event
   */
  _onSubmit: function (event) {
    event.preventDefault();
    this._update();
    this.setState({submitted: true, updated: false});
  },

  _addRow: function() {
    const row = Immutable.fromJS({'permission': {'type': 'all', 'value': null, 'permission': 'r'}, 'toDelete': false});
    this.setState({'permissions': this.state.permissions.push(row)});
  },

  _updateState: function(key, state) {
    const permissions = this.state.permissions;

    const rule = _.pick(state, (value, key) => key !=='toDelete');
    const permission = Immutable.fromJS({'permission': rule, toDelete: state.toDelete});

    if (!permissions.get(key).equals(permission)) {
      this.setState({'permissions': permissions.set(key, permission)});
    }
  },

  uuid: function () {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  },

  /**
   * Render a form
   *
   * @returns {object}
   */
  render: function () {
    const heading = 'Access Permissions';
    const permissions = this.state.permissions.map((v, k)=>
        <Permission
          key={this.uuid()}
          ref={k}
          entityType={this.props.entityType}
          updateState={this._updateState.bind(this, k)}
          serviceTypes={this.props.serviceTypes}
          organisations={this.props.organisations}
          permission={v.get('permission')}
          toDelete={v.get('toDelete')}
        />
    );

    return (
      <div id='crhu_form_section'>
        <h2>{heading}</h2>
        <form id='crhu_form' className='permissions' onSubmit={this._onSubmit}>

          <table className='table'>
            <thead>
              <tr>
              </tr>
            </thead>
            <tbody>
              {permissions}
            </tbody>
          </table>

          <div className='form-group'>
            <a onClick={this._addRow}>Add row</a>
            <ErrorMessages errors={this.state.errors['permissions']} />
          </div>

          <div className='form-group'>
            <button type='submit' className='btn btn-primary'>{'Update'}</button>
            {this.state.updated && <small className='crhu_updated'>Updated</small>}
          </div>
        </form>
      </div>
    );
  }
});

module.exports = PermissionForm;
