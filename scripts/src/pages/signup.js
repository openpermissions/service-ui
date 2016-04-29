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
      actions = require('../actions'),
      ErrorMessage = require('../components/error-message'),
      ErrorMessages = require('../components/error-messages');

const Signup = React.createClass({
  displayName: 'Signup Page',

  propTypes: {
    loggedIn: React.PropTypes.bool,
    validationErrors: React.PropTypes.object
  },

  statics: {
    onlyUnauthenticated: true
  },

  mixins: [ PureRenderMixin, LinkedStateMixin ],

  getInitialState: function () {
    return {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      passwordMismatch: false,
      hasAgreedToTerms: false,
      errors: {}
    };
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({errors: nextProps.validationErrors || {}});
  },

  /**
   * Push a signup action
   *
   * @param {object} event
   */
  _onSubmit: function(event) {
    event.preventDefault();
    if (this.state.password === this.state.confirmPassword) {
      actions.signup.push({
        'email': this.state.email.trim(),
        'password': this.state.password,
        'firstName': this.state.firstName.trim(),
        'lastName': this.state.lastName.trim(),
        'hasAgreedToTerms': this.state.hasAgreedToTerms
      });
    }
  },

  _checkPassword: function () {
    if (this.state.confirmPassword) {
      this.setState({
        passwordMismatch: this.state.password !== this.state.confirmPassword
      });
    }
  },

  /**
   * Render a signup form
   *
   * @returns {object}
   */
  render: function () {
    return (
      <div className='container'>
        <h1>Sign up</h1>
        <p className={'sub-heading'}>It's fast and free to get started.</p>

        <form id='crhu_form' className='signup form row' onSubmit={this._onSubmit}>
          <div className={'form-group col col-xs-12 col-sm-6'}>
            <label className={'label--big'}>First name</label>
            <input type='text' placeholder='First name'
              valueLink={this.linkState('firstName')} className={'form-control'} />
            <ErrorMessages errors={this.state.errors['first_name']} />
          </div>

          <div className={'form-group col col-xs-12 col-sm-6'}>
            <label className={'label--big'}>Last name</label>
            <input type='text' placeholder='Last name'
              valueLink={this.linkState('lastName')} className={'form-control'} />
            <ErrorMessages errors={this.state.errors['last_name']} />
          </div>

          <div className={'form-group col col-xs-12'}>
            <label className={'label--big'}>Email address</label>
            <input type='email' required={true} placeholder='Email address'
              valueLink={this.linkState('email')} className={'form-control'} />
            <ErrorMessages errors={this.state.errors['email']} />
          </div>

          <div className={'form-group col col-xs-12 col-sm-6 cb'}>
            <label className={'label--big'}>Choose Password</label>
            <input type='password' required={true} placeholder='Password'
              valueLink={this.linkState('password')} onBlur={this._checkPassword} className={'form-control'} />
          </div>

          <div className={'form-group col col-xs-12 col-sm-6'}>
            <label className={'label--big'}>Retype password</label>
            <input type='password' required={true} placeholder='Confirm password'
              valueLink={this.linkState('confirmPassword')} onBlur={this._checkPassword} className={'form-control'} />
            <ErrorMessages errors={this.state.errors['password']} />
            {this.state.passwordMismatch && <ErrorMessage message="Passwords don't match" />}
          </div>

          <div className={'form-group col col-xs-12 checkbox'}>
            <label className={'label--big'}>
              <input type='checkbox' required={true}
                // TODO use a real link
                checkedLink={this.linkState('hasAgreedToTerms')}/> I agree to the <a href="terms-and-conditions.html" target="_blank">terms and conditions</a>.
              <ErrorMessages errors={this.state.errors['has_agreed_to_terms']} />
            </label>
          </div>
          <div className={'form-group col col-xs-12 col-sm-6 cb'}>
            <button type='submit' className={'btn btn-primary'}>Sign up</button>
          </div>
        </form>
      </div>
    );
  }
});

module.exports = Signup;
