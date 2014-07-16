checkMessages();
getFiatValue();


setInterval( function() {
	checkMessages();
	getFiatValue();

}, 60000 );	



function getFiatValue ()
{
	$.ajax({
	    type: "GET",
	    url: "https://api.bitcoinaverage.com/ticker/" + 'USD',
	    async: true,
	    data: {}

	}).done(function (msg) {
	    price = msg.last;
	    chrome.storage.local.set( {"price": price} , function (data) {
	    });
	});	
}

function s2hex(s)
{
  var result = '';
  for(var i=0; i<s.length; i++)
  {
    c = s.charCodeAt(i);
    result += ((c<16) ? "0" : "") + c.toString(16);
  }
  return result;
}