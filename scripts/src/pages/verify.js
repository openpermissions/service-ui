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
      actions = require('../actions');

const Verify = React.createClass({
  displayName: 'Verify Page',

  propTypes: {
    loggedIn: React.PropTypes.bool,
    verified: React.PropTypes.bool,
    queryParams: React.PropTypes.object
  },

  mixins: [ PureRenderMixin, LinkedStateMixin ],

  getInitialState: function () {
    return {verified: null};
  },

  /**
  * call verify action
  */
  componentWillMount: function() {
    actions.verified.onValue(verified => this.setState({verified: verified}));
    actions.verified.onError(errors => this.setState({verified: false}));
    actions.verify.push({userId: this.props.queryParams.id, verificationHash: this.props.queryParams.code});
  },

  /**
   * Render a verification notification
   *
   * @returns {object}
   */
  render: function () {
    if (this.state.verified === true) {
      return (
        <div className='container'>
        <p className={'sub-heading'}>
          Thank You.
        </p>
        Your account has been successfully activated.
      </div>
      );
    }
    else if (this.state.verified === false) {
      return (
        <div className='container'>
          <p className={'sub-heading'}>Oops</p>
          There was a problem activating your account. <br/>
          Please contact <a href="mailto:support@openpermissions.org?Subject=Account%20Validation%20Issue"
                            target="_top">support@openpermissions.org </a>
          for assistance.
        </div>
      );
    } else {
      return (
        <div className='container'>
          <p className={'sub-heading'}>Verifying...</p>
        </div>
      );
    }
  }
});

module.exports = Verify;
