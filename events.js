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
                    save(function(result) {
                        // Update preferences.
                        selection = result;
                        //localStorage['selection'] = JSON.stringify(selection);
                        $('#ctrlDomain').val(result.domain);
                        onDomainChange($('#ctrlDomain'));
                        $('#ctrlProblem').val(result.problem);
                        onProblemChange($('#ctrlProblem'));
                    });
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
                    $('li.controls').show();
                }
                else {
                    $('li.controls').hide();
                }
            }
        }
    });

    Template.domainForm.events({
        'change #ctrlDomain': function(event, template) {
            onDomainChange($(event.target));
        }
    });

    Template.problemForm.events({
        'change #ctrlProblem': function(event, template) {
            onProblemChange($(event.target));
        }
    });

    function onDomainChange(element) {
        // Domain dropdown changed.
        var id = element.val();
        if (id) {
            var domain = {name: '', code: ''};

            // Find the domain in the db that matches the selected id.
            if (element.prop('selectedIndex') > 0) {
                domain = Domains.findOne({ _id: id });
            }

            // Populate the name and code for the domain.
            $('#txtDomainName').val(domain.name);
            $('#txtDomainCode').val(domain.code);

            // Update problem dropdown.
            Session.set('domainId', id);

            // Remember dropdown selection.
            selection.domain = id;
            //localStorage['selection'] = JSON.stringify(selection);
        }

        updateShareLink();
        //$('#share').hide();
    }

    function onProblemChange(element) {
        // Problem dropdown changed.
        var id = element.val();
        if (id) {
            var problem = {name: '', code: ''};

            // Find the problem in the db that matches the selected id.
            if (element.prop('selectedIndex') > 0) {
                problem = Problems.findOne({ _id: id });

                // Remember dropdown selection.
                selection.problem = id;
                //localStorage['selection'] = JSON.stringify(selection);                    
            }

            // Populate the name and code for the problem.
            $('#txtProblemName').val(problem.name);
            $('#txtProblemCode').val(problem.code);
        }

        updateShareLink();
        //$('#share').hide();
    }

    function updateShareLink() {
        // Display permalink.
        var share = $('#share');
        
        var url = window.location.host + '?d=' + selection.domain;
        if (selection.problem) {
            url += (selection.problem.indexOf('<Create your own>') > -1 ? '' : '&p=' + selection.problem);
        }

        share.attr('href', url);
        share.show();
    }

    function save(callback) {
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
                        Meteor.call('updateProblem', problemId, txtProblemName, $('#txtProblemCode').val(), function() {
                            if (callback) {
                                callback({ domain: domainId, problem: problemId });
                            }
                        });
                    }
                    else if (txtProblemName) {
                        Meteor.call('addProblem', domainId, txtProblemName, $('#txtProblemCode').val(), function(err, problemId) {
                            if (callback) {
                                callback({ domain: domainId, problem: problemId });
                            }
                        });
                    }
                    else {
                        if (callback) {
                            callback({ domain: domainId, problem: null });
                        }                        
                    }
                });
            }
            else {
                Meteor.call('addDomain', txtDomainName, $('#txtDomainCode').val(), function(err, domainId) {
                    // Insert new problem, if one exists.
                    var problemId = $('#ctrlProblem').val();

                    if ((!problemId || problemId.indexOf('<Create your own>') != -1) && txtProblemName) {
                        Meteor.call('addProblem', domainId, txtProblemName, $('#txtProblemCode').val(), function(err, problemId) {
                            if (callback) {
                                callback({ domain: domainId, problem: problemId });
                            }
                        });
                    }
                    else {
                        if (callback) {
                            callback({ domain: domainId, problem: problemId });
                        }
                    }
                });
            }
        }
    }    
}