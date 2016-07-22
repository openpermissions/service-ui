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
 *
 * App is a "controller view" that passes data down from the stores into pages
 */
'use strict';

var React = require('react'),
    PureRenderMixin = require('react-addons-pure-render-mixin'),
    _ = require('lodash'),
    Header = require('./components/header'),
    Footer = require('./components/footer'),
    ErrorMessages = require('./components/error-messages');

var App = React.createClass({
  displayName: 'App Controller',
  propTypes: {
    errors: React.PropTypes.object.isRequired, // Bacon.EventStream
    app: React.PropTypes.object.isRequired     // Bacon.Property
  },
  mixins: [PureRenderMixin],

  /**
   * Set listeners on the store & errors properties
   */
  componentWillMount: function () {
    this.props.errors.onValue(this._onError);
    this.props.app.onValue(this._onStoreChange);
    this.props.passwordChanged.onValue(this._onPasswordChange);
  },

  getInitialState: function () {
    return {validationErrors: {}};
  },

  /**
   * Set state after the app store property changes
   *
   * Errors are cleared when the store is updated.
   *
   * @param {Immutable.Map} data
   */
  _onStoreChange: function (data) {
    this.setState({
      loggedIn: data.get('loggedIn'),
      user: data.get('user'),
      serviceTypes: data.get('serviceTypes'),
      services: data.get('services'),
      repositories: data.get('repositories'),
      organisations: data.get('organisations'),
      currentOrganisation: data.get('currentOrganisation'),
      page: data.get('page'),
      users: data.get('users'),
      roles: data.get('roles'),
      validationErrors: {},
      errors: null,
      passwordChanged: false,
      offer: data.get('offer'),
      offers: data.get('offers')
    });
  },

  /**
   * Set an error message when the error property changes
   */
  _onError: function (errors) {
    var validationErrors = _.transform(errors, (result, e) => {
      if (!e.message) { return; }
      if (e.field) {
        if (typeof result[e.field] !== 'undefined' ) {
          result[e.field].append(e.message);
        } else {
          result[e.field] = [e.message];
        }
      } else {
        if (typeof result.msgs !== 'undefined') {
          result.msgs.append(e.message);
        } else {
          result.msgs = [e.message];
        }
      }
    }, {});

    this.setState({
      passwordChanged: false,
      errors: _.map(_.filter(errors, e => !e.field && e.message), e => e.message),
      validationErrors: validationErrors
    });
  },

  _onPasswordChange: function (value) {
    this.setState({
      validationErrors: {},
      errors: null,
      passwordChanged: value
    });
  },

  /**
   * Render navigation links, the current page and error message (if any)
   *
   * @return {object}
   */
  render: function () {
    var verified;
    if (this.state.user) {
      verified = this.state.user.get('verified');
    } else {
      verified = false;
    }

    return (
      <div>
        <Header
          user={this.state.user}
          loggedIn={this.state.loggedIn}
          verified={verified}
          page={this.state.page}
          version={'__VERSION__'}
        />

        <main role="main">
          {this.state.page.component &&
            <this.state.page.component
              loggedIn={this.state.loggedIn}
              verified={verified}
              user={this.state.user}
              serviceTypes={this.state.serviceTypes}
              services={this.state.services}
              repositories={this.state.repositories}
              organisations={this.state.organisations}
              currentOrganisation={this.state.currentOrganisation}
              users={this.state.users}
              roles={this.state.roles}
              validationErrors={this.state.validationErrors}
              passwordChanged={this.state.passwordChanged}
              queryParams={this.state.page.queryParams}
              offer={this.state.offer}
              offers={this.state.offers}
            />
          }
          <div id="error_message">
            {this.state.errors && <ErrorMessages errors={this.state.errors} />}
          </div>
        </main>

        <Footer />
      </div>
    );
  }
});

module.exports = App;
