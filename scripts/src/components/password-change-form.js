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
      ErrorMessage = require('./error-message'),
      ErrorMessages = require('./error-messages'),
      messages = require('../messages');

const ChangePassword = React.createClass({
  mixins: [PureRenderMixin, LinkedStateMixin],

  propTypes: {
    user: PropTypes.Immutable.Map.isRequired,
    validationErrors: PropTypes.object,
    passwordChanged: PropTypes.bool.isRequired
  },

  getInitialState: function () {
    return {
      errors: this.props.validationErrors || {},
      updated: false,
      submitted: false
    };
  },

  componentWillReceiveProps: function (nextProps) {
    const updated = nextProps.passwordChanged;

    this.setState({
      errors: nextProps.validationErrors || {},
      updated: nextProps.passwordChanged,
      submitted: !updated && this.state.submitted,
      oldPassword: updated ? '' : this.state.oldPassword,
      newPassword: updated ? '' : this.state.newPassword,
      confirmPassword: updated ? '' : this.state.confirmPassword
    });
  },

  /**
   * Push a changePassword action
   *
   * @param {object} event
   */
  _onSubmit: function (event) {
    event.preventDefault();
    const oldPassword = this.state.oldPassword.trim();
    const newPassword = this.state.newPassword.trim();

    if (oldPassword !== newPassword) {
      actions.changePassword.push({
        userId: this.props.user.get('id'),
        oldPassword: oldPassword,
        newPassword: newPassword
      });
      this.setState({submitted: true, updated: false});
    }
  },

  _checkPassword: function () {
    if (this.state.confirmPassword) {
      this.setState({
        passwordMismatch: this.state.newPassword !== this.state.confirmPassword
      });
    }
  },

  /**
   * Render a form
   *
   * @returns {object}
   */
  render: function () {
    return (
      <section className={'container'}>
        <h1>{messages.requests.actions.changePass}</h1>

        <form className={'change-password form row'}  onSubmit={this._onSubmit}>
          <div className={'form-group col col-xs-12 col-sm-6 cb'}>
            <label className={'label--big'}>{messages.labels.currentPass + ':'}</label>
            <input className='current-password form-control' type='password' required={true}
              placeholder={messages.labels.currentPass} valueLink={this.linkState('oldPassword')} />
            <ErrorMessages errors={this.state.errors['current_password']} />
          </div>

          <div className={'form-group col col-xs-12 col-sm-6 cb'}>
            <label className={'label--big'}>{messages.labels.newPass + ':'}</label>
            <input className='new-password form-control' type='password' required={true}
              placeholder={messages.labels.newPass} valueLink={this.linkState('newPassword')}
              onBlur={this._checkPassword}/>
          </div>

          <div className={'form-group col col-xs-12 col-sm-6 cb'}>
            <label className={'label--big'}>{messages.requests.actions.confirmPass + ':'}</label>
            <input className='confirm-password form-control' type='password' required={true}
              placeholder={messages.requests.actions.confirmPass} valueLink={this.linkState('confirmPassword')}
              onBlur={this._checkPassword}/>
            <ErrorMessages errors={this.state.errors['password']} />
            {this.state.passwordMismatch && <ErrorMessage message={messages.labels.dontMatch} />}
          </div>

          <div className={'form-group col col-xs-12 col-sm-6 cb'}>
            <button type='submit' className='btn btn-primary'>{messages.requests.actions.changePass}</button>
            {!!this.state.updated && !this.state.passwordMismatch &&
            <small className='crhu_updated'>{messages.labels.passChanged}</small>}
          </div>
        </form>
      </section>
    );
  }
});

module.exports = ChangePassword;
