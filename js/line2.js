var format = d3.time.format("%Y");
var format2 = d3.time.format("%m");
var percentFormat = d3.format(".2p");
var _f = d3.format(".0f");

var margin = {top: 25, right: 200, bottom: 30, left: 50},
    width = 680 - margin.left - margin.right+630,
    height = 500 - margin.top - margin.bottom;

// the edge of th left-hand side plot
var width1 = 430;

var x = d3.scale.ordinal()
      .rangeRoundBands([0, width1],.3);

var y = d3.scale.linear()
      .rangeRound([height,0]);

////////// the x y axis for the pie chart click event//////////////
var x2 = d3.scale.ordinal()
      .rangeRoundBands([0, 265]);

var y2 = d3.scale.linear()
      .rangeRound([110,0]);

var x2Axis = d3.svg.axis()
    .scale(x2)
    .orient("bottom")
    .tickFormat(d3.time.format("%b"));

var y2Axis = d3.svg.axis()
    .scale(y2)
    .orient("left")
    .ticks(6)
    .tickFormat(d3.format(".1s"));

var line2 = d3.svg.line()
    .x(function(d) { return x2(d.month); })
    .y(function(d) { return y2(d.value); });

var year=2016;
////////////////////////////////////

// color for line chart
var z = d3.scale.category20b()
      .domain(["2","1","0"])
      .range(["#e6550d","#31a354","#a55194"]);

//color for pie plot
var z2 = d3.scale.category20b()
      .domain(["2","1","0"])
      .range(["#fdae6b","#e6550d","#31a354"]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format("%Y"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("right")
    .tickFormat(d3.format(".2s"));

var LyAxis= d3.svg.axis() //left y axis
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

var nest = d3.nest()
    .key(function(d) { return d.type; });

var line = d3.svg.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.value); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var legendClassArray = [];

var yMaxValue=5228331;  //use python to generate this value
var maxMoney=125352358.7142857;

// pie plot
var radius = 270 / 2;
var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);
var arc2 = d3.svg.arc() //the bigger one when click the pie chart
    .outerRadius(132)
    .innerRadius(0);
var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.value; });

function detail(year,i){
  d3.csv("data/ticket/"+(year-1911)+".csv", function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
    d.month = format2.parse(d.month);
    d.value = +d.value;
  });

  var type;
  var data2 = new Array()
  data.forEach(function(d) {
    var Obj = new Object();
    if(d.type === "ticket" && i === 0)
    {
      Obj.type = "ticket";
      Obj.month = d.month;
      Obj.value = +d.value;
      data2.push(Obj);

      type="票卡";
    }
    else if(d.type === "one_way" && i === 1)
    {
      Obj.type = "one_way";
      Obj.month = d.month;
      Obj.value = +d.value;
      data2.push(Obj);

      type="單程票";
    }
    else if(d.type === "other" && i === 2)
    {

      Obj.type = "other";
      Obj.month = d.month;
      Obj.value = +d.value;
      data2.push(Obj);

      type="其他";
    }
  });

  var layers = nest.entries(data2);

  x2.domain(data2.map(function(d) { return d.month; }));
  y2.domain([0,d3.max(data, function(d) { return d.value; })]).nice();

  var tooltip = svg.selectAll(".tooltip");

// line chart
  tooltip.selectAll(".layer2")
      .data(layers)
      .attr("d", function(d) { return line2(d.values); })
      .style("stroke", function(d,i) {
        switch(d.key)
          {
            case "ticket":
              return z2(0)
            case "one_way":
              return z2(1)
            case "other":
              return z2(2)
            default:
          }
        });

  tooltip.selectAll(".y2.axis")
      .call(y2Axis);

// dot on line chart
  tooltip.selectAll(".dot2")
        .data(data2)
        .attr("cx", function(d) {  return x2(d.month)+36; })
        .attr("cy", function(d) { return y2(d.value)+20; })
        .style("fill", function(d,i) {
          switch(d.type)
          {
            case "ticket":
              return z2(0)
            case "one_way":
              return z2(1)
            case "other":
              return z2(2)
            default:
          }
        });

    tooltip.selectAll(".ltitle")
        .text(year+"年各月"+type+"流量(次)")

});
}

