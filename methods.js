// This code runs on the client and server to enable latency compensation (the security of server code and no round-trip delay). See https://www.meteor.com/tutorials/blaze/security-with-methods for details.
Meteor.methods({
    addDomain: function(name, code) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        else {
            // Wrap the async db method so we can return the result value in the callback.
            var func = Meteor.wrapAsync(function(callback) {
                Domains.insert({ created: new Date(), user: Meteor.userId(),  name: name, code: code }, function(err, id) {
                    callback(err, id);
                });
            });

            return func();
        }
    },

    addProblem: function(domain, name, code) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        else {
            // Wrap the async db method so we can return the result value in the callback.
            var func = Meteor.wrapAsync(function(callback) {
                Problems.insert({ created: new Date(), user: Meteor.userId(),  domain: domain, name: name, code: code }, function(err, id) {
                    callback(err, id);
                });
            });

            return func();
        }
    },

    updateDomain: function(domain, name, code) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        else {
            // Wrap the async db method so we can return the result value in the callback.
            var func = Meteor.wrapAsync(function(callback) {
                Domains.update({ _id: domain, user: Meteor.userId() }, { $set: { lastModified: new Date(), name: name, code: code } }, function(err, count) {
                    if (!count) {
                        // Domain not found, must exist for 'public' user. Copy and insert under this user.
                        Meteor.call('addDomain', 'Copy of ' + name, code, function (err, id) {
                            callback(err, id);
                        });
                    }
                    else {
                        callback(err, domain);
                    }
                });
            });

            return func();
        }
    },

    updateProblem: function(domain, problem, name, code) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        else {
            var func = Meteor.wrapAsync(function(callback) {
                Problems.update({ _id: problem, user: Meteor.userId() }, { $set: { lastModified: new Date(), name: name, code: code } }, function(err, count) {
                    if (!count) {
                        // Problem not found, must exist for 'public' user. Copy and insert under this user.
                        Meteor.call('addProblem', domain, 'Copy of ' + name, code, function (err, id) {
                            callback(err, id);
                        });
                    }
                    else {
                        callback(err, problem);
                    }
                });
            });

            return func();
        }
    }
});