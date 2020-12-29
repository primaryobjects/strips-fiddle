if (Meteor.isClient) {
    // Setup routing.
    Router.configure({
        layoutTemplate: 'layout'
    });
    Router.route('/', { name: 'home' }, function() { this.render('home'); });
    Router.route('/about', { name: 'about' });
    Router.route('/contact', { name: 'contact' });
    Router.onAfterAction(function() {
        var title = '';

        switch (this.route.path()) {
            case '/': title = 'STRIPS-Fiddle: Automated Planning AI in your Browser'; break;
            case '/about': title = 'About' + ' | STRIPS-Fiddle'; break;
            case '/contact': title = 'Contact' + ' | STRIPS-Fiddle'; break;
        }

        if (title) {
            document.title = title;
        }
    });

    // Check url for shared parameters.
    selection = { domain: getUrlParameter('d'), problem: getUrlParameter('p'), algorithm: getUrlParameter('a') };
    Session.set('selection', selection);

    // Setup database access.
    Meteor.subscribe('Domains', Session.get('selection'));

    // Bind to changes to the 'domain' session variable so we can update the Problem dropdown when the Domain dropdown changes.
    Tracker.autorun(function() {
        Meteor.subscribe('Problems', Session.get('domainId'), Session.get('selection'));
    });


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
                if (selection.domain) {
                    dropdown.val(selection.domain);
                }
                else {
                    dropdown.prop('selectedIndex', 1);
                }

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
                if (selection.problem && dropdown.find("option[value='" + selection.problem + "']").length > 0) {
                    // We can select a value in the dropdown.
                    dropdown.val(selection.problem);
                }
                else {
                    // If "<Create your own>" was selected for the domain then this dropdown will have no other options, except for "<Create your own">, so just select index 0. Otherwise, pick the first available option at index 1.
                    dropdown.prop('selectedIndex', dropdown.children().length > 1 ? 1 : 0);
                }

                dropdown.trigger('change');
            }, this));
        }, this));
    };

    Template.layout.rendered = function() {
        // Select algorithm toggle button, based on url parameter.
        if (selection && selection.algorithm) {
            $('.alg').removeClass('active');
            $(".alg:contains('" + selection.algorithm + "')").addClass('active');
        }
    }

    Template.home.rendered = function() {
        Meteor.MenuManager.update();
    };

    Template.about.rendered = function() {
        Meteor.MenuManager.update();
    };

    Template.contact.rendered = function() {
        Meteor.MenuManager.update();
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

    function getUrlParameter(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        var results = regex.exec(location.search);

        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
}
