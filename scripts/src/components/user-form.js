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
      actions = require('../actions'),
      ErrorMessages = require('./error-messages');

const UpdateUser = React.createClass({
  displayName: 'UpdateUser',

  mixins: [PureRenderMixin, LinkedStateMixin],

  propTypes: {
    user: PropTypes.Immutable.Map.isRequired,
    validationErrors: PropTypes.object,
    readOnly: React.PropTypes.bool
  },

  getInitialState: function () {
    return {
      email: this.props.user.get('email'),
      firstName: this.props.user.get('first_name') || '',
      lastName: this.props.user.get('last_name') || '',
      errors: this.props.validationErrors || {},
      updated: false,
      submitted: false
    };
  },

  componentWillReceiveProps: function (nextProps) {
    const errors = nextProps.validationErrors || {};
    const fields = ['email', 'first_name', 'last_name'];
    let updated = false;
    if (this.state.submitted) {
      for (let i=0; i < fields.length; i++) {
        const field = fields[i];
        if (nextProps.user.get(field) !== this.props.user.get(field)) {
          updated = true;
          break;
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
   * Push a updateUser action
   *
   * @param {object} event
   */
  _onSubmit: function (event) {
    event.preventDefault();
    actions.updateUser.push({
      userId: this.props.user.get('id'),
      email: this.state.email.trim(),
      firstName: this.state.firstName.trim(),
      lastName: this.state.lastName.trim()
    });
    this.setState({submitted: true, updated: false});
  },

  /**
   * Render a form
   *
   * @returns {object}
   */
  render: function () {
    return (
      /* jshint ignore:start */
      <section className={'container'}>
        <h1>User Profile</h1>
        <form className={'form row user-profile'} onSubmit={this._onSubmit}>
          <div className={'form-group col col-xs-12 col-sm-6 cb'}>
            <label className={'label--big'}>First name:</label>
            <input type='text' className={'form-control'}
              valueLink={this.linkState('firstName')} readOnly={this.props.readOnly} />
            <ErrorMessages errors={this.state.errors['first_name']} />
          </div>

          <div className={'form-group col col-xs-12 col-sm-6 cb'}>
            <label className={'label--big'}>Last name:</label>
            <input type='text' className={'form-control'}
              valueLink={this.linkState('lastName')} readOnly={this.props.readOnly} />
            <ErrorMessages errors={this.state.errors['last_name']} />
          </div>

          <div className={'form-group col col-xs-12 col-sm-6 cb'}>
            <label className={'label--big'}>Email address:</label>
            <input type='email' required={true} className={'form-control'}
              valueLink={this.linkState('email')} readOnly={this.props.readOnly} />
            <ErrorMessages errors={this.state.errors['email']} />
          </div>

          <div className={'form-group col col-xs-12 col-sm-6 cb'}>
            {!this.props.readOnly && <button type='submit' className='btn btn-primary'>Update</button>}
            {this.state.updated && <small className='crhu_updated'>Updated</small>}
          </div>
        </form>
      </section>
      /* jshint ignore:end */
    );
  }
});

module.exports = UpdateUser;
