//字串處理，將NA換成No Data，其餘則保持原string
const parseNA = string => (string === 'NA' ? "No Data!" : string); //匿名函式


//清理資料
function type(data){
    return {
        country: data["Country Name"],
        income_level: data["Income Level Name"],
        year_survey: +data["Year of survey"],
        total_population: +data["Total population"],
        mean_age_worker: +data["Mean age of worker between 15-64"],
        multip_population_age:  (+data["Total population"])*(+data["Mean age of worker between 15-64"])
    }
}

//data filter
function filterData(data,year) {
    return data.filter(
        d => {
            return (
                d.year_survey == year
            )
        }
    )
}

//data group
function dataGroup(data){
    return d3.group(data, d => d.year_survey)
}

//cal mean age
function calMeanAge(data,label,year){
    const total_population_label = d3.rollup(data, v => d3.sum(v, d => d["total_population"]), d => d[label])
    const multip_population_age_label = d3.rollup(data, v => d3.sum(v, d => d["multip_population_age"]), d => d[label])
    const keys = Array.from(total_population_label.keys())
    var mean_average_label = {}
    var mean_average_label_year = {}
    keys.forEach(element => {
        mean_average_label[element] = (multip_population_age_label.get(element) / total_population_label.get(element))
    })
    mean_average_label_year[year] = mean_average_label
    //console.log(mean_average_label_year)
    return mean_average_label_year
}

//draw line
function drawline(data){
    const line = d3.line().x(d => x(d.incomelevel)).y(d => y(d.value))
}

//load data
d3.csv("../../data_preprocess/dataset/join_database_all.csv",type).then(res => {
    years = Array.from(dataGroup(res).keys()).sort().filter(year => year > 1991)
    var newData = {}
    var high_income= []
    var low_income = []
    var lower_middle_income = []
    var upper_middle_income = []
    years.forEach(year => {
        //console.log(calMeanAge(filterData(res,year),'income_level',year)[year]["High income"]);
        high_income.push(calMeanAge(filterData(res,year),'income_level',year)[year]["High income"])
        low_income.push(calMeanAge(filterData(res,year),'income_level',year)[year]["Low income"])
        lower_middle_income.push(calMeanAge(filterData(res,year),'income_level',year)[year]["Lower middle income"])
        upper_middle_income.push(calMeanAge(filterData(res,year),'income_level',year)[year]["Upper middle income"])
    })
    console.log(high_income)
    console.log(low_income)
    console.log(lower_middle_income)
    console.log(upper_middle_income)
    console.log(res)
})


