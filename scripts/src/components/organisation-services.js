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
      Rating = require('react-rating'),
      actions = require('../actions'),
      PropTypes = require('../prop-types'),
      DeleteModal = require('./delete-modal'),
      util = require('../util'),
      messages = require('../messages');

const OrganisationServices = React.createClass({
  displayName: 'Organisation Services',
  mixins: [PureRenderMixin],

  propTypes: {
    user: PropTypes.Immutable.Map.isRequired,
    onEdit: React.PropTypes.func.isRequired,
    currentOrganisation: PropTypes.Immutable.Map.isRequired,
    validationErrors: React.PropTypes.object
  },

  getInitialState: function() {
    return {
      deleteOrganisation: false
    };
  },

  /**
   * Change internal showForm state to false
   */
  _closeModal: function (event) {
    if (event) { event.preventDefault(); }
    this.setState({deleteOrganisation: false});
  },

  /**
   * Push deleteOrganisation action
   */
  _delete: function() {
    if (!this.state.deleteOrganisation) { return; }
    actions.selectOrganisation.push();
    actions.deleteOrganisation.push({
      organisationId: this.props.currentOrganisation.get('id')
    });
    this._closeModal();
  },

  /**
   * Change internal showForm state to true
   */
  _editOrganisation: function (event) {
    if (event) { event.preventDefault(); }
    this.props.onEdit();
  },

  /**
   * Remove current organisation
   */
  _switchOrganisation: function(event) {
    if (event) { event.preventDefault(); }
    actions.selectOrganisation.push();
  },

  /**
   * Set internal deleteOrganisation
   */
  _deleteOrganisation: function(event) {
    if (event) { event.preventDefault(); }
    this.setState({deleteOrganisation: true});
  },

  render: function() {
    return (
      <div>
        <h1><span><Rating readonly={true} empty={'fa fa-star-o gold'} full={'fa fa-star gold'} initialRate={this.props.currentOrganisation.get('star_rating')}/></span> {this.props.currentOrganisation.get('name')}</h1>
        <div className='edit form-group'>
          <button onClick={this._switchOrganisation} className={'btn btn-primary'}>{messages.requests.actions.switch}</button>
          {util.isAdmin(this.props.user.toJS(), this.props.currentOrganisation.get('id')) &&
          <span>
            <button className={'btn btn-primary'} onClick={this._editOrganisation}>{messages.requests.actions.editOrg}</button>
            <button className={'btn btn-danger'} onClick={this._deleteOrganisation}>{messages.requests.actions.deleteOrg}</button>
          </span>
          }
        </div>
        {this.state.deleteOrganisation &&
          <DeleteModal type='organisation' onClose={this._closeModal} onDelete={this._delete} />}
      </div>
    );
  }

});

module.exports = OrganisationServices;
