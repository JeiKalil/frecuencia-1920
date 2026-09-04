/* ============================================================
 FRECUENCIA 1920 3D — Tercera persona móvil (WebGL + Three.js r128)
 Low-Poly estilizado + Baked Lighting simulado (hemisferio + direccional
 sin sombras dinámicas + vertex AO + blob shadows) · 60 FPS gama media/baja
 Landscape fullscreen · Joysticks flotantes · Cámara con colisión
 ============================================================ */
(function(){
'use strict';
/* ---------- Utilidades ---------- */
function $(id){return document.getElementById(id);}
function clamp(v,a,b){return v<a?a:(v>b?b:v);}
function lerp(a,b,t){return a+(b-a)*t;}
function dist2D(ax,az,bx,bz){var dx=ax-bx,dz=az-bz;return Math.sqrt(dx*dx+dz*dz);}
function toast(msg,ms){var t=$('toast');t.textContent=msg;t.style.display='block';clearTimeout(t._tm);t._tm=setTimeout(function(){t.style.display='none';},ms||2600);}
function saveToast(msg){var s=$('save-toast');$('save-txt').textContent=msg;s.style.display='flex';clearTimeout(s._tm);s._tm=setTimeout(function(){s.style.display='none';},2400);}

/* ---------- Datos históricos (3 zonas del prompt) + RUTA NUMERADA ---------- */
var ZONES=[
 {name:'ZONA 1 · Garaje de Frank Conrad',sub:'Pittsburgh, EE. UU. · 1920',
  intro:'Halla las válvulas termoiónicas y el micrófono de carbón. Calibra el 8XK.',
  keyId:'audion',
  objs:[
   {id:'chispa',icon:'⚡',label:'Inspeccionar Transmisor',name:'Transmisor de chispas (obsoleto)',info:'Solo pulsos ásperos Morse. No sirve para voz.',step:1,station:'MESA 1',art:{k:'diagram',t:'Estación 8XK de Conrad · 1920',c:'Fotografía de la estación 8XK en el garaje de Conrad (1920): del chisporroteo Morse a la onda continua que haría posible la voz.'}},
   {id:'audion',icon:'🔧',label:'Calibrar Transmisor 8XK',name:'Válvula Audión ★ CLAVE',info:'El corazón que amplifica voz y música continua.',step:2,station:'MESA 2',art:{k:'valves',t:'El primer triodo Audión · 1906',c:'Fotografía del primer triodo Audión de De Forest (1906): el tubo que permitió amplificar la voz y que Conrad usó en 1920.'}},
   {id:'micro',icon:'🎙️',label:'Inspeccionar Micrófono',name:'Micrófono de carbón',info:'Captará voz y música cuando el transmisor esté listo.',step:3,station:'MESA 3',art:{k:'portrait',t:'Frank Conrad · 1921',c:'Retrato fotográfico de Frank Conrad, ingeniero de Westinghouse y pionero de la radiodifusión.'}},
   {id:'puerta',icon:'🚪',label:'Abrir puerta KDKA',name:'Puerta a KDKA',info:'Requiere +100 Hz de frecuencia.',step:4,station:'PUERTA KDKA'}
  ],
  trivia:{q:'¿Qué avance permitió transmitir voz y música continua en 1920 en lugar de solo pulsos Morse?',
   ctx:'Frank Conrad (Westinghouse) experimentaba en su garaje superando el transmisor de chispas.',
   opts:['El telégrafo por cable submarino.','El tubo de vacío / válvula termoiónica (Audión).','Los satélites de baja frecuencia.','El disco de vinilo de alta fidelidad.'],correct:1,
   ok:'¡Correcto! El Audión de Lee De Forest permitió amplificar y modular la voz. Conrad lo usó para sus emisiones.',
   bad:'No es correcto. El tubo de vacío / Audión fue la clave para pasar del Morse a la radiotelefonía.'}},
 {name:'ZONA 2 · Estación KDKA · Noche Electoral',sub:'Pittsburgh · Noviembre 1920 · Harding vs. Cox',
  intro:'Prepara la antena de transmisión en vivo. Alinea frecuencia y potencia antes del aire.',
  keyId:'consola',
  objs:[
   {id:'antena',icon:'📶',label:'Reparar Antena',name:'Antena de transmisión',info:'Sin antena no hay alcance en vivo.',step:1,station:'ANTENA 1',art:{k:'transmitter',t:'Transmisores Audión · c.1916',c:'Fotografía de los primeros transmisores Audión AM (c.1916): la misma familia tecnológica de válvulas que Westinghouse llevó a KDKA.'}},
   {id:'consola',icon:'🎚️',label:'Alinear Frecuencia',name:'Consola KDKA ★ CLAVE',info:'Frecuencia + potencia en tiempo real antes del aire.',step:2,station:'CONSOLA 2',art:{k:'kdka',t:'Estudio de KDKA · 1922',c:'Fotografía del estudio de KDKA (diciembre de 1922), heredero directo de la choza donde se transmitió la noche electoral Harding vs. Cox en 1920.'}},
   {id:'teletipo',icon:'📰',label:'Inspeccionar Teletipo',name:'Teletipo electoral',info:'Escupe resultados Harding vs. Cox.',step:3,station:'TELETIPO 3',art:{k:'newspaper',fy:0,t:'Prensa: elecciones por radio · 1920',c:'Recorte real del Saint Louis Post-Dispatch (3-nov-1920) sobre los resultados electorales recibidos por radioteléfono: el broadcasting llegaba a la prensa.'}},
   {id:'puerta',icon:'🚪',label:'Subir a la Azotea',name:'Salida a Buenos Aires',info:'Requiere +200 Hz acumulados.',step:4,station:'SALIDA AZOTEA'}
  ],
  trivia:{q:'¿Qué hito convirtió a KDKA el 2 de noviembre de 1920 en referente del broadcasting comercial?',
   ctx:'Westinghouse instaló un teletipo directo. Leo Rosenberg anunció los retornos en vivo.',
   opts:['La narración del primer combate de boxeo.','La transmisión en vivo de Harding vs. Cox.','La primera radionovela de ciencia ficción.','El primer anuncio de comida en conserva.'],correct:1,
   ok:'¡Correcto! KDKA transmitió el recuento Harding vs. Cox. Miles supieron el ganador por radio antes que por el periódico.',
   bad:'No. KDKA se consagró transmitiendo en vivo las elecciones Harding–Cox, inaugurando el periodismo radial.'}},
 {name:'ZONA 3 · Azotea del Teatro Coliseo',sub:'Buenos Aires, Argentina · Agosto 1920 · 5 watts',
  intro:'Con Los Locos de la Azotea instala el transmisor de 5W. Conecta Parsifal.',
  keyId:'parche',
  objs:[
   {id:'tx5w',icon:'📻',label:'Inspeccionar Transmisor',name:'Transmisor de 5 watts',info:'Armado con restos de un barco de guerra.',step:1,station:'EQUIPO 1',art:{k:'tx5w',t:'Teatro Coliseo · Buenos Aires',c:'Fotografía del Teatro Coliseo hacia 1910: en su azotea, Los Locos instalaron en 1920 el transmisor de 5 vatios.'}},
   {id:'parche',icon:'🔌',label:'Conectar Parches',name:'Circuito de parches ★ CLAVE',info:'Parchea FASE A/B/C para emitir Parsifal de Wagner.',step:2,station:'PARCHE 2',art:{k:'locos',t:'Pioneros de Radio Argentina · 1920',c:'Fotografía de los pioneros de Radio Argentina: Susini, Guerrico, Romero Carranza y Mujica, Los Locos de la Azotea.'}},
   {id:'micro2',icon:'🎙️',label:'Colgar Micrófono',name:'Micrófono sobre el escenario',info:'Captará a los cantantes de Parsifal.',step:3,station:'MIC 3',art:{k:'poster',t:'Parsifal · Ilustración de época',c:'Ilustración de época de Parsifal de Wagner, la ópera transmitida al público general el 27 de agosto de 1920.'}},
   {id:'puerta',icon:'🚪',label:'Ir a la Galería Legado',name:'Galería del legado',info:'Requiere +300 Hz acumulados.',step:4,station:'GALERÍA LEGADO'}
  ],
  trivia:{q:'El 27 de agosto de 1920 en Argentina, ¿qué se transmitió al público general con 5 vatios?',
   ctx:'Enrique Susini y Los Locos de la Azotea, antena improvisada en la azotea del Coliseo.',
   opts:['Un partido de fútbol internacional.','El discurso del presidente.','La ópera Parsifal de Wagner.','Un boletín meteorológico.'],correct:2,
   ok:'¡Exacto! Transmitieron Parsifal. Solo unas 20 personas con galena pudieron oírla. Pioneros en América Latina.',
   bad:'No fue eso. Fue la ópera Parsifal de Wagner, primera transmisión de arte para público general.'}},
 {name:'SALA 4 · Estudio Legado / Siglo XXI',sub:'Estación Final · Del Audión al presente',
  intro:'Galería del legado: inspecciona los 3 cuadros [1][2][3] y emite desde la antena final.',
  keyId:'',
  objs:[
   {id:'gal1',icon:'🖼️',label:'Inspeccionar Infografía',name:'Evolución de frecuencias',info:'Del Audión a la FM, del transistor al streaming.',step:1,station:'PANEL 1',art:{k:'evo',t:'1920 → Hoy: evolución de frecuencias',c:'Infografía vintage: onda media, FM, transistores y radio digital. Todo nació en 1920.'}},
   {id:'gal2',icon:'🖼️',label:'Inspeccionar Cabina',name:'Primeras cabinas profesionales',info:'Locutorio de los años 20: fieltro, carbón y relojes.',step:2,station:'PANEL 2',art:{k:'cabin',t:'Micrófono de carbón · Años 20',c:'Fotografía de un micrófono de carbón Western Electric de doble botón, como los de las primeras cabinas profesionales de los años 20.'}},
   {id:'gal3',icon:'🖼️',label:'Inspeccionar Legado',name:'Del Audión al transistor',info:'Un siglo de éter en una pared.',step:3,station:'PANEL 3',art:{k:'legacy',t:'Legado: un siglo de éter',c:'Comparativa del legado: la válvula que encendió 1920 y las voces que aún viajan por el aire.'}},
   {id:'puerta',icon:'🏆',label:'Emitir Señal Final',name:'Antena final',info:'Inspecciona los 3 paneles y emite.',step:4,station:'ANTENA FINAL'}
  ],
  trivia:null}
];

/* ---------- Tutoriales previos (tarjeta informativa flotante) ---------- */
var TUTS={
 puzzle0:{title:'Instrucciones: Calibración de Onda',
  steps:['<b>Paso 1:</b> Arrastra el <b>dial</b> a izquierda/derecha para mover la aguja.','<b>Paso 2:</b> Alinea la <b>onda roja con la onda verde</b> (zona 82–94%) hasta que el ruido desaparezca.','<b>Paso 3:</b> Observa la <b>barra de señal</b>: debe llenarse en verde y la música aclararse.','<b>Paso 4:</b> Pulsa <b>ESTABILIZAR ONDA</b> para completar.'],
  tip:'🎧 Tip: la estática baja y el Ragtime se oye nítido al acercarte al 88%.'},
 puzzle1:{title:'Instrucciones: KDKA en Vivo',
  steps:['<b>Paso 1:</b> Mueve <b>FRECUENCIA a ~75%</b> y <b>POTENCIA a ~65%</b> con los deslizadores.','<b>Paso 2:</b> Mantén ambas dentro de la <b>zona verde</b> para subir la estabilidad.','<b>Paso 3:</b> Completa antes de que el <b>reloj de emisión (30s)</b> llegue a cero.','<b>Paso 4:</b> Pulsa <b>ABRIR TRANSMISIÓN</b> cuando marque ¡EN VERDE!'],
  tip:'⏱ Tip: si se agota el tiempo pierdes 1 tubo. Ajusta primero frecuencia, luego potencia.'},
 puzzle2:{title:'Instrucciones: Parches de Parsifal',
  steps:['<b>Paso 1:</b> Toca un <b>cable</b> (FASE A / B / C) para seleccionarlo.','<b>Paso 2:</b> Toca su <b>clavija correcta</b>: A→MIC ESCENARIO, B→ANTENA AZOTEA, C→TIERRA COLISEO.','<b>Paso 3:</b> Repite hasta <b>3/3 conectados</b> en verde.','<b>Paso 4:</b> Pulsa <b>TRANSMITIR ÓPERA</b>.'],
  tip:'🔌 Tip: si marcas mal, toca ↺ REINICIAR y vuelve a parchear en orden A·B·C.'},
 trivia:{title:'Instrucciones: Trivia Histórica',
  steps:['<b>Paso 1:</b> Lee la <b>pregunta y el contexto 1920</b> con calma.','<b>Paso 2:</b> Toca una opción <b>A / B / C / D</b> (zona táctil amplia).','<b>Paso 3:</b> <b>Verde ✓</b> = +100 Hz · <b>Rojo ✗</b> = -1 tubo + estática.','<b>Paso 4:</b> Pulsa <b>CONTINUAR</b> para seguir la ruta.'],
  tip:'📚 Tip: el texto de contexto contiene la pista del hito histórico.'}
};

/* ---------- Estado global + RUTA (4 salas) ---------- */
var G={mode:'menu',zone:0,score:0,lives:3,puzzleDone:[false,false,false,true],triviaDone:[false,false,false,true],
 doorOpen:[false,false,false,false],near:null,fps:0,frames:0,fpsT:0,paused:false,clarity:0,
 visited:[{},{},{},{}],pendingTutor:null,pendingCaption:null};

/* ---------- Audio 1920 procedural (WebAudio, offline) ---------- */
var AU={ctx:null,noiseGain:null,musicGain:null,musicFilter:null,humOsc:null,started:false,clarity:0,
 init:function(){
  if(this.started)return;
  try{
   var C=window.AudioContext||window.webkitAudioContext;if(!C)return;
   this.ctx=new C();var ctx=this.ctx;
   // Ruido blanco loop (estática)
   var len=ctx.sampleRate*2,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);
   for(var i=0;i<len;i++)d[i]=Math.random()*2-1;
   var src=ctx.createBufferSource();src.buffer=buf;src.loop=true;
   var bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1800;bp.Q.value=0.6;
   this.noiseGain=ctx.createGain();this.noiseGain.gain.value=0.05;
   src.connect(bp);bp.connect(this.noiseGain);this.noiseGain.connect(ctx.destination);src.start();
   // Zumbido válvulas 55Hz + armónico
   this.humOsc=ctx.createOscillator();this.humOsc.type='sawtooth';this.humOsc.frequency.value=55;
   var hg=ctx.createGain();hg.gain.value=0.015;
   var lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=220;
   this.humOsc.connect(lp);lp.connect(hg);hg.connect(ctx.destination);this.humOsc.start();
   // Música Ragtime procedural (piano-ish, loop)
   this.musicGain=ctx.createGain();this.musicGain.gain.value=0.0;
   this.musicFilter=ctx.createBiquadFilter();this.musicFilter.type='lowpass';this.musicFilter.frequency.value=900;
   this.musicGain.connect(this.musicFilter);this.musicFilter.connect(ctx.destination);
   this.started=true;
   this.ragLoop();
  }catch(e){}
 },
 resume:function(){try{if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume();}catch(e){}},
 setClarity:function(c){ // 0 estática total → 1 nítido (la música se aclara)
  this.clarity=clamp(c,0,1);
  if(!this.started)return;
  try{
   this.noiseGain.gain.setTargetAtTime(0.09*(1-this.clarity)+0.004,this.ctx.currentTime,0.15);
   this.musicFilter.frequency.setTargetAtTime(700+3800*this.clarity,this.ctx.currentTime,0.2);
   this.musicGain.gain.setTargetAtTime(0.05+0.11*this.clarity,this.ctx.currentTime,0.2);
  }catch(e){}
 },
 click:function(){this.blip(1400,0.05,0.12,'square');},
 blip:function(f,dur,vol,type){if(!this.started)return;try{var c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.value=vol||0.15;o.connect(g);g.connect(c.destination);o.start();g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+dur);o.stop(c.currentTime+dur+0.02);}catch(e){}},
 staticBurst:function(dur){if(!this.started)return;try{this.noiseGain.gain.cancelScheduledValues(this.ctx.currentTime);this.noiseGain.gain.setValueAtTime(0.22,this.ctx.currentTime);this.noiseGain.gain.exponentialRampToValueAtTime(0.05,this.ctx.currentTime+(dur||0.4));}catch(e){}},
 ok:function(){var s=this;if(!this.started)return;[523,659,784,1046].forEach(function(f,i){setTimeout(function(){s.blip(f,0.22,0.16,'triangle');},i*110);});},
 err:function(){var s=this;if(!this.started)return;this.staticBurst(0.5);[220,174].forEach(function(f,i){setTimeout(function(){s.blip(f,0.25,0.18,'sawtooth');},i*160);});},
 victoria:function(){var s=this;[523,587,659,784,880,1046,1318].forEach(function(f,i){setTimeout(function(){s.blip(f,0.3,0.15,'triangle');},i*140);});},
 // Ragtime temprano: progresión I–VI–II–V con síncopa simple
 ragLoop:function(){
  if(!this.started)return;var self=this;
  var melody=[261,293,329,349,392,440,493,523, 587,523,493,440, 392,349,329,293, 261,329,392,523, 493,392,349,329];
  var bass=[131,110,98,82];
  var step=0;
  (function tick(){
   if(!self.started)return;
   try{
    if(G.mode==='play'||G.mode==='puzzle'||G.mode==='trivia'){
     var t=self.ctx.currentTime;
     var m=melody[step%melody.length],b=bass[Math.floor(step/4)%bass.length];
     [[m,0.22,0.5],[m*1.005,0.22,0.3],[b,0.4,0.5]].forEach(function(n){
      var o=self.ctx.createOscillator(),g=self.ctx.createGain(),f=self.ctx.createBiquadFilter();
      o.type='triangle';o.frequency.value=n[0];f.type='bandpass';f.frequency.value=n[0]*2;f.Q.value=1.2;
      // filtro vintage megáfono/teléfono: recorte graves+agudos
      g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(n[2]*0.25,t+0.02);g.gain.exponentialRampToValueAtTime(0.001,t+n[1]);
      o.connect(f);f.connect(g);g.connect(self.musicGain);o.start(t);o.stop(t+n[1]+0.05);
     });
    }
   }catch(e){}
   step++;
   setTimeout(tick, step%2===0?300:210); // swing ragtime
  })();
 }
};

