(function (){
    var arr = [];
    var requestCount;

    function searchEnd() {
        $('#loading').hide();
        $('#panel-parent').show();
        console.log(arr);
    }

    function createTdNode(text) {
        var tdNode = document.createElement("td");
        var textNode = document.createTextNode(text); 
        tdNode.appendChild(textNode);  
        return tdNode;
    }

    function searchRestaurant(latlon) {
        $.ajax({
            url: "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json",
            data: {
                location: latlon.lat.toString() + ',' + latlon.lng.toString(),
                type: "restaurant",    
                radius: "1000",
                key: "AIzaSyBTOn2DhmidT0bNa9c26r-a4sn7zwHVsMc",
                format: "json"
            },
         
            // Work with the response
            success: function( response ) {
                var result = response.results;
                var table = document.getElementById('restaurant');

                for (var i = 0; i < result.length; i++) {
                    var target = result[i];
                    arr.push(target);

                    var name = target.name;
                    var addr = target.formatted_address;
                    var rating = target.rating;

                    var trnode = document.createElement("tr");
                    trnode.appendChild(createTdNode(i.toString()));
                    trnode.appendChild(createTdNode(name));
                    trnode.appendChild(createTdNode(rating)); 
                    trnode.appendChild(createTdNode(addr));  

                    table.appendChild(trnode);
                }
                if (--requestCount == 0) searchEnd();
            }
        });
    }

    function searchType(latlon, placetype) {
        $.ajax({
            url: "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json",
            data: {
                location: latlon.lat.toString() + ',' + latlon.lng.toString(),
                type: placetype,    
                rankby: "distance",
                key: "AIzaSyBTOn2DhmidT0bNa9c26r-a4sn7zwHVsMc",
                format: "json"
            },
         
            // Work with the response
            success: function( response ) {
                var result = response.results;
                var table = document.getElementById(placetype);

                for (var i = 0; i < result.length; i++) {
                    var target = result[i];
                    arr.push(target);

                    var name = target.name;
                    var addr = target.formatted_address;
                    var rating = target.rating;

                    var trnode = document.createElement("tr");
                    trnode.appendChild(createTdNode(i.toString()));
                    trnode.appendChild(createTdNode(name));
                    trnode.appendChild(createTdNode(rating)); 
                    trnode.appendChild(createTdNode(addr));  

                    table.appendChild(trnode);
                }
                if (--requestCount == 0) searchEnd();
            }
        });
    }


    function searchPlace(place) {
        $.ajax({
            url: "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json",
            data: {
                query: place,
                key: "AIzaSyBTOn2DhmidT0bNa9c26r-a4sn7zwHVsMc",
                format: "json"
            },
         
            // Work with the response
            success: function( response ) {
                var result = response.results;
                if (result.length == 0) {
                    alert("Can not find the place.");
                    searchEnd();
                    return;
                }
                var target = result[0];
                $('#placeTitle')[0].innerText = "# Place: " + target.name;
                $('#placeAddr')[0].innerText = "# Address: " + target.formatted_address;

                requestCount = 4;
                searchRestaurant(target.geometry.location);
                searchType(target.geometry.location, "park");
                searchType(target.geometry.location, "book_store");
                searchType(target.geometry.location, "museum");
            }
        });
    }

    $('#abouts').hide();
    $('#search').bind('click', function (){
        $('#panel-parent').hide();
        $('#abouts').show();
        $('#loading').show();
        document.getElementById('restaurant').innerHTML = "";

        $('html, body').animate({
            scrollTop: $("#abouts").offset().top - 80
        }, 1000);
        var place = $('#place').val();
        searchPlace(place);
    });
})();
