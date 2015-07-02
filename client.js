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

    Template.layout.rendered = function() {
        // Show validation and disable save button on invalid fields.
        $('form').validator().on('submit', function (e) {
            if (e.isDefaultPrevented()) {
                e.preventDefault();
                //e.stopImmediatePropagation();
            }
        });
    };

    // Access methods for database.
    function domains() {
        return Domains.find();
    }

    function problems() {
        return Problems.find();
    }

    function save() {
        var domainId = $('#ctrlDomain').val();
        var domainName = $('#ctrlDomain option:selected').text();
        var txtDomainName = $('#txtDomainName').val();
        var txtProblemName = $('#txtProblemName').val();

        if (txtDomainName) {
            if (domainId && domainId.indexOf('<Create your own>') == -1) {
                Meteor.call('updateDomain', domainId, txtDomainName, $('#txtDomainCode').val(), function() {
                    // Update problem, if one exists.
                    var problemId = $('#ctrlProblem').val();
                    if (problemId && problemId.indexOf('<Create your own>') == -1) {
                        Meteor.call('updateProblem', domainId, problemId, txtProblemName, $('#txtProblemCode').val());
                    }
                    else if (txtProblemName) {
                        Meteor.call('addProblem', txtProblemName, $('#txtProblemCode').val(), domainId);
                    }                        
                });
            }
            else {
                Meteor.call('addDomain', txtDomainName, $('#txtDomainCode').val(), function(domainId) {
                    // Insert new problem, if one exists.
                    var problemId = $('#ctrlProblem').val();

                    if ((!problemId || problemId.indexOf('<Create your own>') != -1) && txtProblemName) {
                        Meteor.call('addProblem', txtProblemName, $('#txtProblemCode').val(), domainId);
                    }
                });
            }
        }
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
        'click #navbar li.menu, click .navbar-brand, click #btnRun, submit': function(event, template) {
            if (event.currentTarget.id == 'btnRun') {
                // Run button click.
                $('.panel-collapse.editor').collapse('hide');
                $('#outputPanel').collapse('show');

                StripsClient.run($('#txtDomainCode').val(), $('#txtProblemCode').val());
            }
            else if (event.type == 'submit') {
                // Save button click.
                if (!Meteor.userId()) {
                    $('#login-dropdown-list').find('a').trigger('click');
                }
                else {
                    save();
                }

                // Prevent actual form submisson.
                return false;
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