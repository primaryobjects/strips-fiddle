StripsClient = {
    run: function(domain, problem) {
        StripsManager.verbose = true;
        
        // Load the domain and problem.
        StripsManager.load(domain, problem, function(domain, problem) {
            // Run the problem against the domain.
            var solutions = StripsManager.solve(domain, problem);

            // Display each solution.
            for (var i in solutions) {
                var solution = solutions[i];

                console.log('- Solution found in ' + solution.steps + ' steps!');
                for (var i = 0; i < solution.path.length; i++) {
                    console.log((i + 1) + '. ' + solution.path[i]);
                }        
            }
        }, true);
    }
}