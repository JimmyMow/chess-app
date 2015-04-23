var arr = []
res.forEach(function(x) {
  var x = x.replace(/\s{2,}/g,' ').replace(/^\s+|\s+$/g, '');
  if(x[0] !== '@') {
    arr = arr.concat(x.split(' '));
  } else {
    arr = arr.concat([x]);
  }
});
