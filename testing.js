var fs = require('fs');

// // Synchronous read
var data = fs.readFileSync('hand.dat','hex');

var byteStringX = data.substr(0, 2);
var byteStringY = data.substr(4, 2);
var byteStringZ = data.substr(8,4);
var x= parseInt("0x" + byteStringX);
var y= parseInt("0x" + byteStringY);
var z= parseInt("0xce03");
console.log("values: "+byteStringX+": "+x+" "+byteStringY+": "+y+" "+byteStringZ+": "+z);
// var i,j;
// var results= new Array(z);
// for(i=0;i<x;i++){
// 	for(j=0;j<y;j++){
// //add results to array
// 	}
// }

console.log("Program Ended");