let socket;
function initMap(stations) {
    navigator.geolocation.getCurrentPosition((position)=>{
        let userPosition={lat:position.coords.latitude,lng:position.coords.longitude};
        var map = new google.maps.Map(
            document.getElementById('map'), {zoom: 9, center:userPosition });
            new google.maps.Marker({position: userPosition,title:"You are here", map: map,icon:"/public/img/userLocationMarkerIcon.png"});
        stations.forEach(element=>{ 
        new google.maps.Marker({position: {lat:element.latitude,lng:element.longitude},title:element.address, map: map,icon:"/public/img/stationMarkerIcon.png"});
        });
    },()=>{
        var map = new google.maps.Map(
            document.getElementById('map'), {zoom: 9, center:{lat:stations[0].latitude,lng:stations[0].longitude} });
           stations.forEach(element=>{ 
        new google.maps.Marker({position: {lat:element.latitude,lng:element.longitude},title:element.address, map: map,icon:"/public/img/stationMarkerIcon.png"});
        });
    });
   
  }
function connectUser()
{
    socket=io.connect('/acceptor');
    document.getElementById('userSelection').style.display='none';
    socket.on('towns',(data)=>{
        data.forEach(element => {
            let newElement=document.createElement('option');
            newElement.value=element.ID;
            newElement.text=element.name;
            document.getElementById('townSelect').add(newElement);
            
        });
        socket.emit('getStations',data[0].ID);
    });
    socket.on('stations',(data)=>{
        initMap(data)
    });
}

