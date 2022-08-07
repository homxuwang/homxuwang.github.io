
window.onload = function() {
  var body = document.body
  var bodyStyle = getComputedStyle(body);

  var heatmapDIV = document.createElement('div')
  heatmapDIV.style.position= 'fixed'
  heatmapDIV.style.width = bodyStyle.width
  heatmapDIV.style.height = bodyStyle.height
  heatmapDIV.classList.add('heatmap')
  
  let firstChild = document.body.firstChild
  body.insertBefore(heatmapDIV, firstChild)

  // hm.appendChild(heatmapWrapper)
  // var hmEl = document.querySelector('.heatmap-wrapper');
  // hmEl.style.width = bodyStyle.width;
  // hmEl.style.height = bodyStyle.height;
  var hm = document.querySelector('.heatmap');
  var heatmap = h337.create({
      container: hm,
      radius: 60
  });
  if(hm.style.position == 'relative'){
    hm.style.position = 'absolute'
  }
    var trackData = false;
    setInterval(function() {
    trackData = true;
    }, 50);
    var idleTimeout, idleInterval;
    var lastX, lastY;
    var idleCount;
    function startIdle() {
    idleCount = 0;
    function idle() {
        heatmap.addData({
        x: lastX,
        y: lastY
        });
        idleCount++;
        if (idleCount > 10) {
        clearInterval(idleInterval);
        }
    };
    idle();
    idleInterval = setInterval(idle, 1000);
    };
    hm.onmousemove = function(ev) {
      if (idleTimeout) clearTimeout(idleTimeout);
      if (idleInterval) clearInterval(idleInterval);
      if (trackData) {
          lastX = ev.pageX;
          lastY = ev.pageY;
          heatmap.addData({
          x: lastX,
          y: lastY
          });
          trackData = false;
      }
      idleTimeout = setTimeout(startIdle, 500);
    };
  }