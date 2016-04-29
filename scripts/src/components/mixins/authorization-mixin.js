/**
 * Mixin to determine whether a component should be rendered based on provided render policy
 *
 * Example:
 *  var component = React.createClass({
 *  displayName: 'Services',
 *  mixins: [AuthorizationMixin],
 *
 *
 *  renderPolicy: function() {
 *    return true;
 *  },
 *
 * render: function () {
 *   return(
 *       <div/>
 *   )};
 * });
 */

const React = require('react');

const AuthorizationMixin = {

  componentWillMount: function() {
    this._originalRender = this.render;
    this._setRenderMethod();
  },

  componentWillUpdate: function(){
    this._setRenderMethod();
  },

  _emptyRender: function () {
    return <span />;
  },
  _setRenderMethod: function(){
    this.render = this.renderPolicy() ? this._originalRender : this._emptyRender;
  }
};

module.exports = AuthorizationMixin;
