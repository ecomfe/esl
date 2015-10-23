define(function () {
    var state = document.getElementById('state');
    var success = afterConfig && domReady && bodyFoot;

    state.style.background = success ? 'green' : 'red';
    return {};
});