d3.csv("data/ticket/102.csv", function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
    d.month = format2.parse(d.month);
    d.value = +d.value;
  });

  var data2 = new Array()
  data.forEach(function(d) {
    var Obj = new Object();
    if(d.type === "ticket")
    {
      Obj.type = "ticket";
      Obj.month = d.month;
      Obj.value = +d.value;
      data2.push(Obj);
    }
  });

  var layers = nest.entries(data2);

  x2.domain(data2.map(function(d) { return d.month; }));
  y2.domain([0,d3.max(data, function(d) { return d.value; })]).nice();

  var tooltip = svg.append("g")
                   .attr("class", "tooltip")
                   .attr("transform", "translate("+(width1+530)+",300)")
                   .style("opacity", 0);

  tooltip.append("rect")
        .attr("class", "toolrect")
        .attr("width", 300)
        .attr("height",147)
        .attr("fill", "white")
        .attr("rx",10)
        .attr("ry",10)
        .style("opacity", 0.9);

// line chart
  tooltip.selectAll(".layer2")
      .data(layers)
      .enter().append("path")
      .attr("class", "layer2")
      .attr("transform", "translate(36,20)")
      .attr("d", function(d) { return line2(d.values); })
      .style("stroke", "none");

  tooltip.append("g")
      .attr("class", "x2 axis")
      .attr("transform", "translate(25,130)")
      .call(x2Axis);

  tooltip.append("g")
      .attr("class", "y2 axis")
      .attr("transform", "translate(25,20)")
      .call(y2Axis);

// dot on line chart
  tooltip.selectAll(".dot2")
        .data(data2)
        .enter().append("circle")
        .attr("class", "dot2")
        .attr("r", 3.5)
        .attr("cx", function(d) {  return x2(d.month)+36; })
        .attr("cy", function(d) { return y2(d.value)+20; })
        .style("fill","none");

    tooltip.append("text")
        .attr("transform", "translate(0,10)")
        .attr("class", "ltitle")
        .text("2016年各月票卡流量(次)")
});

var newOpacity = 0;

// bar chart and mouse tooltip
d3.csv("data/money_y.csv", function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
    d.year = format.parse(d.year);
  })

  x.domain(data.map(function(d) { return d.year; }));
  y.domain([0,maxMoney]).nice();

  svg.append("text")
        .attr("transform", "translate(-35,-20)")
        .attr("dy", ".71em")
        .text("營業額 (元)");

  svg.append("g")
      .attr("class", "y axis2")
      .call(LyAxis)

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.year); })
      .attr("width", x.rangeBand())
      .attr("fill","#add8e6")
      .attr("y", function(d) { return y(d.money); })
      .attr("height", function(d) { return height - y(d.money); })
      .on("mouseout", function() { d3.select(this).attr("fill","#add8e6");;})
      .on("mousemove", function(d) {
        // if pie chart haven't be click
        if(newOpacity===0){
        d3.select(this).attr("fill","#4fabc9"); // change color on mouse

        var year2=d.year.getFullYear();
        var monL=svg.selectAll(".monL")
            .text(formatNumber(_f(d.money))+"(元)")

        d3.csv("data/ticket_y.csv", function(error, data) {
        if (error) throw error;
         data.forEach(function(d) {
          d.year = format.parse(d.year);
           d.value = +d.value;
          });
          piePlot(data,year2)
          year=year2;
          var title=svg.selectAll(".title")
            .text(year2+"年份票卡比例")
        });
        }
      });
});

// line chart and lengends
d3.csv("data/ticket_y.csv", function(error, data) {
  if (error) throw error;
  data.forEach(function(d) {
    d.year = format.parse(d.year);
    d.value = +d.value;
  });

  var layers = nest.entries(data);

  x.domain(data.map(function(d) { return d.year; }));
  y.domain([0,yMaxValue]).nice();

  svg.append("text")
        .attr("transform", "translate("+ width1 +",-20)")
        .attr("dy", ".71em")
        .text("流量 (次)");

// line chart
  svg.selectAll(".layer")
      .data(layers)
      .enter().append("path")
      .attr("class", "layer")
      .attr("id","totalLine")
      .attr("transform", "translate(16,0)")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d,i) { return z(i); })

// dot on line chart
  svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) {  return x(d.year)+16; })
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

// lengend of line chart
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

  svg.append("rect")
      .attr("x",width1 + 56)
      .attr("y",60)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill","#add8e6")

  svg.append("text")
      .attr("x", width1 + 86)
      .attr("y", 69)
      .attr("dy", ".35em")
      .text("營業額(月平均)");

