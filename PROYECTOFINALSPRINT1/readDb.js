const fs = require('fs');
const path = require('path');

const pathDb = path.join(__dirname,'./db.json')

const readDb = ()=>{
    const data =  fs.readFileSync(pathDb,'utf-8');
   return JSON.parse(data);
}
data = readDb();

module.exports =data;
