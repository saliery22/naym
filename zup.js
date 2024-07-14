
var TOKEN1= '195361be632a84edad04de93800fee7bA39A4965F92DCB97BFFF938BC5A0415C99DF3CCC';
var TOKEN2= 'c6184e20008c73bc1d895a69e2aa4f288674519D6EEE0DCC1057B81F7409B26008F22F86';
var TOKEN3= '4dc3b0204971684d74650010bced5b6a8EB692F1698D3BCF61FA360AA6812AD35EE82E7C';

// global variables
var map, marker,unitslist = [],allunits = [],rest_units = [],marshruts = [],zup = [], unitMarkers = [], markerByUnit = {},tile_layer, layers = {},marshrutMarkers = [],unitsID = {},Vibranaya_zona;
var areUnitsLoaded = false;
var marshrutID=99;
var cklikkk=0;
var markerstart =0;
var markerend =0;
var rux=0;



// for refreshing
var currentPos = null, currentUnit = null;

var isUIActive = true;

var cur_day111 = new Date();
var month = cur_day111.getMonth()+1;   
var from111 = cur_day111.getFullYear() + '-' + (month < 10 ? '0' : '') + month + '-' + cur_day111.getDate()+ ' 06:00';
var from222 = cur_day111.getFullYear() + '-' + (month < 10 ? '0' : '') + month + '-' + cur_day111.getDate()+ ' ' + cur_day111.getHours()+ ':' + cur_day111.getMinutes();


$('#fromtime1').val(from111);
$('#fromtime2').val(from222);






// Unit markers constructor
function getUnitMarker(unit) {
  // check for already created marker
  var marker = markerByUnit[unit.getId()];
  if (marker) return marker;
    
  var unitPos = unit.getPosition();
  var imsaze = 22;
  if (!unitPos) return null;
    
  if(unit.getName().indexOf('Нива')>0 || unit.getName().indexOf('Газель')>0 || unit.getName().indexOf('Лада')>0 || unit.getName().indexOf('Lanos')>0 || unit.getName().indexOf('Дастер')>0 || unit.getName().indexOf('Stepway')>0 || unit.getName().indexOf('ВАЗ')>0 || unit.getName().indexOf('ФОРД')>0 || unit.getName().indexOf('Toyota')>0 || unit.getName().indexOf('Рено')>0 || unit.getName().indexOf('TOYOTA')>0 || unit.getName().indexOf('Skoda')>0|| unit.getName().indexOf('ЗАЗ ')>0){imsaze = 18;}
  if(unit.getName().indexOf('JD')>0 || unit.getName().indexOf(' CL ')>0|| unit.getName().indexOf(' МТЗ ')>0|| unit.getName().indexOf('CASE')>0 || unit.getName().indexOf(' NH ')>0){imsaze = 24;} 

  marker = L.marker([unitPos.y, unitPos.x], {
    clickable: true,
    draggable: true,
    icon: L.icon({
      iconUrl: unit.getIconUrl(imsaze),
      iconAnchor: [imsaze/2, imsaze/2] // set icon center
    })
  });
  marker.bindPopup('<center><font size="1">' + unit.getName()+'<br />' +wialon.util.DateTime.formatTime(unitPos.t));
  marker.bindTooltip(unit.getName(),{opacity:0.8});
  marker.on('click', function(e) {
  
    // select unit in UI
    $('#units').val(unit.getId());
      
     var pos = e.latlng;
      
    // map.setView([pos.lat, pos.lng],14);
      
     var unitId = unit.getId();

     $("#lis0").chosen().val(unit.getId());
     
    $("#lis0").trigger("chosen:updated");
    //if ($('#option').is(':hidden')) {}else{
     // $('#gektary').hide();
     // $('#inftb').empty();
     // $('#obrobka').empty();
     // $("#inftb").append("<tr><td>"+unit.getName()+"</td></tr><tr><td>"+wialon.util.DateTime.formatTime(unitPos.t)+"</td></tr><tr><td>"+unit.getPosition().s+" км/год</td></tr>"); 
  
   // }
   navigator.clipboard.writeText(unit.getName());        
   
     show_track();


  });

  // save marker for access from filtering by distance
 
  markerByUnit[unit.getId()] = marker;
  allunits.push(unit);
  unitsID[unit.getName()] = unit.getId();
  return marker;
}



