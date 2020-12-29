/*
1. To generate an API key, see https://developer.twitter.com/en/portal/dashboard
2. Create /settings.json with client and secret keys.
3. Stringify the json to use as a Heroku environment config variable.

{
 "twitter": {
    "clientId": "jWKaVPxA2gDhZkdxKuNLPHjbm",
    "secret": "XVXIdkmcoPnsDuoIrpt3QGubv12aOmpaAsVYCDxPDfTOqraYJR"
  }
}*/

const settings = Meteor.settings.twitter;

if (settings) {
  ServiceConfiguration.configurations.remove({
    service: 'twitter'
  });

  ServiceConfiguration.configurations.insert({
    service: 'twitter',
    consumerKey: settings.clientId,
    secret: settings.secret
  });
}