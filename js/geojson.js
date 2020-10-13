//function to retrieve the data and place it on the map




function getData(mymap){
    //load the data
    $.ajax("data/citiesData.geojson", {
        dataType: "json",
        success: function(response){

            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response).addTo(mymap);
        }
    });
};

$(document).ready(createMap);