/* ---------- Three.js setup (bajo consumo) ---------- */
var canvas=$('game-canvas'),renderer,scene,camera,clock;
var player,playerParts={},camYaw=0,camPitch=0.32,camDist=6.2;
var keys={},joyL={x:0,y:0,id:null,ox:0,oy:0},camT={id:null,lx:0,ly:0};
var colliders=[],interactMeshes=[],doorMesh=null,spotLight=null;
var raycaster,centerV;
try{
 renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,powerPreference:'high-performance'});
}catch(e){
 toast('WebGL no disponible en este dispositivo',4000);
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)); // gama media: cap 1.5
renderer.setSize(window.innerWidth,window.innerHeight,false);
renderer.outputEncoding=THREE.sRGBEncoding;
// Baked lighting: sin shadowMap dinámico (horneado fake con AO + blob)
renderer.shadowMap.enabled=false;
scene=new THREE.Scene();
scene.background=new THREE.Color(0x0d0a06);
scene.fog=new THREE.Fog(0x0d0a06,18,46);
camera=new THREE.PerspectiveCamera(62,window.innerWidth/window.innerHeight,0.1,120);
clock=new THREE.Clock();
// Luces horneadas: hemisferio cálido + direccional fija + punto del jugador
var hemi=new THREE.HemisphereLight(0xffe6b8,0x2a1c10,0.95);scene.add(hemi);
var dir=new THREE.DirectionalLight(0xffd98a,0.85);dir.position.set(6,10,4);scene.add(dir);
var amb=new THREE.AmbientLight(0x40342a,0.55);scene.add(amb);
raycaster=new THREE.Raycaster();centerV=new THREE.Vector2(0,0);

function onResize(){
 var w=window.innerWidth,h=window.innerHeight;
 camera.aspect=w/h;camera.updateProjectionMatrix();
 renderer.setSize(w,h,false);
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
}
window.addEventListener('resize',onResize);
window.addEventListener('orientationchange',function(){setTimeout(onResize,300);});

/* ---------- Materiales Low-Poly baratos ---------- */
function mat(color){return new THREE.MeshLambertMaterial({color:color,flatShading:true});}
function matEm(color,emissive,ei){return new THREE.MeshLambertMaterial({color:color,emissive:emissive||0x000000,emissiveIntensity:ei||1,flatShading:true});}

/* ---------- Jugador low-poly 1920 (abrigo + sombrero) ---------- */
function buildPlayer(){
 player=new THREE.Group();
 var coat=mat(0x5a4028),skin=mat(0xd8a878),hat=mat(0x2a2118),pants=mat(0x3a2e22);
 var torso=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.42,1.0,7),coat);torso.position.y=1.05;player.add(torso);
 var head=new THREE.Mesh(new THREE.SphereGeometry(0.26,8,6),skin);head.position.y=1.82;player.add(head);
 var brim=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,0.06,8),hat);brim.position.y=1.98;player.add(brim);
 var top=new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.26,0.28,8),hat);top.position.y=2.12;player.add(top);
 var legL=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.6,0.2),pants);legL.position.set(-0.14,0.32,0);player.add(legL);
 var legR=legL.clone();legR.position.x=0.14;player.add(legR);
 var armL=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.7,0.16),coat);armL.position.set(-0.44,1.1,0);player.add(armL);
 var armR=armL.clone();armR.position.x=0.44;player.add(armR);
 playerParts.legL=legL;playerParts.legR=legR;playerParts.armL=armL;playerParts.armR=armR;playerParts.torso=torso;
 // Blob shadow (baked, sin sombras dinámicas)
 var shTex=makeCircleTex();
 var blob=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.2),new THREE.MeshBasicMaterial({map:shTex,transparent:true,opacity:0.5,depthWrite:false}));
 blob.rotation.x=-Math.PI/2;blob.position.y=0.02;player.add(blob);
 // Luz cálida que sigue al jugador (válvula)
 spotLight=new THREE.PointLight(0xffc86a,0.7,9);spotLight.position.set(0,2.5,0);player.add(spotLight);
 scene.add(player);
}
function makeCircleTex(){
 var c=document.createElement('canvas');c.width=c.height=64;var g=c.getContext('2d');
 var gr=g.createRadialGradient(32,32,4,32,32,30);gr.addColorStop(0,'rgba(0,0,0,0.85)');gr.addColorStop(1,'rgba(0,0,0,0)');
 g.fillStyle=gr;g.fillRect(0,0,64,64);
 var t=new THREE.CanvasTexture(c);return t;
}

/* ---------- Construcción de zonas (expandible) + WAYPOINTS NUMERADOS ---------- */
var waypoints=[]; // {sprite,mesh,objId,step}
var routeArrow=null;
function clearZone(){
 var i;for(i=scene.children.length-1;i>=0;i--){var o=scene.children[i];
  if(o===hemi||o===dir||o===amb||o===player)continue;
  scene.remove(o);
  if(o.geometry)o.geometry.dispose();
  if(o.material&&o.material.map&&o.material.map.isCanvasTexture){try{o.material.map.dispose();}catch(e){}try{o.material.dispose();}catch(e){}}
 }
 colliders=[];interactMeshes=[];doorMesh=null;waypoints=[];routeArrow=null;
}
/* --- Ruta: estado por estación (orden secuencial) --- */
function orderedObjs(z){
 var arr=ZONES[z].objs.slice();
 arr.sort(function(a,b){return a.step-b.step;});
 return arr;
}
function isObjDone(z,objId){
 if(objId==='puerta'){
  // Puerta activa cuando trivia lista; se marca done al avanzar (zona limpiada)
  return !!(G.triviaDone[z]&&G.zone>z);
 }
 if(objId===ZONES[z].keyId)return !!G.triviaDone[z];
 return !!G.visited[z][objId];
}
function getObjState(z,objId){
 var order=orderedObjs(z);
 var idx=-1;for(var i=0;i<order.length;i++)if(order[i].id===objId)idx=i;
 if(idx<0)return 'locked';
 if(isObjDone(z,objId))return 'done';
 for(var j=0;j<idx;j++){if(!isObjDone(z,order[j].id))return 'locked';}
 // primer no-completado en orden = activo
 for(var k=0;k<order.length;k++){
  var oid=order[k].id;
  if(!isObjDone(z,oid))return (oid===objId)?'active':'locked';
 }
 return 'done';
}
function getActiveObj(z){
 var order=orderedObjs(z);
 for(var i=0;i<order.length;i++){if(!isObjDone(z,order[i].id)){
  // si los previos están done, este es el activo
  var okPrev=true;
  for(var j=0;j<i;j++)if(!isObjDone(z,order[j].id))okPrev=false;
  if(okPrev)return order[i];
 }}
 return null;
}
function getCurrentObjective(){
 var z=G.zone,act=getActiveObj(z);
 if(!act){
  if(z<2)return {text:'Ve a la puerta para avanzar de zona',objId:'puerta'};
  return {text:'¡Emite Parsifal en la antena final!',objId:'puerta'};
 }
 var zn=ZONES[z].name.split('·')[0].replace('ZONA','Zona');
 return {text:'Dirígete a '+act.station+' · '+act.name+' ('+zn.trim()+')',objId:act.id,station:act.station};
}
function updateObjectiveHUD(){
 var o=getCurrentObjective();
 $('objective-txt').textContent='Objetivo: '+o.text;
}
/* --- Sprites billboard numerados con glow --- */
function makeWaypointTexture(step,state){
 var c=document.createElement('canvas');c.width=c.height=128;var g=c.getContext('2d');
 var bg='#8a8a8a',fg='#fff',ring='#555',glow='rgba(150,150,150,0.8)',txt='['+step+']';
 if(state==='active'){bg='#e8b84a';fg='#2a1e0e';ring='#ffd25e';glow='rgba(255,210,94,0.95)';txt='['+step+']';}
 else if(state==='done'){bg='#3f8f3f';fg='#fff';ring='#7ec87e';glow='rgba(90,200,90,0.9)';txt='✓';}
 else{bg='#4a4a4a';fg='#cfcfcf';ring='#777';glow='rgba(120,120,120,0.6)';txt='🔒';}
 g.clearRect(0,0,128,128);
 g.shadowColor=glow;g.shadowBlur=22;
 g.fillStyle=bg;g.beginPath();g.arc(64,60,44,0,Math.PI*2);g.fill();
 g.shadowBlur=0;g.lineWidth=6;g.strokeStyle=ring;g.beginPath();g.arc(64,60,44,0,Math.PI*2);g.stroke();
 g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';
 if(state==='locked'){g.font='bold 34px serif';g.fillText('🔒',64,58);g.font='bold 22px Georgia';g.fillStyle='#fff';g.fillText('['+step+']',64,108);}
 else{g.font=(state==='done'?'bold 52px serif':'bold 40px Georgia');g.fillText(txt,64,62);}
 if(state==='active'){g.font='bold 18px Georgia';g.fillStyle='#ffd25e';g.fillText('▼ ¡AQUÍ!',64,114);}
 var t=new THREE.CanvasTexture(c);return t;
}
function refreshWaypoint(w){
 var st=getObjState(G.zone,w.objId);
 w.state=st;
 var tex=makeWaypointTexture(w.step,st);
 if(w.sprite.material.map)try{w.sprite.material.map.dispose();}catch(e){}
 w.sprite.material.map=tex;w.sprite.material.needsUpdate=true;
 // color del octaedro según estado
 try{
  if(st==='done')w.mesh.material.emissive.setHex(0x2f7d2f);
  else if(st==='active')w.mesh.material.emissive.setHex(0xffb840);
  else w.mesh.material.emissive.setHex(0x222222);
 }catch(e){}
}
function updateWaypoints(){
 for(var i=0;i<waypoints.length;i++)refreshWaypoint(waypoints[i]);
 // flecha sobre objetivo activo
 var act=getActiveObj(G.zone);
 if(act&&routeArrow){
  for(var j=0;j<waypoints.length;j++)if(waypoints[j].objId===act.id){
   routeArrow.visible=true;
   routeArrow.position.set(waypoints[j].mesh.position.x,3.4+Math.sin(performance.now()*0.005)*0.18,waypoints[j].mesh.position.z);
   routeArrow.rotation.y+=0.06;
   break;
  }
 }else if(routeArrow){routeArrow.visible=false;}
 updateObjectiveHUD();
}
function addWall(x,z,w,d,h,color){
 color=color||0x4a3a28;
 var m=new THREE.Mesh(new THREE.BoxGeometry(w,h||3,d),mat(color));
 m.position.set(x,(h||3)/2,z);scene.add(m);
 colliders.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});
 return m;
}
/* ---------- WALL ART: marcos vintage + FOTOS REALES (albedo sepia, aspecto original) ---------- */
var ART_ASPECT={portrait:0.75,diagram:1.33,valves:1.33,kdka:1.33,newspaper:1.1,transmitter:1.33,locos:1.26,poster:0.8,tx5w:1.33,evo:1.5,cabin:1.33,legacy:1.33,
 family:1.39,spark:1.53,phones:1.45,deforest:0.79,armstrong:0.76,orchestra:1.34,tower:0.78,receiver:1.66,superhet:2.45,superregen:0.81,
 horn:0.5,wagner:0.6,marconi:0.72,home:0.73,hall:0.6,fm:1.36,blackboard:1.0,carbon:2.38,store:1.32,wife:0.52,
 oscillator:1.39,concert1912:0.9,pasystem:1.47,fieldkit:1.32,bayreuth1900:1.5,inventors48:1.26,hangmic:1.0,console:1.5};
