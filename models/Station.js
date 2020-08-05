function Station(ID,token,socket)
{
    this.token=token;
    this.sockets=[socket];
    this.ID=ID;
}