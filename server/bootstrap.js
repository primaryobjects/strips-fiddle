Meteor.startup(function() {
    Meteor.publish('Domains', function(selection) {
        var result = null;

        if (selection && selection.domain) {
            result = Domains.find( { $or: [{ user: this.userId }, { user: 'public' }, { _id: selection.domain }] , $orderby: { created: 1 } });
        }
        else {
            result = Domains.find( { $or: [{ user: this.userId }, { user: 'public' }] }, $orderby: { created: 1 } );
        }

        return result;
    });
    
    Meteor.publish('Problems', function(domainId, selection) {
        var result = null;

        if (domainId) {
            if (selection && selection.problem) {
                result = Problems.find( { $or: [{ user: this.userId }, { user: 'public' }, { _id: selection.problem }, domain: domainId }, $orderby: { created: 1 } });
            }
            else {
                result = Problems.find( { $or: [{ user: this.userId }, { user: 'public' }], domain: domainId }, $orderby:{ created: 1 } });
            }
        }

        return result;
    });

    if (Domains.find().count() == 0) {
        var domains = [];

        domains.push(loadDomainAndProblemsByUrl(
            { name: 'Starcraft', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/starcraft/domain.txt' },
            [
                { name: 'Barracks', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/starcraft/barracks.txt'},
                { name: 'Marine', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/starcraft/marine.txt'},
                { name: 'Tank', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/starcraft/tank.txt'},
                { name: 'Wraith', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/starcraft/wraith.txt'}
            ]
        ));

        domains.push(loadDomainAndProblemsByUrl(
            { name: 'Blocks World 1', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/blocksworld1/domain.txt' },
            [{ name: 'Move Blocks From a to b', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/blocksworld1/problem.txt' }]
        ));

        domains.push(loadDomainAndProblemsByUrl(
            { name: 'Blocks World 2', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/blocksworld2/domain.txt' },
            [
                { name: 'Stack Blocks a b From Table x to a b Table y', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/blocksworld2/problem.txt' },
                { name: 'Stack Blocks Stacked b a From Table X to Stacked a b Table Y', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/blocksworld2/problem2.txt'}
            ]
        ));

        domains.push(loadDomainAndProblemsByUrl(
            { name: 'Blocks World 3', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/blocksworld3/domain.txt' },
            [
                { name: 'Stack Blocks Stacked b a From Table 1 to Stacked a b Table 3, One Pile Per Table', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/blocksworld3/problem.txt' },
                { name: 'Stack Blocks Stacked a b From Table 1 to Stacked a b Table 2, One Pile Per Table', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/blocksworld3/problem2.txt'}
            ]
        ));

        domains.push(loadDomainAndProblemsByUrl(
            { name: 'Blocks World 4', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/blocksworld4/domain.txt' },
            [
                { name: 'Stack Blocks Stacked c b a From Table 1 to Stacked a b c Table 3, One Pile Per Table', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/blocksworld4/problem.txt' },
                { name: 'Stack Blocks Stacked a b c From Table 1 to Stacked a b c Table 2, One Pile Per Table', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/blocksworld4/problem2.txt'}
            ]
        ));

        domains.push(loadDomainAndProblemsByUrl(
            { name: 'Blocks World 5 Sussmann Anomaly', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/blocksworld5/domain.txt' },
            [
                { name: 'Sussman Anomaly: From b and stacked c a To a b c', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/blocksworld5/problem.txt' }
            ]
        ));

        domains.push(loadDomainAndProblemsByUrl(
            { name: 'Cake', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/cake/domain.pddl' },
            [{ name: 'Have Your Cake and Eat It Too', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/cake/problem.pddl' }]
        ));

        domains.push(loadDomainAndProblemsByUrl(
            { name: 'Birthday Dinner', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/dinner/domain.pddl' },
            [{ name: 'Cook Dinner and Wrap a Present', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/dinner/problem.pddl' }]
        ));

        domains.push(loadDomainAndProblemsByUrl(
            { name: 'Air Cargo Transportation', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/aircargo/domain.txt' },
            [{ name: 'Swap Airports From SFO and JFK', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/aircargo/problem.txt' }]
        ));

        domains.push(loadDomainAndProblemsByUrl(
            { name: 'Dock Worker Robot', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/dockworkerrobot/domain.txt' },
            [{ name: '1 Robot, 2 Locations', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/dockworkerrobot/problem.txt' }]
        ));

        domains.push(loadDomainAndProblemsByUrl(
            { name: "1D Rubik's Cube", url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/rubikscube/domain.txt' },
            [
                { name: '1 3 2 6 5 4', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/rubikscube/problem1.txt' },
                { name: '6 5 4 3 1 2', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/rubikscube/problem2.txt' },
                { name: '5 6 2 1 4 3', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/rubikscube/problem3.txt' },
            ]
        ));

        domains.push(loadDomainAndProblemsByUrl(
            { name: "Shakeys World", url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/shakeysworld/domain.txt' },
            [
                { name: 'Turn Light On in Room 3', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/shakeysworld/problem1.txt' },
                { name: 'Pickup Ball', url: 'https://raw.githubusercontent.com/primaryobjects/strips/master/examples/shakeysworld/problem2.txt' }
            ]
        ));

        // Save all domains and problems.
        saveData(domains);
    }

    function downloadUrl(url, callback) {
//    Meteor.http.call('GET', url, function (err, result) {
      HTTP.get(url, {}, function(err, result) {
        callback(result.content);
      });
    }

    function saveData(domains, callback1) {
        // Insert sample data into db.
        for (var i in domains) {
            domain = domains[i];

            var domainCopy = JSON.parse(JSON.stringify(domain));
            domainCopy.problems = null;

            var id = Domains.insert(domain);
            console.log('Added domain ' + domain.name + ', id = ' + id);

            for (var j in domain.problems) {
                var problem = domain.problems[j];
                problem.domain = id;

                Problems.insert(problem);
                console.log('Added problem ' + problem.name);
            }
        }
    }

    function loadDomainAndProblemsByUrl(domain, problems) {
        var domain;

        // Load domain.
        Async.runSync(function(done) {
            downloadUrl(domain.url, function(text) {
                domain = { created: new Date(), user: 'public', name: domain.name, code: text };
                domain.problems = [];

                console.log('Added ' + domain.name);
                done();
            });
        });
        
        // Load problems for domain.
        Async.runSync(function(done) {
            for (var i in problems) {
                Async.runSync(function(done1) {
                    downloadUrl(problems[i].url, function(text) {
                        var problem = { created: new Date(), user: 'public', name: problems[i].name, code: text };
                        domain.problems.push(problem);

                        console.log('Added ' + problems[i].name);
                        done1();
                    });
                });
            }

            done();
        });

        // Add the domain and problems to the array.
        return domain;
    }
})
