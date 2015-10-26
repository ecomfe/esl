//Sample modified from PhantomJS 1.8.2 examples
var system = require('system');
var fs = require('fs');

/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 10001, //< Default Max Timeout is 10s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("\n'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("\n'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 100); //< repeat check every 250ms
};


if (system.args.length !== 2) {
    console.log('Usage: run-phantom.js URL');
    phantom.exit(1);
}

var page = require('webpage').create();

// Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
page.onConsoleMessage = function(msg) {

    console.log(
        msg
            .replace('passed', '\x1B[40m\033[32m[passed]\x1B[0m')
            .replace('failed', '\x1B[40m\033[31m[failed]\x1B[0m')
    );

};

page.open(system.args[1], function(status){
    if (status !== "success") {
        console.log("Unable to access network");
        phantom.exit(1);
    } else {
        waitFor(function(){
            return page.evaluate(function(){
                var el = document.getElementById('test-result');
                if (el && el.innerText.match('completed')) {
                    return true;
                }
                return false;
            });
        }, function(){

            var failedNum = page.evaluate(function() {
                try {
                    return document.getElementById('failed').innerHTML;
                } catch (e) { }
                return 10000;
            });

            phantom.exit((parseInt(failedNum, 10) > 0) ? 1 : 0);
        });
    }
});
