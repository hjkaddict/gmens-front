(function () {

    var globe = document.getElementById('globe');

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage(globe);
        return;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }


    //New scene and camera
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);
    //Set the camera position
    camera.position.set(0, 0, 16);


    //New Renderer
    var renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    //Enable controls
    var controls = new THREE.TrackballControls(camera, renderer.domElement);

    var planet = new THREE.Object3D();



    scene.updateMatrixWorld();

    //Create CanvasTexture
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 2048;
    canvas.height = 1024;

    $.getJSON("test_geojson/imgPosition.json", function (data) {
        for (let i = 0; i < imageUrlArray.length; i++) {
            var loader = new THREE.ImageLoader();
            let randNum = getRandomInt(data.length);

            loader.load('https://gmens-test-1.s3.eu-central-1.amazonaws.com/' + imageUrlArray[i], function (image) {
                var x = data[randNum].FIELD2 * 16;
                var y = data[randNum].FIELD1 * 16;
                var picSize = 14;

                var r = 12;

                var lon = map_range((data[randNum].FIELD2 + 32) * 16 + (picSize/2), 0, 2048, -Math.PI, Math.PI);
                var lat = map_range(data[randNum].FIELD1 * 16 + (picSize/2), 1024, 0, -1 * Math.PI / 2, Math.PI / 2);
                var xx = -r * Math.cos(lat) * Math.cos(lon);
                var yy = r * Math.sin(lat);
                var zz = r * Math.cos(lat) * Math.sin(lon)

                //draw red border when recentpic uploaded
                if (image.src === recentUploaded) {
                    ctx.fillStyle = 'red';
                    ctx.fillRect(x - 1, y - 1, picSize + 2, picSize + 2);
                    ctx.drawImage(image, x, y, picSize, picSize)
                    var targetPosition = new THREE.Vector3(xx, yy, zz)
                    var duration = 4000;
                    tweenCamera(targetPosition, duration);
                } else {
                    ctx.drawImage(image, x, y, picSize, picSize)

                    // var testg = new THREE.BoxGeometry(0.1, 0.1, 0.1);
                    // var testm = new THREE.MeshBasicMaterial({ color: 'red' });
                    // var cube = new THREE.Mesh(testg, testm);
                    // cube.position.set(xx, yy, zz);
                    // planet.add(cube);
                }
            },
                undefined,
                function () {
                    console.error('An error happend.')
                })
        }
    });




    var text = new THREE.CanvasTexture(canvas);
    text.wrapS = THREE.RepeatWrapping;
    text.wrapT = THREE.RepeatWrapping;
    text.offset.set(0.25, 0)
    text.repeat.set(1, 1)

    var mat = new THREE.MeshBasicMaterial({
        map: text,
        alphaTest: 0.5,
        side: THREE.DoubleSide,
    });

    //Create a sphere to make visualization easier.
    var geometry = new THREE.SphereGeometry(10, 64, 64);
    var geometry2 = new THREE.SphereGeometry(10, 64, 64);



    var transpTexture = new THREE.TextureLoader();

    var material = new THREE.MeshBasicMaterial({
        map: transpTexture.load('https://gmens-test-1.s3.eu-central-1.amazonaws.com/imageData/2_no_clouds_4k_black2.png', function (transpTexture) {
            transpTexture.wrapS = THREE.RepeatWrapping;
            transpTexture.wrapT = THREE.RepeatWrapping;
            transpTexture.offset.set(0.25, 0)
            transpTexture.repeat.set(1, 1)
        }),
        color: 0xffffff,
        alphaTest: 0.5
    });

    var sphere2 = new THREE.Mesh(geometry2, mat)
    var sphere = new THREE.Mesh(geometry, material);


    planet.add(sphere2);
    planet.add(sphere);
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
        text.needsUpdate = true;
        text.minFilter = THREE.LinearFilter;
        controls.update();
        TWEEN.update(); //TWEENing

        renderer.render(scene, camera);
        requestAnimationFrame(render);
        //console.log(camera.position)
    }

    render();


    //functions
    //길이가 아니라 각이어야함 
    // convert the positions from a lat, lon to a position on a sphere.

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