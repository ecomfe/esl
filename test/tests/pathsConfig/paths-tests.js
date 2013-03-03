config({
    baseUrl: '.',
    paths: {
        'foo/b': 'alternate/b',
        'foo/b/c': 'elsewhere/c'
    }
});

go(['foo', 'foo/b', 'foo/b/c', 'bar', 'bar/sub'],
function (foo, fooB, fooC, bar, barSub) {
    doh.register(
        "paths",
        [
            function paths(t){
                t.is("foo", foo.name);
                t.is("fooB", fooB.name);
                t.is("fooC", fooC.name);
                t.is("bar", bar.name);
                t.is("barSub", barSub.name);
            }
        ]
    );
    doh.run();
});