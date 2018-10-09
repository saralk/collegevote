var home, uni, home_set, uni_set;

function initMap() {
    var options = {
        componentRestrictions: {
            country: "us"
        }
    };

    home = new google.maps.places.SearchBox(document.getElementById('homeinput'), options);
    uni = new google.maps.places.SearchBox(document.getElementById('uniinput'), options);

    google.maps.event.addListener(home, 'places_changed', _.partial(handleChange, 'home'));
    google.maps.event.addListener(uni, 'places_changed', _.partial(handleChange, 'uni'));

    document.getElementById('search-button').addEventListener('click', onButtonClick);
    document.getElementById('go-back').addEventListener('click', function(e) {
        const page = document.getElementById('app');
        ['result-page', 'result-home', 'result-school', 'result-tossup'].forEach((className) => {
            page.classList.remove(className);
        });
        page.classList.add('home-page');

        document.getElementById('homeinput').value = '';
        document.getElementById('uniinput').value = '';
        home_set = false;
        uni_set = false;
        b.setAttribute('disabled', false);
        b.innerHTML = 'SHOW ME WHERE TO VOTE'

        return false;
    });
}

function handleChange(form) {
    if (form == 'home') {
        home_set = true; 
    } else if (form == 'uni') {
        uni_set = true;
    }
}

function onButtonClick() {
    var b = document.getElementById('search-button')
    b.setAttribute('disabled', true);
    b.innerHTML = 'Searching...'

    var home_place = home.getPlaces();
    var uni_place = uni.getPlaces();

    var results_el = document.getElementById("results");

    if (home_set && uni_set && home_place && uni_place) {
        var home_coords = home_place[0].geometry.location;
        var uni_coords = uni_place[0].geometry.location;

        getPriorities(home_coords, uni_coords, function(response) {
            var priorities = JSON.parse(response);

            renderResults(priorities);

            document.getElementById('homeinput').value = '';
            document.getElementById('uniinput').value = '';
            home_set = false;
            uni_set = false;

        });

    }
}

function getPriorities(home_c, uni_c, cb) {
    let home_coords = home_c.lat() + ',' + home_c.lng();
    let uni_coords = uni_c.lat() + ',' + uni_c.lng();
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            cb(xmlHttp.responseText);
    }
    xmlHttp.open("GET", '/priorities?home=' + encodeURIComponent(home_coords) + '&uni=' + encodeURIComponent(uni_coords), true);
    xmlHttp.send();
}

function renderResults(results) {
    "use strict";

    if (results.home.district_name) {
        Array.from(document.getElementsByClassName('home-name')).forEach((el) => {
            el.innerHTML = results.home.district_name.name;
        });
    }

    if (results.uni.district_name) {
        Array.from(document.getElementsByClassName('school-name')).forEach((el) => {
            el.innerHTML = results.uni.district_name.name;
        });
    }

    const page = document.getElementById('app');

    ['home-page', 'result-home', 'result-school', 'result-tossup'].forEach((className) => {
        page.classList.remove(className);
    });
    page.classList.add('result-page');

    let className;

    if (results.home.priority > results.uni.priority) {
        className = 'result-home';
    }
    if (results.uni.priority > results.home.priority) {
        className = 'result-school';
    }
    if (results.uni.priority == results.home.priority) {
        className = 'result-tossup';
    }

    page.classList.add(className);
}
