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
      messages = require('../messages');

const ServiceForm = React.createClass({
  displayName: messages.labels.createSrvForm,

  mixins: [PureRenderMixin, LinkedStateMixin],

  propTypes: {
    orgId: React.PropTypes.string,
    onClose: React.PropTypes.func,
    service: React.PropTypes.object,
    serviceTypes: PropTypes.Immutable.List.isRequired,
    validationErrors: React.PropTypes.object,
    readOnly: React.PropTypes.bool
  },

  getInitialState: function () {
    return {
      name: this.props.service ? this.props.service.get('name') : '',
      location: this.props.service ? this.props.service.get('location') : '',
      serviceType: this.props.service ? this.props.service.get('service_type') : '',
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
    if (this.props.service) {
      const fields = ['name', 'location', 'service_type'];
      if (this.state.submitted) {
        for (let i = 0; i < fields.length; i++) {
          const field = fields[i];
          if (nextProps.service.get(field) !== this.props.service.get(field)) {
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
   * Push a createService action
   */
  _create: function () {
    const state = _.transform(_.omit(this.state, ['errors', 'updated', 'submitted']),
                            (result, v, k) => {if (v.trim() !== '') {result[k] = v.trim();}});
    actions.createService.push(_.extend({}, this.props, state));
  },


  /**
   * Push a updateService action
   */
  _update: function () {
    if (this.props.service) {
      const updates = {};

      if (this.state.name !== this.props.service.get('name')) {
        updates['name'] = this.state.name;
      }
      if (this.state.serviceType !== this.props.service.get('service_type')) {
        updates['serviceType'] = this.state.serviceType;
      }
      if (this.state.location !== this.props.service.get('location')) {
        updates['location'] = this.state.location;
      }

      if (Object.keys(updates).length) {
        updates['serviceId'] = this.props.service.get('id');
        actions.updateService.push(updates);
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
    if (!this.props.service) {
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
    const heading = this.props.service ? 'Service Details' : 'Create a New Service',
          submit = this.props.service ? 'Update' : 'Create';

    let serviceTypes;

    if (this.props.readOnly) {
      serviceTypes = (
        <input type='text' className='service-type form-control' placeholder='Service Type'
          valueLink={this.linkState('serviceType')} readOnly={this.props.readOnly} />
      );
    } else {
      serviceTypes = (
        <select className='service-type form-control' required={true} placeholder='Service Type'
          valueLink={this.linkState('serviceType')} defaultValue=''>
          <option value='' disabled={true}>{messages.labels.selectOpt}</option>
          {this.props.serviceTypes.map(type =>
            <option key={type} value={type}>{_.capitalize(type)}</option>)}
        </select>
      );
    }

    return (
      <div id="crhu_form_section">
        <h2>{heading}</h2>

        <form id='crhu_form' className='service form row' onSubmit={this._onSubmit}>
          <div className={'form-group col col-xs-12'}>
            <label>Name:</label>
            <input type='text' className='name form-control' required={true} placeholder='Service Name'
             valueLink={this.linkState('name')} readOnly={this.props.readOnly}/>
          </div>

          <div className={'form-group col col-xs-12'}>
            <label>Location:</label>
            <input type='url' className='location form-control' required={true} placeholder='Service URL'
              valueLink={this.linkState('location')} readOnly={this.props.readOnly} />
          </div>

          <div className={'form-group col col-xs-12'}>
            <label>Service Type:</label>
            {serviceTypes}
          </div>

          <ErrorMessages errors={this.state.errors['serviceType']} />
          <ErrorMessages errors={this.state.errors['name']} />
          <ErrorMessages errors={this.state.errors['location']} />

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

module.exports = ServiceForm;
