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
      isAdmin = require('../util').isAdmin,
      FormGroup = require('./form-group'),
      messages = require('../messages'),
      KeyValueTable = require('./keyvalue-table'),
      constants = require('../constants.json'),
      ErrorMessages = require('./error-messages'),
      SketchPicker = require('react-color').SketchPicker;

var ColorPicker = React.createClass({
  propTypes: {
    field: React.PropTypes.string,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      color: this.props.value,
      displayColorPicker: false
    }
  },

  handleClick: function () {
    this.setState({displayColorPicker: !this.state.displayColorPicker})
  },

  handleClose: function () {
    this.setState({displayColorPicker: false})
  },

  handleChange: function(color) {
    this.setState({ color: color.hex });
    this.props.onChange(this.props.field, color.hex)
  },

  render: function () {
    const popover = {
      position: 'absolute',
      zIndex: '100'
    };
    const cover = {
      position: 'fixed',
      top: '0',
      right: '0',
      bottom: '0',
      left: '0',
    };

    return (
      <div>
        <input
          style={{color: _.get(this.state, 'color'), background: _.get(this.state, 'color')}}
          name='color'
          type='text'
          className='color-picker'
          placeholder='Pick Color'
          value={_.get(this.state, 'color')}
          readOnly='true'
          onClick={ this.handleClick } />
        { this.state.displayColorPicker ? <div style={popover}>
          <div style={cover} onClick={this.handleClose}/>
          <SketchPicker color={this.state.color} onChange={this.handleChange} />
        </div> : null }
      </div>
    )
  }
});