// Print message to log
function msg(text) { $('#log').prepend(text + '<br/>'); }




function init() { // Execute after login succeed
  // get instance of current Session
  var session = wialon.core.Session.getInstance();
  // specify what kind of data should be returned
  var flags = wialon.item.Item.dataFlag.base | wialon.item.Unit.dataFlag.lastPosition;
  var res_flags = wialon.item.Item.dataFlag.base ;
 
	var remote= wialon.core.Remote.getInstance();
  remote.remoteCall('render/set_locale',{"tzOffset":7200,"language":'ru',"formatDate":'%Y-%m-%E %H:%M:%S'});
  session.loadLibrary('itemIcon');
  
        
  session.updateDataFlags( // load items to current session
		[{type: 'type', data: 'avl_resource', flags:res_flags , mode: 0}, // 'avl_resource's specification
		 {type: 'type', data: 'avl_unit', flags: flags, mode: 0}], // 'avl_unit's specification
	function (error) { // updateDataFlags callback     
        
      if (error) {
        // show error, if update data flags was failed
        msg(wialon.core.Errors.getErrorText(error));
      } else {
        areUnitsLoaded = true;
        msg('Техніка завнтажена - успішно');
        
        // add received data to the UI, setup UI events
        initUIData();
      }
    }
  );
}




// will be called after updateDataFlags success
let geozonepoint = [];
let geozones = [];
let geozonesgrup = [];
let IDzonacord=[];
function initUIData() {
  var session = wialon.core.Session.getInstance();

 var requestURL =   "data.geojson";
 var request = new XMLHttpRequest();
 request.open("GET", requestURL);
 request.responseType = "json";
 request.send();

 request.onload = function () {
  var data = request.response;
  for(var i=0; i < data.length; i++){
    let poly = data[i].coordinates;
    let name = data[i].name;
    let color = data[i].color;
    var polygon = L.polygon(poly, {color: '#FF00FF', stroke: true,weight: 1, opacity: 0.4, fillOpacity: 0.3, fillColor: color});
    polygon.bindTooltip(name,{opacity:0.8,sticky:true});
    geozones.push(polygon);
  }
  let lgeozone = L.layerGroup(geozones);
  layerControl.addOverlay(lgeozone, "Геозони");
  };
  
 




  var units = session.getItems('avl_unit');
   
  units.forEach(function(unit) {          
    var unitMarker = getUnitMarker(unit);
    if (unitMarker) unitMarker.addTo(map);
    
   
$('#lis0').append($('<option>').text(unit.getName()).val(unit.getId()));


  
  

var sdsa = unit.getPosition();
if (sdsa){
    unitslist.push(unit);
    unitMarkers.push(unitMarker) ;  
}

  });

  
  
$(".livesearch").chosen({search_contains : true});
 $('#lis0').on('change', function(evt, params) {
   onUnitSelected();
  });







// Unit choosed from <select>
  function onUnitSelected() {  
     
    var unitId = parseInt($("#lis0").chosen().val());
    var popupp = markerByUnit[unitId];
    
    if (unitId === 0) return;
            
    var unit = session.getItem(unitId);
       
    if (!unit) {
      msg('No such unit');
      return;
    }
    
    var unitPos = unit.getPosition();
    
    if (!unitPos) {
      msg('Unit haven\'t a position');
      return;
    }
    
   map.setView(popupp.getLatLng(), 15); 
   popupp.openPopup();
     navigator.clipboard.writeText(unit.getName());
     show_track ();     
  }
  
  // find near unit
 
  $('#eeew').click(function() { UpdateGlobalData(0,7,0);});
  
  
}





var layerControl=0;
function initMap() {
  
  // create a map in the "map" div, set the view to a given place and zoom
  map = L.map('map', {
    // disable zooming, because we will use double-click to set up marker
    doubleClickZoom: false
  }).setView([51.62995, 33.64288], 9);
  
 //L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{ subdomains:['mt0','mt1','mt2','mt3']}).addTo(map);


  // add an OpenStreetMap tile layer


  var basemaps = {
    OSM:L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {}),

    'Google Hybrid':L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{ subdomains:['mt0','mt1','mt2','mt3'],layers: 'OSM-Overlay-WMS,TOPO-WMS'})

};


