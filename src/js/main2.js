// set the dimensions and margins of the graph
const margin = {top: 10, right: 70, bottom: 100, left: 70},
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Handmade legend
svg.append("circle").attr("cx",100).attr("cy",30).attr("r", 6).style("fill", "rgb(228, 26, 28)")
svg.append("circle").attr("cx",100).attr("cy",60).attr("r", 6).style("fill", "rgb(55, 126, 184)")
svg.append("text").attr("x", 120).attr("y", 30).text("男性").style("font-size", "15px").attr("alignment-baseline","middle")
svg.append("text").attr("x", 120).attr("y", 60).text("女性").style("font-size", "15px").attr("alignment-baseline","middle")
svg.append("text").attr("x", -320).attr("y", -55).text("勞動市場平均年齡").style("font-size", "18px").attr('transform',`rotate(-90)`)
svg.append("text").attr("x", 500).attr("y", 580).text("年份").style("font-size", "18px")


//Read the data
d3.csv("../../data_preprocess/cleanDataset/clean_gender.csv").then( function(data) {

  // group the data: I want to draw one line per group
  const sumstat = d3.group(data, d => d.gender); // nest function allows to group the calculation per level of a factor

  // Add X axis --> it is a date format
  const x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.year; }))
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(30)).selectAll("text")  
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("font-size","1rem")
    .attr("transform", "rotate(-65)");

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([33, d3.max(data, function(d) { return +d.mean_age; })])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y)).selectAll("text").attr("font-size","1rem");

  // color palette
  const color = d3.scaleOrdinal()
    .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

  // Draw the line
  svg.selectAll(".line")
      .data(sumstat)
      .join("path")
        .attr("fill", "none")
        .attr("stroke", function(d){ return color(d[0]) })
        .attr("stroke-width", 2)
        .attr("d", function(d){
          return d3.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(+d.mean_age); })
            (d[1])
        })

})