var CreateOrg = React.createClass({
  displayName: 'Create organisation form',

  mixins: [PureRenderMixin, LinkedStateMixin],

  _getFormProps: function() {
    const systemAdminOnly = ['star_rating'];
    const props = ['label', 'required', 'type', 'placeholder', 'tip'];
    // The first item should be the path to the value in props.organisation as
    // an array of strings or just a string.
    let mappings = [
      ['name', ['Name', true, 'text', 'Organisation name', 'Name of the startup, company, or university.']],
      ['star_rating', ['Star Rating', false, 'number', 'Organisation star rating (empty is 0)', 'a number from 0 to 5.']],
      ['description', ['Description', false, 'text', 'Organisation description', 'Description of the or anisation.']],
      ['logo', ['Logo', false, 'url', 'URL', 'URL to Organisation Logo.']],
      ['address', ['Address', false, 'text', 'Organisation address', 'Address of the organisation.']],
      ['phone', ['Phone', false, 'text', 'Organisation phone', 'Phone of the organisation.']],
      ['email', ['Email', false, 'email', 'Organisation email', 'Email of the organisation.']],
      ['website', ['Website', false, 'url', 'Organisation website', 'Website of the organisation']]
    ];

    if (!isAdmin(this.props.user.toJS())) {
      mappings = _.filter(mappings, ([name, _]) => systemAdminOnly.indexOf(name) == -1);
    }

    return mappings.map(([key, vals]) => {
      return {
        organisationPath: _.isArray(key) ? key : [key],
        name: _.isArray(key) ? key[0] : key,
        field: _.zipObject(props, vals)
      }
    });
  },

  propTypes: {
    user: PropTypes.Immutable.Map.isRequired,
    onCancel: React.PropTypes.func,
    validationErrors: React.PropTypes.object,
    organisation: PropTypes.Immutable.Map.isRequired,
    readOnly: React.PropTypes.bool
  },

  getInitialState: function () {
    const state = this._getFormProps().reduce((obj, x) => {
      obj[x.name] = this.props.organisation.getIn(x.organisationPath);
      return obj;
    }, {})

    let value;

    [['payment', 'payment'], ['reference_links', 'referenceLinks']].forEach(([orgKey, stateKey]) => {
      value = this.props.organisation.get(orgKey);
      state[stateKey] = value ? value.toJS() : {};
    });

    state['primary_color'] = this.props.organisation.get('primary_color');
    state['secondary_color'] = this.props.organisation.get('secondary_color');
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
   * Prepare POST request to the reference links endpoint
   * by ensuring that all the keys are valid
   *
   * @param {object} referenceLinks
   */
  _prepareReferenceLinks: function () {
    const referenceLinks = {};
    const links = _.cloneDeep(_.omit(this.state.referenceLinks.links, [null]));
    if (!_.isEmpty(links)) {
      referenceLinks.links = links;
      referenceLinks.redirect_id_type = this.state.referenceLinks.redirect_id_type;
    }
    return referenceLinks;
  },
  /**
   * Push a createOrganisation action
   *
   * @param {object} event
   */
  _onSubmit: function (event) {
    event.preventDefault();
    const id = this.props.organisation.get('id');

    const data = this._getFormProps().reduce((prev, item) => {
      const obj = {};

      item.organisationPath.reduce((prev, k, i) => {
        if (i + 1 === item.organisationPath.length) {
          prev[k] = (this.state[item.name] || '').trim();
        } else {
          prev[k] = {};
        }
        return prev[k];
      }, obj);

      return _.defaultsDeep(obj, prev);
    }, {});

    if ('star_rating' in data) {
      data['star_rating'] = parseInt(data['star_rating'] || 0);
    }

    if (this.state.primary_color) {
      data['primary_color'] = this.state.primary_color;
    }
    if (this.state.secondary_color) {
      data['secondary_color'] = this.state.secondary_color;
    }
    data['payment'] = this.state.payment || {};
    data['reference_links'] = this._prepareReferenceLinks();

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
    const newRefLinks = {'links': newLinks},
          redirectIdType = this.state.referenceLinks.redirect_id_type;
    let submitDisabled = false;

    if (redirectIdType) { newRefLinks.redirect_id_type = redirectIdType; }
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
    this.setState({'referenceLinks': currentRefLinks});
  },

  /**
   * Render reference links
   *
   * @returns {object}
   */
  _renderReferenceLinks: function() {
    const refLinks = [],
          redirectIdType = this.state.referenceLinks.redirect_id_type,
          defaultRedirect = (redirectIdType) ? redirectIdType : 'unset';

    _.map(this.state.referenceLinks.links, function(k, v) {
      if (k && v) { refLinks.push(<option key={v} value={v}>{v} - {k}</option>); }
    });

    return (
      <div className={'form-group col col-xs-12 col-sm-6 cb'} >
        <label className='label--big'>Reference Links</label>
        <span className={'help-block'}>{constants.organisationFields.helpBlock.refLinks}</span>
        <KeyValueTable
          data={this.state.referenceLinks.links}
          keyLabel='Source ID Type'
          onChange={this._handleReferenceLinksChange}
          errors={this.state.errors['reference_links'] || []}
          valueType='url' />
        <label className='label--big'>Redirect URL</label>
        <span className={'help-block'}>{constants.organisationFields.helpBlock.redirect}</span>
        <select
          className='reference-links form-control'
          onChange={this._updateRedirectUrl}
          defaultValue={defaultRedirect}>
          <option key='unset' value='unset'> - </option>
          {refLinks}
        </select>
      </div>
    );
  },

  createFormGroup: function () {
    return this._getFormProps().map(item => {
      const props = {
        ...item.field,
        key: item.name,
        fieldName: item.name,
        value: this.props.organisation.getIn(item.organisationPath),
        errors: this.state.errors[item.name] || '',
        onChange: newVal => this.setState({[item.name]: newVal}),
        readOnly: this.props.readOnly
      }

      return React.createElement(FormGroup, props);
    })
  },

  updatePaymentField: function (field) {
    return e => {
      const payment = Object.assign({}, this.state.payment, {[field]: e.target.value});
      this.setState({payment: payment});
    }
  },

  renderPaymentFields: function () {
    return (
      <div className={'form-group col col-exs-12 col-sm-6 cb'} key='payment-form-group'>
        <label className='label--big'>Payment</label>
        <span className='help-block'>{constants.organisationFields.helpBlock.payment}</span>
        <div className='input-group' style={{display: 'table', width: '100%'}}>
          <div style={{display: 'table-cell', width: '50%'}}>
            <label className='label--medium' htmlFor='payment-url'>URL</label>
            <input
              name='payment-url'
              type='url'
              className='form-control'
              placeholder='URL'
              value={_.get(this.state, ['payment', 'url'], '')}
              onChange={this.updatePaymentField('url')}
            />
          </div>
          <div style={{display: 'table-cell', width: '50%'}}>
            <label className='label--medium' htmlFor='payment-source-id-type'>Source ID Type</label>
            <input
              name='payment-source-id-type'
              type='text'
              className='form-control'
              placeholder='Source ID type'
              value={_.get(this.state, ['payment', 'source_id_type'], '')}
              onChange={this.updatePaymentField('source_id_type')}
            />
          </div>
          <ErrorMessages errors={this.state.errors.payment || ''} />
        </div>
      </div>
    )
  },

  updateColorField: function (field, color) {
    let state = {};
    state[field] = color;
    this.setState(state);
  },

  renderColorPicker: function() {
    return (
      <div className={'form-group col col-exs-12 col-sm-6 cb'} key='color-form-group'>
        <label className='label--big'>Colors</label>
        <span className='help-block'>{constants.organisationFields.helpBlock.colors}</span>
        <div className='input-group' style={{display: 'table', width: '100%'}}>
          <div style={{display: 'table-cell', width: '50%'}}>
            <label className='label--medium' htmlFor='primary_color'>Primary Color</label>
            <ColorPicker
              field="primary_color"
              value={this.state.primary_color}
              onChange={this.updateColorField}
            />
          </div>
          <div style={{display: 'table-cell', width: '50%'}}>
            <label className='label--medium' htmlFor='secondary_color'>Secondary Color</label>
            <ColorPicker
              field="secondary_color"
              value={this.state.secondary_color}
              onChange={this.updateColorField}
            />
          </div>
          <ErrorMessages errors={this.state.errors || ''} />
        </div>
      </div>
    )
  },

  /**
   * Render a form
   *
   * @returns {object}
   */
  render: function () {
    const id = this.props.organisation.get('id'),
          submit = id ? 'Update' : 'Create',
          formGroups = this.createFormGroup();

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
          {this.renderColorPicker()}
          {this.renderPaymentFields()}
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
