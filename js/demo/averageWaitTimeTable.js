var startDate;
var endDate;

$(document).ready(function() {
  var start = moment();
  var end = moment();
  var max = moment();
  function cb(start, end) {
    $('#reportrange-averageWaitTime span').html(start.format('MMM D, YYYY') + ' - ' + end.format('MMM D, YYYY'));
    startDate = start.format('YYYY-MM-DD');
    endDate = end.format('YYYY-MM-DD');
  }
  $('#reportrange-averageWaitTime').daterangepicker({
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

  $('#reportrange-averageWaitTime').on('apply.daterangepicker', function(ev, picker) {
    startDate = picker.startDate.format('YYYY-MM-DD');
    endDate = picker.endDate.format('YYYY-MM-DD');
    var parkInput = $('#averageWaitTimeTableDropdown').find('option:selected').attr('park');
    refreshAverageWaitTimeTable(parkInput, startDate, endDate);
  });

  //set start and end date
  startDate = moment().format('YYYY-MM-DD');
  endDate = startDate;
  $('#reportrange-averageWaitTime').data('daterangepicker').setStartDate(moment(startDate));
  $('#reportrange-averageWaitTime').data('daterangepicker').setEndDate(moment(endDate));
  $('#reportrange-averageWaitTime span').html(moment(startDate).format('MMM D, YYYY') + ' - ' + moment(endDate).format('MMM D, YYYY'));

  var parkInput = $('#averageWaitTimeTableDropdown').find('option:selected').attr('park');
  refreshAverageWaitTimeTable(parkInput, startDate, endDate);

});

$('#averageWaitTimeTableDropdown').change(function() {
  var parkInput = $('#averageWaitTimeTableDropdown').find('option:selected').attr('park');
  refreshAverageWaitTimeTable(parkInput, startDate, endDate);
});

function refreshAverageWaitTimeTable(park, startDate, endDate) {
  $("#averagewaittimestableLabel p").empty();
  $("#averagewaittimestableLabel p").append("Average Wait Times Per Hour: " + $('#averageWaitTimeTableDropdown').find('option:selected').attr('name'));

  getAverageWaitTimeData(park, startDate, endDate).then(function (data) {
    if (data["Body"] == "" || data["ErrorMsg"] != "") {
      alert("Error getting wait time data or no data available for selected timeframe.");
    }
    else {
      data = data["Body"];
      //console.log("API returned: " + JSON.stringify(data));
      populateAverageWaitTimeTable(data);
    }

  });
}


function getAverageWaitTimeData(park, startDate, endDate) {
  var start = startDate + "/00";
  var end = endDate + "/23";
  return $.ajax({
    url: 'https://oktnhdxq8f.execute-api.us-east-2.amazonaws.com/dev/average-wait-times?park=' + park + '&startDate=' + start + '&endDate=' + end,
    dataType: 'json',
    async: true
   });
}


function populateAverageWaitTimeTable(data) {
  $('#averageWaitTimeDataTable').empty();
  $('#averageWaitTimeDataTable').append("<thead><tr></tr></thead><tbody></tbody>");

  var hourObj = {};
  var lowestWaitTimesObj = {};
  var highestWaitTimesObj = {};
  for(var rideName in data) {
    data[rideName].sort(GetSortOrder("AvgWaitTime")); //doing this to get the lowest 5 wait times

    if(data[rideName].length >= 10) {
      lowestWaitTimesObj[rideName] = data[rideName].slice(0,5);
      highestWaitTimesObj[rideName] = data[rideName].slice(-3);
    }
    else if(data[rideName].length >= 8) {
      lowestWaitTimesObj[rideName] = data[rideName].slice(0,3);
      highestWaitTimesObj[rideName] = data[rideName].slice(-2);
    }
    else if(data[rideName].length >= 5) {
      lowestWaitTimesObj[rideName] = data[rideName].slice(0,2);
      highestWaitTimesObj[rideName] = data[rideName].slice(-1);
    }


    data[rideName].sort(GetSortOrder("Hour")); //sort list of avg times by hour

    //get list of hours to display as column values
    for(var i = 0; i < data[rideName].length; i ++) {
      if(!(data[rideName][i]["Hour"] in hourObj)) { //using an object to make it simple to not get duplicate hours
        hourObj[data[rideName][i]["Hour"]] = "TMP PLACEHOLDER";
      }
    }
  }

  //loop through hourObj to get LIST of hours. Then sort that list.
  var hourList = [];
  for(var hour in hourObj) {
    hourList.push(hour);
  }
  //sort hour list
  hourList.sort();

  //add column titles to table
  $("#averageWaitTimeDataTable tr").append("<td>Ride</td>");
  var hr;
  for(var i in hourList) {
    hr = hourList[i];
    var ampm = "";
    if(hr >= 12) {
      ampm = "PM EST";
    }
    else {
      ampm = "AM EST";
    }

    if(hr > 12) {
      hr = hr - 12;
    }
    else if(hr == 0) {
      hr = 12; //AM
    }

    $("#averageWaitTimeDataTable tr").append("<td>" + hr + " " + ampm + "</td>");
  }

  //sort rides alphabetically in data
  data = sortObjectByKey(data);

  var numOfColumns = hourList.length + 1;
  for(var rideName in data) { //
    var waitTimeHourIndex = 0;
    $("#averageWaitTimeDataTable tbody").append("<tr>");

    $("#averageWaitTimeDataTable tbody").append("<td>" + rideName + "</td>");

    for(var i in hourList) {
      if(waitTimeHourIndex == data[rideName].length || (data[rideName][waitTimeHourIndex]["Hour"] != hourList[i])) {
        //just write the average wait time as NA
        $("#averageWaitTimeDataTable tbody").append("<td>" + "NA" + "</td>");
      }
      else {
        //write the hour's average wait time and increment waitTimeHourIndex
        var isColored = false;
        //color cell green if it's one of the lowest wait times
        for(j in lowestWaitTimesObj[rideName]) {
          if(lowestWaitTimesObj[rideName][j]["Hour"] == hourList[i]) {
            $("#averageWaitTimeDataTable tbody").append("<td bgcolor=\"#b0fcb0\">" + data[rideName][waitTimeHourIndex]["AvgWaitTime"] + "</td>");
            isColored = true;
          }
        }
        if(!isColored) { //if it's not green, check for if it needs to be red
          //color cell red if it's one of the highest wait times
          for(j in highestWaitTimesObj[rideName]) {
            if(highestWaitTimesObj[rideName][j]["Hour"] == hourList[i]) {
              $("#averageWaitTimeDataTable tbody").append("<td bgcolor=\"#f92f4d\">" + data[rideName][waitTimeHourIndex]["AvgWaitTime"] + "</td>");
              isColored = true;
            }
          }
        }

        if(!isColored) {
          $("#averageWaitTimeDataTable tbody").append("<td>" + data[rideName][waitTimeHourIndex]["AvgWaitTime"] + "</td>");
        }

        waitTimeHourIndex += 1;
      }
    }

    $("#averageWaitTimeDataTable tbody").append("</tr>");
  }

}

function sortObjectByKey(data) {
  var dataTMP = data;
  data = {};
  Object.keys(dataTMP)
      .sort()
      .forEach(function(v, i) {
          data[v] = dataTMP[v];
       });
  return data;
}
