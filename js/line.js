var format = d3.time.format("%m");
var percentFormat = d3.format(".2p");

var margin = {top: 25, right: 200, bottom: 30, left: 50},
    width = 680 - margin.left - margin.right+730,
    height = 500 - margin.top - margin.bottom;

    width1 = 430;

var x = d3.scale.ordinal()
      .rangeRoundBands([0, width1],.3);

var y = d3.scale.linear()
      .rangeRound([height,0]);
/*
var z = d3.scale.category20b()
      .domain(["4","3","2","1","0"])
      .range(["#393b79","#5254a3","#6b6ecf","#9c9ede","#c6dbef"]);
*/
var z = d3.scale.category20b()
      .domain(["2","1","0"])
      .range(["#e6550d","#31a354","#a55194"]);

var z2 = d3.scale.category20b()
      .domain(["2","1","0"])
      .range(["#fdae6b","#e6550d","#31a354"]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format("%b"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("right")
    .tickFormat(d3.format(".2s"));

var LyAxis= d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

var nest = d3.nest()
    .key(function(d) { return d.type; });

var line = d3.svg.line()
    .x(function(d) { return x(d.month); })
    .y(function(d) { return y(d.value); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var legendClassArray = [];

var year = 102;
var yMaxValue=5711546;  //use python to generate this value

var btn = d3.select('#next')
                  .on('click',function(){
                    if(year < 105)
                      year=year+1;
                    document.getElementById("nRadius").value = year+1911;
                    //updateData(year);
                  });

var btn = d3.select('#last')
                  .on('click',function(){
                    if(year > 97)
                      year=year-1;
                    document.getElementById("nRadius").value = year+1911;
                    updateData(year);
                  });

// time slider bar
d3.select("#nRadius").on("input", function() {
            year=+this.value-1911;
            updateData(+this.value-1911);
         });


d3.csv("data/money/"+year+".csv", function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
    d.month = format.parse(d.month);
  })

  //x.domain(d3.extent(data, function(d) { return d.month; }));
  x.domain(data.map(function(d) { return d.month; }));
  y.domain([0, d3.max(data, function(d) { return d.money; })]).nice();

  svg.append("text")
        .attr("transform", "translate(-35,-20)")
        .attr("dy", ".71em")
        .text("營業額 (元)");

  svg.append("g")
      .attr("class", "y axis")
      .call(LyAxis)

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.month); })
      .attr("width", x.rangeBand())
      .attr("fill","#add8e6")
      //.attr("width", 20)
      .attr("y", function(d) { return y(d.money); })
      .attr("height", function(d) { return height - y(d.money); })
      .on("mouseover", function() { tooltip.style("display", null); })
      .on("mouseout", function() { tooltip.style("display", "none"); })
      .on("mousemove", function(d) {
        var mon=d.month.getMonth()+1;
        d3.csv("data/ticket/"+year+".csv", function(error, data) {
        if (error) throw error;
         data.forEach(function(d) {
          d.month = format.parse(d.month);
           d.value = +d.value;
          });
          piePlot(data,mon)
          var title=svg.selectAll(".title")
            .text(1911+year+"年"+mon+"月票卡比例")
        });
      });
       var tooltip = svg.append("g")
                   .attr("class", "tooltip")
                   .style("display", "none");
});

var radius = 300 / 2;

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.value; });



d3.csv("data/ticket/"+year+".csv", function(error, data) {
  if (error) throw error;
  data.forEach(function(d) {
    d.month = format.parse(d.month);
    d.value = +d.value;
  });

  var layers = nest.entries(data);

  x.domain(data.map(function(d) { return d.month; }));
  y.domain([0, yMaxValue]).nice();

svg.append("text")
        .attr("transform", "translate("+ width1 +",-20)")
        .attr("dy", ".71em")
        .text("流量 (次)");


  svg.selectAll(".layer")
      .data(layers)
      .enter().append("path")
      .attr("class", "layer")
      .attr("transform", "translate(12,0)")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d,i) { return z(i); })

  svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 3.5)
        .attr("cx", function(d) {  return x(d.month)+12; })
        .attr("cy", function(d) { return y(d.value); })
        .style("fill", function(d,i) {
          switch(d.type)
          {
            case "total":
              return z(0)
            case "ticket":
              return z(1)
            case "one_way":
              return z(2)
            default:
          }
        });

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width1 + ",0)")
      .call(yAxis);

    var legend = svg.selectAll(".legend")
      .data(z.domain().slice().reverse())
      .enter().append("g")
      .attr("class", function (d) {

        legendClassArray.push(d);
        return "legend";
      })
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  //reverse order to match order in which bars are stacked
  legendClassArray = legendClassArray.reverse();

  legend.append("circle")
      .attr("cy", 8)
      .attr("cx", width1 + 65)
      .attr("r", 3.5)
      .style("fill", z)
      .attr("id", function (d, i) {
        return "id" + d;
      })

  legend.append("line")
      .attr("x1", width1+53)
      .attr("y1", 8)
      .attr("x2", width1+77)
      .attr("y2", 8)
      .style("stroke", z)

  legend.append("text")
      .attr("x", width1 + 86)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text(function(d) {
        switch(d)
        {
          case "0":
            return "總和"
          case "1":
            return "票卡"
          case "2":
            return "單程票"
          default:
        }
      });
