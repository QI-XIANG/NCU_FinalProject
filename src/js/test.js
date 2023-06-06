/*d3.csv("../data/movies.csv").then((res) => {
    console.log(res);
    //debugger; 用來抓住區域變數，不然原則上執行完這行，在瀏覽器console裡面res會變成undefined
});*/

//字串處理，將NA換成undefined，其餘則保持原string
const parseNA = string => (string === 'NA' ? "undifined" : string); //匿名函式

//日期處理
const parseDate = string => d3.timeParse("%Y-%m-%d")(string); //匿名函式
//上面相當於下面
/*const parseDate = d3.timeParse("%Y-%m-%d");
parseDate(string);*/

// + 轉換成數字
//轉換資料類型
function type(d) {
    const date = parseDate(d.release_date);
    return {
        budget: +d.budget,
        genre: parseNA(d.genre),
        genres: JSON.parse(d.genres).map(d => d.name),
        homepage: parseNA(d.homepage),
        id: +d.id, imdb_id: parseNA(d.imdb_id),
        original_language: parseNA(d.original_language),
        overview: parseNA(d.overview),
        popularity: +d.popularity,
        poster_path: parseNA(d.poster_path),
        production_countries: JSON.parse(d.production_countries),
        release_date: date,
        release_year: date.getFullYear(),
        revenue: +d.revenue,
        runtime: +d.runtime,
        tagline: parseNA(d.tagline),
        title: parseNA(d.title),
        vote_average: +d.vote_average,
        vote_count: +d.vote_count,
    }
}

//d3.csv的第2個參數可以給定資料預處理方法
//d3.csv("../data/movies.csv",type).then((res) => console.log(res));

//data filter
function filterData(data) {
    return data.filter(
        d => {
            return (
                d.release_year > 1999 && d.release_year < 2010 &&
                d.revenue > 0 &&
                d.budget > 0 &&
                d.genre != 'undifined' && //不為空值
                d.title //不為空值 
            )
        }
    )
}

//d3.csv("../data/movies.csv",type).then((res) => console.log(filterData(res)));

//Main Function
/*function ready(movies){
    const moviesClean = filterData(movies);
    console.log(moviesClean);
}*/

//資料聚合
//https://github.com/d3/d3-array/blob/v3.2.2/README.md#rollup
//https://observablehq.com/@d3/d3-ascending
//https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/from
function prepareBarChartData(data) {
    //console.log(data);
    //rollup是iterable函式會逐筆讀入資料 rollups(values, reduce, ...keys)
    const dataMap = d3.rollup(data, v => d3.sum(v, d => d.revenue), d => d.genre);
    //將array-like或iterable object轉換成array
    const dataArry = Array.from(dataMap, d => ({ genre: d[0], revenue: d[1] }))
    return dataArry;
}

