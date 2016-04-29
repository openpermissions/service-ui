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
      ServicesSection = require('./services-section'),
      RepositoriesSection = require('./repositories-section'),
      OfferGenerator = require('../offer-generator/pages/offer-generator'),
      PureRenderMixin = require('react-addons-pure-render-mixin'),
      PropTypes = require('../prop-types'),
      Tabs = require('react-simpletabs');

const OrganisationItemsTabs = React.createClass({
  displayName: 'Organisation Tabs',
  mixins: [PureRenderMixin],

  propTypes: {
    user: PropTypes.Immutable.Map.isRequired,
    currentOrganisation: PropTypes.Immutable.Map.isRequired,
    services: PropTypes.Immutable.List,
    serviceTypes: PropTypes.Immutable.List,
    organisations: PropTypes.Immutable.List,
    validationErrors: React.PropTypes.object,
    template: React.PropTypes.object,
    offers: PropTypes.Immutable.List
  },

  /**
   * List an organisation's services and a form to add a new service
   *
   * @return {object}
   */
  render: function () {
    return (
        <Tabs>
         <Tabs.Panel title='Services'>
           <ServicesSection
             user={this.props.user}
             serviceTypes={this.props.serviceTypes}
             organisations={this.props.organisations}
             currentOrganisation={this.props.currentOrganisation}
             validationErrors={this.props.validationErrors} />
         </Tabs.Panel>
         <Tabs.Panel title='Repositories'>
           <RepositoriesSection
             user={this.props.user}
             services={this.props.services}
             organisations={this.props.organisations}
             currentOrganisation={this.props.currentOrganisation}
             validationErrors={this.props.validationErrors} />
         </Tabs.Panel>
          <Tabs.Panel title='Offer Generator'>
           <OfferGenerator
             currentOrganisation={this.props.currentOrganisation}
             template={this.props.template}
             offers={this.props.offers}/>
         </Tabs.Panel>
        </Tabs>
       );

  }
});

module.exports = OrganisationItemsTabs;
