

angular.module('ngWebglDemo', ['colorpicker.module', 'rzModule'])
  .directive('ngWebgl', function () {
      return {
          restrict: 'A',
          scope: {
              'width': '=',
              'height': '=',
              'fillcontainer': '=',
              'scale': '=',
              'materialType': '=',
              'color1': '=',
              'color1s': '=',
              'color1e': '=',
              'color2': '=',
              'color2s': '=',
              'color2e': '=',
              'color3': '=',
              'color3s': '=',
              'color3e': '=',
              'obj': '='
          },
          link: function postLink(scope, element, attrs) {
              var controls;
              var canvas, camera, scene, renderer, geometry,
          shadowMesh, structure, light,
          mouseX = 0, mouseY = 0,
          contW = (scope.fillcontainer) ?
            element[0].clientWidth : scope.width,
          contH = scope.height,
          windowHalfX = contW / 2,
          windowHalfY = contH / 2,
          materials = {},
          densities = [];

              var renderer_axis;
              var AXIS_WIDTH = 200, AXIS_HEIGHT = 200, CAM_DISTANCE = 300;
              var xhttp;

              scope.loadXMLDoc = function (dname) {

                  if (window.XMLHttpRequest) {
                      xhttp = new XMLHttpRequest();

                  }
                  else {
                      xhttp = new ActiveXObject("Microsoft.XMLHTTP");
                  }

                  xhttp.open("GET", dname, false);

                  xhttp.send();

                  return xhttp.responseXML;
              }
              scope.init = function () {

                  // Camera
                  camera = new THREE.PerspectiveCamera(20, contW / contH, 1, 10000);
                  camera.position.z = -2000;
                  camera.position.y = 1400;
                  console.log(camera.position.x);
                  console.log(camera.position.y);
                  //  camera.up = new THREE.Vector3(0, 0, 1);

                  camera2 = new THREE.PerspectiveCamera(50, AXIS_WIDTH / AXIS_HEIGHT, 1, 1000);
                  camera2.up = camera.up;



                  controls = new THREE.TrackballControls(camera);

                  controls.rotateSpeed = 10.0;
                  controls.zoomSpeed = 5.2;
                  controls.panSpeed = 0.5;

                  controls.noZoom = false;
                  controls.noPan = false;

                  controls.staticMoving = true;
                  controls.dynamicDampingFactor = 0.3;

                  controls.keys = [65, 83, 68];

                  controls.addEventListener('change', scope.render);
                  // Scene
                  scene = new THREE.Scene();
                  scene2 = new THREE.Scene();

                  //axis

                  axes2 = new THREE.AxisHelper(100);
                  scene2.add(axes2);

                  // canvas
                  canvas = document.createElement('canvas');
                  canvas.width = 128;
                  canvas.height = 128;

                  scope.addLighting();
                  scope.addShadow();
                  scope.addModel();



                  materials.lambert = new THREE.MeshLambertMaterial({
                      color: 0xffffff,
                      shading: THREE.FlatShading,
                      vertexColors: THREE.VertexColors
                  });

                  materials.phong = new THREE.MeshPhongMaterial({
                      ambient: 0x030303,
                      color: 0xdddddd,
                      specular: 0x009900,
                      shininess: 30,
                      shading: THREE.FlatShading,
                      vertexColors: THREE.VertexColors
                  });

                  materials.wireframe = new THREE.MeshBasicMaterial({
                      color: 0x000000,
                      shading: THREE.FlatShading,
                      wireframe: true,
                      transparent: true
                  });

                  renderer = new THREE.WebGLRenderer({ antialias: true });
                  renderer.setClearColor(0xffffff);
                  renderer.setSize(contW, contH);

                  renderer_axis = new THREE.WebGLRenderer({ alpha: true });
                  renderer_axis.setClearColor(0x000000, 0);
                  renderer_axis.setSize(AXIS_WIDTH, AXIS_HEIGHT);

                  // element is provided by the angular directive
                  element[0].appendChild(renderer.domElement);
                  element[0].appendChild(renderer_axis.domElement);
                  renderer_axis.domElement.style.marginLeft = "-200px";
                  renderer_axis.domElement.style.zIndex = 100;
                  renderer_axis.domElement.style.float = 'left';
                  renderer.domElement.style.float = 'left';

                  document.addEventListener('mousemove', scope.onDocumentMouseMove, false);

                  window.addEventListener('resize', scope.onWindowResize, false);
              };

              scope.addShadow = function () {
                  // Render a 2d gradient to use as shadow
                  var context = canvas.getContext('2d');
                  var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);

                  gradient.addColorStop(0.1, 'rgba(200,200,200,1)');
                  gradient.addColorStop(1, 'rgba(255,255,255,1)');

                  context.fillStyle = gradient;
                  context.fillRect(0, 0, canvas.width, canvas.height);

                  var shadowTexture = new THREE.Texture(canvas);
                  shadowTexture.needsUpdate = true;

                  var shadowMaterial = new THREE.MeshBasicMaterial({
                      map: shadowTexture
                  });
                  var shadowGeo = new THREE.PlaneGeometry(300, 300, 1, 1);

                  // Apply the shadow texture to a plane
                  shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
                  shadowMesh.position.y = -250;
                  shadowMesh.rotation.x = -Math.PI / 2;
                  scene.add(shadowMesh);
              };

              scope.addLighting = function () {
                  // Ligthing
                  light = new THREE.DirectionalLight(0xffffff);
                  light.position.set(0, 0, 1);
                  scene.add(light);
              };

              scope.addModel = function () {
                  var color, f, p, n, vertexIndex,
                    radius = 200
                  geometry = new THREE.Geometry();

                  var colors = [];

                  xmlDoc = scope.loadXMLDoc("models/z15.xml");
                  x = xmlDoc.documentElement.childNodes;
                  for (i = 0; i < x.length; i++) {
                      try {
                          var c = x[i];
                          while (c && c.nodeType != 1) { // 1 = ELEMENT_NODE
                              c = c.nextSibling;
                          }

                          var geodef = c.textContent || c.innerText;
                          var res = geodef.split(",");


                          geometry.vertices.push(new THREE.Vector3(res[0], res[1], res[2]));
                          geometry.vertices.push(new THREE.Vector3(res[3], res[4], res[5]));

                          colors[2 * i] = new THREE.Color(0xffffff);
                          colors[2 * i + 1] = new THREE.Color(0xffffff);

                          res[6] = Math.abs(res[6]);
                          densities[i] = res[6];

                          gradation = (0.276 - (-0.0784)) / 8;

                          //colors[2 * i].setStyle(scope.color1);
                          //colors[2 * i + 1].setStyle(scope.color1);
                          /*
                          if (res[6] < gradation * 1 - 0.0784) {
                          colors[2 * i].setStyle("RGB(143,0,255)");
                          colors[2 * i + 1].setStyle("RGB(143,0,255)");
                          }
                          else if (res[6] < gradation * 2 - 0.0784) {
                          colors[2 * i].setStyle("RGB(75,0,130)");
                          colors[2 * i + 1].setStyle("RGB(75,0,130)");
                          }
                          else if (res[6] < gradation * 3 - 0.0784) {
                          colors[2 * i].setStyle("RGB(0,0,255)");
                          colors[2 * i + 1].setStyle("RGB(0,0,255)");
                          }
                          else if (res[6] < gradation * 4 - 0.0784) {
                          colors[2 * i].setStyle("RGB(0,255,0)");
                          colors[2 * i + 1].setStyle("RGB(0,255,0)");
                          }
                          else if (res[6] < gradation * 5 - 0.0784) {
                          colors[2 * i].setStyle("RGB(255,255,0)");
                          colors[2 * i + 1].setStyle("RGB(255,255,0)");
                          }
                          else if (res[6] < gradation * 6 - 0.0784) {
                          colors[2 * i].setStyle("RGB(255,127,0)");
                          colors[2 * i + 1].setStyle("RGB(255,127,0)");
                          }
                          else if (res[6] < gradation * 7 - 0.0784) {
                          colors[2 * i].setStyle("RGB(255,0,0)");
                          colors[2 * i + 1].setStyle("RGB(255,0,0)");
                          }
                          else {
                          colors[2 * i].setStyle("RGB(0,0,0)");
                          colors[2 * i + 1].setStyle("RGB(0,0,0)");
                          }
                          */
                          //colors[i] = 0;


                      } catch (err) {

                      }



                  }

                  geometry.colors = colors;
                  geometry.colorsNeedUpdate = true;
                  material = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 1, linewidth: 50, vertexColors: THREE.VertexColors });

                  structure = new THREE.Line(geometry, material, THREE.LinePieces);
                  structure.position.x = 0;


                  structure.rotation.x = -90 * Math.PI / 180;

                  structure.position.x = 0
                  structure.position.y = -250
                  structure.position.z = 0;
                  scene.add(structure);
              };

              // -----------------------------------
              // Event listeners
              // -----------------------------------
              scope.onWindowResize = function () {

                  scope.resizeCanvas();
                  controls.handleResize();
              };

              scope.onDocumentMouseMove = function (event) {

                  mouseX = (event.clientX - windowHalfX);
                  mouseY = (event.clientY - windowHalfY);

              };

              scope.clearCanvas = function () {
                  for (var i = scene.children.length - 1; i >= 0; i--) {
                      obj = scene.children[i];
                      scene.remove(obj);
                  }
              };

              scope.recolor = function () {
                  //alert('recolor');
                  //scope.clearCanvas();
                  //scope.addLighting();
                  //scope.addShadow();
                  //scope.addModel();
                  //scene.add(structure
                  for (var i = 0; i < densities.length; i++) {

                      var found = false;

                      structure.geometry.colors[2 * i].setStyle("rgb(240, 216, 216)");
                      structure.geometry.colors[2 * i + 1].setStyle("rgb(240, 216, 216)");

                      for (var j = 0; j < scope.obj.length; j++) {
                          var start = scope.obj[j].min / 10000;
                          var end = scope.obj[j].max / 10000;
                          var color = scope.obj[j].color;


                          if ((start < densities[i]) && (densities[i] < end)) {
                              structure.geometry.colors[2 * i].setStyle(color);
                              structure.geometry.colors[2 * i + 1].setStyle(color);
                              found = true;
                              break;
                          }
                      }

            
                      /*
                      if ((scope.color1s < densities[i]) && (densities[i] < scope.color1e)) {

                      structure.geometry.colors[2 * i].setStyle(scope.color1);
                      structure.geometry.colors[2 * i + 1].setStyle(scope.color1);
                      }
                      else if ((scope.color2s < densities[i]) && (densities[i] < scope.color2e)) {

                      structure.geometry.colors[2 * i].setStyle(scope.color2);
                      structure.geometry.colors[2 * i + 1].setStyle(scope.color2);
                      }
                      else if ((scope.color3s < densities[i]) && (densities[i] < scope.color3e)) {

                      structure.geometry.colors[2 * i].setStyle(scope.color3);
                      structure.geometry.colors[2 * i + 1].setStyle(scope.color3);
                      }
                      else {
                      structure.geometry.colors[2 * i].setStyle("rgb(240, 216, 216)");
                      structure.geometry.colors[2 * i + 1].setStyle("rgb(240, 216, 216)");
                      }
                      
                      */



                  }

                  //for (var i = 0; i < structure.geometry.colors.length; i++) {
                  //    structure.geometry.colors[2 * i].setStyle(scope.color1);
                  //}
              };

              // -----------------------------------
              // Updates
              // -----------------------------------
              scope.resizeCanvas = function () {

                  contW = (scope.fillcontainer) ?
                  element[0].clientWidth : scope.width;
                  contH = scope.height;

                  windowHalfX = contW / 2;
                  windowHalfY = contH / 2;

                  camera.aspect = contW / contH;
                  camera.updateProjectionMatrix();

                  renderer.setSize(contW, contH);

              };

              scope.resizeObject = function () {

                  structure.scale.set(scope.scale, scope.scale, scope.scale);
                  shadowMesh.scale.set(scope.scale, scope.scale, scope.scale);

              };

              scope.changeMaterial = function () {

                  //  structure.material = materials[scope.materialType];

              };


              // -----------------------------------
              // Draw and Animate
              // -----------------------------------
              scope.animate = function () {

                  requestAnimationFrame(scope.animate);
                  controls.update();

                  camera2.position.copy(camera.position);
                  camera2.position.sub(controls.target); // added by @libe
                  camera2.position.setLength(CAM_DISTANCE);

                  camera2.lookAt(scene2.position);

                  scope.render();

              };

              scope.render = function () {

                  //  camera.position.x += (mouseX - camera.position.x) * 0.05;
                  //   camera.position.y += ( - mouseY - camera.position.y ) * 0.05;

                  //camera.lookAt(scene.position);

                  renderer.render(scene, camera);
                  renderer_axis.render(scene2, camera);
                  geometry.colorsNeedUpdate = true;


              };

              // -----------------------------------
              // Watches
              // -----------------------------------
              scope.$watch('fillcontainer + width + height', function () {

                  scope.resizeCanvas();

              });

              scope.$watch('scale', function () {

                  scope.resizeObject();

              });

              scope.$watch('materialType', function () {

                  scope.changeMaterial();

              });

              scope.$watch('obj', function () {
                  console.log("obj change");
                  scope.recolor();
              }, true);

              // Begin
              scope.init();
              scope.animate();

          }
      };
  });