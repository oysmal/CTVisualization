var fs = require('fs');

// Synchronous read
var data = fs.readFileSync('hand.dat');
var x = data.readUIntBE(0,1);
var y = data.readUIntBE(2,1);
var z = data.readUIntBE(3,1);
console.log("values: " + x+" "+y+" " +z);

console.log("Program Ended");