// Fotografía histórica real por motivo (img/ offline en APK y Pages). Sin foto → placeholder vectorial.
var ART_PHOTO={diagram:'station8xk.jpg',valves:'audion.jpg',portrait:'conrad.jpg',kdka:'kdka.jpg',
 newspaper:'press1920.jpg',transmitter:'transmitter.jpg',locos:'locos.gif',tx5w:'coliseo.jpg',
 poster:'parsifal.jpg',cabin:'mic1920.jpg',
 family:'family1920.jpg',spark:'spark1913.jpg',phones:'phones1909.jpg',deforest:'deforest.jpg',armstrong:'armstrong.jpg',
 orchestra:'orchestra20s.jpg',tower:'towerwbz.jpg',receiver:'crystalad.jpg',superhet:'superhet1920.jpg',superregen:'superregen.jpg',
 horn:'horn1920.jpg',wagner:'wagner1862.jpg',marconi:'marconi1909.jpg',home:'home1923.jpg',hall:'coliseo1953.jpg',
 fm:'fm1935.jpg',blackboard:'blackboard.jpg',carbon:'carbon1919.jpg',store:'store1926.jpg',wife:'portable1923.jpg',
 oscillator:'oscillator.png',concert1912:'concert1912.jpg',pasystem:'pasystem.jpg',fieldkit:'fieldkit.jpg',
 bayreuth1900:'bayreuth1900.jpg',inventors48:'inventors48.jpg'};
