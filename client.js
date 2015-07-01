if (Meteor.isClient) {
    // Setup database access.
    Meteor.subscribe('Domains');
    Meteor.subscribe('Problems');

    // Bind to changes to the 'domain' session variable so we can update the Problem dropdown when the Domain dropdown changes.
    Meteor.autosubscribe(function() {
        Meteor.subscribe('Problems', Session.get('domainId'));
    });

    // Setup routing.
    Router.configure({
        layoutTemplate: 'layout'
    });
    Router.route('/', function() { this.render('home'); });
    Router.route('/about');
    Router.route('/contact');

    // Wait for data to load before initializing dropdowns upon page-load.
    Template.domainForm.rendered = function() {
        var dropdown = $(this.find('#ctrlDomain'));
        $('.collapse').collapse();

        this.autorun(_.bind(function() {
            // Wait for the "#each" loop to finish loading data. We do this by listening for database changes. First, get the same data as the #each loop.
            var cursor = domains();

            // Next, iterate over the cursor, in the same manner as the #each loop. This creates the dependency on the cursor.
            cursor.forEach(function(domain) { });

            // Finally, the data has finished loading, we can now initialize the UI.
            Tracker.afterFlush(_.bind(function() {
                dropdown.prop('selectedIndex', 1);
                dropdown.trigger('change');
            }, this));
        }, this));
    };

    // Wait for data to load before initializing dropdowns upon page-load.
    Template.problemForm.rendered = function() {
        var dropdown = $(this.find('#ctrlProblem'));

        this.autorun(_.bind(function() {
            // Wait for the "#each" loop to finish loading data. We do this by listening for database changes. First, get the same data as the #each loop.
            var cursor = problems();

            // Next, iterate over the cursor, in the same manner as the #each loop. This creates the dependency on the cursor.
            cursor.forEach(function(problem) { });

            // Finally, the data has finished loading, we can now initialize the UI.
            Tracker.afterFlush(_.bind(function() {
                // If "<Create your own>" was selected for the domain then this dropdown will have no other options, except for "<Create your own">, so just select index 0. Otherwise, pick the first available option at index 1.
                dropdown.prop('selectedIndex', dropdown.children().length > 1 ? 1 : 0);
                dropdown.trigger('change');
            }, this));
        }, this));
    };

    // Access methods for database.
    function domains() {
        return Domains.find();
    }

    function problems() {
        return Problems.find();
    }

    // Access methods for html templates.
    Template.domainForm.helpers({
        domains: domains()
    });

    Template.problemForm.helpers({
        problems: problems()
    });

    // Event handlers.
    Template.layout.events({
        'click #navbar li.menu, click .navbar-brand, click #btnRun, click #btnSave': function(event, template) {
            if (event.currentTarget.id == 'btnRun') {
                // Run button click.
                $('.panel-collapse.editor').collapse('hide');
                $('#outputPanel').collapse('show');

                StripsClient.run($('#txtDomainCode').val(), $('#txtProblemCode').val());
            }
            else if (event.currentTarget.id == 'btnSave') {
                // Save button click.
                var domainId = $('#ctrlDomain').val();
                var domainName = $('#ctrlDomain option:selected').text();

                if (domainId.indexOf('<Create your own>') == -1) {
                    Domains.update({ _id: domainId }, { name: $('#txtDomainName').val(), code: $('#txtDomainCode').val() }, function() {
                        // Update problem, if one exists.
                        var problemId = $('#ctrlProblem').val();
                        if (problemId.indexOf('<Create your own>') == -1) {
                            Problems.update({ _id: $('#ctrlProblem').val() }, { domain: domainId, name: $('#txtProblemName').val(), code: $('#txtProblemCode').val() });
                        }
                        else {
                            Problems.insert({ domain: domainId, name: $('#txtProblemName').val(), code: $('#txtProblemCode').val() });
                        }                        
                    });
                }
                else {
                    Domains.insert({ name: $('#txtDomainName').val(), code: $('#txtDomainCode').val() }, function(err, domainId) {
                        // Insert new problem, if one exists.
                        var problemId = $('#ctrlProblem').val();
                        if (problemId.indexOf('<Create your own>') != -1) {
                            Problems.insert({ domain: domainId, name: $('#txtProblemName').val(), code: $('#txtProblemCode').val() });
                        }
                    });
                }
            }
            else {
                // Menu tab click.
                var element = $(event.currentTarget);

                if (event.currentTarget.className == 'navbar-brand') {
                    element = $($('#navbar li')[0]);
                }

                // Remove active class from current tab.
                $(template.find('#navbar li.active')).removeClass('active');

                // Mark tab as active.
                element.addClass('active');

                if (element.text() == 'Home') {
                    $('#btnRun').show();
                }
                else {
                    $('#btnRun').hide();
                }
            }
        }
    });

    Template.domainForm.events({
        'change #ctrlDomain': function(event, template) {
            // Domain dropdown changed.
            var id = event.target.value;
            if (id) {
                var domain = {name: '', code: ''};

                // Find the domain in the db that matches the selected id.
                if (event.target.selectedIndex > 0) {
                    domain = Domains.findOne({ _id: id });
                }

                // Populate the name and code for the domain.
                template.find('#txtDomainName').value = domain.name;
                template.find('#txtDomainCode').value = domain.code;

                // Update problem dropdown.
                Session.set('domainId', id);
            }
        }
    });

    Template.problemForm.events({
        'change #ctrlProblem': function(event, template) {
            // Problem dropdown changed.
            var id = event.target.value;
            if (id) {
                var problem = {name: '', code: ''};

                // Find the problem in the db that matches the selected id.
                if (event.target.selectedIndex > 0) {
                    problem = Problems.findOne({ _id: id });
                }

                // Populate the name and code for the problem.
                template.find('#txtProblemName').value = problem.name;
                template.find('#txtProblemCode').value = problem.code;
            }
        }
    });
}