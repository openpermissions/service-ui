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
      PropTypes = require('../prop-types'),
      RepositoryForm = require('./repository-form'),
      PermissionsForm = require('./permission-form'),
      Immutable = require('immutable');

var RepositoryEditSection = React.createClass({
  displayName: 'RepositoryEditSection',
  mixins: [PureRenderMixin],

  propTypes: {
    repository: PropTypes.Immutable.Map.isRequired,
    repositoryServices: React.PropTypes.Immutable.List,
    organisations: PropTypes.Immutable.List,
    onClose: React.PropTypes.func.isRequired,
    validationErrors: PropTypes.object
  },


  getInitialState: function () {
    return {showForm: false};
  },

  /**
   * Change internal showForm state to false
   */
  _finish: function(event) {
    if (event) { event.preventDefault(); }
    this.setState({showForm: false});
  },


  /**
   * Fields to edit a repository
   *
   * @return {object}
   */
  render: function () {
    return (
      <div id="crhu_form_section">
        <RepositoryForm
           repository={this.props.repository}
           repositoryServices={this.props.repositoryServices}
           validationErrors={this.props.validationErrors} />
        <p className='intro' />
        <PermissionsForm
          entity={this.props.repository}
          entityType='repository'
          serviceTypes={Immutable.List.of(['repository'])}
          organisations={this.props.organisations}
          validationErrors={this.props.validationErrors} />
        <hr />

        <div className={'form-group'}>
          <button className='btn btn-primary' onClick={this.props.onClose}>
            Done
          </button>
        </div>
      </div>
    );
  }
  /* jshint ignore:end */
});

module.exports = RepositoryEditSection;