var mon=1,tol;
  var data2 = new Array()

  data.forEach(function(d) {
    var Obj = new Object();
    var a=d.month.getMonth()+1;
    if(a === mon )
    {
      if(d.type === "total")
      {
        tol=d.value;
      }
      else
      {
        Obj.value = +d.value;
        data2.push(Obj);
        if(d.type === "one_way")
        {
          var Obj = new Object();
          Obj.value = tol-data2[0].value-data2[1].value;
          data2.push(Obj);
        }
      }
    }
  });

  var path = svg.datum(data2).selectAll(".pie")
      .data(pie)
    .enter().append("path")
    .attr("class", "pie")
      .attr("transform",  "translate("+(width1+380) +","+(height/2)+")" )
      .style("opacity",0.8)
      .attr("fill", function(d, i) { return z2(i); })
      .attr("d", arc)
      .each(function(d) { this._current = d; });

  var title=svg.append("text")
      .attr("x", width -98)
      .attr("y", height/2-70)
      .attr("class", "title")
      .style("font-size",22)
      .text("2013年1月票卡比例")

  var legend2 = svg.selectAll(".legend2")
      .data(z2.domain().slice().reverse())
      .enter().append("g")
      .attr("class", "legend2")
      .attr("transform", function(d, i) { return "translate(0," + (i * 35+180) + ")"; });

  for(i=0;i<4;i++)
  {
    svg.append("line")
      .style("stroke", "grey")
      .attr("transform", function() { return "translate(0," + (i * 35+171) + ")"; })
      .attr("x1", width - 105)
      .attr("y1", 0)
      .attr("x2", width +  105)
      .attr("y2", 0);
  }

  legend2.append("rect")
      .attr("x", width - 100)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill-opacity", 0.8)
      .style("fill", z2)

  legend2.append("text")
      .attr("x", width -79)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text(function(d) {
        switch(d)
        {
          case "0":
            return "票卡";
          case "1":
            return "單程票";
          case "2":
            return "其他";
          default:
        }
      });

  legend2.append("text")
      .attr("x", width -30)
      .attr("y", 9)
      .attr("dy", ".35em")
      .attr("class", "text1")
      .text(function(d) {
        switch(d)
        {
          case "0":
            return data2[0].value+"(次)"
          case "1":
            return data2[1].value+"(次)"
          case "2":
            return data2[2].value+"(次)"
          default:
        }
      });

  legend2.append("text")
      .attr("x", width +60)
      .attr("y", 9)
      .attr("dy", ".35em")
      .attr("class", "text2")
      .text(function(d) {
        switch(d)
        {
          case "0":
            return  percentFormat(data2[0].value/tol)
          case "1":
            return  percentFormat(data2[1].value/tol)
          case "2":
            return  percentFormat(data2[2].value/tol)
          default:
        }
      });
});

function piePlot(data,mon)
{
   var tol;
  var data2 = new Array()

 data.forEach(function(d) {
    var Obj = new Object();
    var a=d.month.getMonth()+1;
    if(a === mon )
    {
      if(d.type === "total")
      {
        tol=d.value;
      }
      else
      {
        //Obj.type = d.type;
        Obj.value = +d.value;
        data2.push(Obj);
        if(d.type === "one_way")
        {
          var Obj = new Object();
          //Obj.type = "other";
          Obj.value = tol-data2[0].value-data2[1].value;
          data2.push(Obj);
        }
      }
    }
  });

  var path = svg.datum(data2).selectAll(".pie")

    pie.value(function(d) { return d.value; }); // change the value function
    path = path.data(pie); // compute the new angles
    path.transition().duration(500).attrTween("d", arcTween); // redraw the arcs

    var legend2 = svg.selectAll(".legend2")

  legend2.selectAll(".text1")
      .text(function(d) {
        switch(d)
        {
          case "0":
            return data2[0].value+"(次)"
          case "1":
            return data2[1].value+"(次)"
          case "2":
            return data2[2].value+"(次)"
          default:
        }
      });

  legend2.selectAll(".text2")
      .text(function(d) {
        switch(d)
        {
          case "0":
            return  percentFormat(data2[0].value/tol)
          case "1":
            return  percentFormat(data2[1].value/tol)
          case "2":
            return  percentFormat(data2[2].value/tol)
          default:
        }
      });
}

function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
          return arc(i(t));
        };
}