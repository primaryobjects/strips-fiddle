StripsClient = {
    run: function(domain, problem) {
        // Clear output panel.
        $('#output').text('');

        // Setup STRIPS.
        StripsManager.verbose = true;
        StripsManager.output = StripsClient.log;

        try {
        // Load the domain and problem.
        StripsManager.load(domain, problem, function(domain, problem) {
            // Run the problem against the domain.
            var solutions = StripsManager.solve(domain, problem);

            // Display each solution.
            for (var i in solutions) {
                var solution = solutions[i];

                StripsClient.log('<p>&nbsp;</p>');
                StripsClient.log('<h4>Solution found in ' + solution.steps + ' steps!</h4>');
                for (var i = 0; i < solution.path.length; i++) {
                    StripsClient.log('<b>' + (i + 1) + '</b>. ' + solution.path[i]);
                }        
            }
        }, true);
        }
        catch (excep) {
            StripsClient.log(excep.message);
        }
    },

    log: function(text) {
        // Display text in the output panel.
        $('#output').append('<p>' + text + '</p>');
    }
}