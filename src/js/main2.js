// set the dimensions and margins of the graph
const margin = { top: 10, right: 140, bottom: 100, left: 140 },
  width = 1450 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);


// 建立一個覆蓋svg的方形
const rect = svg.append('rect')
  .attr("class", "lineplotrect")
  .style("fill", "none")
  .style("pointer-events", "all")
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .style('cursor', 'pointer')
/*rect.on('mouseover', mouseover)
.on('mousemove', mousemove)
.on('mouseout', mouseout);*/

// 建立沿著折線移動的圓點點1
const focus1 = svg.append('g')
  .append('circle')
  .style("fill", "rgb(228, 26, 28)")
  .attr("stroke", "rgb(228, 26, 28)")
  .attr('r', 5)
  .style("opacity", 0)

// 建立沿著折線移動的圓點點2
const focus2 = svg.append('g')
  .append('circle')
  .style("fill", "rgb(55, 126, 184)")
  .attr("stroke", "rgb(55, 126, 184)")
  .attr('r', 5)
  .style("opacity", 0)

// 建立移動的資料標籤
const focusText = svg.append('g')
  .attr("class","showtext")
  .append('text')
  .style("opacity", 0)

focusText.append('tspan').attr("class","group1")
focusText.append('tspan').attr("class","group2")
focusText.append('tspan').attr("class","year")

// Handmade legend
svg.append("circle").attr("cx", 100).attr("cy", 30).attr("r", 6).style("fill", "rgb(228, 26, 28)")
svg.append("circle").attr("cx", 100).attr("cy", 60).attr("r", 6).style("fill", "rgb(55, 126, 184)")
svg.append("text").attr("class", "linePlotLegend1").attr("x", 120).attr("y", 30).text("男性").style("font-size", "15px").attr("alignment-baseline", "middle")
svg.append("text").attr("class", "linePlotLegend2").attr("x", 120).attr("y", 60).text("女性").style("font-size", "15px").attr("alignment-baseline", "middle")
svg.append("text").attr("x", -320).attr("y", -55).text("全球勞動市場平均年齡").style("font-size", "18px").attr('transform', `rotate(-90)`)
svg.append("text").attr("x", 500).attr("y", 580).text("時間").style("font-size", "18px")


