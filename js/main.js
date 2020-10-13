/* JS by Danielle Wyenberg, 2020 */
/* Example from Leaflet Quick Start Guide*/

//Create Leaflet Map


var cities;    
var mymap = L.map("mapid").setView([20.632799, -9.797421], 2);

//can replace this with an OpenStreetMap tileset later:

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZGFuaWVsbGV3eWVuYmVyZyIsImEiOiJja2N0ODhjeXQxbW01MnBvYnF2amw3c2lhIn0.W40RbZUlWd-HZzYc68TBgQ'
}).addTo(mymap);

//call getData function

    getData(mymap);
    



//Build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];
    
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;
    
    //push each attribute name into attributes array
    for(var attribute in properties){
        //only take attribute names
        if (attribute != "City"){
            attributes.push(attribute);
        }
      }
     
     return attributes;
}


//funtion to Import GeoJSON data 
function getData(mymap){
    //load the data
    $.ajax("data/map.geojson", {
        dataType: "json",
        success: function(response){
            
            //create attributes array
            var attributes = processData(response);
            
            //call functions to create proportional symbols and sequence controls
            
            //define scaleFactor
            var scaleFactor = calcScaleFactor(response);
            createPropSymbols(response, mymap, attributes);
            createSequenceControls(mymap, attributes);
                     
            //createLegend(mymap, attributes);
        }
    });
}

//Calculate scale factor based on user input
function calcScaleFactor(){
    
    //set default value
    var scaleFactor = 50;
    
    //add buttons for increase and decrease scale factor
    $('#panel').append('<button class="skip" id="decrease">Decrease Scale Factor</button>');
    $('#panel').append('<button class="skip" id="increase">Increase Scale Factor</button>');
    
    
    //click listener for button
    $('.skip').click(function(){
        
        //increment or decrement depending on button clicked
        if ($(this).attr('id') == 'increase'){
            scaleFactor = scaleFactor + 5;
             
        } else if ($(this).attr('id') == 'decrease'){
            scaleFactor = scaleFactor - 5; 
        };
       
        });
        return scaleFactor;
    }


//calculate the radius of each proportional symbol
function calcPropRadius(attValue, scaleFactor){
    
    //scale factor to adjust symbol size evenly
    var scaleFactor = 50;
    
                
    //area based on attribute value and sclae factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);
    
    return radius;      

}





//Add circle markers for point features to the map

function createPropSymbols(data, mymap, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
   
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(mymap);
    
};


//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //determine which attribute to visualize with proportional symbols - assign current attribute based on first index of attributes array
   
    var attribute = attributes[0];
      
    
    //create marker options
     var options = {
                fillColor: "#D11117",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
    //for each feature, determine its value for the seleccted attribute
    var attValue = Number(feature.properties[attribute]);
    
    //attribute check
    //console.log(feature.properties, attValue)
                          
    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);
    
    //create circle marker layer
    var layer = L.circleMarker(latlng, options);
    
    //build popup content string
    var popupContent = "<p><b>Capital City:</b> " + feature.properties.City + "</p><p><b> Proportion of women in national parliament in " + attribute + ":</b> " + feature.properties[attribute]+ "%</p>";
    
           
    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius)
    });
    
    return layer;
    
    //event listeners to open popup on hover and fill panel on click
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            $("#panel").html(panelContent);
            
        }
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
}


function createSequenceControls(mymap, attributes){
    
       
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    
    //set slider attributes
    $('.range-slider').attr({
        max: 8,
        min: 0,
        value: 0,
        step: 1,
       
    });
    
    //add skip buttons
    $('#panel').append('<button class="skip" id="reverse"><<</button>');
    $('#panel').append('<button class="skip" id="forward">>></button>');
    
    //replace button content with images -- come back to try this again from Example 3.6
    //$('#forward').html('<img src="js\images\noun_forward_25px.png')
    

    
    //click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 8 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 8 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index);
        
        //Step 9: pass new attribute to update symbols
        updatePropSymbols(mymap, attributes[index]);
        });

    //input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();
        console.log(index);
        
        //Step 9: pass new attribute to update symbols
        updatePropSymbols(mymap, attributes[index]);
    });
    
}



//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(mymap, attribute){
    
    mymap.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //update the layer style and popup
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
            
            
            
            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.City + "</p>";

            //var popupContent = "<p><b>Capital City:</b> " + feature.properties.City + "</p><p><b> Proportion of women in //national parliament in " + attribute + ":</b> " + feature.properties[attribute]+ "%</p>";
            
            //add formatted attribute to panel content string
            
            popupContent += "<p><b>Proportion of women in national parliament in " + attribute + ":</b> " + props[attribute] + "%</p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        };
    });
};
  

