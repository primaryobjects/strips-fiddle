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
                        Domains.insert({ created: new Date(), user: Meteor.userId(),  name: 'Copy of ' + name, code: code }, function(err, id) {
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
                        Problems.insert({ created: new Date(), user: Meteor.userId(), domain: domain, name: name, code: code }, function(err, id) {
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
    },

    removeDomain: function(domain) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        else {
            var func = Meteor.wrapAsync(function(callback) {
                // Remove all problems in this domain.
                var problems = Problems.find({ domain: domain });
                problems.forEach(function(problem) {
                    Problems.remove({ _id: problem._id, user: Meteor.userId() });
                });

                Domains.remove({ _id: domain, user: Meteor.userId() }, function(err, count) {
                    if (!count) {
                        // Domain not found, must exist for 'public' user.
                        callback(err, domain);
                    }
                    else {
                        callback(err, domain);
                    }
                });
            });

            return func();
        }
    },

    removeProblem: function(problem) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        else {
            var func = Meteor.wrapAsync(function(callback) {
                Problems.remove({ _id: problem, user: Meteor.userId() }, function(err, count) {
                    if (!count) {
                        // Problem not found, must exist for 'public' user.
                        callback(err, problem);
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