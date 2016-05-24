/**
 * Main page for Offer generator
 *
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
      Immutable = require('immutable'),
      PureRenderMixin = require('react-addons-pure-render-mixin'),
      LinkedStateMixin = require('react-addons-linked-state-mixin'),
      _ = require('lodash'),
      actions = require('../../actions/index'),
      PropTypes = require('../../prop-types'),
      OfferComponent = require('../components/offer'),
      ErrorMessages = require('../../components/error-messages');


const OfferGenerator = React.createClass({
  displayName: 'Offer Generator Page',

  mixins: [ PureRenderMixin, LinkedStateMixin ],

  propTypes: {
    template: React.PropTypes.object,
    offers: PropTypes.Immutable.List,
    currentOrganisation: PropTypes.Immutable.Map.isRequired,
    validationErrors: PropTypes.object,
  },

  componentWillMount: function() {
    this._getRepositoryToken('read');
  },

  getInitialState: function() {
    let services = this.props.currentOrganisation.has('services') ? this.props.currentOrganisation.get('services') : Immutable.Map();
    services = services.filter( s => s.get('service_type') == 'external');

    return {
      services: services,
      repositoryId: '',
      loadOfferId: '',
      errors: {}
    }
  },

  /**
   * Get access token from repository for given scope
   * @param scope
   * @private
   */
  _getRepositoryToken: function (scope) {
    if (this.state.services.size != 0) {
      let service = this.state.services.first();
      actions.getRepoToken.push({serviceId: service.get('id'), scope: scope});
    }
  },

  /**
   * Load existing offer from repository
    * @private
  */
  _loadOffer: function() {
    this.setState({errors: {}});
    actions.loadOffer.push({
      organisationId: this.props.currentOrganisation.get('id'),
      repositoryId: this.state.repositoryId,
      offerId: this.state.loadOfferId
    });
    this._getRepositoryToken('read write['+this.state.repositoryId+']');
  },

  /**
   * Create new offer template
   * @private
   */
  _newOffer: function() {
    this.setState({errors: {}});
    actions.newOffer.push();
    this._getRepositoryToken('read write['+this.state.repositoryId+']');
    this.setState({loadOfferId: ''})
  },

  /**
   * Save offer to repository
   * @param event
   * @private
   */
  _saveOffer: function(event) {
    event.preventDefault();
    actions.saveOffer.push({repositoryId: this.state.repositoryId});
    this.setState({loadOfferId: ''})
  },

  /**
   * Store repository id on selection
   * Load offers for given repository id
   * @param event
   * @private
   */
  _setRepositoryId: function(event) {
    let repoId = event.target.value;
    this.setState({repositoryId: repoId, errors: {}});
    actions.getOffers.push();
    actions.getOffers.push({'repositoryId': repoId});
  },

  /**
   * Generate react dropdown menu displaying all repositories for organisation
   * @returns React Element
   * @private
   */
  _getRepositoryDropdown: function () {
    let repositories = this.props.currentOrganisation.has('repositories') ?
      this.props.currentOrganisation.get('repositories') : Immutable.Map();

    let children = repositories.map(
      (value, key) => React.createElement('option', {key:key, value: key, label: value.get('name')})).toList();
    children = children.unshift(React.createElement('option', {key:'', value: '', label: '-- Select a repository --', disabled: true}));
    return React.createElement('select', {onChange: this._setRepositoryId, required: true, defaultValue: '', className: 'form-control'}, children);
  },

  /**
   * Generate react div displaying created offer information
   * @returns React Element
   * @private
   */
  _getSaveConfirmation: function() {
    if (this.props.template && this.props.template.get('offerId')) {
      return (
        <div className="alert alert-success">
          {'New offer ' + this.props.template.get('offerId') + ' has been created.'}
        </div>
      );
    }
  },

  /**
   * Generate react dropdown menu displaying all existing offers for a repository
   * @returns React Element
   * @private
   */
  _getOfferSelection: function() {
    if (this.state.repositoryId && this.props.offers) {
      let titleOffers = this.props.offers.filter(offer=>offer.get('title') != null);
      let idOffers = this.props.offers.filter(offer=>offer.get('title') == null);

      let children = Immutable.List([React.createElement('option', {key:'header', value: '', label: '-- Select an Offer to load --', disabled: true})])
      children = children.push(
        titleOffers.map(offer => React.createElement('option', {key:offer.get('id'), value: offer.get('id'), label: offer.get('title')})));

      // If offer does not have title, display using id
      if (idOffers.size > 0) {
        children = children.push(
          React.createElement('option', {key:'breakline-title', value: '', label: '-- Offers with No Title --', disabled: true}));
        children = children.push(
          idOffers.map(offer => React.createElement('option', {key:offer.get('id'), value: offer.get('id'), label: offer.get('id')})));
      }

      let offerList = React.createElement('select', {valueLink: this.linkState('loadOfferId'), defaultValue: '', className: 'form-control'}, children);

      return (
        <div className='form row'>
          <div className='col col-xs-12 cb'>
            <label className='label--big'>Load Offer:</label>
          </div>
          <div className='form-group col col-xs-12 col-sm-6 cb'>
            {offerList}
          </div>
          <div className='form-group col col-xs-12 col-sm-6'>
            <button className='btn btn-primary' onClick={this._loadOffer}>Load</button>
          </div>
          <div className='col col-xs-12 m-t--30 cb'>
            <hr />
          </div>
          <div className='form-group col col-xs-12 col-sm-6 cb'>
            <button className='btn btn-primary' onClick={this._newOffer}>New Offer</button>
          </div>
        </div>
      )
    }
  },

  /**
   * Generate react element displaying offer generator
   * @returns React Element
   * @private
   */
  _getOfferGenerator: function() {
    if (this.props.template && !this.props.template.get('offerId')) {
      return(
        <div>
          <form className='OfferForm form row' onSubmit={this._saveOffer}>
            <OfferComponent
              template={this.props.template}
            />
            <div className='form-group col col-xs-12 cb'>
              <button className='btn btn-primary' type="submit">Save Offer</button>
            </div>
          </form>
        </div>
      );
    }
  },

  /**
   * Render the offer generator
   *
   * @returns {object}
   */
  render: function () {
    if (this.state.services.size === 0)  {
      return (
      <div className="alert alert-danger">
        {'In order to use this feature you need to have an "External" service with client credentials' +
        ' that allow access to your repositories.'}
      </div>
      )
    }

    let repos = this._getRepositoryDropdown();
    let updateInfo = this._getSaveConfirmation();
    let offerSelector = this._getOfferSelection();
    let offerGenerator = this._getOfferGenerator();

    return (
      <div className='offer container m-t-30'>
        <div className='form row'>
          <div className='form-group col col-xs-12 col-sm-6 cb'>
            <label className='label--big'>Repository:</label>
            {repos}
          </div>
        </div>
        {offerSelector}
        {updateInfo}
        {offerGenerator}
      </div>
    );
  }
});

module.exports = OfferGenerator;
