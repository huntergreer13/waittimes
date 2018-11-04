// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

$(document).ready(function() {
  var start = moment();
  var end = moment();
  var max = moment();
  function cb(start, end) {
    $('#reportrange-chart span').html(start.format('MMM D, YYYY') + ' - ' + end.format('MMM D, YYYY'));
    startDate = start.format('YYYY-MM-DD');
    endDate = end.format('YYYY-MM-DD');
  }
  $('#reportrange-chart').daterangepicker({
    startDate: start,
    endDate: end,
    maxDate: max,
    dateLimit: {
      years:1
    },
    ranges: {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1,'days'), moment().subtract(1,'days')],
      'This Week': [moment().startOf('week'), moment()],
      'Last Week': [moment().weekday(-7), moment().weekday(-1)],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1,'month').startOf('month'), moment().subtract(1,'month').endOf('month')]
    }
  }, cb);

  $('#reportrange-chart').on('apply.daterangepicker', function(ev, picker) {
    startDate = picker.startDate.format('YYYY-MM-DD');
    endDate = picker.endDate.format('YYYY-MM-DD');
    chartFilterSubmitted();
  });

  //set start and end date
  startDate = moment().format('YYYY-MM-DD');
  endDate = startDate;
  $('#reportrange-chart').data('daterangepicker').setStartDate(moment(startDate));
  $('#reportrange-chart').data('daterangepicker').setEndDate(moment(endDate));
  $('#reportrange-chart span').html(moment(startDate).format('MMM D, YYYY') + ' - ' + moment(endDate).format('MMM D, YYYY'));


  chartFilterSubmitted();
});


function chartFilterSubmitted() {
  var parkInput = $('#chartDropdown').find('option:selected').attr('park');
  refreshChart(parkInput, startDate, endDate);
}

$('#chartDropdown').change(function() {
  chartFilterSubmitted();
});

var myLineChart;
function refreshChart(park, startDate, endDate) {
  $("#chartLabel p").empty();
  $("#chartLabel p").append($('#chartDropdown').find('option:selected').attr('name'));

  var ctx = document.getElementById("myAreaChart").getContext('2d');
  callWaitTimesAPI(park, startDate, endDate).then(function (data) {
      if (data["Body"] == "") {
        console.log("Error getting wait time data.");
      }
      else {
        var data = data["Body"];
        data.sort(GetSortOrder("Hour")); //added this to order by hour
        var graphData = generateGraphData(data);

        if(myLineChart != null) { //if chart already existed, clear it
          //console.log("chart exists: " + myLineChart.toString());
        }
        myLineChart = new Chart(ctx, graphData);
        //console.log(myLineChart);
        myLineChart.update();
      }

  });
}


/*function callWaitTimesAPI(dateStartsWith, park) { //took this out because it's in waitTimeTable.js
  return $.ajax({
    url: 'https://oktnhdxq8f.execute-api.us-east-2.amazonaws.com/dev/wait-times?dateStartsWith=' + dateStartsWith + '&park=' + park,
    dataType: 'json',
    async: true
   });
}*/


