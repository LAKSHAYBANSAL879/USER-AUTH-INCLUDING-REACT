const mongoose=require('mongoose');

const connectDb=async ()=>{
  mongoose.connect(process.env.MONGOS_URL)
  .then((conn)=>{
    console.log(`connected to DB:${conn.connection.host}`);
  }).catch((err)=>{
    console.log(err.message);
    process.exit(1)
  })
}
module.exports=connectDb