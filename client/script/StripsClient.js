StripsClient = {
    run: function(domain, problem, alg) {
        // Clear output panel.
        $('#output').html("<p style='color: #a0a0a0;'>Initializing, this may take a couple of seconds or minutes, depending upon the domain. Please wait ..</p>");

        // Setup STRIPS.
        StripsManager.verbose = true;
        StripsManager.output = StripsClient.log;

        try {
        // Load the domain and problem.
        StripsManager.load(domain, problem, function(domain, problem) {
            // Run the problem against the domain.
            var solutions = StripsManager.solve(domain, problem, alg == 'DFS');

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