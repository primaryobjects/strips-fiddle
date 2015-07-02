// This code runs on the client and server to enable latency compensation (the security of server code and no round-trip delay). See https://www.meteor.com/tutorials/blaze/security-with-methods for details.
Meteor.methods({
    addDomain: function(name, code, callback) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        else {
            Domains.insert({ user: Meteor.userId(),  name: name, code: code }, function(err, id) {
                if (callback) {
                    callback(id);
                }
            });
        }
    },

    addProblem: function(name, code, domain, callback) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        else {
            Problems.insert({ user: Meteor.userId(),  domain: domain, name: name, code: code }, function(err, id) {
                if (callback) {
                    callback(id);
                }
            });
        }
    },

    updateDomain: function(domain, name, code, callback) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        else {
            Domains.update({ _id: domain }, { user: Meteor.userId(), name: name, code: code }, function() {
                if (callback) {
                    callback();
                }
            });
        }
    },

    updateProblem: function(domain, problem, name, code, callback) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        else {
            Problems.update({ _id: problem }, { user: Meteor.userId(), domain: domain, name: name, code: code }, function() {
                if (callback) {
                    callback();
                }
            });
        }
    }
});