import context from '../Context/context.es6';
import {getFiles} from '../FileList/fileList.es6';


export default function(){

  let props = context();
  let filenames=getFiles();
  //var filenames=["hand","boo"];
  filenames.forEach(function(entry){
    $('#namesHist').append('<option value="'+entry+'">'+entry+'</option>'); //build dropdownmenu
  });
  $( "#namesHist" ).click(function() { //when one is clickedon
    var selected = $('#namesHist').val();
    console.log(selected.length);
    if(selected.length == 1){
    $(".histogram_container").empty();
    var name=$( "#namesHist option:selected" ).text();
    var fileData = props.files[name].data;
    var values=[];
    var count =0;
    fileData.forEach(function(entry) {
    if (count == 0||count ==1||count ==2 ){
      } // the first three values aren't data values
    else{
      values.push(entry);
      }
    count = count +1;
    });
    values=values.sort(function(a, b){return a-b});
    var max= values[count-4];
    var numberOfBars = 15; //this is artbitrarly chosen
    var range = max/numberOfBars;
    var data=[];
    var i, index1,index2,frequency;
    var localMax=max/numberOfBars;
    var zeroFreq=0;
    for(i=0;i<numberOfBars;i++){ //organize into ranges
      frequency = 0;
      index2= 0;
      localMax=Math.round(localMax);
      while(values[index2]<=localMax){
        frequency++;
        index2++;
      }
      values=values.splice(frequency,values.length-1);
      var valueRange= Math.round(range)*i + " - "+ localMax;
      localMax=range*(i+2);
      data.push({Range: valueRange, frequency: frequency},);
    }

//D3 BOOTSTRAP BEGINS HERE
var margin = {top: 40, right: 20, bottom: 30, left: 80},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var formatPercent = d3.format(".0%");

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
    //.tickFormat(formatPercent);

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
  })

var svg = d3.select(".histogram_container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.call(tip);

// The following code was contained in the callback function.
x.domain(data.map(function(d) { return d.Range; }));
y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
  .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Frequency");

svg.selectAll(".bar")
    .data(data)
  .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.Range); })
    .attr("width", x.rangeBand())
    .attr("y", function(d) { return y(d.frequency); })
    .attr("height", function(d) { return height - y(d.frequency); })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)


}
else{
    $(".histogram_container").empty();
    var name=$( "#namesHist option:selected" ).text();
    var activeFile=filenames; //change to selected
    var allData=[];
    var absoluteMax = 0;
    activeFile.forEach(function(entry){ //for each of the selected files
      var fileData = props.files[entry].data;
      var values = fileData.slice(3,fileData.length); //don't want the first three values
      values=values.sort(function(a, b){return a-b});
      var max= values[values.length-1];
      if(max>absoluteMax){
        absoluteMax=max;
      }
      allData.push(values);
    });
    console.log(allData);
   
    var numberOfBars = 4; //this is artbitrarly chosen
    var range = absoluteMax/numberOfBars;
    var data=[];
    var i, index1,index2,frequency;
    var localMax=absoluteMax/numberOfBars;
    var zeroFreq=0;
    var entryCount=0;
    allData.forEach(function(entry){
      var values = entry;
      for(i=0;i<numberOfBars;i++){ //organize into ranges
        frequency = 0;
        index2= 0;
        localMax=Math.round(localMax);
      while(values[index2]<=localMax){
        frequency++;
        index2++;
      }
      values=values.slice(frequency,values.length-1);
      if(entryCount==0){
      var valueRange= Math.round(range)*i + " - "+ localMax;
      data.push({"RangeValues":valueRange});
      }
      var current=data[i];
      var currentName = activeFile[entryCount]; //get name of data set
      current[currentName] = frequency;
      data[i]=current;//override previous
      localMax=range*(i+2);
      
    }
    entryCount++;
  });
    console.log("data final");
    console.log(data);
 var margin = {
     top: 20,
     right: 20,
     bottom: 30,
     left: 40
 },
 width = 960 - margin.left - margin.right,
     height = 500 - margin.top - margin.bottom;

 var x0 = d3.scale.ordinal()
     .rangeRoundBands([0, width], .1);

 var x1 = d3.scale.ordinal();

 var y = d3.scale.linear()
     .range([height, 0]);

 var color = d3.scale.ordinal()
     .range(["#98abc5", "#8a89a6"]);

 var xAxis = d3.svg.axis()
     .scale(x0)
     .orient("bottom");

 var yAxis = d3.svg.axis()
     .scale(y)
     .orient("left")
     .tickFormat(d3.format(""));
 var w = width + margin.left + margin.right;
 var h = height + margin.top + margin.bottom;
 var svg = d3.select(".histogram_container").append("svg")
     .attr("width", w)
     .attr("height", h)
     .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


 // data.push({     RangeValues: "RangeValues11",
 //     True: 9,
 //     False: 4})


 var xg = svg.append("g")
     .attr("class", "x axis")
     .attr("transform", "translate(0," + height + ")");

 var yg = svg.append("g")
     .attr("class", "y axis");

 yg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 6)
     .attr("dy", ".71em")
     .style("text-anchor", "end")
     .text("Count");



 update();
//this function will make teh bar charts
 function update() {
     for (var i = 0; i < data.length; i++) {
         var ageNames = d3.keys(data[i]).filter(function (key) {
             return key !== "RangeValues";
         });

     }

     data.forEach(function (d) {
         d.ages = ageNames.map(function (name) {
             return {
                 name: name,
                 value: +d[name]
             };
         });

     });

     x0.domain(data.map(function (d) {
         return d.RangeValues;
     }));
     x1.domain(ageNames).rangeRoundBands([0, x0.rangeBand()]);
     y.domain([0, d3.max(data, function (d) {
         return d3.max(d.ages, function (d) {
             return d.value;
         });
     })]);
     //making the x axis/y axis
     xg.call(xAxis);
     yg.call(yAxis);
     //removing all the rectangles
     svg.selectAll(".RangeValues").remove();
     
     var state = svg.selectAll(".RangeValues")
         .data(data)
         .enter().append("g")
         .attr("class", "RangeValues")
         .attr("transform", function (d) {
         return "translate(" + x0(d.RangeValues) + ",0)";
     });
     
     state.selectAll("rect")
         .data(function (d) {
         return d.ages;
     })
         .enter().append("rect")
         .attr("width", x1.rangeBand())
         .attr("x", function (d) {
         return x1(d.name);
     })
         .attr("y", function (d) {
         return y(d.value);
     })
         .attr("height", function (d) {
         return height - y(d.value);
     })
         .style("fill", function (d) {
         return color(d.name);
     });
 }
}
});
}

function type(d) {
  d.frequency = +d.frequency;
  return d;
}