var PhotoCache={}; // archivo -> Image (o 'loading'), con cola de repintados pendientes
function upgradeArtTexture(art,repaint){
 var file=ART_PHOTO[art.k];
 if(!file)return;
 var cached=PhotoCache[file];
 if(cached&&cached!=='loading'&&cached.complete&&cached.naturalWidth){try{repaint(cached);}catch(e){}return;}
 if(cached==='loading'){(PhotoCache[file+'_q']=PhotoCache[file+'_q']||[]).push(repaint);return;}
 PhotoCache[file]='loading';PhotoCache[file+'_q']=[repaint];
 var img=new Image();
 img.onload=function(){
  PhotoCache[file]=img;
  var q=PhotoCache[file+'_q']||[];PhotoCache[file+'_q']=[];
  for(var i=0;i<q.length;i++){try{q[i](img);}catch(e){}}
 };
 img.onerror=function(){PhotoCache[file]=null;PhotoCache[file+'_q']=[];}; // conserva vectorial
 img.src='img/'+file; // relativo: file:///android_asset/ en APK, ./ en Pages
}
function grainVignette(g,W,H){
 var i;for(i=0;i<220;i++){g.fillStyle='rgba(90,70,40,'+(Math.random()*0.08)+')';g.fillRect(Math.random()*W,Math.random()*H,1.5,1.5);}
 var gr=g.createRadialGradient(W/2,H/2,Math.min(W,H)*0.35,W/2,H/2,Math.max(W,H)*0.75);
 gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(40,25,10,0.42)');
 g.fillStyle=gr;g.fillRect(0,0,W,H);
 g.strokeStyle='rgba(60,40,20,0.85)';g.lineWidth=6;g.strokeRect(3,3,W-6,H-6);
}
function paintArt(g,kind,W,H,label){
 // fondo papel archivo + dibujo sepia según hito
 g.fillStyle='#e3d3a8';g.fillRect(0,0,W,H);
 g.fillStyle='#d5c096';g.fillRect(0,H-30,W,30);
 g.fillStyle='#2a2118';g.font='bold '+(W>240?'13px':'11px')+' Georgia';g.textAlign='center';
 g.fillText(label||'',W/2,H-11);
 var ink='#3a2c1a',soft='#6b5230',gold='#8a6d2a';
 g.strokeStyle=ink;g.fillStyle=ink;
  if(kind==='portrait'||kind==='deforest'||kind==='armstrong'||kind==='wagner'||kind==='marconi'||kind==='fieldkit'){
  g.fillStyle='#c9b183';g.beginPath();g.arc(W/2,H*0.36,Math.min(W,H)*0.17,0,Math.PI*2);g.fill();
  g.fillStyle='#8a6f45';g.beginPath();g.arc(W/2,H*0.33,Math.min(W,H)*0.125,0,Math.PI*2);g.fill();
  g.fillStyle='#4a3823';g.fillRect(W*0.28,H*0.62,W*0.44,H*0.24);
  g.fillStyle='#2a2118';g.fillRect(W*0.44,H*0.62,W*0.12,H*0.24);
  g.strokeStyle=soft;g.lineWidth=2;g.strokeRect(W*0.14,H*0.08,W*0.72,H*0.78);
  g.font='italic 11px Georgia';g.fillStyle=soft;g.fillText('taller · 1920',W/2,H*0.16);
 }else if(kind==='diagram'||kind==='oscillator'){
  g.strokeStyle=ink;g.lineWidth=2;
  g.strokeRect(W*0.12,H*0.14,W*0.76,H*0.6);
  g.beginPath();g.moveTo(W*0.12,H*0.44);g.lineTo(W*0.88,H*0.44);g.stroke();
  g.beginPath();g.arc(W*0.5,H*0.44,16,0,Math.PI*2);g.stroke();
  g.beginPath();g.moveTo(W*0.5,H*0.2);g.lineTo(W*0.5,H*0.68);g.stroke();
  for(var i=0;i<3;i++){g.beginPath();g.moveTo(W*(0.24+i*0.13),H*0.6);g.lineTo(W*(0.24+i*0.13),H*0.68);g.stroke();}
  g.font='bold 13px Georgia';g.fillText('8XK',W/2,H*0.3);
  g.font='10px Georgia';g.fillStyle=soft;g.fillText('ANT · TIERRA',W/2,H*0.7);
 }else if(kind==='valves'||kind==='carbon'){
  for(var v=0;v<3;v++){var x=W*(0.25+v*0.25);
   g.fillStyle='#8a6f45';g.fillRect(x-14,H*0.62,28,10);
   g.fillStyle='#efe0b8';g.fillRect(x-11,H*0.3,22,H*0.32);
   g.fillStyle='#ffb84d';g.beginPath();g.arc(x,H*0.46,7,0,Math.PI*2);g.fill();}
  g.fillStyle='#4a3823';
  for(var d=0;d<2;d++){g.beginPath();g.arc(W*(0.32+d*0.36),H*0.82,13,0,Math.PI*2);g.fill();}
 }else if(kind==='kdka'){
  g.fillStyle='#4a3823';g.fillRect(W*0.1,H*0.55,W*0.8,H*0.2);
  for(var p=0;p<2;p++){var px=W*(0.32+p*0.36);
   g.fillStyle='#8a6f45';g.beginPath();g.arc(px,H*0.42,14,0,Math.PI*2);g.fill();
   g.fillStyle='#4a3823';g.fillRect(px-16,H*0.55,32,H*0.1);}
  g.fillStyle='#a93226';g.fillRect(W*0.36,H*0.12,W*0.28,20);
  g.fillStyle='#fff';g.font='bold 12px Georgia';g.fillText('ON AIR',W/2,H*0.12+15);
 }else if(kind==='newspaper'||kind==='concert1912'){
  g.fillStyle='#2a2118';g.font='bold 15px Georgia';g.fillText('RADIO DAILY',W/2,H*0.18);
  g.fillRect(W*0.1,H*0.24,W*0.8,2);
  for(var c=0;c<3;c++){var cx=W*(0.14+c*0.26);
   g.fillStyle='#6b5230';for(var l=0;l<6;l++)g.fillRect(cx,H*(0.3+l*0.07),W*0.2,3);}
  g.fillStyle='#a93226';g.font='bold 11px Georgia';g.fillText('¡BROADCASTING!',W/2,H*0.82);
 }else if(kind==='transmitter'||kind==='superhet'||kind==='superregen'||kind==='fm'||kind==='pasystem'){
  g.fillStyle='#4a3823';g.fillRect(W*0.2,H*0.45,W*0.3,H*0.3);
  g.fillStyle='#2a2118';g.fillRect(W*0.55,H*0.2,8,H*0.55);
  g.strokeStyle=soft;for(var a=0;a<3;a++){g.beginPath();g.moveTo(W*0.55+4,H*(0.3+a*0.1));g.lineTo(W*0.55+34-a*8,H*(0.3+a*0.1));g.stroke();}
  g.fillStyle=gold;g.beginPath();g.arc(W*0.55+4,H*0.18,5,0,Math.PI*2);g.fill();
 }else if(kind==='locos'||kind==='inventors48'){
  g.strokeStyle=soft;g.beginPath();g.moveTo(W*0.08,H*0.7);g.lineTo(W*0.92,H*0.7);g.stroke();
  for(var q=0;q<4;q++){var qx=W*(0.2+q*0.2);
   g.fillStyle='#8a6f45';g.beginPath();g.arc(qx,H*0.5,13,0,Math.PI*2);g.fill();
   g.fillStyle='#4a3823';g.fillRect(qx-14,H*0.62,28,10);}
  g.font='10px Georgia';g.fillStyle=soft;g.fillText('azotea · 1920',W/2,H*0.85);
 }else if(kind==='poster'){
  g.strokeStyle=ink;g.lineWidth=3;g.beginPath();g.arc(W/2,H*0.52,W*0.34,Math.PI,0);g.stroke();
  g.beginPath();g.moveTo(W*0.16,H*0.52);g.lineTo(W*0.16,H*0.72);g.moveTo(W*0.84,H*0.52);g.lineTo(W*0.84,H*0.72);g.stroke();
  g.font='bold 17px Georgia';g.fillText('PARSIFAL',W/2,H*0.3);
  g.font='11px Georgia';g.fillStyle=soft;g.fillText('COLISEO',W/2,H*0.38);
 }else if(kind==='tx5w'){
  g.fillStyle='#4a5a4a';g.fillRect(W*0.16,H*0.5,W*0.3,H*0.25);
  g.fillStyle='#2a2118';g.fillRect(W*0.6,H*0.25,7,H*0.5);
  g.strokeStyle=soft;g.beginPath();g.moveTo(W*0.31,H*0.55);g.quadraticCurveTo(W*0.5,H*0.4,W*0.6,H*0.5);g.stroke();
  g.fillStyle=gold;g.beginPath();g.arc(W*0.6+3,H*0.23,5,0,Math.PI*2);g.fill();
  g.font='bold 12px Georgia';g.fillText('5 W',W*0.31,H*0.45);
 }else if(kind==='evo'){
  var yrs=['1920','1940','1970','HOY'];
  g.strokeStyle=ink;g.lineWidth=3;g.beginPath();g.moveTo(W*0.08,H*0.45);g.lineTo(W*0.92,H*0.45);g.stroke();
  for(var y=0;y<4;y++){var yx=W*(0.12+y*0.25);
   g.fillStyle=y===0||y===3?gold:'#4a3823';g.beginPath();g.arc(yx,H*0.45,9,0,Math.PI*2);g.fill();
   g.fillStyle='#fff';if(y===3){g.font='bold 8px Georgia';g.fillText('▶',yx,H*0.48);}
   g.fillStyle=soft;g.font='10px Georgia';g.fillText(yrs[y],yx,H*0.65);}
 }else if(kind==='cabin'){
  g.fillStyle='#5a4632';g.fillRect(W*0.1,H*0.15,W*0.8,H*0.6);
  g.fillStyle='#2a2118';g.fillRect(W*0.14,H*0.19,W*0.3,H*0.5);
  g.fillStyle='#c9b183';g.beginPath();g.arc(W*0.62,H*0.42,12,0,Math.PI*2);g.fill();
  g.fillStyle='#4a3823';g.fillRect(W*0.6,H*0.55,5,H*0.14);
  g.strokeStyle='#e8d9b0';g.beginPath();g.arc(W*0.82,H*0.28,10,0,Math.PI*2);g.stroke();
 }else if(kind==='family'){
  g.fillStyle='#4a3823';g.fillRect(W*0.3,H*0.45,W*0.4,H*0.25);
  g.fillStyle='#8a6f45';
  for(var f=0;f<3;f++){g.beginPath();g.arc(W*(0.36+f*0.14),H*0.38,11,0,Math.PI*2);g.fill();}
  g.fillStyle='#2a2118';g.fillRect(W*0.42,H*0.5,W*0.16,H*0.2);
 }else if(kind==='spark'){
  g.strokeStyle=ink;g.lineWidth=2;
  for(var sp=0;sp<2;sp++){var sx=W*(0.28+sp*0.3);
   g.strokeRect(sx-22,H*0.3,44,H*0.35);
   g.beginPath();g.moveTo(sx-14,H*0.42);g.lineTo(sx-6,H*0.5);g.lineTo(sx-14,H*0.58);g.stroke();
   g.beginPath();g.moveTo(sx+14,H*0.42);g.lineTo(sx+6,H*0.5);g.lineTo(sx+14,H*0.58);g.stroke();}
 }else if(kind==='phones'){
  g.strokeStyle=ink;g.lineWidth=4;g.beginPath();g.arc(W/2,H*0.62,W*0.24,Math.PI,0);g.stroke();
  g.fillStyle='#4a3823';
  g.fillRect(W*0.2,H*0.5,W*0.09,H*0.2);g.fillRect(W*0.71,H*0.5,W*0.09,H*0.2);
  g.strokeStyle=soft;g.lineWidth=1.5;
  g.beginPath();g.moveTo(W*0.24,H*0.7);g.quadraticCurveTo(W*0.3,H*0.85,W*0.5,H*0.82);g.stroke();
 }else if(kind==='stage'||kind==='orchestra'){
  g.fillStyle='#6b3a2a';g.fillRect(W*0.08,H*0.12,W*0.84,H*0.12);
  g.fillStyle='#8a6f45';
  for(var mu=0;mu<4;mu++){g.beginPath();g.arc(W*(0.24+mu*0.17),H*0.5,10,0,Math.PI*2);g.fill();
   g.fillRect(W*(0.24+mu*0.17)-8,H*0.58,16,14);}
  g.fillStyle='#2a2118';g.beginPath();g.arc(W*0.5,H*0.32,12,0,Math.PI*2);g.fill();
  g.fillRect(W*0.48,H*0.36,4,H*0.3);
 }else if(kind==='mast'||kind==='tower'){
  g.strokeStyle=ink;g.lineWidth=2.5;
  g.beginPath();g.moveTo(W*0.5,H*0.85);g.lineTo(W*0.42,H*0.15);g.moveTo(W*0.5,H*0.85);g.lineTo(W*0.58,H*0.15);g.stroke();
  for(var cr=0;cr<5;cr++){var cy=H*(0.78-cr*0.12);
   g.beginPath();g.moveTo(W*(0.5-(0.5-0.42)*(0.85-0.78+cr*0.12)/0.7),cy);g.lineTo(W*(0.5+(0.5-0.42)*(0.85-0.78+cr*0.12)/0.7),cy);g.stroke();}
  g.strokeStyle=soft;g.lineWidth=1.5;
  g.beginPath();g.moveTo(W*0.42,H*0.15);g.quadraticCurveTo(W*0.2,H*0.3,W*0.08,H*0.6);g.stroke();
  g.beginPath();g.moveTo(W*0.58,H*0.15);g.quadraticCurveTo(W*0.8,H*0.3,W*0.92,H*0.6);g.stroke();
 }else if(kind==='receiver'||kind==='store'||kind==='wife'){
  g.fillStyle='#5a4028';g.fillRect(W*0.18,H*0.35,W*0.5,H*0.35);
  g.fillStyle='#2a2118';
  g.beginPath();g.arc(W*0.3,H*0.52,10,0,Math.PI*2);g.fill();
  g.beginPath();g.arc(W*0.44,H*0.52,10,0,Math.PI*2);g.fill();
  g.fillStyle='#8a6f45';g.fillRect(W*0.56,H*0.42,W*0.06,H*0.2);
  g.strokeStyle=ink;g.lineWidth=3;g.beginPath();g.arc(W*0.78,H*0.55,14,Math.PI*0.9,Math.PI*2.1);g.stroke();
 }else if(kind==='horn'){
  g.fillStyle='#2a2118';g.fillRect(W*0.4,H*0.62,W*0.2,H*0.2);
  g.fillStyle='#8a6f45';g.beginPath();g.moveTo(W*0.5,H*0.62);g.lineTo(W*0.2,H*0.2);g.lineTo(W*0.8,H*0.2);g.closePath();g.fill();
  g.fillStyle='#c9b183';g.beginPath();g.ellipse(W*0.5,H*0.2,W*0.3,7,0,0,Math.PI*2);g.fill();
 }else if(kind==='home'){
  g.fillStyle='#5a4028';g.fillRect(W*0.2,H*0.6,W*0.6,H*0.08);
  g.fillStyle='#4a3823';g.fillRect(W*0.32,H*0.42,W*0.24,H*0.18);
  g.fillStyle='#8a6f45';g.beginPath();g.arc(W*0.68,H*0.36,13,0,Math.PI*2);g.fill();
  g.fillStyle='#2a2118';g.beginPath();g.arc(W*0.24,H*0.4,11,0,Math.PI*2);g.fill();
  g.fillRect(W*0.16,H*0.5,16,22);
 }else if(kind==='hall'||kind==='bayreuth1900'){
  g.fillStyle='#6b5a4a';g.fillRect(W*0.1,H*0.25,W*0.8,H*0.5);
  g.fillStyle='#3a2c1a';
  for(var co=0;co<4;co++)g.fillRect(W*(0.16+co*0.2),H*0.32,W*0.05,H*0.36);
  g.fillStyle='#a93226';g.fillRect(W*0.1,H*0.2,W*0.8,14);
  g.fillStyle='#ffe9b0';g.font='bold 10px Georgia';g.fillText('★ ★ ★',W/2,H*0.2+11);
 }else if(kind==='lecture'||kind==='blackboard'){
  g.strokeStyle=ink;g.lineWidth=2;g.strokeRect(W*0.12,H*0.15,W*0.6,H*0.45);
  g.beginPath();g.moveTo(W*0.16,H*0.5);g.lineTo(W*0.68,H*0.28);g.stroke();
  g.fillStyle='#4a3823';g.beginPath();g.arc(W*0.82,H*0.45,11,0,Math.PI*2);g.fill();
  g.fillRect(W*0.75,H*0.55,14,20);
 }else if(kind==='hangmic'){
  g.strokeStyle=soft;g.lineWidth=2;
  g.beginPath();g.moveTo(0,H*0.06);g.lineTo(W,H*0.06);g.stroke();
  g.beginPath();g.moveTo(W*0.5,H*0.06);g.lineTo(W*0.5,H*0.3);g.stroke();
  for(var hm=-1;hm<=1;hm+=2){g.beginPath();g.moveTo(W*0.5+hm*4,H*0.3);g.quadraticCurveTo(W*0.5+hm*22,H*0.42,W*0.5+hm*16,H*0.55);g.stroke();}
  g.fillStyle='#4a3823';g.fillRect(W*0.5-13,H*0.42,26,34);
  g.fillStyle='#8a6f45';g.beginPath();g.arc(W*0.5,H*0.5,7,0,Math.PI*2);g.fill();
  g.fillStyle='#c9b183';g.beginPath();g.ellipse(W*0.5,H*0.78,26,10,0,0,Math.PI*2);g.fill();
 }else if(kind==='console'){
  g.fillStyle='#3a3226';g.fillRect(W*0.12,H*0.45,W*0.76,H*0.3);
  g.fillStyle='#20180f';g.fillRect(W*0.12,H*0.3,W*0.76,H*0.18);
  g.fillStyle='#c9b183';
  for(var kn=0;kn<5;kn++){g.beginPath();g.arc(W*(0.24+kn*0.13),H*0.39,7,0,Math.PI*2);g.fill();}
  g.fillStyle='#53d853';g.fillRect(W*0.2,H*0.55,10,6);
  g.fillStyle='#d85353';g.fillRect(W*0.32,H*0.55,10,6);
  g.fillStyle='#8a6f45';
  for(var f2=0;f2<3;f2++)g.fillRect(W*(0.5+f2*0.12),H*0.52,W*0.03,H*0.16);
 }else{ // legacy
  g.fillStyle='#efe0b8';g.fillRect(W*0.14,H*0.3,26,H*0.35);
  g.fillStyle='#ffb84d';g.beginPath();g.arc(W*0.14+13,H*0.45,8,0,Math.PI*2);g.fill();
  g.fillStyle='#2a2118';g.fillRect(W*0.62,H*0.45,30,16);
  g.strokeStyle=gold;g.lineWidth=2;
  for(var wv=0;wv<3;wv++){g.beginPath();for(var xx=0;xx<=40;xx+=4){var yy=H*(0.75+wv*0.05)+Math.sin(xx*0.3)*4;if(xx===0)g.moveTo(W*0.3+xx,yy);else g.lineTo(W*0.3+xx,yy);}g.stroke();}
 }
 grainVignette(g,W,H);
}
function drawArtLabel(g,art,W,H){
 g.fillStyle='#d5c096';g.fillRect(0,H,W,30);
 g.fillStyle='#2a2118';g.font='bold '+(W>240?'13px':'11px')+' Georgia';g.textAlign='center';
 var t=art.t||'';
 if(g.measureText(t).width>W-12){while(t.length>4&&g.measureText(t+'…').width>W-12)t=t.slice(0,-1);t+='…';}
 g.fillText(t,W/2,H+19);
}
function repaintPhoto(g,art,img,W,H){
 // Foto real con aspect-lock (cover, SIN estirar) + acabado sepia de época.
 // art.fy: punto focal vertical 0=arriba, 0.5=centro (p.ej. recorte de prensa: titular).
 var iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;
 if(!iw||!ih)return false;
 var s=Math.max(W/iw,H/ih),dw=iw*s,dh=ih*s;
 var fy=(art.fy!==undefined)?art.fy:0.5;
 try{
  g.save();
  try{g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';}catch(e){}
  g.drawImage(img,(W-dw)/2,(H-dh)*fy,dw,dh);
  var toned=false;
  try{
   var id=g.getImageData(0,0,W,H),px=id.data;
   for(var i=0;i<px.length;i+=4){
    var r=px[i],gg=px[i+1],b=px[i+2];
    var tr=0.393*r+0.769*gg+0.189*b,tg=0.349*r+0.686*gg+0.168*b,tb=0.272*r+0.534*gg+0.131*b;
    px[i]=Math.min(255,(r+(tr-r)*0.55)*1.04);
    px[i+1]=Math.min(255,(gg+(tg-gg)*0.55)*1.04);
    px[i+2]=Math.min(255,(b+(tb-b)*0.55)*1.04);
   }
   g.putImageData(id,0,0);toned=true;
  }catch(e){toned=false;}
  if(!toned){g.fillStyle='rgba(150,110,55,0.28)';g.fillRect(0,0,W,H);} // tinte sepia (canvas file://)
  g.restore();
 }catch(e){return false;}
 return true;
}
function makeArtTexture(art){
 var asp=ART_ASPECT[art.k]||1.33;
 var W=256,H=Math.round(256/asp);
 var c=document.createElement('canvas');c.width=W;c.height=H+30;
 var g=c.getContext('2d');
 paintArt(g,art.k,W,H,art.t); // placeholder vectorial inmediato (offline/fallback)
 var t=new THREE.CanvasTexture(c);
 // mejora progresiva: foto histórica real cuando cargue img/<archivo>
 upgradeArtTexture(art,function(img){
  if(!repaintPhoto(g,art,img,W,H))return; // conserva vectorial si falla
  drawArtLabel(g,art,W,H);
  grainVignette(g,W,H+30);
  t.needsUpdate=true;
 });
 return {tex:t,asp:asp};
}
function makeFrameMesh(art,maxW,maxH){
 // marco madera vintage + panel albedo sepia, aspecto original preservado
 var info=makeArtTexture(art),asp=info.asp;
 var pw=maxW,ph=maxW/asp;
 if(ph>maxH){ph=maxH;pw=maxH*asp;}
 var grp=new THREE.Group();
 var fw=pw+0.28,fh=ph+0.28;
 var frame=new THREE.Mesh(new THREE.BoxGeometry(fw,fh,0.09),mat(0x5a4028));
 grp.add(frame);
 var inner=new THREE.Mesh(new THREE.BoxGeometry(fw-0.12,fh-0.12,0.1),mat(0xb8934a));
 inner.position.z=0.005;grp.add(inner);
 var artM=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),new THREE.MeshLambertMaterial({map:info.tex}));
 artM.position.z=0.06;grp.add(artM);
 // luz cálida sutil sobre el cuadro (integra con ambiente)
 grp.userData.w=pw;grp.userData.h=ph;
 return grp;
}
function placeGallery(list){
 // list: [{x,y,z,ry,art}] cuadros en paredes
 list.forEach(function(f){
  var m=makeFrameMesh(f.art,2.5,1.9);
  m.position.set(f.x,f.y,f.z);m.rotation.y=f.ry||0;
  scene.add(m);
 });
}
function addProp(mesh,x,z,ry){mesh.position.x=x;mesh.position.z=z;if(ry)mesh.rotation.y=ry;scene.add(mesh);return mesh;}
function makeTable(){
 var g=new THREE.Group();
 var top=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.12,1.1),mat(0x6b4a2a));top.position.y=0.95;g.add(top);
 [[-1,-0.45],[1,-0.45],[-1,0.45],[1,0.45]].forEach(function(p){
  var l=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.95,0.12),mat(0x3a2a18));l.position.set(p[0],0.48,p[1]);g.add(l);});
 return g;
}
function makeValve(glow){
 var g=new THREE.Group();
 var base=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.34,0.18,7),mat(0x2a2118));base.position.y=0.09;g.add(base);
 var glass=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.26,0.7,7),matEm(0xc8b890,0xff9a3c,glow?0.9:0.25));
 glass.position.y=0.55;g.add(glass);
 var tip=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,5),matEm(0xffe6b8,0xffc86a,glow?1:0.2));tip.position.y=0.95;g.add(tip);
 g.userData.glass=glass;g.userData.tip=tip;
 return g;
}
function makeAntenna(){
 var g=new THREE.Group();
 var pole=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.12,4.2,6),mat(0x555049));pole.position.y=2.1;g.add(pole);
 for(var i=0;i<3;i++){var arm=new THREE.Mesh(new THREE.BoxGeometry(1.6-i*0.4,0.06,0.06),mat(0x777066));arm.position.y=3.9-i*0.4;g.add(arm);}
 var tip=new THREE.Mesh(new THREE.SphereGeometry(0.14,6,5),matEm(0xff5544,0xff2222,1));tip.position.y=4.3;g.add(tip);
 g.userData.tip=tip;return g;
}
function makeInteractMarker(color){
 var m=new THREE.Mesh(new THREE.OctahedronGeometry(0.3,0),matEm(color||0xffd25e,0xffb840,0.9));
 return m;
}
function buildZone(idx){
 clearZone();
 var W=26,D=20;
 // Suelo: damero vintage (canvas texture, baked)
 var floorTex=makeFloorTex(idx);
 var floor=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshLambertMaterial({map:floorTex}));
 floor.rotation.x=-Math.PI/2;scene.add(floor);
 // Paredes perimetrales con hueco de puerta al fondo (gap z -0.5..2.5)
 addWall(0,-D/2,W,1,3.4);addWall(0,D/2,W,1,3.4);
 addWall(-W/2,0,1,D,3.4);addWall(W/2,-5.25,1,9.5,3.4);addWall(W/2,6.25,1,7.5,3.4);
 // Puerta dorada al fondo (desbloqueo por Hz)
 var dg=new THREE.Mesh(new THREE.BoxGeometry(3,3.2,0.4),matEm(0xb8934a,0x664400,G.doorOpen[idx]?0.5:0.05));
 dg.position.set(W/2-0.2,1.6,1);scene.add(dg);doorMesh=dg;
 // Contenido por zona
 var defs=ZONES[idx].objs;
 interactMeshes=[];
 if(idx===0){
  // Garaje Conrad: mesas, válvulas, chispas, mic
  addProp(makeTable(),-6,-4);addProp(makeTable(),0,-4);addProp(makeTable(),6,-4);
  var v1=makeValve(true);addProp(v1,-6,-4);v1.position.y=1.0;
  var v2=makeValve(false);addProp(v2,0,-4);v2.position.y=1.0;
  var coil=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.14,6,10),mat(0x8a6f3e));addProp(coil,6,-3.4);coil.position.y=1.4;coil.rotation.x=0.4;
  var ant=makeAntenna();addProp(ant,9,6);
  addProp(makeTable(),-8,5);
  placeInteracts([[-6,-2.6,'audion'],[6,-2.2,'chispa'],[-8,5,'micro'],[W/2-2,1,'puerta']]);
  addSign('8XK · GARAJE CONRAD',0,3.2,-D/2+0.6);
  // Galería época Sala 1 (pared norte, sepia, aspecto original)
  placeGallery([
   {x:-7,y:2.0,z:-D/2+0.6,ry:0,art:ZONES[0].objs[0].art},
   {x:0,y:2.0,z:-D/2+0.6,ry:0,art:ZONES[0].objs[1].art},
   {x:7,y:2.0,z:-D/2+0.6,ry:0,art:ZONES[0].objs[2].art}
  ]);
  // Laterales Sala 1 (pared de la puerta despejada): sur 3 + oeste 2, eye-level
  placeGallery([
   {x:-7,y:2.0,z:D/2-0.6,ry:Math.PI,art:{k:'family',t:'La radio en familia · Años 20',c:'Fotografía de una familia escuchando la radio con altavoz: el nuevo ritual del hogar en los años 20.'}},
   {x:0,y:2.0,z:D/2-0.6,ry:Math.PI,art:{k:'spark',t:'Transmisor de chispa · 1913',c:'Fotografía del transmisor de chispa rotativo de la Marina en Arlington (1913): pulsos Morse de 100 kW, sin voz.'}},
   {x:7,y:2.0,z:D/2-0.6,ry:Math.PI,art:{k:'phones',t:'Auriculares inalámbricos · 1909',c:'Aviso de 1909 de auriculares Holtzer-Cabot para telegrafía sin hilos: antes del altavoz, la radio se oía en diadema.'}},
   {x:-W/2+0.6,y:2.0,z:-4,ry:Math.PI/2,art:{k:'deforest',t:'Lee de Forest · Inventor del Audión',c:'Retrato fotográfico de Lee de Forest junto a uno de sus inventos: su Audión de 1906 hizo posible amplificar la voz.'}},
   {x:-W/2+0.6,y:2.0,z:3,ry:Math.PI/2,art:{k:'armstrong',t:'Edwin Armstrong · Regeneración y FM',c:'Retrato de Edwin Armstrong, inventor del circuito regenerativo, el superheterodino y la FM.'}}
  ]);
  // Pared de la puerta Sala 1 (este): 1 izq + 1 der, paso central libre
  placeGallery([
   {x:W/2-0.6,y:2.0,z:-5.25,ry:-Math.PI/2,art:{k:'oscillator',t:'Oscilador regenerativo · Patente',c:'Esquema de realimentación de Armstrong: el dibujo de patente que hizo oscilar a la válvula y nacer la onda continua.'}},
   {x:W/2-0.6,y:2.0,z:6.25,ry:-Math.PI/2,art:{k:'concert1912',fy:0,t:'Conciertos por radioteléfono · 1912',c:'Prensa de 1912 anunciando conciertos por radioteléfono: así se enteraba el público de las emisiones, como las nocturnas de 8XK en 1920.'}}
  ]);
 }else if(idx===1){
  // KDKA: consola, teletipo, antena
  var cons=new THREE.Group();
  var box=new THREE.Mesh(new THREE.BoxGeometry(3,1.1,1),mat(0x2e3a4a));box.position.y=0.55;cons.add(box);
  for(var i=0;i<5;i++){var btn=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.1),matEm(i%2?0x53d853:0xd85353,0x000000,0));btn.position.set(-1+i*0.5,1.2,0.3);cons.add(btn);}
  var lamp=new THREE.Mesh(new THREE.SphereGeometry(0.16,6,5),matEm(0xffe6b8,0xff2222,1));lamp.position.set(0,1.6,0);cons.add(lamp);cons.userData.lamp=lamp;
  addProp(cons,0,-5);
  addProp(makeTable(),-7,-3);addProp(makeTable(),7,-3);
  var tel=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.2,1),mat(0xd8cba8));addProp(tel,-7,-3);tel.position.y=1.6;
  var ant2=makeAntenna();addProp(ant2,9,6);
  placeInteracts([[0,-3.4,'consola'],[-7,-1.6,'teletipo'],[9,4.6,'antena'],[W/2-2,1,'puerta']]);
  addSign('KDKA · ON AIR · HARDING vs COX',0,3.2,-D/2+0.6);
  placeGallery([
   {x:-7,y:2.0,z:-D/2+0.6,ry:0,art:ZONES[1].objs[0].art},
   {x:0,y:2.0,z:-D/2+0.6,ry:0,art:ZONES[1].objs[1].art},
   {x:7,y:2.0,z:-D/2+0.6,ry:0,art:ZONES[1].objs[2].art}
  ]);
  // Laterales Sala 2: sur 3 + oeste 2 (puerta este despejada)
  placeGallery([
   {x:-7,y:2.0,z:D/2-0.6,ry:Math.PI,art:{k:'orchestra',t:'Orquesta ante el micrófono · Años 20',c:'Fotografía de una cantante con orquesta grabando ante el micrófono (estudio HMV, Sídney, ca.1928-1932): la música en vivo entraba a la radio.'}},
   {x:0,y:2.0,z:D/2-0.6,ry:Math.PI,art:{k:'tower',t:'Antena WBZ de Westinghouse · 1925',c:'Fotografía de la antena en T de la estación WBZ de Westinghouse (1925): torres como las que llevaron el broadcasting al aire.'}},
   {x:7,y:2.0,z:D/2-0.6,ry:Math.PI,art:{k:'receiver',t:'Radio de galena · Aviso de época',c:'Aviso de época de una radio de galena: el receptor hogareño de madera y piedra que llevó KDKA a miles de salas.'}},
   {x:-W/2+0.6,y:2.0,z:-4,ry:Math.PI/2,art:{k:'superhet',t:'Superheterodino · Prototipo 1920',c:'Fotografía del prototipo de receptor superheterodino de Armstrong (1920), base de los receptores comerciales.'}},
   {x:-W/2+0.6,y:2.0,z:3,ry:Math.PI/2,art:{k:'superregen',t:'Armstrong y su superregenerativo',c:'Fotografía de Edwin Armstrong junto a su receptor superregenerativo: sintonía fina para la era del broadcast.'}}
  ]);
  // Pared de la puerta Sala 2 (este): 1 izq + 1 der, paso central libre
  placeGallery([
   {x:W/2-0.6,y:2.0,z:-5.25,ry:-Math.PI/2,art:{k:'pasystem',t:'Megafonía por válvulas · c.1920',c:'Fotografía de una cadena de megafonía electrónica por válvulas (c.1920): micrófono, amplificador de 6 tubos y bocina, con sus llaves y perillas.'}},
   {x:W/2-0.6,y:2.0,z:6.25,ry:-Math.PI/2,art:{k:'fieldkit',t:'Radio de campaña · 1906',c:'Fotografía de un técnico Marconi con equipo de campaña en Inglaterra (1906): la radio portátil en exteriores.'}}
  ]);
 }else if(idx===2){
  // Azotea Coliseo: parapetos, tx 5W, cúpula teatro, cielo nocturno + ciudad
  addWall(-4,-2,6,0.6,1.1,0x6b5a4a);addWall(4,-2,6,0.6,1.1,0x6b5a4a);
  var tx=new THREE.Group();
  var b1=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.3,1),mat(0x3a4a3a));b1.position.y=0.65;tx.add(b1);
  var dial=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,0.15,8),matEm(0xffe6b8,0xffc86a,0.6));dial.rotation.x=Math.PI/2;dial.position.set(0,0.9,0.55);tx.add(dial);
  addProp(tx,-5,-4);
  var dome=new THREE.Mesh(new THREE.SphereGeometry(3,8,5,0,Math.PI*2,0,Math.PI/2),mat(0x8a4a3a));addProp(dome,0,-8);
  var ant3=makeAntenna();addProp(ant3,8,6);
  // Luces ciudad (puntos baratos)
  for(var k=0;k<24;k++){var l=new THREE.Mesh(new THREE.SphereGeometry(0.09,4,3),new THREE.MeshBasicMaterial({color:0xffd98a}));l.position.set(-12+Math.random()*24,0.4+Math.random()*1.2,-D/2-2-Math.random()*6);scene.add(l);}
  // tx5w (info) y parche (clave) separados para no solapar marcadores
  placeInteracts([[-6.5,-2.4,'tx5w'],[-3.2,-2.4,'parche'],[0,-5.6,'micro2'],[W/2-2,1,'puerta']]);
  addSign('COLISEO · PARSIFAL · 5 WATTS',0,3.4,-D/2+0.6);
  placeGallery([
   {x:-7,y:2.1,z:-D/2+0.6,ry:0,art:ZONES[2].objs[0].art},
   {x:0,y:2.1,z:-D/2+0.6,ry:0,art:ZONES[2].objs[1].art},
   {x:7,y:2.1,z:-D/2+0.6,ry:0,art:ZONES[2].objs[2].art}
  ]);
  // Laterales Sala 3: sur 3 + oeste 2 (puerta este despejada)
  placeGallery([
   {x:-7,y:2.1,z:D/2-0.6,ry:Math.PI,art:{k:'horn',t:'Altavoz de bocina · 1920',c:'Fotografía de un altavoz de bocina Magnavox (1920): bocinas como esta amplificaban la ópera en los hogares.'}},
   {x:0,y:2.1,z:D/2-0.6,ry:Math.PI,art:{k:'wagner',t:'Richard Wagner · Viena 1862',c:'Retrato fotográfico de Richard Wagner (Viena, 1862), compositor de Parsifal, la ópera de la hazaña del Coliseo.'}},
   {x:7,y:2.1,z:D/2-0.6,ry:Math.PI,art:{k:'marconi',t:'Guglielmo Marconi · 1909',c:'Retrato de Guglielmo Marconi en 1909, año de su Nobel: su telégrafo sin hilos inspiró a Los Locos de la Azotea.'}},
   {x:-W/2+0.6,y:2.1,z:-4,ry:Math.PI/2,art:{k:'home',t:'Sintonizando en casa · 1923',c:'Fotografía hogareña de 1923 sintonizando la radio con bocina: así oyeron los porteños a Parsifal con galena.'}},
   {x:-W/2+0.6,y:2.1,z:3,ry:Math.PI/2,art:{k:'hall',t:'Teatro Coliseo · 1953',c:'Fotografía del Teatro Coliseo en 1953, tres décadas después de la noche en que su azotea hizo historia.'}}
  ]);
  // Pared de la puerta Sala 3 (este): 1 izq + 1 der, paso central libre
  placeGallery([
   {x:W/2-0.6,y:2.1,z:-5.25,ry:-Math.PI/2,art:{k:'bayreuth1900',t:'Bayreuth · Templo de Parsifal',c:'Fotografía del Festspielhaus de Bayreuth hacia 1900, templo de Parsifal: la ópera viajó de aquí al Coliseo de Buenos Aires.'}},
   {x:W/2-0.6,y:2.1,z:3,ry:-Math.PI/2,art:{k:'hangmic',t:'Micrófono colgado · Recreación',c:'Recreación ilustrada del micrófono de carbón colgado con bocina para sordos, como el del Coliseo (foto original no disponible en dominio público).'}}
  ]);
 }else{
  // SALA 4 · Estudio Legado / Siglo XXI: galería comparativa final
  addProp(makeTable(),-7,-6);addProp(makeTable(),0,-6);addProp(makeTable(),7,-6);
  var ant4=makeAntenna();addProp(ant4,9,6);
  placeInteracts([[-7,-4.6,'gal1'],[0,-4.6,'gal2'],[7,-4.6,'gal3'],[W/2-2,1,'puerta']]);
  addSign('ESTUDIO LEGADO · 1920 → HOY',0,3.2,-D/2+0.6);
  placeGallery([
   {x:-7,y:2.0,z:-D/2+0.6,ry:0,art:ZONES[3].objs[0].art},
   {x:0,y:2.0,z:-D/2+0.6,ry:0,art:ZONES[3].objs[1].art},
   {x:7,y:2.0,z:-D/2+0.6,ry:0,art:ZONES[3].objs[2].art}
  ]);
  // Laterales Sala 4 (evolución): sur 3 + oeste 2 (puerta este despejada)
  placeGallery([
   {x:-7,y:2.0,z:D/2-0.6,ry:Math.PI,art:{k:'fm',t:'Prototipo FM · 1935',c:'Fotografía del prototipo de transmisor FM de Armstrong (1935): del AM de 1920 a la frecuencia modulada.'}},
   {x:0,y:2.0,z:D/2-0.6,ry:Math.PI,art:{k:'blackboard',t:'Armstrong en la pizarra',c:'Fotografía de Edwin Armstrong explicando sus circuitos: la lección que llevó la radio del AM al FM.'}},
   {x:7,y:2.0,z:D/2-0.6,ry:Math.PI,art:{k:'carbon',t:'Amplificador de carbón · 1919',c:'Fotografía de un receptor con amplificador de carbón (1919): el puente entre el micrófono y la válvula.'}},
   {x:-W/2+0.6,y:2.0,z:-4,ry:Math.PI/2,art:{k:'store',t:'Radios en vitrina · 1926',c:'Fotografía de una vitrina de receptores comerciales de madera (Washington D.C., ca.1926): la radio ya era mueble del hogar.'}},
   {x:-W/2+0.6,y:2.0,z:3,ry:Math.PI/2,art:{k:'wife',t:'Superheterodino portátil · 1923',c:'Fotografía del superheterodino portátil de 1923: la radio salía del taller a la calle.'}}
  ]);
  // Pared de la puerta Sala 4 (este): 1 izq + 1 der, paso central libre
  placeGallery([
   {x:W/2-0.6,y:2.0,z:-5.25,ry:-Math.PI/2,art:{k:'inventors48',t:'Inventores del transistor',c:'Fotografía de Bardeen, Brattain y Shockley, inventores del transistor: del Audión de 1906 al estado sólido.'}},
   {x:W/2-0.6,y:2.0,z:3,ry:-Math.PI/2,art:{k:'console',t:'Consola profesional · Recreación',c:'Recreación ilustrada de una consola profesional de radiodifusión de época, con vúmetros y perillas (foto original no disponible en dominio público).'}}
  ]);
 }
 // Posición inicial jugador (centrada, cámara dentro de sala)
 player.position.set(-7,0,4);camYaw=2.5;camPitch=0.32;
 updateHUD();
}
function makeFloorTex(idx){
 var c=document.createElement('canvas');c.width=c.height=128;var g=c.getContext('2d');
 var base=['#5a4632','#4a4a52','#6b5a4a'][idx]||'#5a4632';
 var alt=['#4a3826','#3c3c44','#5a4a3c'][idx]||'#4a3826';
 for(var y=0;y<8;y++)for(var x=0;x<8;x++){g.fillStyle=((x+y)%2)?base:alt;g.fillRect(x*16,y*16,16,16);}
 g.strokeStyle='rgba(0,0,0,0.25)';for(var i=0;i<=8;i++){g.beginPath();g.moveTo(i*16,0);g.lineTo(i*16,128);g.stroke();g.beginPath();g.moveTo(0,i*16);g.lineTo(128,i*16);g.stroke();}
 var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(6,5);return t;
}
function addSign(text,x,y,z){
 var c=document.createElement('canvas');c.width=512;c.height=64;var g=c.getContext('2d');
 g.fillStyle='#2a2118';g.fillRect(0,0,512,64);g.strokeStyle='#d8b96a';g.lineWidth=4;g.strokeRect(4,4,504,56);
 g.fillStyle='#ffd98a';g.font='bold 30px Georgia';g.textAlign='center';g.fillText(text,256,42);
 var t=new THREE.CanvasTexture(c);
 var m=new THREE.Mesh(new THREE.PlaneGeometry(8,1),new THREE.MeshBasicMaterial({map:t}));
 m.position.set(x,y,z);scene.add(m);
}
function placeInteracts(list){
 // list: [x,z,objId] — crea octaedro + sprite billboard numerado [N] con glow
 list.forEach(function(p){
  var def=null;ZONES[G.zone].objs.forEach(function(o){if(o.id===p[2])def=o;});
  if(!def)return;
  var st=getObjState(G.zone,p[2]);
  var isKey=(p[2]===ZONES[G.zone].keyId)||p[2]==='puerta';
  var baseCol=st==='done'?0x53d853:(st==='active'?0xffd25e:0x8a8a8a);
  var mk=makeInteractMarker(isKey?baseCol:baseCol);
  mk.position.set(p[0],1.7,p[1]);
  mk.userData.objId=p[2];
  scene.add(mk);
  interactMeshes.push(mk);
  // Sprite billboard siempre visible mirando a cámara
  var tex=makeWaypointTexture(def.step||1,st);
  var sm=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false});
  var sp=new THREE.Sprite(sm);
  sp.position.set(p[0],2.9,p[1]);
  sp.scale.set(1.5,1.5,1);
  sp.renderOrder=5;
  scene.add(sp);
  waypoints.push({sprite:sp,mesh:mk,objId:p[2],step:def.step||1,state:st});
 });
 // Flecha flotante del siguiente objetivo (dorada, giratoria)
 try{
  var ag=new THREE.ConeGeometry(0.28,0.55,4);
  var am=new THREE.MeshLambertMaterial({color:0xffd25e,emissive:0xaa7700,emissiveIntensity:0.9});
  routeArrow=new THREE.Mesh(ag,am);
  routeArrow.rotation.x=Math.PI; // punta hacia abajo
  scene.add(routeArrow);
 }catch(e){routeArrow=null;}
 updateWaypoints();
}

