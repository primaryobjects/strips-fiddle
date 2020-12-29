/*
1. To generate an API key, see https://medium.com/@spencer_carli/meteor-google-oauth-from-react-native-e30d146dfad6
   In the Google API dashboard, click Credentials->Create Credentials->OAuth 2.0 Client IDs.
2. Create /settings.json with client and secret keys.
3. Stringify the json to use as a Heroku environment config variable.

{
  "google": {
    "clientId": "YOUR_CLIENT_ID",
    "secret": "YOUR_SECRET_KEY"
  }
}
*/

const settings = Meteor.settings.google;

if (settings) {
  ServiceConfiguration.configurations.remove({
    service: 'google'
  });

  ServiceConfiguration.configurations.insert({
    service: 'google',
    clientId: settings.clientId,
    secret: settings.secret
  });
}