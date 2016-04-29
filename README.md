#  Service UI

An example frontend for the Open Permissions Platform accounts service.

The UI is implemented completely in JavaScript using

+ [React.js](http://facebook.github.io/react/)
+ [Bacon.js](https://baconjs.github.io/)
+ [Immutable.js](http://facebook.github.io/immutable-js/)

in a [Flux](http://facebook.github.io/flux/)-like architecture.

##  Getting Started

Download & install [node & npm](http://nodejs.org/download/) or use your
package manager of choice e.g.

```bash
brew install node
```

##  Install dependencies

```bash
npm install
```

### Updating dependencies

Dependencies are shrink wrapped to when updating don't forget to update this

```bash
npm shrinkwrap
```

and commit the changes.

## Build

### Production environment

```bash
npm run build
npm run build-dev-css
```

### Development environment

Either run this

```bash
npm run build-dev
npm run build-dev-css
```

or this, if you require automatic rebuild of the bundle whenever there are file
changes

```bash
npm run build-dev:watch
npm run build-dev-css:watch
```

## Running the service

You need a web server to serve index.html. It is recommended that you use the
provided http server, which is compatible with React-style routing e.g.

```bash
python httpserver.py
```

You should be able to view the application at
[http://localhost:1234](http://localhost:1234).
Assuming you have couchdb and the accounts service running on your local
machine you should now be able to login/signup, create an organisation and add
services to the organisation.
If you also require the offer generator facility you will also require the
auth, repository and blazegraph services running.

## Overview

This is a single-page application using a
[Flux](http://facebook.github.io/flux/)-like architecture, where all data flows
cyclically in a single direction:

    View ──> Event stream ──> Store
     ^                          │
     └──────────────────────────┘

Data is pushed into an event stream by a view, which is then passed through a
series of functions, and the store listens to the end result. For example, when
a login form is submitted:

* a user submits an email and password in a login view
* the email and password is pushed into the `login` event bus
* an asynchronous API request is triggered to fetch a token and user
  details
* a response is received
* the application state updates with the token and user object
* the application re-renders to display the Account page

The views are implemented using React components, which are structured in a
hierarchy:

    Store ──> App
               │
               │─> Login
               │
               │─> Signup
               │
               └─> Account
                      │
                      │─> OrganisationSection
                      │        │
                      │        └─> OrganisationForm
                      │
                      └─> ServicesSection
                               │
                               │─> ServicesList
                               │
                               └─> ServiceForm


The only view that listens to the store is the top-level `App` component, which
passes data down into child components using their `props`. The component's can
be thought of as functions that output DOM changes since each component's
output is determined by the `props`. If the input has not changed after a
cycle, then there will be no change in output from the component (or it's
children) and we don't need to re-render. Checking if the input has changed is
very efficient, even for large JSON objects, because application data is stored
in an immutable data structure.

##  Tests

Unit tests are written using [mocha](https://github.com/mochajs/mocha), which
can be run with

```bash
npm test
```

There are also some BDD system tests implemented using
[cucumber.js](https://github.com/cucumber/cucumber-js) and
[webdriverio](http://webdriver.io/) to drive Chrome. To run these test, you
will need:

* a running instance of the accounts service
* serve index.html at http://localhost:8000/ (or run with `TEST_URL`
  environment variable set to the relevant URL)
* launch the selenium-standalone with  `selenium-standalone start` (before
  running the first time, run `selenium-standalone install` to install the
  chrome driver)

Then to run the tests call

```
cucumber.js
```

##  Deployment

The UI is deployed to a S3 bucket, so you need tthe `AWS_ACCESS_KEY_ID` and
`AWS_SECRET_ACCESS_KEY` to be in the environment or defined in the
[deploy/config.json](./deploy/config.json) file using the `accessKeyId` and
`secretAccessKey` object keys (see [the
docs](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Credentials_from_Environment_Variables)).

To deploy run:

```bash
npm run deploy S3_BUCKET
```

### Production deployment

Edit [scripts/src/config.js](./scripts/src/config.js) so that the service are
set to the production versions

```js
module.exports = {
  api: {
    accounts: 'https://acc.copyrighthub.org/v1/accounts',
    repository: 'https://repo.copyrighthub.org/v1/repository',
    authentication: 'https://auth.copyrighthub.org/v1/authentication'
  }
};

```

Run the following commands to deploy to services.copyrighthub.org

```bash
npm install
npm run deploy services.copyrighthub.org
```

### Stage deployment
Edit [scripts/src/config.js](./scripts/src/config.js) so that the service are
set to the stage versions

```js
module.exports = {
  api: {
    accounts: 'https://acc-stage.copyrighthub.org/v1/accounts',
    repository: 'https://repo-stage.copyrighthub.org/v1/repository',
    authentication: 'https://auth-stage.copyrighthub.org/v1/authentication'
  }
};

```

Run the following commands to deploy to services-stage.copyrighthub.org

```bash
npm install
npm run deploy services-stage.copyrighthub.org
```
