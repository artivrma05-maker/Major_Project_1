mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: listing.geometry.coordinates,
    zoom: 9,
});

const marker1 = new mapboxgl.Marker({color: "red"})
.setLngLat(listing.geometry.coordinates)
.setPopup(new mapboxgl.Popup({offset: 25, className: 'my-class'})
//.setLngLat(e.lngLat)
.setHTML("<h4>Exect location provided after booking</h4>"))
.addTo(map);