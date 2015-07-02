// This code runs on the client and server to enable latency compensation (the security of server code and no round-trip delay). See https://www.meteor.com/tutorials/blaze/security-with-methods for details.
Meteor.methods({
    addDomain: function(name, code) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        else {
            Domains.insert({ user: Meteor.userId(),  name: name, code: code }, function(err, id) {
                Session.set('addDomainResult', id);
            });
        }
    },

    addProblem: function(domain, name, code) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        else {
            Problems.insert({ user: Meteor.userId(),  domain: domain, name: name, code: code });
        }
    },

    updateDomain: function(domain, name, code) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        else {
            Domains.update({ _id: domain, user: Meteor.userId() }, { $set: { name: name, code: code } });
        }
    },

    updateProblem: function(problem, name, code) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        else {
            Problems.update({ _id: problem, user: Meteor.userId() }, { $set: { name: name, code: code } });
        }
    }
});