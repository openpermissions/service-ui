/**
 * (C) Copyright Open Permissions Platform Coalition 2016
 */
'use strict';

const React = require('react'),
      PureRenderMixin = require('react-addons-pure-render-mixin'),
      LinkedStateMixin = require('react-addons-linked-state-mixin'),
      ErrorMessages = require('./error-messages');

const FormGroup = React.createClass({
  displayName: 'FormGroup',

  mixins: [PureRenderMixin, LinkedStateMixin],

  propTypes: {
    fieldName: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    required: React.PropTypes.bool.isRequired,
    type: React.PropTypes.string.isRequired,
    placeholder: React.PropTypes.string.isRequired,
    tip: React.PropTypes.string.isRequired,
    readOnly: React.PropTypes.bool
  },

  getInitialState: function() {
    return {value: this.props.value};
  },

  handleChange: function(e) {
    const newValue = e.target.value;
    this.setState({value: newValue});
    this.props.onChange(newValue);
  },

  render: function () {
    let labelHtml,
        input;

    if (this.props.required) {
      labelHtml = <label className={'label--big'}>{this.props.label}*</label>;
    } else {
      labelHtml = <label className={'label--big'}>{this.props.label}</label>;
    }

    if (!this.props.readOnly) {
      input = (<input className={'form-control ' + this.props.fieldName}
                     type={this.props.type}
                     required={this.props.required}
                     placeholder={this.props.placeholder}
                     onChange={this.handleChange}
                     value={this.state.value} />
              );
    } else {
      input = (<input className={'form-control ' + this.props.fieldName}
                      type={this.props.type}
                      value={this.state.value}
                      readOnly={this.props.readOnly} />
              );
    }

    return (
      <div className={'form-group col col-xs-12 col-sm-6 cb'} key={this.props.fieldName}>
        {labelHtml}
        {input}
        <ErrorMessages errors={this.props.errors} />
        {!this.props.readOnly && <span className={'help-block'}>{this.props.tip}</span>}
      </div>
    );
  }
});

module.exports = FormGroup;