//初始化座標軸
//x axis
svg.append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${height})`)
//y axis
svg.append("g")
  .attr("class", "y-axis")


//3個label : gender、location、education
const legendText = {
  "gender": ["男性", "女性"],
  "location": ["城市區域", "鄉村區域"],
  "education": ["高教育程度", "低教育程度"]
}

//initial line
var line;


function dataFilter(originalData, label) { //使資料依照特定規則分組
  const sumstat = d3.group(originalData, d => d[label]);
  return sumstat;
}


//畫線動畫
function lineAnimation(path, length) {
  path.attr("stroke-dasharray", length + " " + length)
    .attr("stroke-dashoffset", length)
    .transition()
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0)
    .duration(6000);
}

const dataYear = []

for (var i = 1992; i <= 2021; i++) {
  dataYear.push(String(i))
}

console.log(dataYear)

//Read the data
d3.csv("data_preprocess/cleanDataset/clean_lineplotData.csv").then(function (data) {


  btn = document.querySelectorAll('.lineplotBtn')
  btn.forEach(element => {
    element.addEventListener("click", e => {
      console.log(element['id'])
      updateChart(data, element['id'])
    })
  });



  function updateChart(data, label) {

    //清除留下的tooltip殘影
    focusText.style("opacity", 0)
    focus1.style("opacity", 0)
    focus2.style("opacity", 0)

    // group the data: I want to draw one line per group
    const sumstat = dataFilter(data, label)// nest function allows to group the calculation per level of a factor

    legend1 = d3.select(".linePlotLegend1")
    legend2 = d3.select(".linePlotLegend2")

    legend1.text(legendText[label][0])
    legend2.text(legendText[label][1])


    // 使用 d3.bisect() 找到滑鼠的 X 軸 index 值
    const bisect = d3.bisect(dataYear, '1992');

    console.log(bisect)

    // Add X axis --> it is a date format
    const x = d3.scaleLinear()
      .domain(d3.extent(data, function (d) { return d.year; }))
      .range([0, width]);

    svg.select(".x-axis")
      .call(d3.axisBottom(x).ticks(30)).selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("font-size", "1rem")
      .attr("transform", "rotate(-65)");


    //d3.min(data, function (d) { return +d["mean_age_"+label]; })
    // Add Y axis
    const y = d3.scaleLinear()
      .domain([d3.min(data, function (d) { return +d["mean_age_" + label]; }) - 0.5, d3.max(data, function (d) { return +d["mean_age_" + label]; }) + 0.5])
      .range([height, 0]);
    svg.select(".y-axis")
      .call(d3.axisLeft(y)).selectAll("text").attr("font-size", "1rem");

    // color palette
    const color = d3.scaleOrdinal()
      .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'])

    rect.on('mouseover', mouseover).on('mousemove',mousemove)

    // 滑鼠事件觸發的方法
    function mouseover() {
      focus1.style("opacity", 1)
      focus2.style("opacity", 1)
      focusText.style("opacity", 1)
    }

    function mousemove(event) {
      // 把目前X的位置用xScale去換算
      const x0 = x.invert(d3.pointer(event, this)[0])
     
      // 由於我的X軸資料是擷取過的，這邊要整理並補零
      const fixedX0 = parseInt(x0).toString()
     
      // 接著把擷取掉的2021補回來，因為data是帶入原本的資料
      let i = d3.bisect(dataYear, fixedX0)

      var groupKey = Array.from(sumstat.keys())

      var selectedDataGroup1 = sumstat.get(groupKey[0])
      var selectedDataGroup2 = sumstat.get(groupKey[1])

      var DataGroup1 = selectedDataGroup1.find(x => x.year === fixedX0)
      var DataGroup2 = selectedDataGroup2.find(x => x.year === fixedX0)

      // 圓點1
      focus1
        // 換算到X軸位置時，一樣使用擷取過的資料，才能準確換算到正確位置
        .attr("cx", x(DataGroup1['year']))
        .attr("cy", y(DataGroup1["mean_age_" + label]))

      // 圓點2
      focus2
        // 換算到X軸位置時，一樣使用擷取過的資料，才能準確換算到正確位置
        .attr("cx", x(DataGroup2['year']))
        .attr("cy", y(DataGroup2["mean_age_" + label]))

      var maxForY = Math.max(DataGroup1["mean_age_" + label],DataGroup2["mean_age_" + label])



      //var showText = "年份：" + DataGroup2['year'] + "<br>" +  String(legendText[label][0])
      focusText
        .attr("x", x(parseInt(DataGroup2['year'])+0.5))
        .attr("y", y(maxForY))
      
      focusText.select(".group1").attr("dy","0em").text(legendText[label][0]+"：" + parseFloat(DataGroup1["mean_age_" + label]).toFixed(2)+"歲").attr("fill","rgb(228, 26, 28)")
      
      var bbox1 = document.querySelector("tspan.group1").getBBox();

      focusText.select(".group2").attr("dx",`-${bbox1.width}px`).attr("dy","1.3em").text(legendText[label][1]+"：" + parseFloat(DataGroup2["mean_age_" + label]).toFixed(2)+"歲").attr("fill","rgb(55, 126, 184)")
      
      var bbox2 = document.querySelector("tspan.group2").getBBox();
   
      focusText.select(".year").attr("dx",`-${bbox2.width}px`).attr("dy","1.3em").text(DataGroup2['year']+"年").attr("fill","green")
      
    }


    var path1, length1;

    // Draw the line
    if (label == "gender") {
      svg.selectAll(".path2").attr("display", "none")
      svg.selectAll(".path3").attr("display", "none")
      svg.selectAll(".line")
        .data(sumstat)
        .join("path")
        .attr("class", "path1")
        .attr("fill", "none")
        .attr("stroke", function (d) { return color(d[0]) })
        .attr("stroke-width", 2)
        .transition()
        .attr("d", function (d) {
          return d3.line()
            .x(function (d) { return x(d.year); })
            .y(function (d) { return y(+d["mean_age_" + label]); })
            (d[1])
        })

      path1 = d3.selectAll(".path1")
      length1 = path1.node().getTotalLength()

      lineAnimation(path1, length1)

    }

    var path2, length2;

    if (label == "location") {
      svg.selectAll(".path1").attr("display", "none")
      svg.selectAll(".path3").attr("display", "none")
      svg.selectAll(".line2")
        .data(sumstat)
        .join("path")
        .attr("class", "path2")
        .attr("fill", "none")
        .attr("stroke", function (d) { return color(d[0]) })
        .attr("stroke-width", 2)
        .attr("d", function (d) {
          console.log(d)
          return d3.line()
            .x(function (d) { return x(d.year); })
            .y(function (d) { return y(+d["mean_age_" + label]); })
            (d[1])
        })

      path2 = d3.selectAll(".path2")
      length2 = path2.node().getTotalLength()



      lineAnimation(path2, length2)

    }

    var path3, length3;

    if (label == "education") {
      svg.selectAll(".path1").attr("display", "none")
      svg.selectAll(".path2").attr("display", "none")
      svg.selectAll(".line3")
        .data(sumstat)
        .join("path")
        .attr("class", "path3")
        .attr("fill", "none")
        .attr("stroke", function (d) { return color(d[0]) })
        .attr("stroke-width", 2)
        .attr("d", function (d) {
          return d3.line()
            .x(function (d) { return x(d.year); })
            .y(function (d) { return y(+d["mean_age_" + label]); })
            (d[1])
        })

      path3 = d3.selectAll(".path3")
      length3 = path3.node().getTotalLength()

      lineAnimation(path3, length3)
    }


  }

  updateChart(data, 'gender')

  document.querySelector("input#gender").click()


})

window.addEventListener('load', function () {
  document.querySelector("input#gender").click()
})