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
      _ = require('lodash'),
      actions = require('../actions'),
      ErrorMessages = require('./error-messages'),
      messages = require('../messages');

const RepositoryForm = React.createClass({
  displayName: messages.labels.createSrvForm,

  mixins: [PureRenderMixin, LinkedStateMixin],

  propTypes: {
    orgId: React.PropTypes.string,
    onClose: React.PropTypes.func,
    repositoryServices: React.PropTypes.Immutable.List,
    repository: React.PropTypes.object,
    validationErrors: React.PropTypes.object,
    readOnly: React.PropTypes.bool,
    orgIndexById: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      name: this.props.repository ? this.props.repository.get('name'): '',
      organisationId: this.props.orgId,
      serviceId: this.props.repository ? this.props.repository.get('service').get('id'): '',
      errors: {},
      updated: false,
      submitted: false
    };
  },

  componentWillReceiveProps: function(nextProps) {
    const errors = nextProps.validationErrors || {};
    if (_.isEmpty(errors) && this.props.onClose) {
      this.props.onClose();
      return;
    }
    let updated = false;
    if (this.props.repository) {
      const fields = ['name', 'service'];
      if (this.state.submitted) {
        for (let i = 0; i < fields.length; i++) {
          const field = fields[i];
          if (nextProps.repository.get(field) !== this.props.repository.get(field)) {
            updated = true;
            break;
          }
        }
      }
    }

    this.setState({
      errors: errors,
      updated: updated,
      submitted: !updated && this.state.submitted
    });
  },


  /**
   * Push a createRepository action
   */
  _create: function () {
    const state = _.transform(_.omit(this.state, ['errors', 'updated', 'submitted']),
                            (result, v, k) => {if (v.trim() !== '') {result[k] = v.trim();}});
    actions.createRepository.push(state);
  },


  /**
   * Push a updateRepository action
   */
  _update: function () {
    if (this.props.repository) {
      const updates = {};

      if (this.state.name !== this.props.repository.get('name')) {
        updates['name'] = this.state.name;
      }

      if (Object.keys(updates).length) {
        updates['repositoryId'] = this.props.repository.get('id');
        actions.updateRepository.push(updates);
      }
    }
  },

  /**
   * Either create or update a service
   *
   * @param {object} event
   */
  _onSubmit: function (event) {
    event.preventDefault();
    if (!this.props.repository) {
      this._create();
    } else {
      this._update();
    }
    this.setState({submitted: true, updated: false});
  },

  /**
   * Render a form
   *
   * @returns {object}
   */
  render: function () {
    const heading = this.props.repository ? 'Repository' : 'Create a New Repository',
          submit = this.props.repository ? 'Update' : 'Create';

    var repositoryService;
    if (this.props.repository) {
      repositoryService = (
        <input type='text' className='name form-control' required={true} placeholder='Repository Name'
               readOnly value={this.props.repository.get('service').get('name')}/>
      )
    } else {
      repositoryService = (
        <select className='service-type form-control' required={true} placeholder='Repository Service'
                valueLink={this.linkState('serviceId')} defaultValue='' readOnly={this.props.repository}>
          <option value='' disabled={true}>{messages.labels.selectOpt}</option>
          {this.props.repositoryServices.map(srv =>
            <option key={srv.get('id')}
                    value={srv.get('id')}>{srv.get('name')} ({this.props.orgIndexById[srv.get('organisation_id')].name})
            </option>
          )}
        </select>
      )
    }

    return (
      <div id="crhu_form_section">
        <h1>{heading}</h1>

        <form id='crhu_form' className='service form row' onSubmit={this._onSubmit}>
          <div className={'form-group col col-xs-12'}>
            <label>Name:</label>
            <input type='text' className='name form-control' required={true} placeholder='Repository Name'
             valueLink={this.linkState('name')} readOnly={this.props.readOnly}/>
          </div>

          <div className={'form-group col col-xs-12'}>
            <label>Repository Service:</label>
            {repositoryService}
          </div>

          <ErrorMessages errors={this.state.errors['name']} />

          <div className={'form-group col col-xs-12'}>
            {!this.props.readOnly &&
              <button type='submit' className='btn btn-primary'>{submit}</button>
            }

            {!!this.props.onClose &&
              <button className='btn btn-default' id='crhu_button_cancel'
                onClick={this.props.onClose}>
                Cancel
              </button>
            }
            {!!this.state.updated && <small className='crhu_updated'>Updated</small>}
          </div>
        </form>
      </div>
    );
  }
});

module.exports = RepositoryForm;
