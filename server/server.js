Meteor.methods({
    'run': function run(domain, problem) {
        var strips = Meteor.npmRequire('strips');

        console.log(domain);
        console.log(problem);
    }
});