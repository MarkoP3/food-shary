function User(socket,email,token)
{
    this.token=token
    this.sockets=[socket];
    this.email=email;
}
module.exports=User;