function generateGraphData(obj) {
  //console.log(JSON.stringify(obj));
  var parkName = obj[0]["Park"];

  var xAxisLabels = [];
  var hourObj = {};
  var tmpDayHr = [];
  for(var h in obj) {
    hourObj[obj[h]["Hour"]] = obj[h]["WaitTimes"];
    tmpDayHr.push(obj[h]["Hour"]);

    var date = obj[h]["Hour"].split("/")[0];
    var hr = obj[h]["Hour"].split("/")[1];
    var ampm = "";
    if(hr >= 12) {
      ampm = "PM";
    }
    else {
      ampm = "AM";
    }

    if(hr > 12) {
      hr = hr - 12;
    }
    else if(hr == 0) {
      hr = 12; //AM
    }
    hr = hr + ampm;
    xAxisLabels.push([date,hr]);

  }


  //get list of rides
  var rides = [];
  for(ride in hourObj[tmpDayHr[0]]) {
    rides.push(ride);
  }


  var data = {};
  var options = {};

  data.labels = xAxisLabels;
  data.datasets = [];

  var colors = [
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(222, 99, 255, 0.2)', 'rgba(222, 99, 255, 1)'],
    ['rgba(99, 65, 246, 0.2)','rgba(99, 65, 246, 1)'],
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(246, 189, 65, 0.2)','rgba(246, 189, 65, 1)'],
    ['rgba(99, 255, 222, 0.2)', 'rgba(99, 255, 222, 1)'],
    ['rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)'],

    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(222, 99, 255, 0.2)', 'rgba(222, 99, 255, 1)'],
    ['rgba(99, 65, 246, 0.2)','rgba(99, 65, 246, 1)'],
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(246, 189, 65, 0.2)','rgba(246, 189, 65, 1)'],
    ['rgba(99, 255, 222, 0.2)', 'rgba(99, 255, 222, 1)'],
    ['rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)'],
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(222, 99, 255, 0.2)', 'rgba(222, 99, 255, 1)'],
    ['rgba(99, 65, 246, 0.2)','rgba(99, 65, 246, 1)'],
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(246, 189, 65, 0.2)','rgba(246, 189, 65, 1)'],
    ['rgba(99, 255, 222, 0.2)', 'rgba(99, 255, 222, 1)'],
    ['rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)'],
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(222, 99, 255, 0.2)', 'rgba(222, 99, 255, 1)'],
    ['rgba(99, 65, 246, 0.2)','rgba(99, 65, 246, 1)'],
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(246, 189, 65, 0.2)','rgba(246, 189, 65, 1)'],
    ['rgba(99, 255, 222, 0.2)', 'rgba(99, 255, 222, 1)'],
    ['rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)'],
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(222, 99, 255, 0.2)', 'rgba(222, 99, 255, 1)'],
    ['rgba(99, 65, 246, 0.2)','rgba(99, 65, 246, 1)'],
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(246, 189, 65, 0.2)','rgba(246, 189, 65, 1)'],
    ['rgba(99, 255, 222, 0.2)', 'rgba(99, 255, 222, 1)'],
    ['rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)'],
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(222, 99, 255, 0.2)', 'rgba(222, 99, 255, 1)'],
    ['rgba(99, 65, 246, 0.2)','rgba(99, 65, 246, 1)'],
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(246, 189, 65, 0.2)','rgba(246, 189, 65, 1)'],
    ['rgba(99, 255, 222, 0.2)', 'rgba(99, 255, 222, 1)'],
    ['rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)'],
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(222, 99, 255, 0.2)', 'rgba(222, 99, 255, 1)'],
    ['rgba(99, 65, 246, 0.2)','rgba(99, 65, 246, 1)'],
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(246, 189, 65, 0.2)','rgba(246, 189, 65, 1)'],
    ['rgba(99, 255, 222, 0.2)', 'rgba(99, 255, 222, 1)'],
    ['rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)'],
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(222, 99, 255, 0.2)', 'rgba(222, 99, 255, 1)'],
    ['rgba(99, 65, 246, 0.2)','rgba(99, 65, 246, 1)'],
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(246, 189, 65, 0.2)','rgba(246, 189, 65, 1)'],
    ['rgba(99, 255, 222, 0.2)', 'rgba(99, 255, 222, 1)'],
    ['rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)'],
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(222, 99, 255, 0.2)', 'rgba(222, 99, 255, 1)'],
    ['rgba(99, 65, 246, 0.2)','rgba(99, 65, 246, 1)'],
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(246, 189, 65, 0.2)','rgba(246, 189, 65, 1)'],
    ['rgba(99, 255, 222, 0.2)', 'rgba(99, 255, 222, 1)'],
    ['rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)'],
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(222, 99, 255, 0.2)', 'rgba(222, 99, 255, 1)'],
    ['rgba(99, 65, 246, 0.2)','rgba(99, 65, 246, 1)'],
    ['rgba(99, 132, 255, 0.2)','rgba(99, 132, 255, 1)'],
    ['rgba(246, 189, 65, 0.2)','rgba(246, 189, 65, 1)'],
    ['rgba(99, 255, 222, 0.2)', 'rgba(99, 255, 222, 1)'],
    ['rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)']
  ];

  var c = 0;

  for(j in rides) {
    var ride = rides[j];
    //for each ride, looping through each hour and getting list of y values
    var waitTimes = [];
    for(i in tmpDayHr) {
      var dayhr = tmpDayHr[i];
      if(hourObj[dayhr][ride] == null) {
        waitTimes.push(-2);
      }
      waitTimes.push(hourObj[dayhr][ride]);
    }
    //console.log(ride + " - " + waitTimes);

    //generating multiple datasets
    var dset = {};
    dset.label = ride;
    dset.data = waitTimes;
    dset.backgroundColor = colors[c][0];
    dset.borderColor = colors[c][1];
    dset.borderWidth = 1;
    dset.fill = false;
    dset.borderDash = [5,5];
    data.datasets.push(dset);
    c+=1;

  }


  //options
  options.responsive = true;
  options.title = {};
  options.title.display = true;
  options.title.text = "Ride Wait Times - " + parkName;
  options.scales = {};
  options.scales.xAxes = [];
  var xAxes = {};
  xAxes.display = true;
  xAxes.ticks = {};
  xAxes.ticks.callback = function(dataLabel, index) { return index % 2 === 0 ? dataLabel : ''; };
  options.scales.xAxes.push(xAxes);
  options.scales.yAxes = [];
  var yAxes = {};
  yAxes.display = true;
  yAxes.scaleLabel = {};
  yAxes.scaleLabel.display = true;
  yAxes.scaleLabel.labelString = "Wait Time";
  options.scales.yAxes.push(yAxes);

  //create json which creates graph
  var json = {};
  json.type = "line"; //type of graph
  json.data = data;
  json.options = options;
  //console.log(JSON.stringify(data));
  return json;
}







// Area Chart Example
/*var ctx = document.getElementById("myAreaChart");
var myLineChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ["Mar 1", "Mar 2", "Mar 3", "Mar 4", "Mar 5", "Mar 6", "Mar 7", "Mar 8", "Mar 9", "Mar 10", "Mar 11", "Mar 12", "Mar 13"],
    datasets: [{
      label: "Sessions",
      lineTension: 0.3,
      backgroundColor: "rgba(2,117,216,0.2)",
      borderColor: "rgba(2,117,216,1)",
      pointRadius: 5,
      pointBackgroundColor: "rgba(2,117,216,1)",
      pointBorderColor: "rgba(255,255,255,0.8)",
      pointHoverRadius: 5,
      pointHoverBackgroundColor: "rgba(2,117,216,1)",
      pointHitRadius: 50,
      pointBorderWidth: 2,
      data: [10000, 30162, 26263, 18394, 18287, 28682, 31274, 33259, 25849, 24159, 32651, 31984, 38451],
    }],
  },
  options: {
    scales: {
      xAxes: [{
        time: {
          unit: 'date'
        },
        gridLines: {
          display: false
        },
        ticks: {
          maxTicksLimit: 7
        }
      }],
      yAxes: [{
        ticks: {
          min: 0,
          max: 40000,
          maxTicksLimit: 5
        },
        gridLines: {
          color: "rgba(0, 0, 0, .125)",
        }
      }],
    },
    legend: {
      display: false
    }
  }
});*/
