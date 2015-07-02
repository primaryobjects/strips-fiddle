Meteor.MenuManager = {
    update: function() {
        // Remove active class from the previously active tab.
        $('#navbar li.active').removeClass('active');

        // Find the tab that matches the route.
        var tab = $('.navbar-nav').find("li a[href='" + window.location.pathname + "']");

        // Highlight active menu for route.
        tab.closest('li').addClass('active');

        // Show/hide controls for route.
        if (tab.text() == 'Home') {
            $('li.controls').show();
        }
        else {
            $('li.controls').hide();
        }       
    }
}