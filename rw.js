rush = window.rush = {

    "key": "",
    "address": "",
    "txFee": 0.0001,
    "price": 0,
    "lastTab": "",
    "pageArray": ['wallet', 'settings', 'help'],

    "open": function ()
    {
        var manifest = chrome.runtime.getManifest();

        var key = localStorage.getItem('key');

        // If we don't have any keys
        if (!key) {

            // Ask them for the key
            $("#createKey").show();
            $("#foundKey").hide();

            // Save the key
            var key = $('#txtKey').val();
            localStorage.setItem('key', key);
            this.key = key;

        } else {

            // chrome.tabs.getCurrent({
            //     active: true,
            //     lastFocusedWindow: true 
            // }, function(tabs) {
            //     var url = tabs[0].url;
            //     $('#txtNote').val("url");
            //     //setMsg();
            // });

            // chrome.tabs.getSelected(null,function(tab) {
            //     var tablink = tab.url;
            //     setMsg(tablink);
            // });

            // chrome.tabs.getSelected(null, function(tab) {
            //     var tab = tab.id;
            //     var tabUrl = tab.url;

            //     setMsg(typeof tab.title);
            // });

          // chrome.permissions.request({
          //   permissions: ['tabs'],
          //   origins: ['http://www.google.com/']
          // }, function(granted) {
          //   // The callback argument will be true if the user granted the permissions.
          //   if (granted) {
          //     setMsg("granted");
          //   } else {
          //     setMsg("not granted");
          //   }
          // });
        chrome.tabs.query (
                { currentWindow: true, active: true }, 
                function(tabs) {
                    var title = JSON.stringify(tabs[0].title);
                    var url = JSON.stringify(tabs[0].url);
                    var autofill_note = "Sending from: " + title + "(" + url + ")";
                    document.getElementById('txtNote').value = autofill_note;
             });
        //setMsg(JSON.stringify(tab));

            // chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
            //     setMsg(typeof tabs[0].url);
            // });

          // chrome.permissions.contains({
          //   permissions: ['tabs'],
          //   origins: ['http://www.google.com/']
          // }, function(result) {
          //   if (result) {
          //     setMsg("got it!");
          //   } else {
          //     setMsg("no go");
          //   }
          // });

            this.getInfo();

            $('#createKey').hide();
            $('#foundKey').show(); 
            $('#addressTitle').show();
            $('#balanceBox').show();
        }
    },
    "check": function ()
    {

        var balance = localStorage.getItem('balance');

        if (parseFloat($("#txtAmount").val()) > balance)
        {
            setMsg("You don't have enough BTC!");
            return false;
        }
        
        if (parseFloat($("#txtAmount").val()) + this.txFee > balance)
        {
            setMsg("Please add " + this.txFee + " to the amount total for the miners' fee.");
            return false;
        }

        if (parseFloat($("#txtAmount").val()) == 0)
        {
            setMsg("No amount specified.");
            return false;
        }

        var checkAddr = rush.checkAddress($('#txtAddress').val());
        if ( !checkAddr )
        {
            setMsg("Invalid address!");
            return false;
        }

       return true;
    },
    "checkAddress": function ( address )
    {
        try
        {
            var res = Bitcoin.base58.checkDecode(address);
            var version = res.version
            var payload = res.slice(0);
            if (version == 0)
                return true;
        }
        catch (err)
        {
            return false;
        }
    },
    "send": function ()
    {

        var note = "";
        var key = localStorage.getItem('key');
        var to = $('#txtAddress').val();
        var amount = $('#txtAmount').val();
        if ($('#txtNote').val()) var note = $('#txtNote').val();
        var code = $('#code').val();

        $('#txtAddress').hide();
        $('#txtAmount').hide();
        $('#txtNote').hide();
        $('#code').hide();
        $('#send').hide();

        var url = 'http://76.74.170.194/plugin/send?plugin_key=' + key + '&to=' + to + '&amount=' + amount + '&amp;' + 'note=' + note + '&code=' + code;

        rush.check();

        if (!checks)
        {
            setMsg("An error occurred. Please double check the values you entered or contact us for support.");
            return;
        }

        $.ajax({
            type: "GET",
            url: url,
            async: true,
            data: {}
        }).done(function (msg) {

            var newMsg = jQuery.parseJSON(msg);
            var success = newMsg.success;
            var message = newMsg.message;
            this.success = success;
            this.message = message;

            if (success) {
                var successStr = "Congrats! " + message;
                setMsg(successStr);
            } else {
                var failStr = "Sending failed. Failure message: " + message;
                setMsg(failStr);
            }
        });
    },
    "prepareReset": function ()
    {
        setMsg("Are you sure you want to reset your Plug In Key? <strong>This will require you to enter your valid Plug In Key again when you want to send from this Plug In.</strong> <br/><button id='confirmReset'>Yes</button> <button id='noReset'>No</button>");
    },
    "reset": function ()
    {
        $("#errorBox").hide();

        localStorage.setItem('key',"");
        localStorage.setItem('address', "");
        localStorage.setItem('balance', "");

        $("#createKey").show();
        $("#foundKey").hide();

        this.key = "";
        this.address = "";
        this.balance = "";
    },
    "setKey": function ()
    {
        key = $('#txtKey').val();
        localStorage.setItem('key',key);

        // Get info from key and set balance and address
        var url = 'http://76.74.170.194/plugin/info?plugin_key=' + key;

        $.ajax(
        {
            type: "GET",
            url: url,
            async: true,
            data: {}

        }).done(function (msg) {
            var info = jQuery.parseJSON(msg);

            // save wallet address
            this.address = info.address;
            localStorage.setItem('address', this.address);

            // save wallet balance
            this.balance = info.bitcoin_balance;
            localStorage.setItem('balance', this.balance);

        });

        $("#createKey").hide();
        $("#foundKey").show(); 
        //$('#addressTitle').show();
        //$('#balanceBox').show();

        setMsg("Key has been set succesfully! Please close and open the application again!");

        var address = localStorage.getItem('address');
        $("#address").html(address);
        $("#address").show();

        var balance = localStorage.getItem('balance');
        $("#balance").html("B⃦" + balance);
        $("#balance").show();
    },
    "getInfo" : function () {

        var key = localStorage.getItem('key');
        var url = 'http://76.74.170.194/plugin/info?plugin_key=' + key;

        $.ajax(
        {
            type: "GET",
            url: url,
            async: true,
            data:
            {}

        }).done(function (msg)
        {
            var info = jQuery.parseJSON(msg);

            // save wallet address
            this.address = info.address;
            localStorage.setItem('address', this.address);

            // save wallet balance
            this.balance = info.bitcoin_balance;
            localStorage.setItem('balance', this.balance);

        });

        var address = localStorage.getItem('address');
        $("#address").html(address);

        var balance = localStorage.getItem('balance');
        $("#balance").html("B⃦" + balance);
    },
    "openTab": function ( tab )
    {
        for ( i in this.pageArray )
        {
            if ( this.pageArray[i] != tab )
            {
                $( "#" + this.pageArray[i] + "Tab" ).removeClass("selected");
                $( "#" + this.pageArray[i] + "Page" ).hide();
            }
        }

        $( "#" + tab + "Tab" ).addClass("selected");
        $( "#" + tab + "Page" ).show();

        chrome.storage.local.set(
        {
            'lastTab': tab,
        }, function (){});

        $("#settingsErrorBox").hide();
        $("body").css("height", "");
        $("body").css("min-height", "0px");

    },
};

$(document).ready(function ()
{
    chrome.storage.local.get(["key", "address"], function (data)
    {
        this.key = data.key;
        this.address = data.address;
    });

    rush.open();
});

function formatMoney(x)
{
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function htmlEncode(value)
{
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
}

function s2hex(s)
{
    return Bitcoin.convert.bytesToHex(Bitcoin.convert.stringToBytes(s))
}

function ajax(url,success,data) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            success(xhr.responseText);
            xhr.close;
        }
    }
    xhr.open(data ? "POST" : "GET", url, true);
    if (data) xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(data);
}
