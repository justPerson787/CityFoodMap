    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: restaurant.geometry.coordinates, // starting position [lng, lat]
        zoom: 9 // starting zoom
    });

    // Add Marker 
    new mapboxgl.Marker()
    .setLngLat(restaurant.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h3>${restaurant.title}</h3><p>${restaurant.location}</p>`
        )
    )
    .addTo(map)