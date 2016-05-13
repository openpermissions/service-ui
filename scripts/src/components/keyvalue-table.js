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

import React, {PropTypes, Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import _ from 'lodash';
import ErrorMessages from './error-messages';
import {findDuplicates} from '../util';


export default class KeyValueTable extends Component {

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    // validationErrors are errors from client side form validation
    this.state = {data: _.pairs(props.data), validationErrors: []};
  }

  updateData(newData) {
    this.setState({data: newData});
    this.props.onChange(_.zipObject(newData), []);
  }

  handleRowChange(index, key, value) {
    const newData = _(this.state.data).cloneDeep();
    newData[index] = [key, value];
    this.updateData(newData);
  }

  removeRow(index, e) {
    e.preventDefault();
    const newData = _(this.state.data).cloneDeep();
    // use [null, null] as a placehoder so the index for each row doesn't change
    // in order to help react render the row with the same key and for
    // _.zipObject in updateData to work as expected
    newData[index] = [null, null];
    this.updateData(newData);
  }

  addRow(e) {
    e.preventDefault();
    const emptyRow = ['', ''];
    if (_.findIndex(this.state.data, x => _.isEqual(emptyRow, x)) == -1) {
      const newData = _(this.state.data).cloneDeep();
      newData.push(emptyRow);
      this.updateData(newData);
    }
  }

  render() {
    // filter out the nulls and preserve the index in the original array
    // in order to help react render the row with the same key
    const data = this.state.data
      .map((row, index) => [row, index])
      .filter(([row, index]) => row && row[0] !== null);
    // concat the errors from above with local validation errors
    const errors = (this.props.errors).concat(this.state.validationErrors);
    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th>{this.props.keyLabel}</th>
              <th>{this.props.valueLabel}</th>
              <th><a href="#" onClick={(e) => this.addRow(e)}><i className="fa fa-plus-circle fa-lg" ></i></a></th>
            </tr>
          </thead>
          <tbody>
            {data.map(
              ([[k, v], index]) => (
                <Row key={index} leftCol={k} rightCol={v}
                     leftColType={this.props.keyType}
                     rightColType={this.props.valueType}
                     removeRow={(e) => this.removeRow(index, e)}
                     onChange={(key, val) => this.handleRowChange(index, key, val)}
                     />
                ))}
          </tbody>
        </table>
        <ErrorMessages errors={errors} />
      </div>
      )
  }
}

KeyValueTable.propTypes = {
  data: PropTypes.object,
  onChange: PropTypes.func,
  keyLabel: PropTypes.string,
  keyType: PropTypes.string,
  valueType: PropTypes.string,
  valueLabel: PropTypes.string,
}

KeyValueTable.defaultProps = {
  keyLabel: 'Key',
  keyType: 'text',
  valueLabel: 'Value',
  valueType: 'text'
}


class Row extends Component {

  constructor(props) {
    super(props);
    this.state = _.pick(props, ['leftCol', 'rightCol']);
  }

  handleChange(colName, e) {
    const value = e.target.value;
    this.setState({[colName]: value});
    if(colName == 'leftCol') {
      this.props.onChange(value, this.state.rightCol);
    } else {
      this.props.onChange(this.state.leftCol, value);
    }
  }


  render() {
    return (
      <tr>
        <td>
          <input className={'form-control text'} value={this.state.leftCol}
                 type={this.props.leftColType} required={true}
                 onChange={(e) => this.handleChange('leftCol', e)} />
        </td>
        <td>
          <input className={'form-control text'} value={this.state.rightCol}
                 type={this.props.rightColType} required={true}
                 onChange={(e) => this.handleChange('rightCol', e)} />
        </td>
        <td>
          <a href="#" onClick={this.props.removeRow}><i className="fa fa-minus-circle fa-lg"></i></a>
        </td>
      </tr>
      );
  }
}

Row.propTypes = {
  leftCol: PropTypes.string.isRequired,
  rightCol: PropTypes.string.isRequired,
  leftColType: PropTypes.string.isRequired,
  rightColType: PropTypes.string.isRequired,
  removeRow: PropTypes.func,
  onChange: PropTypes.func,
  onError: PropTypes.func
};