layerControl=L.control.layers(basemaps).addTo(map);

basemaps.OSM.addTo(map);
  


}




$(document).ready(function () {
  // init session
  $('#figura').click(function() { 
    $('#figura').hide();
    $('#dyacok').hide();
    $('#kash').hide();
    $('#nammmme').text("    ФІГУРА");
  wialon.core.Session.getInstance().initSession("https://hst-api.wialon.com");
  wialon.core.Session.getInstance().loginToken(TOKEN1, "", function (code) { if (code){ msg(wialon.core.Errors.getErrorText(code)); return; }  msg('Зеднання з Фігура - успішно'); initMap(); init(); } );
  });
  $('#dyacok').click(function() { 
    $('#figura').hide();
    $('#dyacok').hide();
    $('#kash').hide();
    $('#nammmme').text("    ДЯЧОК");
  wialon.core.Session.getInstance().initSession("https://ingps.com.ua");
  wialon.core.Session.getInstance().loginToken(TOKEN2, "", function (code) { if (code){ msg(wialon.core.Errors.getErrorText(code)); return; }  msg('Зеднання з Фігура - успішно'); initMap(); init(); } );
  });
  $('#kash').click(function() { 
    $('#figura').hide();
    $('#dyacok').hide();
    $('#kash').hide();
    $('#nammmme').text("    КАШИНА");
  wialon.core.Session.getInstance().initSession("https://ingps.com.ua");
  wialon.core.Session.getInstance().loginToken(TOKEN3, "", function (code) { if (code){ msg(wialon.core.Errors.getErrorText(code)); return; }  msg('Зеднання з Фігура - успішно'); initMap(); init(); } );
  });


  
});




function show_track (time1,time2) {

	var unit_id =  $("#lis0").chosen().val(),
		sess = wialon.core.Session.getInstance(), // get instance of current Session	
		renderer = sess.getRenderer(),
		cur_day = new Date(),	
		unit = sess.getItem(unit_id), // get unit by id
		color = "ff0000"; // track color
    var to,from;
     if(time1 == undefined){
     to = Date.parse($('#fromtime2').val())/1000; // end of day in seconds
     from = Date.parse($('#fromtime1').val())/1000; // get begin time - beginning of day
    }else{
    to = Date.parse(time2)/1000;
    from = Date.parse(time1)/1000;
    }
         
		if (!unit) return; // exit if no unit
		renderer.removeAllLayers(function(code) { 
			if (code) 
				msg(wialon.core.Errors.getErrorText(code)); // exit if error code
			else 
				msg("Track removed."); // else send message, then ok
		});
  
		var pos = unit.getPosition(); 
		if(!pos) return; 
		callback =  qx.lang.Function.bind(function(code, layer) {
			if (code) { msg(wialon.core.Errors.getErrorText(code)); return; } // exit if error code
			if (layer) { 
				if (map) {
					if (!tile_layer)
						tile_layer = L.tileLayer(sess.getBaseUrl() + "/adfurl" + renderer.getVersion() + "/avl_render/{x}_{y}_{z}/"+ sess.getId() +".png", {zoomReverse: true, zoomOffset: -1,zIndex: 3}).addTo(map);
					else 
						tile_layer.setUrl(sess.getBaseUrl() + "/adfurl" + renderer.getVersion() + "/avl_render/{x}_{y}_{z}/"+ sess.getId() +".png");
				}	
			}
	});
	params = {
		"layerName": "route_unit_" + unit_id, // layer name
		"itemId": unit_id, // ID of unit which messages will be requested
		"timeFrom": from, //interval beginning
		"timeTo": to, // interval end
		"tripDetector": 0, //use trip detector: 0 - no, 1 - yes
		"trackColor": color, //track color in ARGB format (A - alpha channel or transparency level)
		"trackWidth": 2, // track line width in pixels
		"arrows": 1, //show course of movement arrows: 0 - no, 1 - yes
		"points": 1, // show points at places where messages were received: 0 - no, 1 - yes
		"pointColor": color, // points color
		"annotations": 0, //show annotations for points: 0 - no, 1 - yes
        "flags": 32
	};
	renderer.createMessagesLayer(params, callback);
}