//設定資料呈現的畫布
function setupCanvas(barchartData) {
    const svg_width = 400; //畫布寬度
    const svg_height = 500; //畫布高度
    const chart_margin = { top: 80, right: 40, bottom: 40, left: 80 }; //畫布離邊緣的距離
    const chart_width = svg_width - (chart_margin.right + chart_margin.left); //圖表寬度
    const chart_height = svg_height - (chart_margin.top + chart_margin.bottom); //圖表長度

    const this_svg = d3.select('.bar-chart-container').append('svg') //在.bar-chart-container裡面建立svg元素
        .attr('width', svg_width).attr('height', svg_height) //修改svg的尺寸
        //Template literals (Template strings) -> 可在字串中呼叫、使用參數，而非以+進行串聯
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
        .append('g').attr('transform', `translate(${chart_margin.left}, ${chart_margin.top})`);//建立圖表的群組

    //scale 決定水平、鉛直座標軸的分布範圍
    //V1.d3.extent find the max & min in revenue (x座標從最小的revenue開始)
    const xExtent = d3.extent(barchartData, d => d.revenue); // return array 找到資料當中的最大、最小值
    //scaleLinear()產生線性關係(數值對應到畫布尺寸的關係，y=mx) domain() 數值範圍 range() 畫布的範圍
    const xScale_v1 = d3.scaleLinear().domain(xExtent).range([0, chart_width]);
    //V2 (x座標從0開始)
    const xMax = d3.max(barchartData, d => d.revenue); // 找到資料當中的最大值
    const xScale_v2 = d3.scaleLinear().domain([0, xMax]).range([0, chart_width]);
    //V3 簡寫
    const xScale_v3 = d3.scaleLinear([0, xMax], [0, chart_width]);

    //決定鉛直方向座標軸的分布範圍
    //d3.scaleBand() 設定bar的寬度和總共要有幾個bar //domain 有幾個bar 
    //rangeRound 計算每條bar的寬度並無條件捨去小數點 //paddingInner 在bar跟bar之間設定間隔
    //map(d => d.genre) 產生新陣列
    const yScale = d3.scaleBand().domain(barchartData.map(d => d.genre)).rangeRound([0, chart_height]).paddingInner(0.25);

    //draw bars 實際繪製出所有的bar
    /*selection.data - bind elements to data 將資料與元素綁定，按照資料的比數建立對應個數的element
    selection.enter - get the enter selection (data missing elements) 將資料數值放入element*/
    const bars = this_svg.selectAll('.bar')
        .data(barchartData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', d => yScale(d.genre))
        .attr('width', d => xScale_v3(d.revenue))
        .attr('height', yScale.bandwidth()) //bandwidth() 取得bar的寬度
        .style('fill', 'dodgerblue'); //決定bar的顏色

    //Draw header 新增圖表的標題
    const header = this_svg.append('g').attr('class', 'bar-header')
        .attr('transform', `translate(0,${-(chart_margin.top / 2)})`) //向上平移
        .append('text');
    header.append('tspan').text('Total revenue by genre in $US');
    header.append('tspan').text('Year: 2000-2009')
        .attr('x', 0).attr('y', 20).style('font-size', '0.8em').style('fill', '#555');

    function formatTicks(d) {
        /*d3.format("s")(1500);  // "1.50000k"
          d3.format("~s")(1500); // "1.5k"*/
        return d3.format('~s')(d)
            .replace('M', 'mil') //字串取代
            .replace('G', 'bil')
            .replace('T', 'tri')
    }

    //新增刻度
    //axisTop 產生圖表頂部的刻度
    const xAxis = d3.axisTop(xScale_v3)
        .tickFormat(formatTicks) //set the tick format explicitly 設定刻度的格式
        .tickSizeInner(-chart_height) //tickSizeInner: the length of the tick lines 內刻度的長度
        .tickSizeOuter(0); //tickSizeOuter: the length of the square ends of the domain path 外刻度的長度

    //selection.call - call a function with this selection
    const xAxisDraw = this_svg.append('g').attr('class', 'x axis').call(xAxis);
    //set the size of the ticks 同時設定 tickSizeInner tickSizeOuter
    const yAxis = d3.axisLeft(yScale).tickSize(0);
    const yAxisDraw = this_svg.append('g')
        .attr('class', 'y axis').call(yAxis);
    //The dx attribute indicates a shift along the x-axis on the position of an element or its content.
    yAxisDraw.selectAll('text').attr('dx','-0.6em')
}

//Main Function
function ready(movies) {
    //篩選資料
    const moviesClean = filterData(movies);
    //barchartData : Array
    const barchartData = prepareBarChartData(moviesClean).sort( //將Array的資料進行排序(由大到小)
        (a, b) => {
            return d3.descending(a.revenue, b.revenue);//return compare function 用來比較a、b大小的函數
        }
    );
    /*下面跟上面的效果相同 https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/sort*/
    /*const barchartData = prepareBarChartData(moviesClean).sort(
        (a,b) => {
            if(a.revenue > b.revenue ){
                return -1;
            }
            if(a.revenue < b.revenue){
                return 1;
            }
            return 0;
        }
    );*/
    console.log(barchartData);
    setupCanvas(barchartData);
}

//load data
d3.csv("../data/movies.csv", type).then(res => {
    ready(res);
})