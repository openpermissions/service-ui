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
      PropTypes = require('../prop-types'),
      actions = require('../actions'),
      mapObject = require('../util').mapObject,
      isAdmin = require('../util').isAdmin,
      FormGroup = require('./form-group'),
      messages = require('../messages'),
      KeyValueTable = require('./keyvalue-table'),
      constants = require('../constants.json');

var CreateOrg = React.createClass({
  displayName: 'Create organisation form',

  mixins: [PureRenderMixin, LinkedStateMixin],

  _getFormProps: function() {
    const globalAdminOnly = ['star_rating'];
    const props = ['label', 'required', 'type', 'placeholder', 'tip'];
    let mappings = [
      ['name', ['Name', true, 'text', 'Organisation name', 'Name of the startup, company, or university.']],
      ['star_rating', ['Star Rating', false, 'number', 'Organisation star rating (empty is 0)', 'a number from 0 to 5.']],
      ['description', ['Description', false, 'text', 'Organisation description', 'Description of the or anisation.']],
      ['logo', ['Logo', false, 'url', 'URL', 'URL to Organisation Logo.']],
      ['address', ['Address', false, 'text', 'Organisation address', 'Address of the organisation.']],
      ['phone', ['Phone', false, 'text', 'Organisation phone', 'Phone of the organisation.']],
      ['email', ['Email', false, 'email', 'Organisation email', 'Email of the organisation.']],
      ['website', ['Website', false, 'url', 'Organisation website', 'Website of the organisation']],
      ['modal_header_text', ['Licence Modal Header', false, 'text', 'Header Text', 'Header Text for Licence Modal.']],
      ['modal_footer_text', ['Licence Modal Footer', false, 'text', 'Footer Text', 'Footer Text for Licence Modal.']],
      ['modal_link_text', ['Licence Modal Link Text', false, 'text', 'Link Text', 'Link Text for Licence Modal.']],
      ['modal_link_url', ['Licence Modal Link Url', false, 'text', 'URL', 'Link URL for Licence Modal.']]];
    if (!isAdmin(this.props.user.toJS())) {
      mappings = _.filter(mappings, ([name, _]) => globalAdminOnly.indexOf(name) == -1);
    }
    return _.map(mappings, ([name, vals]) => [name, _.zipObject(props, vals)]);
  },

  propTypes: {
    user: PropTypes.Immutable.Map.isRequired,
    onCancel: React.PropTypes.func,
    validationErrors: React.PropTypes.object,
    organisation: PropTypes.Immutable.Map.isRequired,
    readOnly: React.PropTypes.bool
  },

  getInitialState: function () {
    const attrs = _.zip(...this._getFormProps())[0];
    const state = _.zipObject(attrs, _.map(attrs, attr => this.props.organisation.get(attr)));

    let referenceLinks = this.props.organisation.get('reference_links');
    if (!referenceLinks) { referenceLinks = {}; }
    else { referenceLinks = referenceLinks.toJS(); }

    state.referenceLinks = referenceLinks;
    state.submitDisabled = false;
    return _.extend({errors: {}}, state);
  },

  componentWillReceiveProps: function (nextProps) {
    var errors = nextProps.validationErrors || {};

    if (_.isEmpty(errors) && this.props.onCancel) {
      this.props.onCancel();
    } else {
      this.setState({errors: errors});
    }
  },

  /**
   * Push a createOrganisation action
   *
   * @param {object} event
   */
  _onSubmit: function (event) {
    event.preventDefault();
    const id = this.props.organisation.get('id');
    const attrs = _.zip(...this._getFormProps())[0];
    const data = _.zipObject(attrs, _.map(attrs, key => (_.get(this.state, key) || '').trim()));
    if ('star_rating' in data) {
      data['star_rating'] = parseInt(data['star_rating'] || 0);
    }
    data['reference_links'] = this.state.referenceLinks;
    if (id) {
      actions.updateOrganisation.push(_.extend(data, { organisationId: id }));
    } else {
      actions.createOrganisation.push(data);
    }
  },

  /**
   * Handle changes to reference links and updates
   * the state for referenceLinks
   *
   * @param {object} newLinks
   * @param {array} errors
   */
  _handleReferenceLinksChange(newLinks, errors) {
    const newRefLinks = {'links': newLinks};
    let submitDisabled = false;
    if (errors.length > 0) { submitDisabled = true; }
    this.setState({referenceLinks: newRefLinks, submitDisabled: submitDisabled});
  },

  /**
   * Updates the state with the new redirect URL
   *
   * @param {object} event
   */
  _updateRedirectUrl: function(event) {
    const newRedirectIdType = event.target.value,
          currentRefLinks = this.state.referenceLinks;

    if (newRedirectIdType === 'unset') { delete currentRefLinks.redirect_id_type; }
    else { currentRefLinks.redirect_id_type = newRedirectIdType; }
    this.setState({
      'referenceLinks': currentRefLinks
    });
  },

  /**
   * Render reference links
   *
   * @returns {object}
   */
  _renderReferenceLinks: function() {
    const refLinks = [];
    _.map(this.state.referenceLinks.links, function(k, v) {
      if (k && v) {
        refLinks.push(<option key={v} value={v}>{v} - {k}</option>);
      }
    });

    return (
      <div className={'form-group col col-xs-12 col-sm-6 cb'} >
        <label className='label--big'>Reference Links</label>
        <span className={'help-block'}>{constants.organisationFields.helpBlock.refLinks}</span>
        <KeyValueTable
          data={this.state.referenceLinks.links}
          keyLabel='Asset ID Type'
          onChange={this._handleReferenceLinksChange}
          errors={this.state.errors['reference_links'] || []}
          valueType='url' />
        <label className='label--big'>Redirect URL</label>
        <span className={'help-block'}>{constants.organisationFields.helpBlock.redirect}</span>
        <select
          className='reference-links form-control'
          onChange={this._updateRedirectUrl}
          defaultValue={this.state.referenceLinks.redirect_id_type}>
          <option key='unset' value='unset'> - </option>
          {refLinks}
        </select>
      </div>
    );
  },

  /**
   * Render a form
   *
   * @returns {object}
   */
  render: function () {
    const id = this.props.organisation.get('id'),
          submit = id ? 'Update' : 'Create',
          formGroups = _.map(this._getFormProps(),
            ([key, vals]) => React.createElement(FormGroup,
              _.extend({
                fieldName: key, key: key,
                value: this.props.organisation.get(key),
                errors: this.state.errors[key] || '',
                onChange: newVal => this.setState({[key]: newVal}),
                readOnly: this.props.readOnly
              }, vals))
            );

    let heading = messages.requests.actions.createOrg;
    if (this.props.readOnly) {
      heading = messages.labels.orgProfile;
    } else if (id) {
      heading = messages.requests.actions.updateOrg;
    }

    return (
      /* jshint ignore:start */
      <div className={'container'}>
        <h1>{heading}</h1>
        <form className={'organisation form row'} onSubmit={this._onSubmit}>
          {formGroups}
          {this._renderReferenceLinks()}
          {!this.props.readOnly &&
            <div className={'form-group col col-xs-12 cb'}>
              <button type='submit' className={'btn btn-primary'} disabled={this.state.submitDisabled}>{submit}</button>
              <button className={'btn btn-danger'} onClick={this.props.onCancel}>{messages.labels.cancel}</button>
            </div>
          }
        </form>
      </div>
      /* jshint ignore:end */
    );
  }
});

module.exports = CreateOrg;
