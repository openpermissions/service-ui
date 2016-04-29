const api = require('chub'),
      config = require('../config'),
      Actions = require('./actions');

const accountsClient = api.accounts(config.api.accounts);
const repositoryClient = api.repository(config.api.repository);
const authenticationClient = api.authentication(config.api.authentication);
const actions = new Actions(accountsClient, repositoryClient, authenticationClient);

module.exports = actions;
