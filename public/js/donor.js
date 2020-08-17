let socket=io.connect('/donor?token='+localStorage.getItem('token'));
let userPosition={};
function login(){
    socket.emit('login',{email:document.getElementById('email').value,password:document.getElementById('password').value});
    document.getElementById('email').value=''; document.getElementById('password').value='';
}
function register(){
    socket.emit('register',{email:document.getElementById('emailR').value,password:document.getElementById('passwordR').value,phoneNumber:document.getElementById('phoneNumberR').value,name:document.getElementById('nameR').value,surname:document.getElementById('surnameR').value});
}
function donate(){
    if(document.getElementById('stations').selectedIndex!=-1)
    {
        socket.emit('donate',{token:localStorage.getItem('token'),station:JSON.parse(document.getElementById('stations').options[document.getElementById('stations').selectedIndex].value).ID,quantity:document.getElementById('quantity').value});
        getStations();
    }
}
socket.on('loginOk',(token)=>{
    localStorage.setItem('token',token);
    socket.emit('getUserDonations',token);
    socket.emit('getTowns',token);
    openScreen('donationSection');
    getLocation();
   
});
socket.on('loginError',error=>{
    openScreen('loginForm');
    if(error)alert(error.message);
});
socket.on('userDonations',data=>{
    let table=document.getElementById('donationsTable');
    let rows='';
    data.forEach(({ID,name,address,donationDate,quantity,approved})=>{
        donationDate=new Date(donationDate);
        rows+=`
        <tr data-toggle='modal' data-target='#donationInfo' data-town='${name}' data-address='${address}' data-date='${donationDate.toLocaleDateString()}' data-quantity='${quantity}' data-approved='${(approved==null?'Waiting approval':(approved==1?'Approved':'Declined'))}'>
            <th scope='row'>${ID}</th>
            <td>${name}</td>
             <td>${quantity}</td>
            <td><img src='public/img/${(approved==null?'waiting':(approved==1?'approved':'declined'))}.svg' width='20px'></td>
        </tr>
        `;
    });
    table.innerHTML=rows;
});
socket.on('towns',(data)=>{
    let towns=document.getElementById('cities');
    towns.length=0;
    data.forEach(town=>{
        let option=document.createElement('option');
        option.text=town.name
        option.value=town.ID;
        towns.add(option)
    });
    getStations();
});
socket.on('stations',data=>{
    let stations=document.getElementById('stations');
    stations.length=0;
    data.forEach(station=>{
        let option=document.createElement('option');
        option.text=station.address;
        option.value=JSON.stringify(station);
        stations.add(option);
    });
    setMaxValue();
});
socket.on('failedAuthentication',()=>{
    alert('You need to login to peform this action!');
});
socket.on('logout',()=>{
    openScreen('loginForm');
    clearData();
});
socket.on('registerOk',()=>{
    openScreen('loginForm');
    document.getElementById('nameR').value='';
    document.getElementById('surnameR').value='';
    document.getElementById('emailR').value='';
    document.getElementById('phoneNumberR').value='';
    document.getElementById('passwordR').value='';
});
function logout()
{
    socket.emit('logout',localStorage.getItem('token'));
}
function openScreen(screen){
    Array.prototype.slice.call(document.getElementsByTagName('section')).forEach(element => {
        if(element.id!=screen)
            element.style.display="none";
        else
            element.style.display="flex";
    });;
}

function getStations()
{
    let townID=document.getElementById('cities').options[document.getElementById('cities').selectedIndex].value;
    socket.emit('getStations',{token:localStorage.getItem('token'),town:townID});
}
function setMaxValue()
{
    let selectedItem=JSON.parse(document.getElementById('stations').options[document.getElementById('stations').selectedIndex].value);
    if(selectedItem.maxMeal-selectedItem.mealCount-selectedItem.waitingCount!=0)
    {
        document.getElementById('quantity').setAttribute('max',selectedItem.maxMeal-selectedItem.mealCount-selectedItem.waitingCount);
        document.getElementById('donateBtn').disabled=false;
    }else
    {
        document.getElementById('donateBtn').disabled=true;}
        initMap({lat:selectedItem.latitude,lng:selectedItem.longitude});
}
function initMap(station)
{
    var map = new google.maps.Map(
        document.getElementById('map'), {zoom: 11, center:station });
        new google.maps.Marker({position:station, map: map,icon:"/public/img/stationMarkerIcon.png"});
        if(userPosition.lat && userPosition.lng)
        new google.maps.Marker({position: userPosition,title:"You are here", map: map,icon:"/public/img/userLocationMarkerIcon.png"});
     
    
}
function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position=>{
        userPosition.lat=position.coords.latitude;
        userPosition.lng=position.coords.longitude;
    });
    }
  }  

$('#donationInfo').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    $(this).find('.modal-body #town').text(button.data('town'));
    $(this).find('.modal-body #address').text(button.data('address'));
    $(this).find('.modal-body #date').text(button.data('date'));
    $(this).find('.modal-body #quantity').text(button.data('quantity'));
    $(this).find('.modal-body #approved').text(button.data('approved'));
  });
  function clearData()
  {
      document.getElementById('donationsTable').innerHTML='';
      document.getElementById('cities').innerHTML='';
      document.getElementById('stations').innerHTML='';
  }