/* ---------- Entrada: joysticks flotantes + teclado/ratón ---------- */
var joyLBase=$('joy-left'),joyRBase=$('joy-right'),knobL=$('knob-left'),knobR=$('knob-right');
function setupInput(){
 var app=$('app');
 // Joystick izquierdo dinámico: toca mitad izquierda
 app.addEventListener('touchstart',function(e){
  AU.init();AU.resume();
  for(var i=0;i<e.changedTouches.length;i++){
   var t=e.changedTouches[i];
   if(t.clientX<window.innerWidth*0.45&&joyL.id===null&&G.mode==='play'){
    joyL.id=t.identifier;joyL.ox=t.clientX;joyL.oy=t.clientY;
    joyLBase.style.left=(t.clientX-66)+'px';joyLBase.style.top=(t.clientY-66)+'px';joyLBase.style.bottom='auto';
   }else if(t.clientX>=window.innerWidth*0.45&&camT.id===null&&G.mode==='play'){
    // touchpad derecho: rotación cámara (no joystick visual fijo, usamos base derecha como referencia)
    camT.id=t.identifier;camT.lx=t.clientX;camT.ly=t.clientY;
   }
  }
 },{passive:true});
 app.addEventListener('touchmove',function(e){
  for(var i=0;i<e.changedTouches.length;i++){
   var t=e.changedTouches[i];
   if(t.identifier===joyL.id){
    var dx=t.clientX-joyL.ox,dy=t.clientY-joyL.oy;
    var len=Math.sqrt(dx*dx+dy*dy),max=52;
    if(len>max){dx*=max/len;dy*=max/len;}
    joyL.x=dx/max;joyL.y=dy/max;
    knobL.style.transform='translate('+dx+'px,'+dy+'px)';
   }else if(t.identifier===camT.id){
    var mx=t.clientX-camT.lx,my=t.clientY-camT.ly;
    camT.lx=t.clientX;camT.ly=t.clientY;
    camYaw-=mx*0.006;camPitch=clamp(camPitch+my*0.004,0.05,1.1);
    knobR.style.transform='translate('+clamp(mx*2,-30,30)+'px,'+clamp(my*2,-30,30)+'px)';
    clearTimeout(knobR._t);knobR._t=setTimeout(function(){knobR.style.transform='';},120);
   }
  }
  if(G.mode==='play')e.preventDefault();
 },{passive:false});
 function endTouch(e){
  for(var i=0;i<e.changedTouches.length;i++){
   var t=e.changedTouches[i];
   if(t.identifier===joyL.id){joyL.id=null;joyL.x=0;joyL.y=0;knobL.style.transform='';}
   if(t.identifier===camT.id){camT.id=null;knobR.style.transform='';}
  }
 }
 app.addEventListener('touchend',endTouch);app.addEventListener('touchcancel',endTouch);
 // Ratón (PC): arrastrar = cámara
 var dragging=false,lx=0,ly=0;
 canvas.addEventListener('mousedown',function(e){dragging=true;lx=e.clientX;ly=e.clientY;AU.init();AU.resume();});
 window.addEventListener('mousemove',function(e){if(dragging&&G.mode==='play'){camYaw-=(e.clientX-lx)*0.005;camPitch=clamp(camPitch+(e.clientY-ly)*0.004,0.05,1.1);lx=e.clientX;ly=e.clientY;}});
 window.addEventListener('mouseup',function(){dragging=false;});
 window.addEventListener('keydown',function(e){keys[e.key.toLowerCase()]=true;if(e.key==='e'||e.key==='E')doAction();if(e.key==='Escape')togglePause();});
 window.addEventListener('keyup',function(e){keys[e.key.toLowerCase()]=false;});
}
function readKeys(){
 var x=0,y=0;
 if(keys['w']||keys['arrowup'])y-=1;
 if(keys['s']||keys['arrowdown'])y+=1;
 if(keys['a']||keys['arrowleft'])x-=1;
 if(keys['d']||keys['arrowright'])x+=1;
 if(x!==0||y!==0){var l=Math.sqrt(x*x+y*y);joyL.x=x/l*Math.min(1,l);joyL.y=y/l*Math.min(1,l);}
 else if(joyL.id===null){joyL.x=0;joyL.y=0;}
}

