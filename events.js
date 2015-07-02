if (Meteor.isClient) {
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

    function save() {
        var domainId = $('#ctrlDomain').val();
        var domainName = $('#ctrlDomain option:selected').text();
        var txtDomainName = $('#txtDomainName').val();
        var txtProblemName = $('#txtProblemName').val();

        if (txtDomainName) {
            if (domainId && domainId.indexOf('<Create your own>') == -1) {
                Meteor.call('updateDomain', domainId, txtDomainName, $('#txtDomainCode').val(), function(err, count) {
                    // Update problem, if one exists.
                    var problemId = $('#ctrlProblem').val();
                    if (problemId && problemId.indexOf('<Create your own>') == -1) {
                        Meteor.call('updateProblem', problemId, txtProblemName, $('#txtProblemCode').val());
                    }
                    else if (txtProblemName) {
                        Meteor.call('addProblem', domainId, txtProblemName, $('#txtProblemCode').val());
                    }                        
                });
            }
            else {
                Meteor.call('addDomain', txtDomainName, $('#txtDomainCode').val(), function(err, domainId) {
                    // Insert new problem, if one exists.
                    var problemId = $('#ctrlProblem').val();

                    if ((!problemId || problemId.indexOf('<Create your own>') != -1) && txtProblemName) {
                        Meteor.call('addProblem', domainId, txtProblemName, $('#txtProblemCode').val());
                    }
                });
            }
        }
    }    
}