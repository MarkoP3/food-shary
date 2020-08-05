const mysql=require('mysql');
const fs=require('fs');
function  MysqlController(done)
{
     fs.readFile('./config/dbConfig.json','utf-8',async (error,data)=>{
        if(error)
        throw error;
        dbConfig=JSON.parse(data)[1];
        this.pool=await mysql.createPool(dbConfig);
        this.pool.getConnection((error,connection)=>{
            this.connection=connection;
            done();
        });
       
      }); 
}
module.exports=MysqlController;