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

var React = require('react'),
    actions = require('../actions'),
    PureRenderMixin = require('react-addons-pure-render-mixin'),
    PropTypes = require('../prop-types'),
    Tabs = require('react-simpletabs'),
    util = require('../util'),
    consts = require('../constants'),
    MyRequestsList = require('../components/my-requests-list.js'),
    ManageRequestsSection = require('../components/manage-requests-section');


var Requests = React.createClass({
  displayName: 'Requests Page',

  propTypes: {
    loggedIn: PropTypes.bool.isRequired,
    verified: PropTypes.bool.isRequired,
    organisations: PropTypes.object,
    services: PropTypes.object,
    repositories: PropTypes.object
  },

  statics: {
    loginRequired: true,
    verificationRequired: true
  },

  mixins: [PureRenderMixin],

  componentWillMount: function () {
    actions.getServices.push();
    actions.getRepositories.push();
  },

  render: function () {
    let manageRequests = (<div/>);
    if (util.hasRole(this.props.user.toJS(), consts.roles.admin)) {
      manageRequests=(
        <Tabs.Panel title='Manage Requests'>
          <div className='requests container'>
            <ManageRequestsSection
              user={this.props.user}
              users={this.props.users}
              organisations={this.props.organisations}
              services={this.props.services}
              repositories={this.props.repositories} />
           </div>
        </Tabs.Panel>
      )
    }
    return (
      <Tabs>
        <Tabs.Panel title='My Requests'>
          <div className='requests container'>
            <MyRequestsList
              user={this.props.user}
              organisations={this.props.organisations}
              services={this.props.services}
              repositories={this.props.repositories} />
           </div>
        </Tabs.Panel>
        {manageRequests}
      </Tabs>
    );
  }
});

module.exports = Requests;
