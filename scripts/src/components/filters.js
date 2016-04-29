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
      _ = require('lodash');

const NameFilter = React.createClass({
  displayName: 'NameFilter',
  propTypes: {
    filterName: PropTypes.string.isRequired,
    changeFilterName: PropTypes.func.isRequired
  },
  mixins: [PureRenderMixin],
  handleFilterNameChange: function() {
    return this.props.changeFilterName(this.refs.filterNameInput.value);
  },
  render: function() {
    return (
      /* jshint ignore:start */
      <div className={'form-group col col-xs-6'}>
        <label>Filter by User</label>
        <input
           type='text'
           value={this.props.filterName}
           ref='filterNameInput'
           onChange={this.handleFilterNameChange}
           className={'form-control'}
         />
       </div>
      /* jshint ignore:end */
        );
  }
});

const OrgFilter = React.createClass({
  displayName: 'OrgFilter',
  propTypes: {
    filterOrg: PropTypes.string.isRequired,
    changeFilterOrg: PropTypes.func.isRequired,
    organisations: PropTypes.Immutable.List.isRequired
  },
  mixins: [PureRenderMixin],
  handleFilterOrgChange: function() {
    return this.props.changeFilterOrg(this.refs.filterOrgInput.value);
  },
  render: function() {
    /* jshint ignore:start */
    const orgArray = _.map(this.props.organisations.toArray(),
                     org => org.toJS()
                     ),
          orgOptions = [<option key='all' value='all'> All </option>];
    orgArray.forEach( function(org) {
      orgOptions.push(<option key={org.id} value={org.id}>{org.name}</option>);
    });
    /* jshint ignore:end*/
    return (
      /* jshint ignore:start */
      <div className={'form-group col col-xs-6'}>
        <label>Filter by Organisation</label>
        <select
           value={this.props.filterOrg}
           onChange={this.handleFilterOrgChange}
           ref='filterOrgInput'
           className={'form-control'}
         >
           {orgOptions}
         </select>
       </div>
      /* jshint ignore:end*/
        );
  }
});

module.exports={'NameFilter': NameFilter, 'OrgFilter': OrgFilter};