Global_DATA=[];
function UpdateGlobalData(i=0){
    if(i==0){
     $('#eeew').prop("disabled", true);
       Global_DATA = [];
       cur_day111 = new Date();
       month = cur_day111.getMonth()+1;  
       from222 = cur_day111.getFullYear() + '-' + (month < 10 ? '0' : '') + month + '-' + cur_day111.getDate()+ ' ' + cur_day111.getHours()+ ':' + cur_day111.getMinutes();
       $('#fromtime2').val(from222);
    } 
    if(i < unitslist.length){
        msg(unitslist.length-i);
        loadMessages(i,unitslist[i]);
    } else {
      $('button').prop("disabled", false);
      $('#log').empty();
      msg('Завантажено');
      console.log(Global_DATA);
    }   
}
function loadMessages(i,unitt){ 
	var sess = wialon.core.Session.getInstance(); 
	var to = Date.parse($('#fromtime2').val())/1000; 
	var from = Date.parse($('#fromtime1').val())/1000; 
	let ii=i;
	var unit = unitt.getId(); 
  Global_DATA.push([[unitt.getId(),unitt.getName(),0]])
	var ml = sess.getMessagesLoader(); 
	ml.loadInterval(unit, from, to, 0, 0, 100, 
	    function(code, data){
		    if(code){ msg(wialon.core.Errors.getErrorText(code));  ii++; UpdateGlobalData(ii);return; } 
    		else { showMessages(0,data.count,ii);} 
	    }
    );
}

function showMessages(from, to,ii){ 
	$("#messages").html(""); 
	var ml = wialon.core.Session.getInstance().getMessagesLoader(); 
	ml.getMessages(from, to, 
	    function(code, data){ 
		    if(code){ msg(wialon.core.Errors.getErrorText(code));  ii++; UpdateGlobalData(ii);return; } 
		    else if(data.length == 0){
		        msg("Nothing to show. Load messages first");  ii++; UpdateGlobalData(ii);return;}
	        var from_index = from; 
	        for(var i=0; i<data.length; i++){ 
            if(data[i].pos){
              let xy=data[i].pos.y+','+data[i].pos.x
              Global_DATA[ii].push([xy,data[i].t*1000]);
            }           
            }
            ii++; UpdateGlobalData(ii);
	    }
    );
}




var slider = document.getElementById("myRange");
var output = document.getElementById("f");
output.innerHTML = from222; // 
slider.oninput = function() {
    var interval = Date.parse($('#fromtime1').val())+(Date.parse($('#fromtime2').val())-Date.parse($('#fromtime1').val()))/2000*this.value;
    position(interval);
}

function position(t)  {
  var interval = t;
  var cur_day1111 = new Date(interval);
  var month2 = cur_day1111.getMonth()+1;   
  var from2222 = cur_day1111.getFullYear() + '-' + (month2 < 10 ? '0' : '') + month2 + '-' + cur_day1111.getDate()+ ' ' + cur_day1111.getHours()+ ':' + cur_day1111.getMinutes()+ ':' + cur_day1111.getSeconds();
  output.innerHTML = from2222;
  var x,y,markerrr;
    for(let ii = 0; ii<Global_DATA.length; ii++){
     if(Global_DATA[ii].length<5) continue
     let ind=1;
     markerrr = markerByUnit[Global_DATA[ii][0][0]];
     if (markerrr){
     for(let iii = Global_DATA[ii].length-1; iii>0; iii-=200){
      if(interval>Global_DATA[ii][iii][1]) {ind=iii;break;}
     }
     for(let i = ind; i<Global_DATA[ii].length; i++){
         if(interval<Global_DATA[ii][i][1]){
           if(Global_DATA[ii][i][0]=="")continue;
            y = parseFloat(Global_DATA[ii][i][0].split(',')[0]);
            x = parseFloat(Global_DATA[ii][i][0].split(',')[1]);
            markerrr.setLatLng([y, x]); 
            markerrr.bindPopup('<center><font size="1">'+Global_DATA[ii][0][1]);
            break;
          }
     }
    }
  }
}
    


function clear(){  if(tile_layer) {map.removeLayer(tile_layer); tile_layer=null; layers[0]=0; }}

function track_Monitoring(evt){
 
   $("#lis0").chosen().val(evt.target.parentNode.id);
   $("#lis0").trigger("chosen:updated");
   layers[0]=0;
   show_track();    
 }

