var native_map;

function main() {

    // Get url parameters
    var params = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        params[key] = value;
    });

    if (params.layers) {
        var activeLayers = params.layers.split(',').map(function(item) { // map function not supported in IE < 9
            return layers[item];
        });
    }
    params.interaction = params.interaction == "false" ? false : true;
    params.scrollWheelZoom = params.scrollWheelZoom == "false" || !params.interaction ? false : true;

    if(params.place) {
        if(params.place == "europe") {
            params.lat = 48;
            params.lng = 14;
            params.zoom = 5;
        } else if(params.place == "south-america") {
            params.lat = -3;
            params.lng = -49;
            params.zoom = 4;
        } else if(params.place == "balkans") {
            params.lat = 43;
            params.lng = 19;
            params.zoom = 6;
       }
    }
    var travel_url = 'http://elusivetruth.cartodb.com/api/v2/viz/d8b9da38-0a4d-11e3-8c39-3085a9a956e8/viz.json';
    var route_url = 'http://elusivetruth.cartodb.com/api/v2/viz/fe3bc0aa-10e1-11e4-87db-0edbca4b5057/viz.json';

    var vis_url = travel_url;
    if(params.route) {
       vis_url = route_url;
    }

    var options = {
        center: [params.lat || 20, params.lng || 0],
        zoom: params.zoom || 3,
        zoomControl: false,
        loaderControl: false,
        infowindow: true,
        shareable: false,
        title: false,
        searchControl: false
    };

        cartodb.createVis('map', vis_url, options).done(function(vis, layers) {
        var isMobile = window.innerWidth <= 480 ? true : false;
        native_map = vis.getNativeMap();
        if(!params.interaction || isMobile) {
            native_map.dragging.disable();
            native_map.touchZoom.disable();
            native_map.doubleClickZoom.disable();
            native_map.scrollWheelZoom.disable();
            native_map.boxZoom.disable();
            native_map.keyboard.disable();
        } else if(params.scrollWheelZoom) {
            native_map.scrollWheelZoom.disable();
        }
        L.control.pan({position:'topleft'}).addTo(native_map);
        L.control.zoom({position:'topleft'}).addTo(native_map);
        // there are two layers, base layer and points layer
        var route_layer = layers[1].getSubLayer(0);
        var point_layer = layers[1].getSubLayer(1);
        route_layer.setInteraction(true);
        route_layer.infowindow.set('template', $('#infowindow_template').html());
        route_layer.set({
            sql: 'select  *, ST_AsGeoJSON(the_geom) as geometry from journey',
            interactivity: 'cartodb_id,geometry,name,description'
        });

        // add the tooltip show when hover on the point
        vis.addOverlay({
            type: 'tooltip',
            template: '<p>{{name}}</p>'
            //template: '<div class="cartodb-popup"><div class="cartodb-popup-content-wrapper"><div class="custom-popup-content">{{#img}}<ul><li><img src="{{img}}"/><h4>{{name}}</h4></li></ul>{{/img}}{{^img}}<ul><li><img src="img/background.png"/><h4>{{name}}</h4></li></ul>{{/img}}<p>{{{description}}}</p></div></div><div class="custom-popup-tip-container"></div></div>'
        });

        // HACK - manually add overlay to attach it to your route layer
        // re: https://github.com/CartoDB/cartodb.js/issues/64

       /*
        vis.addOverlay({
            type: 'infobox',
            template: '<h3>{{name}}</h3><p>{{{description}}}</p>',
            width: 200,
            position: 'top|right'
        });
       */
        //vis.getOverlay('infobox').enable();

        var infobox = new cdb.geo.ui.InfoBox({ template: '<h3>{{name}}</h3><p>{{{description}}}</p>', layer: route_layer, position: 'top|right', width: 200 });
        vis.container.append(infobox.render().el);
        infobox.show();
        infobox.hide();

        route_layer.on('featureOver', function(e, pos, latlng, data) {
            if (data.cartodb_id != polyline.cartodb_id) {
                drawHoverLine(data);
            }
        });
        route_layer.on('featureOut', function(e, pos, latlng, data) {
            removeLine();
        });
        route_layer.on('featureClick', function(e, pos, latlng, data) {
            // no-op
        });

        point_layer.setInteraction(true);
        point_layer.infowindow.set('template', $('#infowindow_template').html());
        point_layer.set({
            interactivity: 'cartodb_id,name,description,read_more,img'
        });
        point_layer.on('featureOver', function(e, pos, latlng, data) {
            $('.leaflet-container').css('cursor', 'pointer');
        });
        point_layer.on('featureOut', function(e, pos, latlng, data) {
            $('.leaflet-container').css('cursor', 'default');
        });
        point_layer.on('featureClick', function(e, pos, latlng, data) {
            // no-op
        });
    });
}

var polyline = new L.GeoJSON(null);
// Hover polyline style
var polyline_style = {
    color: "#ffffff",
    weight: 5,
    opacity: 0.8,
    fillOpacity: 0,
    clickable: false
};

function drawHoverLine(data) {
    removeLine();

    polyline = new L.GeoJSON(JSON.parse(data.geometry), {
        style: function(feature) {
            return polyline_style;
        }
    }).addTo(native_map);

}

function removeLine() {
    native_map.removeLayer(polyline);
    polyline.cartodb_id = null;
}

window.onload = main;
