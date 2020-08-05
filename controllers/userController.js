const bcrypt = require('bcrypt');
const User= require('../models/User');
const Station=require('../models/Station');
function UserController(donors,mysql,stations){
    this.mysql=mysql;
    this.users=[];
    this.stations=[];
    this.donors=donors;
    this.stationsIO=stations;
    function checkToken(token,users){
        return users.includes(users.find(user=>user.token==token));
    }
    function checkEmail(email,users)
    {
        return users.includes(users.find(user=>user.email==email));
    }
    this.returnUserByToken=function returnUserByToken(token,users)
    {
        return users.find(user=>user.token==token);
    }
    function returnUserByEmail(email,users)
    {
        return users.find(user=> user.email==email);
    }
    this.authenticate=(token,socket,users)=>{
        let verified=checkToken(token,users);
        if(verified && !(this.returnUserByToken(token,users).sockets.includes(socket)))
        this.returnUserByToken(token,users).sockets.push(socket);
        return verified;
    }
    this.loginStation=(ID,password,socket)=>{
        this.mysql.connection.query("SELECT ID,password from station where ID=?",ID,async (error,data)=>{
            let user=JSON.parse(JSON.stringify(data))[0];
                if (user == null) {
                    stationsIO.to(socket).emit('loginError', {message:"No user with this email address"});
                }
                else if (await bcrypt.compare(password, user.password)) {
                  if(!checkEmail(ID,this.stations))
                  {
                      let token=await bcrypt.genSalt();
                    this.stations.push(new User(socket,ID,token));
                    stationsIO.to(socket).emit('loginOk',token);
                  }
                  else if(!returnUserByEmail(ID,this.stations).sockets.includes(socket))
                  {
                      returnUserByEmail(ID,this.stations).sockets.push(socket);
                  }
                } else {
                    stationsIO.to(socket).emit('loginError',{message:"Password incorrect"});
                }
              });

    }
    this.login=(email,password,socket)=>{
        this.mysql.connection.query("SELECT ID,name,surname,phoneNumber,email,password from donor where email=?",email,async (error,data)=>{
            let user=JSON.parse(JSON.stringify(data))[0];
                if (user == null) {
                    donors.to(socket).emit('loginError', {message:"No user with this email address"});
                }
                else if (await bcrypt.compare(password, user.password)) {
                  if(!checkEmail(email,this.users))
                  {
                      let token=await bcrypt.genSalt();
                    this.users.push(new User(socket,email,token));
                    donors.to(socket).emit('loginOk',token);
                  }
                  else if(!returnUserByEmail(email,this.users).sockets.includes(socket))
                  {
                      returnUserByEmail(email,this.users).sockets.push(socket);
                  }
                } else {
                    donors.to(socket).emit('loginError',{message:"Password incorrect"});
                }
              });

    };
    this.register=async(email,password,phoneNumber,name,surname,socket)=>{
        mysql.connection.query("INSERT INTO donor VALUES(default,?,?,?,?,?)",[name,surname,email,phoneNumber,await bcrypt.hash(password,10)],(err,result)=>{
            if(err)
            {
                donors.to(socket).emit('registerError',err);
            }
            else
                donors.to(socket).emit('registerOk');
        });
    };
    this.logout=async(token)=>{
        if(checkToken(token,this.users))
            {
                this.returnUserByToken(token,this.users).sockets.forEach(socket=> donors.to(socket).emit('logout'));
                users.splice(users.indexOf(this.returnUserByToken(token,this.users)),1);
            }
    }
    this.logoutStation=async(token)=>{
        if(checkToken(token,this.stations))
            {
                this.returnUserByToken(token,this.stations).sockets.forEach(socket=> stationsIO.to(socket).emit('logout'));
                stations.splice(stations.indexOf(this.returnUserByToken(token,this.stations)),1);
            }
    }
    this.socketClosed=(socket)=>{
       if(this.users.find(user=>user.sockets.includes(socket.id))){
        (this.users.find(user=>user.sockets.includes(socket.id))).sockets.splice(socket.id,1);
       }
    }
}
module.exports=UserController;