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

// 建立沿著折線移動的圓點點1
const focus3 = svg.append('g')
  .append('circle')
  .style("fill", "#4daf4a")
  .attr("stroke", "#4daf4a")
  .attr('r', 5)
  .style("opacity", 0)

// 建立沿著折線移動的圓點點2
const focus4 = svg.append('g')
  .append('circle')
  .style("fill", "#984ea3")
  .attr("stroke", "#984ea3")
  .attr('r', 5)
  .style("opacity", 0)

// 建立移動的資料標籤
const focusText = svg.append('g')
  .attr("class", "showtext")
  .append('text')
  .style("opacity", 0)

//新增tootip內部的文字區塊
focusText.append('tspan').attr("class", "group1")
focusText.append('tspan').attr("class", "group2")
focusText.append('tspan').attr("class", "group3")
focusText.append('tspan').attr("class", "group4")
focusText.append('tspan').attr("class", "year")


//新增線段圖例(legend)
const legendC1 = svg.append("circle").attr("cx", 100).attr("cy", 30).attr("r", 6).style("fill", "rgb(228, 26, 28)")
const legendC2 = svg.append("circle").attr("cx", 100).attr("cy", 60).attr("r", 6).style("fill", "rgb(55, 126, 184)")
const legendC3 = svg.append("circle").attr("cx", 100).attr("cy", 90).attr("r", 6).style("fill", "#4daf4a").attr("opacity", "0")
const legendC4 = svg.append("circle").attr("cx", 100).attr("cy", 120).attr("r", 6).style("fill", "#984ea3").attr("opacity", "0")

const legendT1 = svg.append("text").attr("class", "linePlotLegend1").attr("x", 120).attr("y", 30).text("男性").style("font-size", "15px").attr("alignment-baseline", "middle")
const legendT2 = svg.append("text").attr("class", "linePlotLegend2").attr("x", 120).attr("y", 60).text("女性").style("font-size", "15px").attr("alignment-baseline", "middle")
const legendT3 = svg.append("text").attr("class", "linePlotLegend3").attr("x", 120).attr("y", 90).text("Demo").style("font-size", "15px").attr("alignment-baseline", "middle").attr("opacity", "0")
const legendT4 = svg.append("text").attr("class", "linePlotLegend4").attr("x", 120).attr("y", 120).text("Demo").style("font-size", "15px").attr("alignment-baseline", "middle").attr("opacity", "0")


//圖表座標軸標題
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


//4個label : gender、location、education、income_level
const legendText = {
  "gender": ["男性", "女性"],
  "location": ["城市區域", "鄉村區域"],
  "education": ["高教育程度", "低教育程度"],
  "income_level": ["高收入↑", "中高收入", "中低收入", "低收入↓"]
}

//initial line
var line;


//使資料依照特定規則(label)分組
function dataFilter(originalData, label) { 
  const sumstat = d3.group(originalData, d => d[label]);
  return sumstat;
}


//產生描繪線段的動畫
function lineAnimation(path, length) {
  console.log(path)
  path.attr("stroke-dasharray", length + " " + length)
    .attr("stroke-dashoffset", length)
    .transition()
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0)
    .duration(7000);
}


//用在圓點點所使用的x參考點座標計算
const dataYear = []

for (var i = 1992; i <= 2021; i++) {
  dataYear.push(String(i))
}