/* ---------- Bucle principal 60FPS ---------- */
var walkPhase=0;
function animate(){
 requestAnimationFrame(animate);
 var dt=Math.min(clock.getDelta(),0.05);
 if(G.mode==='play'&&!G.paused){
  readKeys();
  updatePlayer(dt);
  updateCamera(dt);
  updateInteracts(dt);
  // Claridad audio según proximidad a objetivo clave (la música se aclara al acercarse)
  var dMin=99;interactMeshes.forEach(function(m){if(m.userData.objId===ZONES[G.zone].keyId){dMin=Math.min(dMin,dist2D(player.position.x,player.position.z,m.position.x,m.position.z));}});
  var cl=G.puzzleDone[G.zone]?1:clamp(1-dMin/10,0.05,0.9);
  G.clarity=lerp(G.clarity,cl,dt*2);AU.setClarity(G.clarity);
 }
 // Pulso waypoints SIEMPRE (billboard + glow + parpadeo activo + flecha)
 try{
  var t=performance.now()*0.004;
  var t2=performance.now()*0.001;
  interactMeshes.forEach(function(m,i){m.rotation.y+=dt*1.6;m.position.y=1.7+Math.sin(t+i)*0.12;});
  for(var wi=0;wi<waypoints.length;wi++){
   var w=waypoints[wi];
   // sprites miran a cámara automáticamente (Billboard); parpadeo activo
   if(w.state==='active'){
    var p=1+Math.sin(t2*5)*0.14;
    w.sprite.scale.set(1.5*p,1.5*p,1);
    w.sprite.material.opacity=0.75+0.25*Math.sin(t2*5);
   }else{
    w.sprite.scale.set(1.35,1.35,1);
    w.sprite.material.opacity=w.state==='done'?0.95:0.75;
   }
  }
  if(routeArrow&&routeArrow.visible){
   routeArrow.position.y=3.4+Math.sin(performance.now()*0.005)*0.22;
   routeArrow.rotation.y+=0.06;
   var s=1+Math.sin(performance.now()*0.006)*0.12;
   routeArrow.scale.set(s,s,s);
  }
 }catch(e){}
 if(doorMesh)doorMesh.rotation.y=Math.sin(performance.now()*0.0012)*0.02;
 renderer.render(scene,camera);
 // FPS
 G.frames++;var now=performance.now();
 if(now-G.fpsT>500){G.fps=Math.round(G.frames*1000/(now-G.fpsT));G.frames=0;G.fpsT=now;$('fps').textContent=G.fps+' FPS · Low-Poly Baked';}
}
function updatePlayer(dt){
 var mag=Math.sqrt(joyL.x*joyL.x+joyL.y*joyL.y);
 var speed=mag>0.85?7:4.2; // correr / caminar suave
 if(mag<0.08){ // idle: respirar
  walkPhase*=0.9;
  return;
 }
 // Dirección relativa a cámara (tercera persona)
 // forward = -offset cámara; right = (-fz, fx). Movimiento = fwd*(-joyY)+right*joyX
 var fwd=camYaw+Math.PI; // cámara mira al jugador
 var mx=(Math.sin(fwd)*-joyL.y-Math.cos(fwd)*joyL.x);
 var mz=(Math.cos(fwd)*-joyL.y+Math.sin(fwd)*joyL.x);
 var l=Math.sqrt(mx*mx+mz*mz)||1;mx/=l;mz/=l;
 var nx=player.position.x+mx*speed*mag*dt;
 var nz=player.position.z+mz*speed*mag*dt;
 // Colisión: círculo r=0.5 vs AABB
 var r=0.5;
 for(var i=0;i<colliders.length;i++){var c=colliders[i];
  var cx=clamp(nx,c.x0,c.x1),cz=clamp(nz,c.z0,c.z1);
  var dx=nx-cx,dz=nz-cz,d2=dx*dx+dz*dz;
  if(d2<r*r){
   if(d2>0.0001){var d=Math.sqrt(d2);nx=cx+dx/d*r;nz=cz+dz/d*r;}
   else{nx=player.position.x;nz=player.position.z;}
  }
 }
 // Límites sala
 nx=clamp(nx,-12.2,12.2);nz=clamp(nz,-9.2,9.2);
 player.position.x=nx;player.position.z=nz;
 // Rotar hacia movimiento
 var target=Math.atan2(mx,mz);
 var cur=player.rotation.y,diff=((target-cur+Math.PI*3)%(Math.PI*2))-Math.PI;
 player.rotation.y=cur+diff*Math.min(1,dt*10);
 // Anim caminar
 walkPhase+=dt*speed*2.2;
 var s=Math.sin(walkPhase);
 playerParts.legL.rotation.x=s*0.6;playerParts.legR.rotation.x=-s*0.6;
 playerParts.armL.rotation.x=-s*0.5;playerParts.armR.rotation.x=s*0.5;
 player.position.y=Math.abs(Math.cos(walkPhase))*0.05;
}
function updateCamera(dt){
 // Tercera persona adaptativa con colisión (no atraviesa muros)
 var px=player.position.x,py=player.position.y+1.9,pz=player.position.z;
 var d=camDist,pitch=camPitch,yaw=camYaw;
 var cx=px+Math.sin(yaw)*Math.cos(pitch)*d;
 var cz=pz+Math.cos(yaw)*Math.cos(pitch)*d;
 var cy=py+Math.sin(pitch)*d;
 // Colisión cámara: acortar si el segmento jugador→cámara cruza un collider
 var best=1;
 for(var i=0;i<colliders.length;i++){var c=colliders[i];
  // Sampleo barato del segmento (8 pasos) en XZ + altura>0.5
  for(var s2=1;s2<=8;s2++){var t=s2/8;
   var sx=lerp(px,cx,t),sy2=lerp(py,cy,t),sz=lerp(pz,cz,t);
   if(sy2<3.2&&sx>c.x0-0.2&&sx<c.x1+0.2&&sz>c.z0-0.2&&sz<c.z1+0.2){best=Math.min(best,Math.max(0.15,t-0.08));break;}
  }
 }
 d*=best;
 cx=px+Math.sin(yaw)*Math.cos(pitch)*d;
 cz=pz+Math.cos(yaw)*Math.cos(pitch)*d;
 cy=py+Math.sin(pitch)*d;
 cy=Math.max(cy,0.8);
 var k=1-Math.pow(0.0001,dt); // suavizado
 camera.position.x=lerp(camera.position.x,cx,k);
 camera.position.y=lerp(camera.position.y,cy,k);
 camera.position.z=lerp(camera.position.z,cz,k);
 camera.lookAt(px,py-0.3,pz);
}
function updateInteracts(dt){
 var best=null,bd=2.8;
 interactMeshes.forEach(function(m){
  var d=dist2D(player.position.x,player.position.z,m.position.x,m.position.z);
  if(d<bd){bd=d;best=m;}
 });
 G.near=best;
 var btn=$('btn-action');
 if(best&&G.mode==='play'){
  var def=null;ZONES[G.zone].objs.forEach(function(o){if(o.id===best.userData.objId)def=o;});
  if(def){
   var st=getObjState(G.zone,def.id);
   if(st==='locked'){
    // Estación futura: gris + candado + número de orden
    var prev=getActiveObj(G.zone);
    $('action-ico').textContent='🔒';
    $('action-txt').textContent='['+def.step+'] Bloqueado · Ve a '+(prev?prev.station:'objetivo');
   }else if(st==='done'){
    $('action-ico').textContent='✓';
    $('action-txt').textContent='['+def.step+'] Completado';
   }else{
    // Activo: dorado
    if(def.id==='puerta'){
     var need=(G.zone+1)*100;
     if(G.score<need){$('action-ico').textContent='🔒';$('action-txt').textContent='Puerta ('+G.score+'/'+need+' Hz)';}
     else{$('action-ico').textContent=def.icon;$('action-txt').textContent='['+def.step+'] '+def.label;}
    }else{$('action-ico').textContent=def.icon;$('action-txt').textContent='['+def.step+'] '+def.label;}
   }
   btn.style.display='flex';
   return;
  }
 }
 btn.style.display='none';
}
function doAction(){
 if(G.mode!=='play'||!G.near)return;
 AU.click();AU.resume();
 var id=G.near.userData.objId;
 var def=null;ZONES[G.zone].objs.forEach(function(o){if(o.id===id)def=o;});
 if(!def)return;
 var st=getObjState(G.zone,id);
 if(st==='locked'){
  AU.err();
  var act=getActiveObj(G.zone);
  toast('🔒 ['+def.step+'] Bloqueado. Primero completa '+(act?('['+act.step+'] '+act.station+' · '+act.name):'el objetivo anterior')+'.',3000);
  return;
 }
 if(st==='done'&&id!=='puerta'){
  toast('✓ ['+def.step+'] Ya completado. Sigue la flecha dorada al siguiente número.',2500);
  return;
 }
 if(id==='puerta'){tryDoor();return;}
 if(id===ZONES[G.zone].keyId&&ZONES[G.zone].keyId){openCaption(def,true);return;}
 // Secundarios y galería: pie de foto + marcar visitado (verde ✓)
 G.visited[G.zone][id]=true;
 saveGame();updateWaypoints();
 AU.blip(700,0.08,0.12,'square');
 openCaption(def,false);
}

