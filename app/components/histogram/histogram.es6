import context from '../Context/context.es6';
import {getFiles} from '../FileList/fileList.es6';


export default function(){

  let props = context();
  let filenames=getFiles();
  filenames.forEach(function(entry){
    $('#namesHist').append('<option value="'+entry+'">'+entry+'</option>'); //build dropdownmenu
  });
  $( "#namesHist" ).click(function() { //when one is clickedon
    $(".histogram_container").empty();
    let name=$( "#namesHist option:selected" ).text();
    let fileData = props.files[name].data;
    let values=[];
    let count =0;
    fileData.forEach(function(entry) {
    if (count == 0||count ==1||count ==2 ){
      } // the first three values aren't data values
    else{
      values.push(entry);
      }
    count = count +1;
    });
    values=values.sort(function(a, b){return a-b});
    let max= values[count-4];
    let numberOfBars = 15; //this is artbitrarly chosen
    let range = max/numberOfBars;
    let data=[];
    let i, index1,index2,frequency;
    let localMax=max/numberOfBars;
    let zeroFreq=0;
    for(i=0;i<numberOfBars;i++){ //organize into ranges
      frequency = 0;
      index2= 0;
      localMax=Math.round(localMax);
      while(values[index2]<=localMax){
        frequency++;
        index2++;
      }
      values=values.splice(frequency,values.length-1);
      let valueRange= Math.round(range)*i + " - "+ localMax;
      localMax=range*(i+2);
      data.push({Range: valueRange, frequency: frequency},);
    }

//D3 BOOTSTRAP BEGINS HERE
let margin = {top: 40, right: 20, bottom: 30, left: 80},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

let formatPercent = d3.format(".0%");

let x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

let y = d3.scale.linear()
    .range([height, 0]);

let xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

let yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
    //.tickFormat(formatPercent);

let tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
  })

let svg = d3.select(".histogram_container").append("svg")
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
});
}

function type(d) {
  d.frequency = +d.frequency;
  return d;
}
