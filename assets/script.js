// Simple interactions: year, volunteer form handling, mobile nav toggle
document.addEventListener('DOMContentLoaded', function(){
  // set year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // triangle background container
  var stitchBg = document.getElementById('stitch-bg');
  var trigIndex = 0;
  var triangles = []; // legacy, not used
  var centers = [];
  function createCenters(){
    var w = window.innerWidth, h = window.innerHeight;
    centers = [
      {cx:w/3, cy:h/2, trigIndex:0, currentScale:1, triangles:[]},
      {cx:2*w/3, cy:h/2, trigIndex:0, currentScale:1, triangles:[]},
      // new center above and between the other two
      {cx:w/2, cy:h/3, trigIndex:0, currentScale:1, triangles:[]}
    ];
  }
  var currentScale = 1;
  var scaleFactor = 0.97; // shrink by 3% each time
  var thresh = 20; // scroll pixels per triangle - less frequent triangles
  // add initial triangle immediately (none at top)
  function initTriangles(){
    createCenters();
    // ensure no triangles at start
    trigIndex = 0;
    currentScale = 1;
    // reset scroll position to top so we start empty
    window.scrollTo(0,0);
  }
  function createLine(x1,y1,x2,y2){
    var dx = x2 - x1;
    var dy = y2 - y1;
    var len = Math.sqrt(dx*dx + dy*dy);
    var angle = Math.atan2(dy,dx) * 180/Math.PI;
    var line = document.createElement('div');
    line.className = 'triangle-line';
    line.style.width = len + 'px';
    line.style.height = '1px';
    // position at first point and rotate toward second
    line.style.transform = 'translate(' + x1 + 'px,' + y1 + 'px) rotate(' + angle + 'deg)';
    stitchBg.appendChild(line);
    return line;
  }
  function addTriangle(rot, center, scale){
    if(!stitchBg) return;
    var w = window.innerWidth;
    var h = window.innerHeight;
    var cx = center.cx;
    var cy = center.cy;
    // determine side length equilateral with scale
    var maxSideByHeight = 2/Math.sqrt(3) * h;
    var side = Math.min(w * scale, maxSideByHeight * scale);
    var heightEqui = Math.sqrt(3)/2 * side;
    var xa = cx;
    var ya = cy - (heightEqui * 2/3);
    var x0 = cx - side/2;
    var y0 = cy + heightEqui/3;
    var x1 = cx + side/2;
    var y1 = y0;
    var pts = [[x0,y0],[x1,y1],[xa,ya]];
    var rad = rot * Math.PI/180;
    var cos = Math.cos(rad), sin = Math.sin(rad);
    var rotPts = pts.map(function(p){
      var dx = p[0] - cx, dy = p[1] - cy;
      return [ cx + dx*cos - dy*sin, cy + dx*sin + dy*cos ];
    });
    // create lines and glitter
    [ [0,1],[0,2],[1,2] ].forEach(function(pair){
      var l = createLine(rotPts[pair[0]][0], rotPts[pair[0]][1], rotPts[pair[1]][0], rotPts[pair[1]][1]);
      center.triangles.push(l);
      // glitter dot at midpoint
      var mx = (rotPts[pair[0]][0] + rotPts[pair[1]][0])/2;
      var my = (rotPts[pair[0]][1] + rotPts[pair[1]][1])/2;
      var dot = document.createElement('div');
      dot.style.position='absolute';
      dot.style.width='4px';
      dot.style.height='4px';
      dot.style.background='gold';
      dot.style.borderRadius='50%';
      dot.style.left=mx+'px';
      dot.style.top=my+'px';
      stitchBg.appendChild(dot);
      center.triangles.push(dot);
    });
  }
  window.addEventListener('scroll', function(){
    var y = window.scrollY;
    var thresh = 20; // larger step, fewer triangles
    var desiredCount = Math.floor(y / thresh);
    // debug
    console.debug('scroll', y, 'desired', desiredCount, 'current', trigIndex);
    if(desiredCount !== trigIndex){
      var delta = desiredCount - trigIndex;
      if(delta > 0){
        console.debug('adding', delta, 'sets');
        // add triangles for each center
        for(var k = trigIndex; k < desiredCount; k++){
          centers.forEach(function(c){
            c.currentScale *= scaleFactor;
            addTriangle(k * 5, c, c.currentScale);
          });
        }
      } else {
        console.debug('removing', -delta, 'sets');
        // remove triangles from each center
        for(var removeCount = 0; removeCount < -delta; removeCount++){
          centers.forEach(function(c){
            c.currentScale /= scaleFactor;
            // remove last six elements (3 lines + 3 glitter dots)
            for(var m=0;m<6;m++){
              var el = c.triangles.pop();
              if(el && el.parentNode) el.parentNode.removeChild(el);
            }
          });
        }
      }
      trigIndex = desiredCount;
    }
  });
  // draw the first triangle immediately
  initTriangles();

  // volunteer form: mailto fallback
  var form = document.getElementById('volunteer-form');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var formData = new FormData(form);
      var name = formData.get('name') || '';
      var email = formData.get('email') || '';
      var message = formData.get('message') || '';
      var subject = encodeURIComponent('Volunteer: ' + name);
      var body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message);
      window.location.href = 'mailto:info@johncountsfor5.org?subject=' + subject + '&body=' + body;
    });
  }

  // mobile menu toggle
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');
  if(toggle && nav){
    toggle.addEventListener('click', function(){
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', (!expanded).toString());
      if(nav.style.display === 'block') nav.style.display = '';
      else nav.style.display = 'block';
    });
  }

  var redTapeVideo = document.getElementById('red-tape-video');
  if (redTapeVideo && 'IntersectionObserver' in window) {
    var redTapeObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          redTapeVideo.play().catch(function(){});
        } else {
          redTapeVideo.pause();
        }
      });
    }, { threshold: [0.3] });
    redTapeObserver.observe(redTapeVideo);
  } else if (redTapeVideo) {
    // Fallback: start muted if IntersectionObserver is unavailable.
    redTapeVideo.play().catch(function(){});
  }

  // scroll indicators in all corners using p1–p6 images
  var porcupines = document.querySelectorAll('.porcupine');
  console.log('porcupine elements found?', porcupines.length);
  if (porcupines.length) {
    var frameCount = 6;
    var loadPromises = [];

    for (let i = 1; i <= frameCount; i++) {
      loadPromises.push(new Promise(function(resolve, reject){
        var img = new Image();
        img.onload = function(){ resolve(img); };
        img.onerror = reject;
        img.src = 'assets/images/p' + i + '.png';
      }));
    }

    Promise.all(loadPromises)
      .then(function(images){
        var maxW = 0, maxH = 0;
        images.forEach(function(img){
          maxW = Math.max(maxW, img.naturalWidth);
          maxH = Math.max(maxH, img.naturalHeight);
        });
        // determine maximum allowed size based on body's left/right padding (margin)
        var bodyStyles = getComputedStyle(document.body);
        var pad = Math.max(parseFloat(bodyStyles.paddingLeft)||0, parseFloat(bodyStyles.paddingRight)||0);
        var maxDim = pad * 0.8;
        var scale = Math.min(1, maxDim / Math.max(maxW, maxH));
        porcupines.forEach(function(p){
          p.style.width = (maxW * scale) + 'px';
          p.style.height = (maxH * scale) + 'px';
          p.style.backgroundImage = 'url("assets/images/p1.png")';
        });
        console.log('porcupine frames loaded, containers sized', maxW, maxH, 'scale', scale, 'maxDim', maxDim);
      })
      .catch(function(err){
        console.error('error loading porcupine frames', err);
      });

    window.addEventListener('scroll', function(){
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? window.scrollY / max : 0;
      var index = Math.min(frameCount - 1, Math.floor(pct * frameCount));
      porcupines.forEach(function(p){
        p.style.backgroundImage = 'url("assets/images/p' + (index + 1) + '.png")';
      });
      // update stitching lines: start as V, gradually morph into smooth curve
      var lines = document.querySelectorAll('#stitch-bg .line');
      var len = lines.length;
      var groups = Math.floor(len/2) || 1;
      lines.forEach(function(line,i){
        var g = Math.min(i, len - 1 - i);
        var start = g / groups;
        var progress = (pct - start) * groups;
        var amount = Math.min(Math.max(progress, 0), 1);
        amount = amount * amount * (3 - 2 * amount); // smoothstep
        line.style.opacity = amount > 0 ? 1 : 0;
        // want intersections to follow the shape from image map
        var spacing = window.innerWidth / (len - 1);
        var h;
        if(intersectionHeights.length === lineCount){
          // scale mapped image height to viewport
          h = intersectionHeights[i] / img.height * window.innerHeight;
        } else {
          // fallback to previous power curve if image not ready
          var midIndex = i < len/2 ? i : len-1-i;
          var maxH = window.innerHeight * 0.6;
          var baseH = 50;
          var frac = midIndex / (Math.floor(len/2) - 1 || 1);
          h = baseH + (maxH - baseH) * Math.pow(frac, 1.5);
        }
        // angle such that lines intersect at height h: tanθ = spacing/(2h)
        var theta = Math.atan(spacing / (2 * h)) * (180/Math.PI);
        var angle = (i < len/2 ? theta : -theta);
        // when not yet active, keep initial V shape
        if(amount <= 0) angle = (i < len/2 ? 45 : -45);
        // decorative skew based on activation
        var skew = (i < len/2 ? 1 : -1) * amount * 10;
        line.style.transform = 'rotate(' + angle + 'deg) skewY(' + skew + 'deg)';
      });
    });
  }
});