/* ---------- Tutorial previo (pausa acción + tarjeta flotante) ---------- */
function openTutorial(kind){
 // kind: puzzle0/puzzle1/puzzle2/trivia
 var z=G.zone,t;
 if(kind.indexOf('puzzle')===0){t=TUTS[kind]||TUTS.puzzle0;G.pendingTutor={type:'puzzle',zone:z};}
 else{t=TUTS.trivia;G.pendingTutor={type:'trivia',zone:z};}
 G.mode='tutorial';
 $('tut-title').textContent=t.title+' · '+ZONES[z].name.split('·')[0].trim();
 var html='<ol>';
 for(var i=0;i<t.steps.length;i++)html+='<li>'+t.steps[i]+'</li>';
 html+='</ol><div class="tip">'+t.tip+'</div>';
 $('tut-steps').innerHTML=html;
 show('tutorial');
}

/* ---------- Caption galería (tooltip histórico táctil) ---------- */
var ART_ICON={portrait:'🧔',diagram:'📐',valves:'🔮',kdka:'🎙️',newspaper:'📰',transmitter:'🗼',locos:'👥',poster:'🎭',tx5w:'📻',evo:'📈',cabin:'🎧',legacy:'💡'};
function openCaption(def,isKey){
 // Pie de foto del cuadro sobre la estación + info del punto
 G.mode='caption';
 var art=def.art||null;
 $('cap-title').textContent=art?art.t:def.name;
 $('cap-step').textContent='['+def.step+'] '+def.station+' · '+def.name;
 $('cap-icon').textContent=art?(ART_ICON[art.k]||'🖼️'):def.icon;
 $('cap-body').textContent=(art?art.c+' ':'')+def.info;
 var go=$('cap-go');
 if(isKey){go.style.display='block';go.textContent='CONTINUAR AL PUZZLE ▶';G.pendingCaption={type:'puzzle'};}
 else{go.style.display='none';G.pendingCaption={type:'close'};}
 show('caption');
}
/* ---------- Puertas / guardado (4 salas) ---------- */
function tryDoor(){
 if(G.zone===3){ // Sala 4 final: requiere galería completa
  var v=G.visited[3]||{};
  if(v.gal1&&v.gal2&&v.gal3){winGame();return;}
  AU.err();
  toast('🏆 Inspecciona los 3 paneles [1][2][3] antes de emitir la señal final.',2800);return;
 }
 var need=(G.zone+1)*100;
 if(G.score>=need&&G.puzzleDone[G.zone]&&G.triviaDone[G.zone]){
  G.zone++;saveGame();
  saveToast('💾 Punto de guardado · Zona '+(G.zone+1)+' · ◆ JO · UNIAJC');
  AU.ok();
  loadZone(G.zone);
  toast('📡 '+ZONES[G.zone].name+' — '+ZONES[G.zone].intro,3800);
 }else{
  AU.err();
  var missing=[];
  if(!G.puzzleDone[G.zone])missing.push('puzzle 3D');
  if(!G.triviaDone[G.zone])missing.push('trivia');
  if(G.score<need)missing.push('frecuencia ('+G.score+'/'+need+' Hz)');
  toast('🔒 Puerta bloqueada. Falta: '+missing.join(' · '),3000);
 }
}
function saveGame(){try{localStorage.setItem('f1920_3d',JSON.stringify({zone:G.zone,score:G.score,lives:G.lives,pd:G.puzzleDone,td:G.triviaDone,vis:G.visited}));}catch(e){}}
function loadSave(){try{var s=JSON.parse(localStorage.getItem('f1920_3d'));if(s&&(s.zone>0||s.score>0))return s;}catch(e){}return null;}
function loadZone(i){
 G.zone=i;buildZone(i);G.near=null;
 $('zone-label').textContent=ZONES[i].name;
 $('zone-sub').textContent=ZONES[i].sub;
 updateHUD();updateObjectiveHUD();
}

/* ---------- HUD / vidas / señal ---------- */
function updateHUD(){
 for(var i=0;i<3;i++){var t=$('tube'+i);if(i<G.lives){t.className='tube on';}else{t.className='tube off';}}
 var sig=G.lives<=0?0:Math.round(G.lives/3*100);
 $('signal-bar').style.width=sig+'%';
 $('signal-bar').style.background=sig>60?'linear-gradient(to right,#4da64d,#8fd48f)':sig>30?'linear-gradient(to right,#c8a83c,#e8d27e)':'linear-gradient(to right,#a83c3c,#e87e7e)';
 $('signal-txt').textContent=sig+'%';
 $('score-val').textContent=G.score;
}
function loseLife(){
 G.lives=Math.max(0,G.lives-1);updateHUD();AU.err();
 if(G.lives<=0){gameOver();}
}
function gameOver(){
 G.mode='gameover';
 $('go-zone').textContent=ZONES[G.zone].name;
 $('go-score').textContent=G.score+' Hz';
 show('gameover');
 try{navigator.vibrate&&navigator.vibrate([120,60,120]);}catch(e){}
}
function winGame(){
 G.mode='victory';saveGame();
 $('win-score').textContent=G.score+' Hz';
 $('win-lives').textContent=G.lives+'/3';
 AU.victoria();AU.setClarity(1);
 show('victory');
}

/* ---------- Pantallas ---------- */
var SCREENS=['menu','help','credits','tutorial','caption','puzzle1','puzzle2','puzzle3','trivia','gameover','victory','pause'];
function show(id){
 SCREENS.forEach(function(s){$(s).classList.add('hidden');});
 if(id)$(id).classList.remove('hidden');
 var inGame=(G.mode==='play'||G.mode==='puzzle'||G.mode==='trivia'||G.mode==='tutorial'||G.mode==='caption');
 $('hud').classList.toggle('hidden',!inGame);
 $('objective').classList.toggle('hidden',!inGame);
 $('joy-left').classList.toggle('hidden',!(G.mode==='play'));
 $('joy-right').classList.toggle('hidden',!(G.mode==='play'));
 $('btn-pause').classList.toggle('hidden',!(G.mode==='play'));
 $('touch-hint').classList.toggle('hidden',!(G.mode==='play'));
 if(G.mode!=='play')$('btn-action').style.display='none';
}
function startGame(fresh){
 AU.init();AU.resume();
 if(fresh){G.zone=0;G.score=0;G.lives=3;G.puzzleDone=[false,false,false,true];G.triviaDone=[false,false,false,true];G.doorOpen=[false,false,false,false];G.visited=[{},{},{},{}];G.pendingTutor=null;G.pendingCaption=null;try{localStorage.removeItem('f1920_3d');}catch(e){}}
 G.mode='play';G.paused=false;G.near=null;
 loadZone(G.zone);show(null);updateWaypoints();
 toast('📡 '+ZONES[G.zone].name+' — Sigue la ruta [1]→[2]→[3]→[4] dorada.',3800);
}
function togglePause(){
 if(G.mode!=='play')return;
 G.paused=true;G.mode='pause';
 $('pause-info').textContent=ZONES[G.zone].name+' · '+G.score+' Hz · '+G.lives+'/3 tubos';
 show('pause');AU.click();
}
window.F1920={onBackPressed:function(){
 if(G.mode==='tutorial'||G.mode==='caption'){G.mode='play';G.pendingTutor=null;G.pendingCaption=null;show(null);updateWaypoints();}
 else if(G.mode==='play')togglePause();
}};

