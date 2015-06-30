Meteor.startup(function() {
    Meteor.publish('Domains', function() {
        return Domains.find();
    });
    
    Meteor.publish('Problems', function(domain) {
        return Problems.find({ domain: domain });
    });

    if (Domains.find().count() == 0) {
        // Create sample data.
        var domains = [
            {
                name: 'blocksworld1',
                code: '(define (domain blocksworld)\n' +
                      '  (:requirements :strips)\n' +
                      '  (:action move\n' +
                      '   :parameters (?b ?t1 ?t2)\n' +
                      '   :precondition (and (block ?b) (table ?t1) (table ?t2) (on ?b ?t1) (not (on ?b ?t2))\n' +
                      '   :effect (and (on ?b ?t2)) (not (on ?b ?t1))))\n' +
                      ')'
            },
            {
                name: 'blocksworld2',
                code: '(define (domain blocksworld)\n' +
                      '(:requirements :strips :typing)\n' +
                      '(:types block table)\n' +
                      '(:action move\n' +
                      '   :parameters (?b - block ?t1 - table ?t2 - table)\n' +
                      '   :precondition (and (block ?b) (table ?t1) (table ?t2) (on ?b ?t1) not (on ?b ?t2) (clear ?b))\n' +
                      '   :effect (and (on ?b ?t2)) (not (on ?b ?t1))))\n' +
                      '(:action stack\n' +
                      '   :parameters (?a - block ?b - block ?t1 - table)\n' +
                      '   :precondition (and (block ?a) (block ?b) (table ?t1) (clear ?a) (clear ?b) (on ?a ?t1) (on ?b ?t1))\n' +
                      '   :effect (and (on ?a ?b) not (on ?a ?t1) not (clear ?b))\n' +
                      '   )\n' +
                      '(:action unstack\n' +
                      '   :parameters (?a - block ?b - block ?t1 - table)\n' +
                      '   :precondition (and (block ?a) (block ?b) (table ?t1) (on ?b ?t1) (clear ?a) (on ?a ?b))\n' +
                      '   :effect (and (on ?a ?t1) not (on ?a ?b) (clear ?b))\n' +
                      '   )\n' +
                      ')'
            }
        ];

        // Insert sample data into db.
        domains.forEach(function(domain) {
            Domains.insert(domain);
        });

        var problems = [
            {
                domain: 'blocksworld1',
                name: 'move-blocks-from-a-to-b',
                code: '(define (problem move-blocks-from-a-to-b)\n' +
                        '(:domain blocksworld)\n' +
                        '(:init (and (block a) (block b) (table x) (table y)\n' +
                        '      (on a x) (on b x)))\n' +
                        '(:goal (and (on a y) (on b y)))\n' +
                        ')'
            },
            {
                domain: 'blocksworld2',
                name: 'stack-blocks-ab-from-tablex-to-ab-tabley',
                code: '(define (problem stack-blocks-a-b-from-tablex-to-ab-tabley)\n' +
                          '(:domain blocksworld)\n' +
                          '(:objects\n' +
                          '  a b - block\n' +
                          '  x y - table)\n' +
                          '(:init (and (block a) (block b) (table x) (table y)\n' +
                          '       (on a x) (on b x) (clear a) (clear b)))\n' +
                          '(:goal (and (on a b) (on b y) (clear a) not (clear b)))\n' +
                        ')'
            },
            {
                domain: 'blocksworld2',
                name: 'stack-blocks-stacked-ba-from-tablex-to-stacked-ab-tabley',
                code: '(define (problem stack-blocks-stacked-ba-from-tablex-to-stacked-ab-tabley)\n' +
                        '(:domain blocksworld)\n' +
                        '(:objects\n' +
                        '  a b - block\n' +
                        '  x y - table)\n' +
                        '(:init (and (block a) (block b) (table x) (table y)\n' +
                        '       (on a x) (on b a) (clear b)))\n' +
                        '(:goal (and (on b y) (on a b) (clear a) not (clear b)))\n' +
                        ')'
            }
        ];

        // Insert sample data into db.
        problems.forEach(function(problem) {
            Problems.insert(problem);
        });        
    }
})