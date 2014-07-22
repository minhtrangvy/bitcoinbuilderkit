function setMsg(str)
{
  $("#errorBox").show().html(str);
}

function setSettingsMsg(str)
{
  $("#settingsErrorBox").show().html(str);
}

// Needed to find addresses on the page
var unique = function (origArr)
{
    var dict = {},
    newArr = []
    for (var i = 0; i < origArr.length; i++) {
        if (!dict[origArr[i]]) {
            newArr.push(origArr[i])
            dict[origArr[i]] = true
        }
    }
    return newArr;
};

// Finds all address on the page
chrome.extension.onRequest.addListener(function (object)
{
  var addresses = object.addresses;
  if (addresses)
  {
    var cleanAddresses = Array();
    for (var index in addresses)
    {
      str = addresses[index];
      removeChars = "<>&:?\".()|' \n";

      for (var c in removeChars) str = str.replace(removeChars[c],'')
      cleanAddresses.push(str);
    }

    cleanAddresses = unique(cleanAddresses);
    cleanAddresses.sort();
    var addressCount = 0;
    uris = object.uris;
    var usedUris = [];

    for ( var index in uris )
    {
      if ( usedUris.indexOf( uris[index].address ) > -1 ) break;
      usedUris.push( uris[index].address );

      if ( rush.checkAddress( uris[index].address ) )
      {
        $("#addresses").prepend("<input type='radio' name='addy' value='" + uris[index].address + "' amount='" + uris[index].amount + "'><span class='address' address='" + uris[index].address + "'>" + uris[index].address + " <b>(฿" + uris[index].amount + ")</b></span> <br/>");   
        addressCount++;     
      }

      if ( cleanAddresses.indexOf( uris[index].address ) > -1  ) cleanAddresses.splice( cleanAddresses.indexOf( uris[index].address ), 1 );
    }

    for (var index in cleanAddresses)
    {
      str = cleanAddresses[index];

      if ( rush.checkAddress( str ) )
      {
        $("#addresses").append("<input type='radio' name='addy' value='" + str + "'><span class='address' address='" + str + "'>" + str + "</span> <br/>");   
        addressCount++;     
      }
    }

    if ( addressCount )
    {
      $("#addresses").show().css(
      {
        "border-bottom": "1px solid #DDD"
      });

      $("#foundTitle").show();
    }
  }
});

window.onload = function ()
{
  //setMsg("hi");

  document.getElementById('resetAddress').onclick = rush.prepareReset;

  $(document).on("click", '#send', function (event)
  {
    rush.send();
  });

  $(document).on("click", '#keyEnter', function (event)
  {
    rush.setKey();
  });

  $(document).on("click", '#confirmReset', function (event)
  {
    rush.reset();
  });

  $(document).on("click", '#noReset', function (event)
  {
    $("#errorBox").hide();
  });

  $(document).on("click", '#addresses input', function (event)
  {
    $("#txtAddress").val($(this).val());

    if ( $(this).attr("amount") )
    {
      $("#txtAmount").val( $(this).attr("amount") );
      rush.amountFiatValue( $(this).attr("amount") );
    }      
  });

  chrome.windows.getCurrent(function (currentWindow)
  {
    chrome.tabs.query(
      {
        active: true,
        windowId: currentWindow.id
      },
      function (activeTabs)
      {
        chrome.tabs.executeScript(
          activeTabs[0].id,
          {
            file: 'find_addresses.js',
            allFrames: true
          });
      });
  });

};

function showMessages()
{
  return;
}