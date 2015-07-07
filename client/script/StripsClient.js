StripsClient = {
    worker: null,

    run: function(domain, problem, alg) {
        // Create an HTML5 web worker.
        StripsClient.worker = new Worker('/scripts/strips.js');

        // Setup web worker event handler, to receive output messages.
        StripsClient.worker.onmessage = function(event) {
            StripsClient.log(event.data);
        }

        // Clear output panel.
		$('#output').text('');

        // Start strips, by posting a message to the web worker with our arguments.
        StripsClient.worker.postMessage({ name: 'run', domain: domain, problem: problem, alg: alg });
    },

    log: function(text) {
        // Display text in the output panel.
        $('#output').append('<p>' + text + '</p>');
    }
}