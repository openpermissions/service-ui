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
      ReactCSSTransitionGroup = require('react-addons-css-transition-group'),
      PropTypes = require('../prop-types'),
      Immutable = require('immutable'),
      actions = require('../actions'),
      consts = require('../constants'),
      Modal = require('./modal'),
      DeleteModal = require('./delete-modal'),
      ServiceForm = require('./service-form'),
      PermissionsForm = require('./permission-form'),
      SecretsList = require('./secrets-list');

var ServiceEditSection = React.createClass({
  displayName: 'ServiceEditSection',
  mixins: [PureRenderMixin],

  propTypes: {
    service: PropTypes.Immutable.Map.isRequired,
    readOnly: React.PropTypes.bool,
    serviceTypes: PropTypes.Immutable.List,
    organisations: PropTypes.Immutable.List,
    onClose: React.PropTypes.func.isRequired,
    validationErrors: PropTypes.object
  },

  componentWillMount: function () {
    if (!this.props.service.has('secrets') && this.props.service.get('state') == consts.states.approved) {
      actions.getSecrets.push({serviceId: this.props.service.get('id')});
    }
  },

  componentWillUpdate: function () {
    if (!this.props.service.has('secrets') && this.props.service.get('state') == consts.states.approved) {
      actions.getSecrets.push({serviceId: this.props.service.get('id')});
    }
  },

  getInitialState: function () {
    return {};
  },

  /**
   * Change internal showForm state to false
   */
  _finish: function(event) {
    if (event) { event.preventDefault(); }
    this.setState({});
  },

  /**
   * Fields to edit a service
   *
   * @return {object}
   */
  render: function () {
    return (
      <div id="crhu_form_section">
        <ServiceForm
           service={this.props.service}
           readOnly={this.props.readOnly}
           serviceTypes={this.props.serviceTypes}
           validationErrors={this.props.validationErrors} />
        {this.props.service.get('state') == consts.states.approved &&
          <SecretsList
            service={this.props.service}
            readOnly={this.props.readOnly}
            validationErrors={this.props.validationErrors} />}
        {(this.props.service.get('state') == consts.states.approved && !this.props.readOnly) &&
          <PermissionsForm
            entity={this.props.service}
            entityType='service'
            serviceTypes={this.props.serviceTypes}
            organisations={this.props.organisations}
            validationErrors={this.props.validationErrors} />}
        <div className={'form-group'}>
          <button className='btn btn-primary' onClick={this.props.onClose}>
            Back
          </button>
        </div>
      </div>
    );
  }
});

module.exports = ServiceEditSection;
