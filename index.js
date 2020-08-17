const express = require('express');
const app = express();
port = ( process.env.PORT!=undefined ? process.env.PORT : 8081 );
const server = app.listen(port);
const io = require('socket.io').listen(server);
const bcrypt = require('bcrypt');
const MysqlController=require('./controllers/dbController');
const UserController=require('./controllers/userController');
let acceptors=io.of('/acceptor');
let donors=io.of('/donor');
let stations=io.of('/station');
let userController;
let mysql=new  MysqlController(()=>userController=new UserController(donors,mysql,stations));
app.use('/public', express.static('public'));
app.get('/',(req,res)=>{
  res.sendFile(__dirname+'/public/views/main.html');
});
app.get('/station',(req,res)=>{
  res.sendFile(__dirname+'/public/views/station.html');
});
app.get('/donor', (req,res)=>{
  res.sendFile(__dirname+"/public/views/donor.html");
});
function refreshDonations(email,socket,io)
{
  mysql.connection.query('SELECT donation.ID,town.name,station.address,donation.quantity,donation.donationDate,donation.approved from donation,town,station,donor where donor.ID=donation.donorID and donation.stationID=station.ID and town.ID=station.townID and email=?',email,(error,result)=>{
    io.to(socket).emit('userDonations',result);
  });
}
donors.on('connect',socket=>{
  if(userController!=undefined && userController.authenticate(socket.handshake.query.token,socket.id,userController.users)){
    donors.to(socket.id).emit('loginOk',socket.handshake.query.token);
  }
  else{
    donors.to(socket.id).emit('loginError',null);
  }
  socket.on('login',(data)=>{
    userController.login(data.email,data.password,socket.id);
  });
  socket.on('register',data=>{
    userController.register(data.email,data.password,data.phoneNumber,data.name,data.surname,socket.id);
  });
  socket.on('disconnect',()=>{
    if(userController!=undefined)
    userController.socketClosed(socket);
  });
  socket.on('getUserDonations',token=>{
    if(userController.authenticate(token,socket.id,userController.users))
    {
      let email=userController.returnUserByToken(token,userController.users).email;
     refreshDonations(email,socket.id,donors);
    }
    else
    {
     donors.to(socket.id).emit('failedAuthentication');
    }
  });
  socket.on('getTowns',token=>{
    if(userController.authenticate(token,socket.id,userController.users))
    {
      mysql.connection.query('SELECT * from town',(error,result)=>{
        donors.to(socket.id).emit('towns',result);
      });
    } else
    {
     donors.to(socket.id).emit('failedAuthentication');
    }
  });
  socket.on('getStations',data=>{
    if(userController.authenticate(data.token,socket.id,userController.users))
    {
      mysql.connection.query('SELECT station.ID as ID,mealCount,maxMeal,waitingCount,address from station,(SELECT SUM(quantity) as waitingCount,stationID from donation where approved is null GROUP BY stationID) as waitingTable where waitingTable.stationID=station.ID and townID=?',data.town,(error,result)=>{
        donors.emit('stations',result);
      });
    }  else
    {
     donors.to(socket.id).emit('failedAuthentication');
    }
  });
  socket.on('donate',data=>{
    if(userController.authenticate(data.token,socket.id,userController.users))
    {
      let email=userController.returnUserByToken(data.token,userController.users).email;
      mysql.connection.query('INSERT INTO donation VALUES(default,?,(SELECT ID from donor where email=?),?,default,default,default)',[data.station,email,data.quantity],(error,result)=>{
        if(error)
          console.log(error);
        refreshDonations(email,socket.id,donors);
      });
    
    }  else
    {
     donors.to(socket.id).emit('failedAuthentication');
    }
  });
  socket.on('logout',(token)=>{
    userController.logout(token);
  });
});
acceptors.on('connect',socket=>{
  if(mysql)
  mysql.connection.query("SELECT * from town",(error,result)=>{
    acceptors.to(socket.id).emit("towns",result);
  });
  socket.on('getStations',(townID)=>{
    mysql.connection.query('SELECT mealCount,latitude,longitude,address from station where townID=?',townID,(error,result)=>{
      acceptors.to(socket.id).emit('stations',result);
    });
  })
});

stations.on('connect',socket=>{
  if(userController.authenticate(socket.handshake.query.token,socket.id,userController.stations)){
    stationsIO.to(socket.id).emit('loginOk',socket.handshake.query.token);
  }
  socket.on('login',(data)=>{
    userController.login(data.ID,data.password,socket.id);
  });
  socket.on('getUserDonations',token=>{
    if(userController.authenticate(token,socket.id,userController.stations))
    {
      let ID=userController.returnUserByToken(token,userController.stations).email;
     refreshDonations(ID,socket.id,stations);
    }
    else
    {
     stations.to(socket.id).emit('failedAuthentication');
    }
  });
  socket.on('approve',data=>{
    
  });
});

