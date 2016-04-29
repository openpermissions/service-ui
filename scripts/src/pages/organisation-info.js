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
      PropTypes = require('../prop-types'),
      actions = require('../actions'),
      SwitchOrganisation = require('../components/organisation-switch'),
      OrganisationServices = require('../components/organisation-services'),
      OrganisationItemsTabs = require('../components/organisation-items-tabs'),
      OrganisationForm = require('../components/organisation-form');

const OrganisationInformation = React.createClass({
  displayName: 'Organisation Information Page',

  propTypes: {
    loggedIn: PropTypes.bool.isRequired,
    verified: PropTypes.bool.isRequired,
    user: PropTypes.Immutable.Map.isRequired,
    services: PropTypes.Immutable.List,
    serviceTypes: PropTypes.Immutable.List,
    organisations: PropTypes.Immutable.List.isRequired,
    currentOrganisation: PropTypes.Immutable.Map,
    validationErrors: PropTypes.object,
    template: PropTypes.object,
    offers: PropTypes.Immutable.List
  },

  statics: {
    loginRequired: true,
    verificationRequired: true
  },

  mixins: [PureRenderMixin],

  /**
   * Push a request to get organisations from the API
   */
  componentWillMount: function () {
    actions.getOrganisations.push();
  },

  _onEdit: function() {
    this.setState({editOrganisation: true});
  },

  _closeEdit: function() {
    this.setState({editOrganisation: false});
  },

  getInitialState: function() {
    return {
      editOrganisation: false
    };
  },

  /**
   * Render the organisation name (or form to create one). If an organisation
   * exists, then display a list of it's services and a form to add a new one
   *
   * @return {object}
   */
  render: function () {
    const user = this.props.user;

    if (!this.props.currentOrganisation || !this.props.currentOrganisation.get('id')) {
      return (
        <div className={'container account'}>
          <SwitchOrganisation
           userId={user.get('id')}
           user={this.props.user}
           organisations={this.props.organisations}
           validationErrors={this.props.validationErrors}/>
        </div>
      );
    } else {
      let pageInfo;
      if (this.state.editOrganisation) {
        pageInfo = (
          <OrganisationForm
            user={this.props.user}
            organisation={this.props.currentOrganisation}
            onCancel={this._closeEdit}
            key='form'
            validationErrors={this.props.validationErrors} />
        );
      } else {
        pageInfo = (
          <OrganisationItemsTabs
            user={this.props.user}
            serviceTypes={this.props.serviceTypes}
            services={this.props.services}
            organisations={this.props.organisations}
            currentOrganisation={this.props.currentOrganisation}
            validationErrors={this.props.validationErrors}
            offers={this.props.offers}
            template={this.props.template} />
        );
      }
      return (
        <div className={'container account'}>
          <OrganisationServices
           user={user}
           onEdit={this._onEdit}
           currentOrganisation={this.props.currentOrganisation}
           validationErrors={this.props.validationErrors}/>
          {pageInfo}
        </div>
      );
    }
  }
});

module.exports = OrganisationInformation;
