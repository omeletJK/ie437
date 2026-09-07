/* Lecture 2 labs follow the original source's model order.
   All results are recomputed from the displayed model and controls.
   finish/reset give a deterministic, informative PDF state. */
IE437.widget('ch02-experiments', function (host, opts) {
  var E = IE437.el, BLUE = '#2563eb', AMBER = '#d97706', GREEN = '#16a34a', INK = '#16181d', GREY = '#8b929b';
  var mode = opts.mode, W = 700, H = 290, controls = [], seed = 39;
  var names = { sampling: 'Repeat the coin experiment', poisson: 'Learn a district rate', normal: 'Combine two sources of information', categories: 'Learn category probabilities', residuals: 'Fit the same three observations', regularisation: 'Fit versus generalisation' };
  host.innerHTML = '<div class="wbar"><span class="wt">' + names[mode] + '</span><span class="wspacer"></span><span data-controls style="display:flex;align-items:center;gap:10px"></span></div>' +
    '<div class="wbody" style="flex-direction:row;align-items:center;gap:24px"><div data-plot></div>' +
    '<div data-values aria-live="polite" style="flex:1;min-width:0;font:400 14px/1.7 var(--sans)"></div></div>';
  var bar = host.querySelector('[data-controls]'), values = host.querySelector('[data-values]');
  var svg = IE437.svg(W,H); svg.setAttribute('role','img');svg.setAttribute('aria-label',names[mode]);host.querySelector('[data-plot]').appendChild(svg);
  function button(label, fn) { var b=E('button',{class:'wb',type:'button',text:label},bar); b.onclick=fn;return b; }
  function slider(label,min,max,step,value,on,fmt) {
    var d=IE437.slider(bar,{label:label,min:min,max:max,step:step,value:value,width:105,on:on,fmt:fmt});
    d.input.setAttribute('aria-label',label);
    d.input.addEventListener('keydown',function(e){if(/^(ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End|PageUp|PageDown)$/.test(e.key))e.stopPropagation();});
    controls.push(d);return d;
  }
  function text(x,y,t,c,parent,size,anchor) { return E('text',{x:x,y:y,text:t,fill:c||INK,'font-size':size||12,'text-anchor':anchor||'start','font-family':'Inter, sans-serif'},parent||svg); }
  function line(m,x,color,parent,hi) { E('line',{x1:m.X(x),x2:m.X(x),y1:m.Y(0),y2:m.Y(hi),stroke:color,'stroke-dasharray':'4 4','stroke-width':1.2},parent||svg); }
  function plot(spec,target,w) { return IE437.plot(target||svg,Object.assign({w:w||W,h:H,pad:{l:48,r:16,t:38,b:38},xfmt:function(v){return String(v);},yfmt:function(v){return v.toFixed(2);}},spec)); }
  function lin(a,b,n,fn) { return Array.from({length:n+1},function(_,i){var x=a+(b-a)*i/n;return [x,fn(x)];}); }
  function show(data,html) { host.dataset.result=JSON.stringify(data);values.innerHTML=html; }
  function normal(x,mu,sd) { return Math.exp(-.5*Math.pow((x-mu)/sd,2))/(sd*Math.sqrt(2*Math.PI)); }
  function logGamma(z) {
    var c=[676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
    if(z<.5)return Math.log(Math.PI)-Math.log(Math.sin(Math.PI*z))-logGamma(1-z);
    z-=1;var x=.99999999999980993;for(var i=0;i<c.length;i++)x+=c[i]/(z+i+1);var t=z+7.5;
    return .5*Math.log(2*Math.PI)+(z+.5)*Math.log(t)-t+Math.log(x);
  }
  function gamma(x,a,b){return x===0?0:Math.exp(a*Math.log(b)-logGamma(a)+(a-1)*Math.log(x)-b*x);}
  function gauss(r){return Math.sqrt(-2*Math.log(Math.max(1e-9,r())))*Math.cos(2*Math.PI*r());}
  var reset;

  if(mode==='sampling') {
    var sizes=[5,20,100], si=0, samples=[];
    var size=slider('tosses per experiment',0,2,1,0,function(v){si=v;drawSampling();},function(v){return String(sizes[v]);});
    button('Repeat 200',function(){seed+=101;drawSampling();});
    function drawSampling(){
      var n=sizes[si],r=IE437.rng(seed),bins=Array(21).fill(0);samples=[];
      for(var j=0;j<200;j++){var h=0;for(var i=0;i<100;i++){var hit=r()<.6;if(i<n&&hit)h++;}samples.push(h/n);bins[Math.min(20,Math.floor(h/n*20+1e-9))]++;}
      var mean=samples.reduce(function(s,v){return s+v;},0)/200;
      var variance=samples.reduce(function(s,v){return s+Math.pow(v-mean,2);},0)/200;
      var hi=Math.max.apply(null,bins)*1.18;
      var m=plot({xdom:[-.025,1.025],ydom:[0,hi],xticks:[0,.2,.4,.6,.8,1],yticks:[0,Math.round(hi/2)],yfmt:function(v){return String(v);},xlabel:'estimated head probability in each repeated experiment',series:[]});
      bins.forEach(function(v,k){E('rect',{x:m.X(k/20)-6,y:m.Y(v),width:12,height:m.Y(0)-m.Y(v),fill:BLUE,'fill-opacity':.7},svg);});
      line(m,.6,INK,svg,hi);text(48,18,'Frequency across 200 simulated experiments',BLUE);
      show({mode:mode,n:n,truth:.6,estimates:samples,mean:mean,empiricalVariance:variance,theoreticalVariance:.24/n},
        '<b>One fixed coin: θ = 0.60</b><br>New data in every repetition.<br><br>Mean estimate: <b>'+mean.toFixed(3)+'</b><br>Empirical variance: '+variance.toFixed(4)+'<br>Theoretical variance: <b>'+(.24/n).toFixed(4)+'</b><br><br>This is variability of <b>an estimator across datasets</b>, not a posterior for one dataset.');
    }
    reset=function(){seed=39;si=0;size.set(0,false);drawSampling();};
  } else if(mode==='poisson') {
    var counts=[14,13,7,10,15,15,2,13,13,11,10,13,5,13,9,12,9,12,8,7],n=20,bi=0,bs=[.2,2,20];
    var size=slider('districts observed',0,20,1,n,function(v){n=v;drawPoisson();});
    var strength=button('prior exposure b = 0.2',function(){bi=(bi+1)%3;drawPoisson();});
    function drawPoisson(){
      var sum=counts.slice(0,n).reduce(function(s,v){return s+v;},0),b0=bs[bi],a0=20*b0,a=a0+sum,b=b0+n;
      var prior=lin(0,50,1400,function(x){return gamma(x,a0,b0);}),post=lin(0,50,1400,function(x){return gamma(x,a,b);});
      var hi=1.14*Math.max.apply(null,prior.concat(post).map(function(p){return p[1];}));
      var m=plot({xdom:[0,50],ydom:[0,hi],xticks:[0,10,20,30,40,50],yticks:[0,hi/2],xlabel:'λ: expected count per comparable district',series:[{pts:prior,color:AMBER,dash:'5 4'},{pts:post,color:BLUE,w:2.6}]});
      text(48,18,'Prior density',AMBER);text(230,18,'Posterior density',BLUE);
      strength.textContent='prior exposure b = '+b0;
      var mean=a/b,variance=a/(b*b);
      show({mode:mode,n:n,counts:counts.slice(0,n),sum:sum,a0:a0,b0:b0,a:a,b:b,mean:mean,variance:variance,predictiveVariance:mean+variance},
        '<b>'+n+' districts · '+sum+' events</b><br>Prior mean stays at 20.<br><br>Posterior: Gamma('+a.toFixed(0)+', '+b.toFixed(1)+')<br>Mean rate: <b>'+mean.toFixed(3)+'</b><br>Rate SD: '+Math.sqrt(variance).toFixed(3)+'<br>New-count SD: <b>'+Math.sqrt(mean+variance).toFixed(3)+'</b><br><br>Prior weight: '+(100*b0/b).toFixed(1)+'%<br>Data weight: '+(100*n/b).toFixed(1)+'%');
    }
    reset=function(){n=20;bi=0;size.set(n,false);drawPoisson();};
  } else if(mode==='normal') {
    var n=4,ni=1,pi=1,noises=[1,3,5],priors=[.5,2,4];
    var size=slider('readings n',1,40,1,n,function(v){n=v;drawNormal();});
    var noise=button('noise SD = 3',function(){ni=(ni+1)%3;drawNormal();});
    var prior=button('prior SD = 2',function(){pi=(pi+1)%3;drawNormal();});
    function drawNormal(){
      var sig=noises[ni],tau=priors[pi],dp=n/(sig*sig),pp=1/(tau*tau),v=1/(dp+pp),mu=v*(20*pp+23*dp);
      var pts=[lin(0,43,1400,function(x){return normal(x,20,tau);}),lin(0,43,1400,function(x){return normal(x,23,sig/Math.sqrt(n));}),lin(0,43,1400,function(x){return normal(x,mu,Math.sqrt(v));})];
      var hi=1.13*Math.max.apply(null,pts.flat().map(function(p){return p[1];}));
      plot({xdom:[0,43],ydom:[0,hi],xticks:[0,10,20,30,40],yticks:[0,hi/2],xlabel:'θ: unknown mean temperature (°C)',series:[{pts:pts[0],color:AMBER,dash:'5 4'},{pts:pts[1],color:GREY,dash:'2 4'},{pts:pts[2],color:BLUE,w:2.5}]});
      text(48,18,'Prior',AMBER);text(195,18,'Normalised likelihood',GREY);text(465,18,'Posterior',BLUE);
      noise.textContent='noise SD = '+sig;prior.textContent='prior SD = '+tau;
      show({mode:mode,n:n,noiseSd:sig,priorSd:tau,sampleMean:23,mean:mu,variance:v,priorPrecision:pp,dataPrecision:dp},
        '<b>Prior centre 20°C; data average 23°C</b><br>Noise SD: '+sig+'; prior SD: '+tau+'<br><br>Prior precision: '+pp.toFixed(3)+'<br>Data precision: '+dp.toFixed(3)+'<br><br>Posterior mean: <b>'+mu.toFixed(2)+'°C</b><br>Posterior SD: <b>'+Math.sqrt(v).toFixed(3)+'</b><br><br>More precise information receives more weight.<br>The sample average stays fixed.');
    }
    reset=function(){n=4;ni=1;pi=1;size.set(4,false);drawNormal();};
  } else if(mode==='categories') {
    var counts=[6,4,0],ai=0,alphas=[1,5,20],cats=['Delivery','Pickup','Return'];
    cats.forEach(function(c,i){button('+ '+c,function(){counts[i]++;drawCategories();});});
    var prior=button('α each = 1',function(){ai=(ai+1)%3;drawCategories();});
    button('Clear',function(){counts=[0,0,0];drawCategories();});
    function drawCategories(){
      var n=counts.reduce(function(s,v){return s+v;},0),alpha=alphas[ai],a=counts.map(function(v){return alpha+v;}),total=3*alpha+n,p=a.map(function(v){return v/total;});
      var m=plot({xdom:[-.6,2.6],ydom:[0,1],xticks:[0,1,2],xfmt:function(v){return cats[v];},yticks:[0,.5,1],xlabel:'type of the next request',series:[]});
      counts.forEach(function(v,i){
        if(n)E('rect',{x:m.X(i)-40,y:m.Y(v/n),width:34,height:m.Y(0)-m.Y(v/n),fill:AMBER,'fill-opacity':.55},svg);
        E('rect',{x:m.X(i)+3,y:m.Y(p[i]),width:34,height:m.Y(0)-m.Y(p[i]),fill:BLUE},svg);
        text(m.X(i)+20,m.Y(p[i])-8,p[i].toFixed(3),BLUE,svg,12,'middle');
      });
      E('line',{x1:m.X(-.5),x2:m.X(2.5),y1:m.Y(1/3),y2:m.Y(1/3),stroke:GREY,'stroke-dasharray':'4 4'},svg);
      text(48,18,n?'Observed fraction':'No observed fractions yet',AMBER);text(355,18,'Posterior predictive probability',BLUE);
      prior.textContent='α each = '+alpha;
      show({mode:mode,n:n,counts:counts,alpha:alpha,posterior:a,probabilities:p},
        '<b>Counts: ('+counts.join(', ')+')</b><br>Prior: Dirichlet('+[alpha,alpha,alpha].join(', ')+')<br>Posterior: Dirichlet('+a.join(', ')+')<br><br>P(next is Return) = <b>'+a[2]+'/'+total+'</b><br><br>The dashed line is the prior prediction, 1/3.<br><br>'+(n?'No returns observed does not mean returns are impossible.':'With no data, predictions equal the prior.'));
    }
    reset=function(){counts=[6,4,0];ai=0;drawCategories();};
  } else if(mode==='residuals') {
    var w0=.5,w1=1;
    var intercept=slider('intercept w₀',0,3,1/6,w0,function(v){w0=v;drawResiduals();},function(v){return v.toFixed(3);});
    var slope=slider('slope w₁',-1,2,.1,w1,function(v){w1=v;drawResiduals();},function(v){return v.toFixed(2);});
    button('Fit least squares',function(){w0=7/6;w1=.5;intercept.set(w0,false);slope.set(w1,false);drawResiduals();});
    function drawResiduals(){
      var x=[0,1,2],y=[1,2,2],res=y.map(function(v,i){return v-w0-w1*x[i];}),sse=res.reduce(function(s,v){return s+v*v;},0);
      var m=plot({xdom:[-.2,2.2],ydom:[-3,8],xticks:[0,1,2],yticks:[0,2,4,6,8],xlabel:'feature x',series:[{pts:[[-.2,7/6-.1],[2.2,7/6+1.1]],color:GREEN,dash:'4 4'},{pts:[[-.2,w0-.2*w1],[2.2,w0+2.2*w1]],color:BLUE,w:2.6}]});
      x.forEach(function(v,i){E('line',{x1:m.X(v),x2:m.X(v),y1:m.Y(y[i]),y2:m.Y(w0+w1*v),stroke:AMBER,'stroke-width':3},svg);E('circle',{cx:m.X(v),cy:m.Y(y[i]),r:5,fill:INK},svg);});
      text(48,18,'Your line',BLUE);text(210,18,'Squared-error minimiser',GREEN);text(505,18,'Residuals',AMBER);
      show({mode:mode,x:x,y:y,w:[w0,w1],residuals:res,sse:sse,negativeLogLikelihoodWithoutConstant:sse/2},
        '<b>y = '+w0.toFixed(3)+' + '+w1.toFixed(3)+' x</b><br><br>Residuals:<br>('+res.map(function(v){return v.toFixed(3);}).join(', ')+')<br><br>SSE = <b>'+sse.toFixed(4)+'</b><br>Best possible SSE = 1/6<br><br>With noise variance 1:<br>−log likelihood = <b>'+ (sse/2).toFixed(4)+'</b> + constant.');
    }
    reset=function(){w0=.5;w1=1;intercept.set(w0,false);slope.set(w1,false);drawResiduals();};
  } else if(mode==='regularisation') {
    var sizes=[8,20,100],si=0,li=2,lambdas=[0,.01,.1,1,10,100],training,validation,models;
    var strength=slider('penalty λ',0,5,1,li,function(v){li=v;drawRegularisation();},function(v){return String(lambdas[v]);});
    var size=button('n = 8',function(){si=(si+1)%3;makeRegression();drawRegularisation();});
    button('New training data',function(){seed+=101;makeRegression();drawRegularisation();});
    function features(x){var p=[1,x];for(var k=2;k<=5;k++)p.push(((2*k-1)*x*p[k-1]-(k-1)*p[k-2])/k);return p;}
    function solve(A,b){
      var M=A.map(function(row,i){return row.slice().concat(b[i]);}),d=b.length;
      for(var k=0;k<d;k++){
        var pivot=k;for(var j=k+1;j<d;j++)if(Math.abs(M[j][k])>Math.abs(M[pivot][k]))pivot=j;
        var temp=M[k];M[k]=M[pivot];M[pivot]=temp;var s=M[k][k];
        for(var j=k;j<=d;j++)M[k][j]/=s;
        for(var i=0;i<d;i++)if(i!==k){var f=M[i][k];for(var j=k;j<=d;j++)M[i][j]-=f*M[k][j];}
      }return M.map(function(row){return row[d];});
    }
    function predict(w,x){return features(x).reduce(function(s,v,i){return s+v*w[i];},0);}
    function mse(w,D){return D.reduce(function(s,p){return s+Math.pow(p[1]-predict(w,p[0]),2);},0)/D.length;}
    function makeRegression(){
      var r=IE437.rng(seed),n=sizes[si];training=[];
      for(var i=0;i<n;i++){var x=-1+2*i/(n-1);training.push([x,8+11*x+2.4*gauss(r)]);}
      var vr=IE437.rng(739);validation=[];for(var i=0;i<200;i++){var x=-1+2*vr();validation.push([x,8+11*x+2.4*gauss(vr)]);}
      models=lambdas.map(function(lam){
        var A=Array.from({length:6},function(){return Array(6).fill(0);}),b=Array(6).fill(0);
        training.forEach(function(p){var f=features(p[0]);for(var i=0;i<6;i++){b[i]+=f[i]*p[1];for(var j=0;j<6;j++)A[i][j]+=f[i]*f[j];}});
        for(var i=1;i<6;i++)A[i][i]+=lam; // intercept has a flat prior; it is unpenalised.
        var w=solve(A,b);return {lambda:lam,w:w,train:mse(w,training),validation:mse(w,validation),curve:lin(-1,1,200,function(x){return predict(w,x);})};
      });
    }
    function drawRegularisation(){
      while(svg.firstChild)svg.removeChild(svg.firstChild);
      var left=E('g',{},svg),right=E('g',{transform:'translate(360,0)'},svg),model=models[li];
      var ys=[-3,19].concat(training.map(function(p){return p[1];})).concat(models.flatMap(function(m){return m.curve.map(function(p){return p[1];});}));
      var lo=Math.min.apply(null,ys)-2,hi=Math.max.apply(null,ys)+2;
      var m=plot({xdom:[-1,1],ydom:[lo,hi],xticks:[-1,0,1],yticks:[0,10,20].filter(function(v){return v>=lo&&v<=hi;}),xlabel:'feature x',series:[{pts:[[-1,-3],[1,19]],color:GREY,dash:'4 4'},{pts:model.curve,color:BLUE,w:2.5}]},left,340);
      training.forEach(function(p){E('circle',{cx:m.X(p[0]),cy:m.Y(p[1]),r:3,fill:INK},left);});
      var max=1.15*Math.max.apply(null,models.flatMap(function(m){return [m.train,m.validation];}));
      var q=plot({xdom:[0,5],ydom:[0,max],xticks:[0,1,2,3,4,5],xfmt:function(v){return String(lambdas[v]);},yticks:[0,max/2],xlabel:'penalty λ (listed settings)',series:[{pts:models.map(function(m,i){return [i,m.train];}),color:BLUE},{pts:models.map(function(m,i){return [i,m.validation];}),color:AMBER}]},right,340);
      E('circle',{cx:q.X(li),cy:q.Y(model.train),r:4,fill:BLUE},right);E('circle',{cx:q.X(li),cy:q.Y(model.validation),r:4,fill:AMBER},right);
      text(45,18,'Fit (blue) and true mean (dashed)',INK,left,11);text(48,18,'Training MSE',BLUE,right,11);text(178,18,'Validation MSE',AMBER,right,11);
      size.textContent='n = '+sizes[si];
      show({mode:mode,n:sizes[si],lambda:model.lambda,w:model.w,training:training,validation:validation,models:models.map(function(m){return {lambda:m.lambda,w:m.w,train:m.train,validation:m.validation};})},
        '<b>'+sizes[si]+' training cases · same data for every λ</b><br>Six polynomial features, degree 0–5.<br><br>Training MSE: <b>'+model.train.toFixed(3)+'</b><br>Validation MSE: <b>'+model.validation.toFixed(3)+'</b><br><br>Validation: 200 fixed, independent cases.<br><br>Increasing λ trades fit for shrinkage. Too much can underfit. The intercept is unpenalised.');
    }
    reset=function(){si=0;li=2;seed=9;strength.set(li,false);makeRegression();drawRegularisation();};
  } else { throw new Error('Unknown Lecture 2 experiment: '+mode); }
  reset();
  return {reset:reset,finish:reset};
});
