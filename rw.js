rush = window.rush = {

    "key": "",
    "address": "",
    "txSec": "",
    "balance": 0,
    "txFee": 0.0001,
    "price": 0,
    "lastTab": "",
    "pageArray": ['wallet', 'settings', 'help'],

    "open": function ()
    {
        var manifest = chrome.runtime.getManifest();

        this.getAddress();

        this.key = localStorage.getItem('key');

        if (!this.key) {
            $("#createKey").show();

            chrome.storage.local.set({
                'key': $('#txtKey').val()
            });

            $("#foundKey").hide();
        } else {
            $('#createKey').hide();

            $('#foundKey').show(); 
        }

        // $("#address").html(this.address);

        this.getBalance();

        var socket = new WebSocket("ws://ws.blockchain.info:8335/inv");

        socket.onopen = function (msg)
        {
            var message = {
                "op": 'addr_sub',
                "addr": rush.address
            };

            socket.send(JSON.stringify(message));
        }

        socket.onmessage = function (msg)
        {
            setTimeout(function ()
            {
                rush.getBalance();
                playBeep();
            }, 500);
        }

    },
    "help": function ()
    {
        this.openTab("help");

        // chrome.tabs.create({url: chrome.extension.getURL('help.html')});
    },
    "userManual": function ()
    {
        chrome.tabs.create({
          'url':'http://kryptokit.com/getting-started.html' }, function(tab) {
          });
    },
    "check": function ()
    {

        if (parseFloat($("#txtAmount").val()) > this.balance)
        {
            setMsg("You are trying to send more BTC than you have in your balance!");
            return false;
        }
        
        if (parseFloat($("#txtAmount").val()) + this.txFee > this.balance)
        {
            setMsg("You need to leave enough room for the " + this.txFee + " btc miner fee");
            return false;
        }

        if (parseFloat($("#txtAmount").val()) == 0)
        {
            setMsg("Please enter an amount!");

            return false;
        }

        if ( !this.checkAddress( $('#txtAddress').val() ) )
        {
            setMsg("Malformed address!");

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
        // if (!this.check())
        // {
        //     return;
        // }

        // var bytes = Bitcoin.Crypto.SHA256(passcode,
        // {
        //     asBytes: true
        // });

        // var btcKey = new Bitcoin.Key(bytes);

        // this.txSec = btcKey.export("base58");
        // this.txAmount = parseFloat($("#txtAmount").val());
        // this.txAmount = this.txAmount.toFixed(8);
        // this.txDest = $('#txtAddress').val();
        // txGetUnspent();

        // $("#send").attr("disabled", "disabled");
        // $("#send").html("Sending...");
    },
    "getAddress": function ()
    {
        var url = "https://blockchain.info/q/addressbalance/" + this.address;

        $.ajax(
        {
            type: "GET",
            url: url,
            async: true,
            data:
            {}

        }).done(function (msg)
        {


        });
    },
    "getBalance": function ()
    {
        var url = "https://blockchain.info/q/addressbalance/" + this.address;

        $.ajax(
        {
            type: "GET",
            url: url,
            async: true,
            data:
            {}

        }).done(function (msg)
        {
            rush.balance = msg / 100000000;
            var spendable = rush.balance - rush.txFee;

            if (spendable < 0)
                spendable = 0;

            $("#balance").html("฿" + rush.balance.toFixed(8));
            $("#spendable").html("฿" + spendable.toFixed(8));

            rush.getFiatValue();

        });
    },
    "getFiatValue": function ()
    {

        this.fiatValue = this.price * rush.balance;

        $("#fiatValue").html("(" + this.getFiatPrefix() + formatMoney(this.fiatValue.toFixed(2)) + ")");

        $("#currentPrice").html( this.getFiatPrefix() + formatMoney(rush.price.toFixed(2)));
    },
    "getFiatPrice": function ()
    {
        currency = 'USD';

        $.ajax({
            type: "GET",
            url: "https://api.bitcoinaverage.com/ticker/" + currency,
            async: true,
            data: {}

        }).done(function (msg) {
            price = msg.last;

            rush.price = price;
            chrome.storage.local.set( {"price": price} , function (data) {

            });

            rush.getFiatValue();

        });
    },
    "amountFiatValue": function ()
    {

        var amount = $("#txtAmount").val();

        amount = parseFloat(amount);

        if (!amount)
        {
            amount = 0;
        }

        var fiatValue = this.price * amount;

        fiatValue = fiatValue.toFixed(2);

        $("#send").html("Send (" + this.getFiatPrefix() + formatMoney(fiatValue) + ")");
    },
    "prepareReset": function ()
    {
        setMsg("Are you sure you want to generate a new address? <strong>This will delete your current one and all funds associated with it.</strong> <br/><button id='confirmReset'>Yes</button> <button id='noReset'>No</button>");
    },
    "reset": function ()
    {
        $("#errorBox").hide();

        localStorage.setItem('key',"");
        localStorage.setItem('address', "");

        $("#createKey").show();
        $("#foundKey").hide();

        this.key = "";
        this.address = "";
    },
    // "removePassword": function ()
    // {
    //     setMsg("Enter your password to disable it. <input type='password' id='passwordTxt' placeholder='password'> <button id='confirmRemovePassword'>Remove Password</button>");
    // },
    // "confirmRemovePassword": function ()
    // {
    //     var decrypted = CryptoJS.AES.decrypt(this.passcode, "" + $("#passwordTxt").val() );

    //     var passcode = decrypted.toString(CryptoJS.enc.Utf8);

    //     if (!passcode)
    //     {
    //         setMsg("Incorrect Password!");
    //         return;
    //     }

    //     this.password = passcode;

    //     this.encrypted = false;

    //     chrome.storage.local.set(
    //     {
    //         'code': passcode,
    //         'encrypted': false
    //     }, function ()
    //     {
    //         setMsg("Password has been removed succesfully!");

    //         $("#password").hide();
    //         $("#removePassword").hide();
    //         $("#preparePassword").show();
    //     });


    // },
    // "preparePassword": function ()
    // {
    //     setMsg("Please set a password below: <br/><input type='password' id='setPassword' placeholder='password'> <input type='password' id='setPassword2' placeholder='repeat password'> <button id='setPasswordBtn'>Set Password</button>");
    //     $("#setPassword").focus();
    // },
    "setKey": function ()
    {
        key = $('#txtKey').val();
        localStorage.setItem('key',key);

        setMsg("Key has been set succesfully!");
        $("#createKey").hide();
        $("#foundKey").show();

        // chrome.storage.local.set(
        // {
        //     'key': key
        // }, function ()
        // {
        //     setMsg("Key has been set succesfully!");

        //     $("#createKey").hide();
        //     $("#foundKey").show();
        // });

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
    "openWalletTab": function ()
    {
        this.openTab("wallet");
    },
    "txComplete": function ()
    {
        setMsg("Payment sent!");

        $("#send").removeAttr("disabled");
        $("#send").html("Send");

        this.txSec = "";

        $("#txtAmount").val("");
        $("#txtAddress").val("");

        this.getBalance();
    },
    "showSettings": function ()
    {
        $("#showSettings").hide();
        $("#tools").show();
    },
    "getFiatPrefix": function()
    {
        switch ( this.currency )
        {
            case "AUD":
            case "USD":
            case "CAD":
                return "$";
                break;
            default:
                return "";
        }
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

// Date.prototype.format = function (format) //author: meizz
// {
//     var o = {
//         "M+": this.getMonth() + 1, //month
//         "d+": this.getDate(), //day
//         "H+": this.getHours(), //hour
//         "h+": ((this.getHours() % 12)==0)?"12":(this.getHours() % 12), //hour
//         "z+": ( this.getHours()>11 )?"pm":"am", //hour
//         "m+": this.getMinutes(), //minute
//         "s+": this.getSeconds(), //second
//         "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
//         "S": this.getMilliseconds() //millisecond
//     }

//     if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
//     for (var k in o)
//         if (new RegExp("(" + k + ")").test(format))
//             format = format.replace(RegExp.$1,
//                 RegExp.$1.length == 1 ? o[k] :
//                 ("00" + o[k]).substr(("" + o[k]).length));
//     return format;
// }

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
