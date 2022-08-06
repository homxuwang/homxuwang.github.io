  // var hmEl = document.getElementsByClassName('wrapper')[0];
      // var bodyStyle = getComputedStyle(document.body);
      // hmEl.style.width = bodyStyle.width;
      // hmEl.style.height = '1500px';
    //   var hm = document.getElementsByClassName('wrapper')[0];
    var hm = document.body
      var heatmap = h337.create({
          container: hm,
          radius: 60
      });
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
      document.body.onmousemove = function(ev) {
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