//載入資料
d3.csv("data_preprocess/cleanDataset/clean_new_lineplotData.csv").then(function (data) {

  //按鈕註冊click事件
  btn = document.querySelectorAll('.lineplotBtn')

  btn.forEach(element => {
    element.addEventListener("click", e => {
      console.log(element['id'])
      updateChart(data, element['id'])
    })
  });

  //更新圖表的方法
  function updateChart(data, label) {

    //清除留下的tooltip殘影
    focusText.style("opacity", 0)
    focusText.select(".group3").text("")
    focusText.select(".group4").text("")
    focus1.style("opacity", 0)
    focus2.style("opacity", 0)
    focus3.style("opacity", 0)
    focus4.style("opacity", 0)

    // group the data: I want to draw one line per group
    var sumstat;

    //將指標分成收入或其他做對應的處理
    if (label == "income_level") {
      sumstat = dataFilter(data.slice(0, 120), label)

      legendC3.attr("opacity", "1");
      legendC4.attr("opacity", "1");

      legendT3.text(legendText[label][2]).attr("opacity", "1");
      legendT4.text(legendText[label][3]).attr("opacity", "1");

    }
    else {
      //在合併資料時，有重複新增資料，所以只取資料的一半
      sumstat = dataFilter(data.slice(0, 60), label)// nest function allows to group the calculation per level of a factor
      //其他指標不需要圖例3、4
      legendT3.attr("opacity", "0");
      legendT4.attr("opacity", "0");
      legendC3.attr("opacity", "0");
      legendC4.attr("opacity", "0");

    }


    //更新圖例
    legend1 = d3.select(".linePlotLegend1")
    legend2 = d3.select(".linePlotLegend2")

    legend1.text(legendText[label][0])
    legend2.text(legendText[label][1])


    // 使用 d3.bisect() 找到滑鼠的 X 軸 index 值
    const bisect = d3.bisect(dataYear, '1992');

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

    rect.on('mouseover', mouseover).on('mousemove', mousemove)

    // 滑鼠事件觸發的方法
    function mouseover() {
      focus1.style("opacity", 1)
      focus2.style("opacity", 1)
      if(label=="income_level"){
        focus3.style("opacity", 1)
        focus4.style("opacity", 1)
      }
      focusText.style("opacity", 1)
    }

    function mousemove(event) {
      
      // 把目前X的位置用x方法去換算原始數值
      const x0 = x.invert(d3.pointer(event, this)[0])
      
      const fixedX0 = parseInt(x0).toString()
      
      //判斷被插入值(fixedX0)應被插入陣列的何處，回傳index(從1開始，所以之後要減1)
      let i = d3.bisect(dataYear, fixedX0)

      //取得資料被分組後各組的key
      var groupKey = Array.from(sumstat.keys())

      //取得各個圓點點所需使用到的資料
      var selectedDataGroup1 = sumstat.get(groupKey[0])
      var selectedDataGroup2 = sumstat.get(groupKey[1])
      var selectedDataGroup3, selectedDataGroup4

      var DataGroup1 = selectedDataGroup1.find(x => x.year === fixedX0)
      var DataGroup2 = selectedDataGroup2.find(x => x.year === fixedX0)
      var DataGroup3, DataGroup4

      var maxForY = Math.max(DataGroup1["mean_age_" + label], DataGroup2["mean_age_" + label])
      
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

      //var showText = "年份：" + DataGroup2['year'] + "<br>" +  String(legendText[label][0])
      focusText
        .attr("x", x(parseInt(DataGroup2['year']) + 0.5))
        .attr("y", y(maxForY))

      focusText.select(".group1").attr("dy", "0em").text(legendText[label][0] + "：" + parseFloat(DataGroup1["mean_age_" + label]).toFixed(2) + "歲").attr("fill", "rgb(228, 26, 28)")
      
      //排版功能
      var bbox1 = document.querySelector("tspan.group1").getBBox();

      focusText.select(".group2").attr("dx", `-${bbox1.width}px`).attr("dy", "1.3em").text(legendText[label][1] + "：" + parseFloat(DataGroup2["mean_age_" + label]).toFixed(2) + "歲").attr("fill", "rgb(55, 126, 184)")

      //排版功能
      var bbox2 = document.querySelector("tspan.group2").getBBox();

      focusText.select(".year").attr("dx", `-${bbox2.width}px`).attr("dy", "1.3em").text(DataGroup2['year'] + "年").attr("fill", "black").style("z-index",5)

      //判斷是不是以收入作為指標
      if (groupKey.length == 4) {
        console.log(111)
        console.log(sumstat.get(groupKey[2]))
        selectedDataGroup3 = sumstat.get(groupKey[2])
        selectedDataGroup4 = sumstat.get(groupKey[3])

        DataGroup3 = selectedDataGroup3.find(x => x.year === fixedX0)
        DataGroup4 = selectedDataGroup4.find(x => x.year === fixedX0)

        maxForY = Math.max(DataGroup1["mean_age_" + label], DataGroup2["mean_age_" + label],DataGroup3["mean_age_" + label], DataGroup4["mean_age_" + label])
        // 圓點3
        focus3
          // 換算到X軸位置時，一樣使用擷取過的資料，才能準確換算到正確位置
          .attr("cx", x(DataGroup3['year']))
          .attr("cy", y(DataGroup3["mean_age_" + label]))
        // 圓點3
        focus4
          // 換算到X軸位置時，一樣使用擷取過的資料，才能準確換算到正確位置
          .attr("cx", x(DataGroup4['year']))
          .attr("cy", y(DataGroup4["mean_age_" + label]))

        focusText.select(".group3").attr("dx", `-${bbox1.width}px`).attr("dy", "1.3em").text(legendText[label][2] + "：" + parseFloat(DataGroup3["mean_age_" + label]).toFixed(2) + "歲").attr("fill", "#4daf4a")
        focusText.select(".group4").attr("dx", `-${bbox1.width}px`).attr("dy", "1.3em").text(legendText[label][3] + "：" + parseFloat(DataGroup4["mean_age_" + label]).toFixed(2) + "歲").attr("fill", "#984ea3")
      
      }

      //排版設定
      if (parseInt(DataGroup2['year']) == 2021) {
        focusText
          .attr("x", x(parseInt(DataGroup2['year'])) - (bbox1.width) - 18)
          .attr("y", y(maxForY))
      }


    }


    //開始畫線
    //性別指標
    var path1, length1;

    if (label == "gender") {
      svg.selectAll(".path2").attr("display", "none")
      svg.selectAll(".path3").attr("display", "none")
      svg.selectAll(".path4").attr("display", "none")
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
    
    //區域指標
    var path2, length2;

    if (label == "location") {
      svg.selectAll(".path1").attr("display", "none")
      svg.selectAll(".path3").attr("display", "none")
      svg.selectAll(".path4").attr("display", "none")
      svg.selectAll(".line2")
        .data(sumstat)
        .join("path")
        .attr("class", "path2")
        .attr("fill", "none")
        .attr("stroke", function (d) { return color(d[0]) })
        .attr("stroke-width", 2)
        .attr("d", function (d) {
          return d3.line()
            .x(function (d) { return x(d.year); })
            .y(function (d) { return y(+d["mean_age_" + label]); })
            (d[1])
        })

      path2 = d3.selectAll(".path2")
      length2 = path2.node().getTotalLength()

      lineAnimation(path2, length2)

    }

    //教育指標
    var path3, length3;

    if (label == "education") {
      svg.selectAll(".path1").attr("display", "none")
      svg.selectAll(".path2").attr("display", "none")
      svg.selectAll(".path4").attr("display", "none")
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
      console.log("length3:" + length3)

      lineAnimation(path3, length3)
    }

    //收入指標
    var path4, length4;

    if (label == "income_level") {
      svg.selectAll(".path1").attr("display", "none")
      svg.selectAll(".path2").attr("display", "none")
      svg.selectAll(".path3").attr("display", "none")
      svg.selectAll(".line4")
        .data(sumstat)
        .join("path")
        .attr("class", "path4")
        .attr("fill", "none")
        .attr("stroke", function (d) { return color(d[0]) })
        .attr("stroke-width", 2)
        .transition()
        .attr("d", function (d) {
          console.log(d)

          return d3.line()
            .x(function (d) { return x(d.year); })
            .y(function (d) { return y(+d["mean_age_income_level"]); })
            (d[1])
        })

      path4 = d3.selectAll(".path4")
      console.log(path4)
      console.log(path4.node())
      length4 = 2200
      console.log("length4:" + length4)

      lineAnimation(path4, length4)

    }

  }
  //初始畫圖標
  updateChart(data, 'gender')

})

//視窗載入完成後，模擬點擊產生繪圖動畫效果
window.addEventListener('load', function () {
  document.querySelector("input#gender").click()
})