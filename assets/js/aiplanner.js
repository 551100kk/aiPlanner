(function (){
    var arr = [];
    var requestCount;
    var placeKey = "AIzaSyBQPuHcHXYSEMm_gNcmDM_7JmVQfiSp10A";
    var distKey = "AIzaSyAy4-q9b3nQa1iuJtYjAsQxDL1I22HM0_A";
    var center;

    var maxUtl;
    var routeCount;
    var ST = 8 * 60 + 0;
    var ET = 16 * 60 + 0;
    var pset = [];
    var order = [];
    var dist = [];

    function intToTime(time) {
        var hr = Math.floor(time / 60);
        var min = time % 60;
        var res = hr.toString() + ":" + min.toString();
        if (min == 0) res += "0";
        return res;
    }

    function timeToInt(time) {
        var hr = Math.floor(time / 100);
        var min = time % 100;
        return hr * 60 + min;
    }

    function createTdNode(text) {
        var tdNode = document.createElement("td");
        var textNode = document.createTextNode(text); 
        tdNode.appendChild(textNode);  
        return tdNode;
    }

    function routeEnd() {
        console.log("enddddddddddddd");
        console.log(maxUtl);
        console.log(pset);
        console.log(order);
        console.log(dist);
        $("#rating")[0].innerText = "(Rating: " + maxUtl.toString() + ")";
        var table = document.getElementById('schedule');

        now = ST + 10;
        for (var i = 0; i < order.length; i++) {
            var place = arr[pset[order[i]]].name;
            var rate = arr[pset[order[i]]].rating;;
            var staytime = Math.floor(Math.random() * 3) * 10 + 70;
            var disText = dist[i].distance.text;
            var timeVal = Math.floor((parseInt(dist[i].duration.value) + 59) / 60);
            while (timeVal % 5) timeVal ++;

            var trnode = document.createElement("tr");
            trnode.appendChild(createTdNode((i*2).toString()));
            trnode.appendChild(createTdNode(intToTime(now) + " ~ " + intToTime(now + timeVal)));
            trnode.appendChild(createTdNode("On the way to " + place));
            trnode.appendChild(createTdNode(disText)); 
            table.appendChild(trnode);
            now += timeVal;

            trnode = document.createElement("tr");
            trnode.appendChild(createTdNode((i*2+1).toString()));
            trnode.appendChild(createTdNode(intToTime(now) + " ~ " + intToTime(Math.min(now + staytime, ET))));
            trnode.appendChild(createTdNode(place));
            trnode.appendChild(createTdNode(rate)); 
            table.appendChild(trnode);
            now += staytime;
        }
        $('#panel-parent-2').show();
        $('#reset').show();
    }

    function generateRoute () {
        var cnt = Math.floor((ET - ST) / 85);
        var waypt = [];
        for (var i = 0; i < cnt; i++) {
            var pt = Math.floor(Math.random() * arr.length);
            var flag = 0;
            for (var j = 0; j < i; j++) {
                if (pt == waypt[j]) {
                    flag = 1;
                }
            }
            if (flag) {
                i--;
                continue;
            }
            waypt.push(pt);
        } 
        var waystr = "optimize:true";
        var point = 0;
        for (var i = 0; i < cnt; i++) {
            waystr += "|";
            waystr += arr[waypt[i]].formatted_address;
            if (arr[waypt[i]].rating) point += arr[waypt[i]].rating;
        }

        console.log(waypt);
        console.log(waystr);
        console.log(point);

        $.ajax({
            url: "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/directions/json",
            data: {
                origin: center,
                destination: center,    
                waypoints: waystr,
                key: distKey,
                format: "json"
            },
         
            // Work with the response
            success: function( response ) {
                console.log(response);
                if (point > maxUtl) {
                    maxUtl = point;
                    console.log(response.routes);
                    pset = waypt;
                    order = response.routes[0].waypoint_order;
                    dist = response.routes[0].legs;

                }

                if (--routeCount == 0) {
                    routeEnd();
                }
            }
        });
    }

    function searchEnd() {
        $('#loading').hide();
        $('#panel-parent').show();
        console.log(arr);

        maxUtl = 0;
        routeCount = 4;
        for (var i = 0; i < routeCount; i++)
            generateRoute();

        
    }

    function searchRestaurant(latlon) {
        $.ajax({
            url: "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json",
            data: {
                location: latlon.lat.toString() + ',' + latlon.lng.toString(),
                type: "restaurant",    
                radius: "1000",
                key: placeKey,
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
                key: placeKey,
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
                key: placeKey,
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
                center = target.formatted_address;

                requestCount = 4;
                searchRestaurant(target.geometry.location);
                searchType(target.geometry.location, "park");
                searchType(target.geometry.location, "book_store");
                searchType(target.geometry.location, "museum");
            }
        });
    }


    $('#abouts').hide();
    $('.search').bind('click', function (){
        ST = timeToInt(parseInt($("#start_time")[0].value.replace(":", "")));
        ET = timeToInt(parseInt($("#end_time")[0].value.replace(":", "")));
        $('#reset').hide();
        $('#panel-parent').hide();
        $('#panel-parent-2').hide();
        $('#abouts').show();
        $('#loading').show();
        document.getElementById('restaurant').innerHTML = "";
        document.getElementById('park').innerHTML = "";
        document.getElementById('book_store').innerHTML = "";
        document.getElementById('museum').innerHTML = "";
        document.getElementById('schedule').innerHTML = "";

        $('html, body').animate({
            scrollTop: $("#abouts").offset().top - 80
        }, 1000);
        var place = $('#place').val();
        searchPlace(place);
    });
})();
