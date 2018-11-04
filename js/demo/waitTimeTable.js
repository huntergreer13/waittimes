var startDate;
var endDate;

$(document).ready(function() {
  var start = moment();
  var end = moment();
  var max = moment();
  function cb(start, end) {
    $('#reportrange span').html(start.format('MMM D, YYYY') + ' - ' + end.format('MMM D, YYYY'));
    startDate = start.format('YYYY-MM-DD');
    endDate = end.format('YYYY-MM-DD');
  }
  $('#reportrange').daterangepicker({
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

  $('#reportrange').on('apply.daterangepicker', function(ev, picker) {
    startDate = picker.startDate.format('YYYY-MM-DD');
    endDate = picker.endDate.format('YYYY-MM-DD');
    tableFilterSubmitted();
  });

  //set start and end date
  startDate = moment().format('YYYY-MM-DD');
  endDate = startDate;
  $('#reportrange').data('daterangepicker').setStartDate(moment(startDate));
  $('#reportrange').data('daterangepicker').setEndDate(moment(endDate));
  $('#reportrange span').html(moment(startDate).format('MMM D, YYYY') + ' - ' + moment(endDate).format('MMM D, YYYY'));

  tableFilterSubmitted();

});


function tableFilterSubmitted() {
  var parkInput = $('#tableDropdown').find('option:selected').attr('park');
  refreshTable(parkInput, startDate, endDate);
}

$('#tableDropdown').change(function() {
  tableFilterSubmitted();
});

function refreshTable(park, startDate, endDate) {
  $("#tableLabel p").empty();
  $("#tableLabel p").append("Historical Wait Times: " + $('#tableDropdown').find('option:selected').attr('name'));

  callWaitTimesAPI(park, startDate, endDate).then(function (data) {
    if (data["Body"] == "") {
      console.log("Error getting wait time data.");
      alert("Error getting wait time data.");
    }
    else {
      data = data["Body"];
      //console.log("API returned: " + JSON.stringify(data));
      data.sort(GetSortOrder("Hour"));
      var tableData = generateTableData(data);

      var colList = [];
      for(var hr in data) {
        colList.push(data[hr]["Hour"]);
      }
      populatedataTable(tableData, colList);
    }

  });
}


function callWaitTimesAPI(park, startDate, endDate) {
  var start = startDate + "/00";
  var end = endDate + "/23";
  return $.ajax({
    url: 'https://oktnhdxq8f.execute-api.us-east-2.amazonaws.com/dev/wait-times?park=' + park + '&startDate=' + start + '&endDate=' + end,
    dataType: 'json',
    async: true
   });
}

function generateTableData(data) {
  //create object with hours as main key, and create list of hours and list of rides
  var hourObj = {};
  var hourList = [];
  var rideObj = {};
  var rideList = [];
  for(var h in data) {
    hourObj[data[h]["Hour"]] = data[h]["WaitTimes"];
    hourList.push(data[h]["Hour"]);

    for(r in data[h]["WaitTimes"]) {
      rideObj[r] = {};
      rideList.push(r);
    }
  }

  //loop through data
  for(var h in data) {
    for(r in data[h]["WaitTimes"]) { //for each ride in wait times
      rideObj[r][data[h]["Hour"]] = data[h]["WaitTimes"][r]; //ride: { "hour": __}
    }
  }

  var retVal = [];
  for(var ride in rideObj) {
    var tmp = {};
    tmp["Ride"] = ride;
    for(var hour in rideObj[ride]) {
      tmp[hour] = rideObj[ride][hour];
    }
    retVal.push(tmp);
  }

  retVal.sort(GetSortOrder("Ride"));
  //each object will be its own row. Each object will be for a ride...
  return retVal;
}


function GetSortOrder(arr) { //sorts by objects in a list
  return function(a,b) {
    if(a[arr] > b[arr]) {
      return 1;
    }
    else if (a[arr] < b[arr]) {
      return -1;
    }
    return 0;
  }
}


function populatedataTable(data, colList) {
  $('#dataTable').empty();
  $('#dataTable').append("<thead><tr></tr></thead><tbody></tbody>");

  //populate columns
  $("#dataTable tr").append("<td>Ride</td>");
  for(var x in colList) {
    var date = colList[x].split("/")[0].split("-")[1] + "/" + colList[x].split("/")[0].split("-")[2];
    var hr = colList[x].split("/")[1];

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

    $("#dataTable tr").append("<td>" + date + "</br>" + hr + " " + ampm + "</td>");
  }

  //populate rows -- pirate's should be at 2, 3, 4, 5, 6pm
  var numOfColumns = colList.length + 1;
  var c = 0;
  var countOfColsAdded = 0;
  //console.log(JSON.stringify(data));
  /*for(var row in data) {
    $("#dataTable tbody").append("<tr>");
    for(var col in data[row]) {
      console.log("looking at: " + colList[c]);
      console.log("col: " + col);
      if(col == colList[c]) {
        $("#dataTable tbody").append("<td>" + data[row][col] + "</td>");
        countOfColsAdded += 1;
        c += 1;
        console.log("just added: " + data[row][col]);
      }
      else if(col == "Ride") {
        $("#dataTable tbody").append("<td>" + data[row][col] + "</td>");
        countOfColsAdded += 1;
        console.log("just added: " + data[row][col]);
      }
      else {
        $("#dataTable tbody").append("<td>" + "NA" + "</td>");
        countOfColsAdded += 1;
        console.log("just added NA");
      }

      //console.log("checking for: " + colList[c] + " and cols added: " + countOfColsAdded + " and col val looked at: " + col);
    }
    //console.log("num of columns: " + numOfColumns + " & number added: " + countOfColsAdded);
    for(var j = 0; j < (numOfColumns - countOfColsAdded); j++) {
      $("#dataTable tbody").append("<td>" + "NA" + "</td>");
      console.log("adding filler NA");
    }
    c = 0;
    countOfColsAdded = 0;
    $("#dataTable tbody").append("</tr>");
  }*/


  for(var row in data) {
    $("#dataTable tbody").append("<tr>");

    $("#dataTable tbody").append("<td>" + data[row]["Ride"] + "</td>");

    //colList will have each hour that may or may not be in the data[row object]
    for(var i in colList) {
      if(data[row][colList[i]]) {
        $("#dataTable tbody").append("<td>" + data[row][colList[i]] + "</td>");
      }
      else {
        $("#dataTable tbody").append("<td>" + 0 + "</td>");
      }
    }


    $("#dataTable tbody").append("</tr>");
  }


}
