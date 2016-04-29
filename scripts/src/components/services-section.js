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
      Modal = require('./modal'),
      DeleteModal = require('./delete-modal'),
      ServiceEdit = require('./service-edit-section'),
      ServiceForm = require('./service-form'),
      ServicesList = require('./services-list');

const ServicesSection = React.createClass({
  displayName: 'ServicesSection',
  mixins: [PureRenderMixin],

  propTypes: {
    user: PropTypes.Immutable.Map.isRequired,
    currentOrganisation: PropTypes.Immutable.Map.isRequired,
    serviceTypes: PropTypes.Immutable.List,
    organisations: PropTypes.Immutable.List,
    validationErrors: PropTypes.object
  },

  componentWillMount: function () {
    if (this.props.serviceTypes.size == 0) {
      actions.getServiceTypes.push();
    }
  },

  getInitialState: function () {
    return {showForm: false, deleteService: undefined};
  },

  /**
   * Change internal showForm state to false
   */
  _finish: function(event) {
    if (event) { event.preventDefault(); }
    this.setState({showForm: false, editService: undefined, deleteService: undefined});
  },

  /**
   * Change internal showForm state to true
   */
  _createService: function(event) {
    if (event) { event.preventDefault(); }
    this.setState({showForm: true});
  },

  /**
   * Change internal showForm state to true and set the service that should be edited
   */
  _editService: function(serviceId, readOnly) {
    this.setState({readOnly: readOnly, editService: serviceId});
  },

  /**
   * Set internal deleteService
   */
  _deleteService: function(serviceId) {
    this.setState({deleteService: serviceId});
  },

  /**
   * Push deleteService action
   */
  _delete: function() {
    if (!this.state.deleteService) { return; }
    actions.deleteService.push({serviceId: this.state.deleteService});
    this._finish();
  },

  /**
   * List an organisation's services and a form to add a new service
   *
   * @return {object}
   */
  render: function () {
    const currentOrganisation = this.props.currentOrganisation,
          services = currentOrganisation.has('services') ? currentOrganisation.get('services') : Immutable.OrderedMap(),
          editService = services.get(this.state.editService);

    if (!this.state.editService) {
      return (
        <div id='crhu_container'>
          <section id='crhu_services_section' className='services m-t-30'>
            <div className={'form-group'}>
              <button className={'btn btn-primary'} onClick={this._createService}>
                Create a New Service
              </button>
            </div>

            <p className='intro' />

            <ServicesList
              user={this.props.user}
              orgId={currentOrganisation.get('id')}
              services={services}
              editService={this._editService}
              deleteService={this._deleteService}
            />

            {this.props.children}

          </section>

          <ReactCSSTransitionGroup transitionName='modal'
           transitionLeaveTimeout={50} transitionEnterTimeout={50}>
            {this.state.showForm &&
              <Modal onClose={this._finish} key='modal'>
                <ServiceForm
                 orgId={currentOrganisation.get('id')}
                 serviceTypes={this.props.serviceTypes}
                 onClose={this._finish}
                 validationErrors={this.props.validationErrors}/>
              </Modal>
            }
          </ReactCSSTransitionGroup>

          <ReactCSSTransitionGroup transitionName='modal'
           transitionLeaveTimeout={50} transitionEnterTimeout={50}>
            {this.state.deleteService &&
            <DeleteModal type='serivce' onClose={this._finish} onDelete={this._delete} />}
          </ReactCSSTransitionGroup>
        </div>
      )
    } else {
      return (
        <div id="crhu_form_section">
          <ServiceEdit
             service={editService}
             readOnly={this.state.readOnly}
             serviceTypes={this.props.serviceTypes}
             organisations={this.props.organisations}
             onClose={this._finish}
             validationErrors={this.props.validationErrors}
          />
        </div>
      )
    }
  }
});

module.exports = ServicesSection;