// change data format for the pie plot
  var ye=2016,tol;
  var data2 = new Array()
  data.forEach(function(d) {
    var Obj = new Object();
    var a=d.year.getFullYear();
    if(a === ye )
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

  var slice=5; //the beginning state
// pie plot
  var path = svg.datum(data2).selectAll(".pie")
      .data(pie)
    .enter().append("path")
    .attr("class", "pie")
      .attr("transform",  "translate("+(width1+355) +","+(height/2+90)+")" )
      .style("opacity",0.95)
      .attr("fill", function(d, i) { return z2(i); })
      .attr("d", arc)
      .each(function(d) { this._current = d; })
      .on("click", function(d,i){
        if(slice === 5 || slice === i){
          // Determine if current line is visible
          var active   = totalLine.active ? false : true;
          newOpacity = active ? 1 : 0;
          // Hide or show the elements
          if (newOpacity === 1) // the "click"
          {
            detail(year,i);
            path.style("opacity",0.7);
            d3.select(this).style("opacity",0.95);
            d3.select(this).transition().duration(200).delay(50).ease("elastic").attr("d",arc2);
            slice = i;
          }
          else // "unclick"
          {
            path.style("opacity",0.95);
            path.transition().duration(200).attr("d",arc);
            slice = 5;
          }
          d3.selectAll(".tooltip").style("opacity", newOpacity);
          // Update whether or not the elements are active
          totalLine.active = active;
        }
      });

//title of table on right-hand side
  var title=svg.append("text")
      .attr("x", width1+350)
      .attr("y", 0)
      .attr("class", "title")
      .text(ye+"年份票卡比例");

  svg.append("rect")
      .attr("x",width1+250)
      .attr("y",122)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill","#add8e6");

    svg.append("text")
      .attr("x", width1+273)
      .attr("y", 132.5)
      .attr("dy", ".35em")
      .attr("class", "text2")
      .text("月均營業額");

  var monL=svg.append("text")
      .attr("x", width1+365)
      .attr("y", 135)
      .attr("class", "monL")
      .text(formatNumber(_f(125352358.7142857))+"(元)");

// lengend of table
  var legend2 = svg.selectAll(".legend2")
      .data(z2.domain().slice().reverse())
      .enter().append("g")
      .attr("class", "legend2")
      .attr("transform", function(d, i) { return "translate(0," + (i * 35+18.5) + ")"; });

// the table axis
  for(i=0;i<5;i++)
  {
    svg.append("line")
      .style("stroke", "grey")
      .attr("transform", function() { return "translate(0," + (i * 35+10) + ")"; })
      .attr("x1", width1+245)
      .attr("y1", 0)
      .attr("x2", width1+455)
      .attr("y2", 0);
  }

  legend2.append("rect")
      .attr("x",width1+250)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill-opacity", 0.95)
      .style("fill", z2)

  legend2.append("text")
      .attr("x", width1+273)
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
      .attr("x", width1+320)
      .attr("y", 9)
      .attr("dy", ".35em")
      .attr("class", "text1")
      .text(function(d) {
        switch(d)
        {
          case "0":
            return formatNumber(_f(data2[0].value))+"(次)"
          case "1":
            return formatNumber(_f(data2[1].value))+"(次)"
          case "2":
            return formatNumber(_f(data2[2].value))+"(次)"
          default:
        }
      });

  legend2.append("text")
      .attr("x", width1+410)
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

// update pie plot
function piePlot(data,year)
{
  var tol;
  var data2 = new Array()

 data.forEach(function(d) {
    var Obj = new Object();
    var a=d.year.getFullYear();
    if(a === year )
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

  pie.value(function(d) { return d.value; }); // change the value function
  path = path.data(pie); // compute the new angles
  path.transition().duration(500).attrTween("d", arcTween); // redraw the arcs

  var legend2 = svg.selectAll(".legend2")

  legend2.selectAll(".text1")
      .text(function(d) {
        switch(d)
        {
          case "0":
            return formatNumber(_f(data2[0].value))+"(次)"
          case "1":
            return formatNumber(_f(data2[1].value))+"(次)"
          case "2":
            return formatNumber(_f(data2[2].value))+"(次)"
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

function formatNumber(number)
{
    x1 = number;
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1;
}