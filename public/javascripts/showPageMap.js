// const campground = require("../../models/campground");

// mapboxgl.accessToken = 'pk.eyJ1Ijoic2lsdml1ZCIsImEiOiJja21scjBxc2QwOGp3MnBsd3ZkYnYwNTluIn0.54ExqVPjEWeiN1c5OqjQUQ';
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map', // container ID
// style: 'mapbox://styles/mapbox/satellite-v9', // style URL
style: 'mapbox://styles/mapbox/streets-v11', // style URL
// style: 'mapbox://styles/mapbox/light-v10', // style URL
// center: [25, 45], // starting position [lng, lat]
center: campground.geometry.coordinates,
zoom: 8 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
// map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
.setLngLat(campground.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({offset: 25})
    .setHTML(
        `<h3>${campground.title}</h3><p>${campground.location}</p>`
    )
)
.addTo(map);