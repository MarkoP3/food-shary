let socket=io.connect('/donor?token='+localStorage.getItem('token'));
function login(){
    socket.emit('login',{email:document.getElementById('email').value,password:document.getElementById('password').value});
}
function register(){
    socket.emit('register',{email:document.getElementById('emailR').value,password:document.getElementById('passwordR').value,phoneNumber:document.getElementById('phoneNumberR').value,name:document.getElementById('nameR').value,surname:document.getElementById('surnameR').value});
}
function donate(){
    if(document.getElementById('stations').selectedIndex!=-1)
    {
    socket.emit('donate',{token:localStorage.getItem('token'),station:document.getElementById('stations').options[document.getElementById('stations').selectedIndex].id,quantity:document.getElementById('quantity').value});
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
alert(error.message);
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
        option.id=station.ID;
        option.value=station.maxMeal-station.mealCount-station.waitingCount;
        stations.add(option);
    });
    setMaxValue();
});
socket.on('failedAuthentication',()=>{
    alert('You need to login to peform this action!');
});

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
    if(document.getElementById('stations').selectedIndex!=-1)
    {
        document.getElementById('quantity').setAttribute('max',document.getElementById('stations').options[document.getElementById('stations').selectedIndex].value);
        document.getElementById('quantity').disabled=false;
    }else
    {
        document.getElementById('quantity').disabled=true;}
}
function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position=>{
        console.log(position);
        // document.getElementById('map').innerHTML=`<img src="https://maps.googleapis.com/maps/api/staticmap?center=${position.coords.latitude},${position.coords.longitude}&zoom=14&size=400x300&sensor=false&key=AIzaSyDc7V74brKLCIzQd1ELBRj1iITl1bFcC1A">`
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
  })