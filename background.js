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

// var myNotification = new Notify('Yo dawg!', {
//     body: 'This is an awesome notification',
//     notifyShow: onNotifyShow
// });

// function onNotifyShow() {
//     alert('notification was shown!');
// }

// myNotification.show();

// if (window.webkitNotifications) {
//   alert("Notifications are supported!");
// }
// else {
//   alert("Notifications are not supported for this Browser/OS version yet.");
// }

// function notify() {
//   if (!window.webkitNotifications) return;  // no notifications support
//   var havePermission = window.webkitNotifications.checkPermission();
//   if (havePermission == 0) {
//     // 0 is PERMISSION_ALLOWED
//     var notification = window.webkitNotifications.createNotification(
//       'http://i.stack.imgur.com/dmHl0.png',
//       'Chrome notification!',
//     'Here is the notification text'
//     );

//     notification.onclick = function () {
//       window.open("http://stackoverflow.com/a/13328397/1269037");
//       // the notification will close itself after being clicked
//     }
//     notification.show();
//   } else {
//       window.webkitNotifications.requestPermission();
//   }
// } 

// fetchTweets();

// // Retrieve tweets using jsonp.
// var script = document.createElement("script");
// script.src = 'http://twitter.com/statuses/user_timeline/'+ username+'.json?' +
//              'count=3&callback=fetchTweets';
// document.body.appendChild(script);

// function fetchTweets(data) {
//   var tweet;
//   var i = data.length;
//   while (i--) {
//     tweet = data[i];
//     if (window.webkitNotifications.checkPermission() == 0) {
//       window.webkitNotifications.createNotification(
//           tweet.user.profile_image_url, tweet.user.name,
//           tweet.text).show(); // note the show()
//     } else {
//       // Note that we can't call requestPermission from here as we are in the
//       // callback function and not triggered just on user action
//       console.log('You have to click on "Set notification permissions for this page" ' +
//                   'first to be able to receive notifications.');
//       return;
//     }
//   }
// }