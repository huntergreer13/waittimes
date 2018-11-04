$(document).ready(function() {
  refreshCurrentWaitTimesTable("DisneylandResortMagicKingdom");
});

function refreshCurrentWaitTimesTable(park) {

  callWaitTimesAPI(park).then(function (data) {
    console.log("current wait times: " + JSON.stringify(data));
    /*if (data["Body"] == "") {
      console.log("Error getting wait time data.");
      alert("Error getting wait time data.");
    }

    var data = data["Body"];
    data.sort(GetSortOrder("Hour"));
    var tableData = generateTableData(data);

    var colList = [];
    for(var hr in data) {
      colList.push(data[hr]["Hour"]);
    }
    populatedataTable(tableData, colList);*/
  });
}

function callCurrentWaitTimesAPI(dateStartsWith, park) {
  return $.ajax({
   url: 'https://oktnhdxq8f.execute-api.us-east-2.amazonaws.com/dev/currentwaittimes?park=\"' + dateStartsWith + '\"' + '&park=\"' + park + '\"',
       dataType: 'json',
       async: true
   });
}
