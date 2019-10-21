(function () {

    var globe = document.getElementById('globe');

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage(globe);
        return;
    }


    //New scene and camera
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);
    //Set the camera position
    camera.position.set(11.4, 9.47, -5.99);

    //scene.background =  new THREE.Color( 0xf0f0f0 );

    //New Renderer
    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    //Enable controls
    var controls = new THREE.TrackballControls(camera, renderer.domElement);

    var planet = new THREE.Object3D();


    //Create Canvas for CanvasTexture
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 2048;
    canvas.height = 1024;

    var canvasTexture = new THREE.CanvasTexture(canvas);
    
    canvasTexture.wrapS = THREE.RepeatWrapping;
    canvasTexture.wrapT = THREE.RepeatWrapping;
    canvasTexture.offset.set(0.25, 0)
    canvasTexture.repeat.set(1, 1)

    var canvasMaterial = new THREE.MeshBasicMaterial({
        map: canvasTexture,
        alphaTest: 0.5,
        side: THREE.DoubleSide,
    });

    var canvasSphereGeometry = new THREE.SphereGeometry(10, 64, 64);

    //Import Img Position on globe and draw

    $.getJSON("test_geojson/imgPosition.json", function (data) {
        for (let i = 0; i < data.length; i++) {
            var loader = new THREE.ImageLoader();
            let randNum = getRandomInt(imageUrlArray.length);

            loader.load('https://gmens-test-1.s3.eu-central-1.amazonaws.com/' + imageUrlArray[randNum], function (image) {
                var imageXpos = data[i].FIELD2 * 16,
                    imageYpos = data[i].FIELD1 * 16;
                var picSize = 14;
                var radius = 12;

                var lon = map_range((data[i].FIELD2 + 32) * 16 + (picSize / 2), 0, 2048, -Math.PI, Math.PI),
                    lat = map_range(data[i].FIELD1 * 16 + (picSize / 2), 1024, 0, -1 * Math.PI / 2, Math.PI / 2);
            
                var pos3D = new THREE.Vector3(-radius * Math.cos(lat) * Math.cos(lon), radius * Math.sin(lat), radius * Math.cos(lat) * Math.sin(lon));

                if (image.src === recentUploaded) {
                    //Draw Red border when uploaded
                    ctx.fillStyle = 'red';
                    ctx.fillRect(imageXpos - 1, imageYpos - 1, picSize + 2, picSize + 2);
                    ctx.drawImage(image, imageXpos, imageYpos, picSize, picSize);
                    //Move Camera when uploaded
                    var targetPosition = pos3D,
                        duration = 4000;
                    tweenCamera(targetPosition, duration);
                } else {
                    //Draw all images
                    ctx.drawImage(image, imageXpos, imageYpos, picSize, picSize);
                }
            },
                undefined,
                function () {
                    console.error('An error happend.');
                })
        }
    });

    var canvasSphere = new THREE.Mesh(canvasSphereGeometry, canvasMaterial)

    //Create Spheres

    var transpTexture = new THREE.TextureLoader();

    var transMaterial = new THREE.MeshBasicMaterial({
        map: transpTexture.load('https://gmens-test-1.s3.eu-central-1.amazonaws.com/imageData/2_no_clouds_4k_black2.png', function (transpTexture) {
            transpTexture.wrapS = THREE.RepeatWrapping;
            transpTexture.wrapT = THREE.RepeatWrapping;
            transpTexture.offset.set(0.25, 0);
            transpTexture.repeat.set(1, 1);
        }),
        color: 0xffffff,
        alphaTest: 0.5
    });

    var geometry = new THREE.SphereGeometry(10, 64, 64);
    var transSphere = new THREE.Mesh(geometry, transMaterial);


    planet.add(canvasSphere);
    planet.add(transSphere);

    //Draw lines
    $.getJSON("test_geojson/countries.json", function (data) {
        drawThreeGeo(data, 10, 'sphere', {
            color: 0xffffff
        }, planet);
    });


    globe.appendChild(renderer.domElement);
    scene.add(planet);

    //Render the image
    function render() {
        canvasTexture.needsUpdate = true;
        canvasTexture.minFilter = THREE.LinearFilter;
        controls.update();
        TWEEN.update(); //TWEENing
        renderer.render(scene, camera);
        requestAnimationFrame(render);
        //console.log(camera.position)
    }

    render();


    //functions below:

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    function tweenCamera(targetPosition, duration) {
        controls.enabled = false;
        var position = new THREE.Vector3().copy(camera.position);
        var tween = new TWEEN.Tween(position)
            .to(targetPosition, duration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function () {
                camera.position.copy(position);
                camera.lookAt(controls.target);
            })
            .onComplete(function () {
                camera.position.copy(targetPosition);
                camera.lookAt(controls.target);
                controls.enabled = true;
            })
            .start();
    }

    function map_range(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

})()