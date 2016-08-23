# JavaScript Architecture 

The Copyright Hub web user interface will use [react.js](http://facebook.github.io/react/) in a Flux-like architecture using functional reactive programming (FRP). The application's state is all stored in immutable data structures (using [Immutable.js](http://facebook.github.io/immutable-js/)). 

For some background reading, see: 

* [React documentation](http://facebook.github.io/react/index.html)
* [Facebook's Flux documentation](http://facebook.github.io/flux/docs/overview.html) 
* [Fluxxor's introduction to Flux](http://fluxxor.com/what-is-flux.html) (Fluxxor is a Flux implementation) 
* [Comparing Reflux and Flux](http://spoike.ghost.io/deconstructing-reactjss-flux/) (Reflux is a Flux implementation that leans more towards FRP) 
* [The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754) 

##Architecture Diagram 

Suggested architecture for a simple Accounts page: ![Accounts UI architecture](https://camo.githubusercontent.com/fddd31f48f7a53d9cade0494d841d3ec5770bc9b/68747470733a2f2f646f63732e676f6f676c652e636f6d2f64726177696e67732f642f317075644b307849566d394a772d504a6462507442663072586b537263565f434d5832744e31714e66496f6b2f7075623f773d3135353426683d373839)

##Why React.js? 

Reasons for using React over full frameworks like Angular: 

* It's simple and doesn't have a steep learning curve 
* Easy to compose small React components together into a larger application 
* React manages when the UI needs to re-rendered and minimises slow DOM interactions 
* React can be used in a very functional style without internal state. This makes it very easy to understand an individual component since what is displayed will only depend on the input data passed into the component 

Since React isn't a framework, you have to build an architecture around it yourself or embed it inside a framework (e.g. Backbone). Flux has become a popular architecture to use with React, however how you implement the basic design is left up to you. 

##Flux vs FRP 
The key feature of the Flux architecture is a unidirectional flow of data through the application, which makes it easier to reason about state. It's much easier to debug if all changes to application's state come from a single source. There are, however, a couple of things off-putting about Facebook's examples: 

* Since there is a single dispatcher, and each store listens to the dispatcher each store is full of`switch` statements comparing static strings, which doesn't feel right 
* The views call a function (aka "action creators"), instead of triggering events that actions listen to. It feels more natural to listen to events so that from within the actions you can immediately see what components can cause a particular change in application state. 

[Reflux](https://github.com/spoike/refluxjs) addresses the first concern quite well by creating actions that are their own dispatcher. However, it can cumbersome making asynchronous API requests within Reflux actions and composing actions together is inelegant. Reflux also does not address the second concern, encouraging calling the actions directly from your components. 

Reflux is a step closer to FRP than Flux. Using a FRP library, such as [Bacon.js](https://github.com/baconjs/bacon.js), provides a nice way to transform an event into event streams that can be easily composed together. For example, an event stream can be fed into asynchronous API requests which then update our store. Key features of the Flux-like implementation using Bacon are: 

* Bacon's `EventStream`'s are analogous to Flux actions, which listen to events emitted from components 
* There are no "action creators", the EventStreams take input from the component's event and transform it into a final output 
* The store utilises Bacon's `Property` to store and update application state 
* Application state is an Immutable.js data structure, so React can efficiently check whether a re-render is required and less data is copied around the application 

####Bacon Example 
Suppose we have a login form, that has an `EventEmitter` on it's `events` property. When a 'submit' event is triggered we want to take the email and password from the event and make an API request to retrieve a token and some information about the user. Using Bacon, our actions.js file could look like:

```javascript
var Bacon = require('baconjs'),
    _ = require('lodash'),
    api = require('chub'),
    loginForm = require('./components/Login');
// initialise our API client
var accounts = api.accounts('https://localhost:8006/v0/accounts');
// create an event stream from submit events, passing on the event's arguments
var login = Bacon.fromEventTarget(loginForm.events, 'submit', () => arguments);
// create an event stream from our API client's login method
var loginRequest = _.compose(Bacon.fromPromise, args => accounts.login.apply(null, args));
// transform the login event stream into a event stream of JSON API responses
var authenticated = login.flatMapLatest(loginRequest).map('.body');
module.exports = {
    'authenticated': authenticated
}
```

The stores.js file can then listen the `authenticated` event stream to then update our application state, e.g.:

```javascript
var Immutable = require('immutable'),
    Bacon = require('baconjs'),
    actions = require('./actions');
// create a Bacon.Property that updates when we receive an authenticated user
var user = Bacon.update(
    Immutable.Map({}), 
    actions.authenticated,
    (prevUser, newUser) => Immutable.fromJS(newUser)
);
module.exports = {
    'user': user
}
```

Our application's top-level view will listen to the `stores.user` property, and passes data down into child components via their `props` as required. Since `user` is an immutable data structure, the application can efficiently determine whether or not data has actually changed, minimising unnecessary re-rendering.