/* ---------- Puzzles táctiles 3D ---------- */
// P1: dial 8XK
var p1={target:88,tol:6};
function openPuzzle(){
 var z=G.zone;
 G.mode='puzzle';
 if(z===0){$('p1-slider').value=50;drawWave(50);show('puzzle1');}
 else if(z===1){p2start();show('puzzle2');}
 else{p3init();show('puzzle3');}
}
function drawWave(v){
 var c=$('wave-canvas'),g=c.getContext('2d');
 var W=c.width,H=c.height;g.clearRect(0,0,W,H);
 g.fillStyle='#120e0a';g.fillRect(0,0,W,H);
 var q=Math.max(0,100-Math.abs(v-p1.target)*4);
 var t=performance.now()*0.004;
 for(var x=0;x<W;x+=3){
  var clean=Math.sin(x*0.05+t*2)*22;
  var noise=(Math.random()-0.5)*44*(1-q/100);
  var y=H/2+clean*(q/100)+noise;
  var col=q>65?'#5cb85c':q>30?'#d8b96a':'#c85c5c';
  g.fillStyle=col;g.fillRect(x,y,2,2);
 }
 $('p1-val').textContent=v;$('p1-q').textContent=Math.round(q)+'%';
 AU.setClarity(q/100);
 return q;
}
// P2: mixer contra reloj
var p2={f:50,p:50,t:30,timer:null,run:false};
function p2start(){
 p2.f=50;p2.p=50;p2.t=30;p2.run=true;
 $('p2-freq').value=50;$('p2-pow').value=50;
 clearInterval(p2.timer);
 p2.timer=setInterval(function(){
  if(G.mode!=='puzzle'||G.zone!==1){clearInterval(p2.timer);p2.run=false;return;}
  p2.t--;if(p2.t<=0){p2.t=0;clearInterval(p2.timer);p2.run=false;
   AU.err();toast('⏱ ¡Tiempo de emisión agotado! -1 tubo',2600);loseLife();
   if(G.lives>0){p2start();}
   return;
  }
  p2draw();
 },1000);
 p2draw();
}
function p2stab(){var df=Math.abs(p2.f-75),dp=Math.abs(p2.p-65);return Math.max(0,Math.round(100-(df+dp)*2.2));}
function p2draw(){
 $('timer-big').textContent='⏱ '+p2.t;
 $('v-f').textContent=p2.f+'%';$('v-p').textContent=p2.p+'%';
 $('fill-f').style.height=p2.f+'%';$('fill-p').style.height=p2.p+'%';
 var okF=Math.abs(p2.f-75)<9,okP=Math.abs(p2.p-65)<9;
 $('zo-f').style.top='16%';$('zo-f').style.height='18%';
 $('zo-p').style.top='26%';$('zo-p').style.height='18%';
 var s=p2stab();$('p2-stab').textContent=s+'%'+(okF&&okP?' ¡EN VERDE!':'');
 AU.setClarity(s/100);
}
// P3: patchbay
var p3={sel:null,links:{}};
var PATCH=[{id:'A',txt:'FASE A · MIC'},{id:'B',txt:'FASE B · ANT'},{id:'C',txt:'FASE C · TIERRA'}];
var SLOTS=[{id:'A',txt:'🎙️ MIC ESCENARIO'},{id:'B',txt:'📶 ANTENA AZOTEA'},{id:'C',txt:'🔌 TIERRA COLISEO'}];
function p3init(){
 p3.sel=null;p3.links={};
 var cw=$('cables'),sw=$('slots');cw.innerHTML='';sw.innerHTML='';
 PATCH.forEach(function(p){
  var b=document.createElement('button');b.className='patch-cable';b.textContent='🔌 '+p.txt;b.dataset.id=p.id;
  b.style.background=['#e8b84a','#7ea8d8','#8fd48f'][PATCH.indexOf(p)];
  b.onclick=function(){AU.click();p3.sel=p.id;
   Array.prototype.forEach.call(cw.children,function(x){x.classList.remove('sel');});
   b.classList.add('sel');};
  cw.appendChild(b);
 });
 SLOTS.forEach(function(s){
  var d=document.createElement('div');d.className='patch-slot';d.textContent=s.txt;d.dataset.id=s.id;
  d.onclick=function(){
   if(!p3.sel){toast('Toca primero un cable (A/B/C)',1800);return;}
   AU.click();p3.links[s.id]=p3.sel;p3.sel=null;
   Array.prototype.forEach.call(cw.children,function(x){x.classList.remove('sel');});
   p3draw();
  };
  sw.appendChild(d);
 });
 p3draw();
}
function p3draw(){
 var n=Object.keys(p3.links).length;
 $('p3-status').textContent='Conectados: '+n+'/3'+(n===3?' · ¡Verifica y transmite!':'');
 Array.prototype.forEach.call($('slots').children,function(d){
  var sid=d.dataset.id;
  if(p3.links[sid]){d.classList.add('filled');d.textContent=(p3.links[sid]===sid?'✅ ':'🔀 ')+sid+'←'+p3.links[sid];}
  else{var s=SLOTS.filter(function(x){return x.id===sid;})[0];d.classList.remove('filled');d.textContent=s.txt;}
 });
 var ok=n===3&&p3.links.A==='A'&&p3.links.B==='B'&&p3.links.C==='C';
 AU.setClarity(n===0?0.1:n===3?(ok?1:0.4):0.5);
}
function puzzleSolved(){
 AU.ok();G.puzzleDone[G.zone]=true;saveGame();updateWaypoints();
 try{navigator.vibrate&&navigator.vibrate(60);}catch(e){}
 openTutorial('trivia');
}

/* ---------- Trivia A-B-C-D hitbox amplio ---------- */
var tr={lock:false};
function openTrivia(){
 var d=ZONES[G.zone].trivia;
 if(!d){G.mode='play';show(null);updateWaypoints();return;}
 G.mode='trivia';
 $('trivia-kicker').textContent='MÓDULO DE EVALUACIÓN · '+ZONES[G.zone].name.toUpperCase();
 $('trivia-q').textContent=d.q;
 $('trivia-ctx').textContent=d.ctx;
 var box=$('trivia-opts');box.innerHTML='';
 $('trivia-feedback').style.display='none';$('trivia-next').style.display='none';tr.lock=false;
 d.opts.forEach(function(op,i){
  var b=document.createElement('button');b.className='btn btn-dark opt';
  b.innerHTML='<span class="letter">'+'ABCD'[i]+'</span><span>'+op+'</span><span class="mark"></span>';
  b.onclick=function(){answerTrivia(i,b);};
  box.appendChild(b);
 });
 show('trivia');
}
function answerTrivia(i,btn){
 if(tr.lock)return;tr.lock=true;
 var d=ZONES[G.zone].trivia,ok=(i===d.correct);
 var btns=$('trivia-opts').children;
 if(ok){
  btn.classList.remove('btn-dark');btn.classList.add('correct');
  btn.querySelector('.mark').textContent='✓';
  AU.ok();
  var f=$('trivia-feedback');f.className='';f.id='trivia-feedback';f.classList.add('ok');
  // id se pierde al reasignar className; restaurar
  f.setAttribute('id','trivia-feedback');
  f.innerHTML='<b>✓ ¡CORRECTA!</b> +100 Hz de frecuencia.<br>'+d.ok;
  f.style.display='block';
  try{navigator.vibrate&&navigator.vibrate(40);}catch(e){}
 }else{
  btn.classList.remove('btn-dark');btn.classList.add('wrong');
  btn.querySelector('.mark').textContent='✗';
  var cb=btns[d.correct];cb.classList.remove('btn-dark');cb.classList.add('correct');cb.querySelector('.mark').textContent='✓';
  AU.err();
  var f2=$('trivia-feedback');f2.className='';f2.setAttribute('id','trivia-feedback');f2.classList.add('bad');
  f2.innerHTML='<b>✗ INCORRECTA.</b> -1 tubo de vacío + estática de error.<br>'+d.bad;
  f2.style.display='block';
  try{navigator.vibrate&&navigator.vibrate([100,50,100]);}catch(e){}
 }
 $('trivia-next').style.display='block';
 $('trivia-next').onclick=function(){
  AU.click();
  if(ok){
   G.score+=100;G.triviaDone[G.zone]=true;G.doorOpen[G.zone]=true;
   saveGame();saveToast('💾 Punto de guardado · +100 Hz · ◆ JO · UNIAJC');
   updateHUD();updateWaypoints();
   if(G.zone===3){winGame();return;}
   G.mode='play';show(null);updateWaypoints();
   if(G.zone===2)toast('🚪 ¡Galería desbloqueada! Ve al marco dorado para entrar al Legado.',3200);
   else toast('🚪 ¡Puerta desbloqueada! Sigue la flecha al [4] dorado y pulsa ABRIR.',3200);
  }else{
   loseLife();
   if(G.lives<=0)return; // gameOver ya
   G.mode='play';show(null);updateWaypoints();
   toast('Vuelve al objeto ★ para reintentar el puzzle y la trivia.',2800);
  }
 };
}

/* ---------- Wiring UI ---------- */
function wire(){
 $('btn-start').onclick=function(){AU.init();AU.resume();AU.click();startGame(true);};
 $('btn-continue').onclick=function(){AU.click();var s=loadSave();if(s){G.zone=s.zone||0;G.score=s.score||0;G.lives=s.lives||3;G.puzzleDone=(s.pd&&s.pd.length===4)?s.pd:[!!(s.pd&&s.pd[0]),!!(s.pd&&s.pd[1]),!!(s.pd&&s.pd[2]),true];G.triviaDone=(s.td&&s.td.length===4)?s.td:[!!(s.td&&s.td[0]),!!(s.td&&s.td[1]),!!(s.td&&s.td[2]),true];G.visited=s.vis||[{},{},{},{}];while(G.visited.length<4)G.visited.push({});}startGame(false);};
 $('cap-close').onclick=function(){AU.click();G.pendingCaption=null;G.mode='play';show(null);updateWaypoints();};
 $('cap-go').onclick=function(){
  AU.click();AU.resume();
  var p=G.pendingCaption;G.pendingCaption=null;
  if(p&&p.type==='puzzle'){openTutorial('puzzle'+G.zone);}
  else{G.mode='play';show(null);updateWaypoints();}
 };
 $('tut-btn').onclick=function(){
  AU.click();AU.resume();
  var p=G.pendingTutor;G.pendingTutor=null;
  if(!p){G.mode='play';show(null);return;}
  if(p.type==='puzzle'){openPuzzle();}
  else{openTrivia();}
 };
 $('btn-credits').onclick=function(){AU.click();show('credits');};
 $('btn-credits-back').onclick=function(){AU.click();G.mode='menu';show('menu');};
 $('btn-help').onclick=function(){AU.click();show('help');};
 $('btn-help-back').onclick=function(){AU.click();G.mode='menu';show('menu');};
 $('btn-action').addEventListener('click',function(e){e.preventDefault();doAction();});
 $('btn-pause').onclick=function(){togglePause();};
 $('btn-resume').onclick=function(){AU.click();G.mode='play';G.paused=false;show(null);};
 $('btn-pause-menu').onclick=function(){AU.click();G.mode='menu';show('menu');};
 $('btn-retry-zone').onclick=function(){AU.click();G.lives=3;updateHUD();G.mode='play';loadZone(G.zone);show(null);updateWaypoints();};
 $('btn-retry-l1').onclick=function(){AU.click();startGame(true);};
 $('btn-go-menu').onclick=function(){AU.click();G.mode='menu';show('menu');};
 $('btn-win-menu').onclick=function(){AU.click();G.mode='menu';show('menu');refreshMenu();};
 $('btn-win-again').onclick=function(){AU.click();startGame(true);};
 // P1
 $('p1-slider').addEventListener('input',function(){drawWave(parseInt(this.value,10));});
 $('p1-ok').onclick=function(){
  var v=parseInt($('p1-slider').value,10);
  if(Math.abs(v-p1.target)<=p1.tol){clearInterval(p2.timer);puzzleSolved();}
  else{AU.err();AU.staticBurst(0.4);toast('📻 Aún hay estática. Busca la zona verde (82–94%).',2200);}
 };
 $('p1-cancel').onclick=function(){AU.click();G.mode='play';show(null);};
 // P2
 $('p2-freq').addEventListener('input',function(){p2.f=parseInt(this.value,10);p2draw();});
 $('p2-pow').addEventListener('input',function(){p2.p=parseInt(this.value,10);p2draw();});
 $('p2-ok').onclick=function(){
  var okF=Math.abs(p2.f-75)<9,okP=Math.abs(p2.p-65)<9;
  if(okF&&okP){clearInterval(p2.timer);p2.run=false;puzzleSolved();}
  else{AU.err();toast('📡 Señal inestable. Frecuencia ~75% y Potencia ~65% en verde.',2300);}
 };
 $('p2-cancel').onclick=function(){AU.click();clearInterval(p2.timer);p2.run=false;G.mode='play';show(null);};
 // P3
 $('p3-reset').onclick=function(){AU.click();p3init();};
 $('p3-ok').onclick=function(){
  var ok=p3.links.A==='A'&&p3.links.B==='B'&&p3.links.C==='C'&&Object.keys(p3.links).length===3;
  if(ok)puzzleSolved();
  else{AU.err();toast('🔌 Conexión incorrecta. Orden: A→MIC, B→ANTENA, C→TIERRA.',2400);}
 };
 $('p3-cancel').onclick=function(){AU.click();G.mode='play';show(null);};
 // Canvas click = init audio (autoplay policy)
 document.addEventListener('pointerdown',function(){AU.init();AU.resume();},{passive:true});
}
function refreshMenu(){
 var s=loadSave();
 $('btn-continue').style.display=s?'block':'none';
}

/* ---------- Arranque ---------- */
buildPlayer();
buildZone(0);
G.mode='menu';show('menu');refreshMenu();
setupInput();wire();
camera.position.set(-9+5,4,6+5);
animate();
})();
