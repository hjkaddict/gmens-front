(function () {

    var globe = document.getElementById('globe');

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage(globe);
        return;
    }

    function shuffle(array) {
        var i = array.length,
            j = 0,
            temp;
        while (i--) {
            j = Math.floor(Math.random() * (i + 1));
            // swap randomly chosen element with current element
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    //New scene and camera
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);

    //New Renderer
    var renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
  

    document.body.appendChild(renderer.domElement);

    var planet = new THREE.Object3D();

    //Create CanvasTexture
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 4096;
    canvas.height = 2048;

    //shuffle(imageUrlArray)

    // $.getJSON("test_geojson/imgPosition.json", function (data) {
    //     for (let i = 0; i < data.length; i++) {
    //         var loader = new THREE.ImageLoader();
    //         loader.load('https://gmens-test-1.s3.eu-central-1.amazonaws.com/' + imageUrlArray[getRandomInt(imageUrlArray.length)], function (image) {
    //             ctx.drawImage(image, data[i].FIELD2 * 32, data[i].FIELD1 * 32, 28, 28)
    //         },
    //             undefined,
    //             function () {
    //                 console.error('An error happend.')
    //             })
    //     }
    // });

    $.getJSON("test_geojson/imgPosition.json", function (data) {
        for (let i = 0; i < data.length; i++) {
            var loader = new THREE.ImageLoader();
            let randNum = getRandomInt(imageUrlArray.length);
            loader.load('https://gmens-test-1.s3.eu-central-1.amazonaws.com/' + imageUrlArray[randNum], function (image) {
                ctx.drawImage(image, data[i].FIELD2 * 32, data[i].FIELD1 * 32, 28, 28)
            },
                undefined,
                function () {
                    console.error('An error happend.')
                })
        }
    });

    text = new THREE.CanvasTexture(canvas);
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
        // transparent: true,
        // opacity: 1.0
    });

    var sphere2 = new THREE.Mesh(geometry2, mat)
    var sphere = new THREE.Mesh(geometry, material);


    planet.add(sphere2);
    planet.add(sphere);




    // function latLongToVector3(lat_, lon_, radius_, heigth_) {
    //     var phi = (lat_) * Math.PI / 180;
    //     var theta = (lon_ - 180) * Math.PI / 180;

    //     var x = -(radius_ + heigth_) * Math.cos(phi) * Math.cos(theta);
    //     var y = (radius_ + heigth_) * Math.sin(phi);
    //     var z = (radius_ + heigth_) * Math.cos(phi) * Math.sin(theta);

    //     return new THREE.Vector3(x, y, z);
    // }

    // Draw lines
    $.getJSON("test_geojson/countries.json", function (data) {
        drawThreeGeo(data, 10, 'sphere', {
            color: 0xffffff
        }, planet);
    });



    globe.appendChild(renderer.domElement);

    scene.add(planet);





    //Set the camera position
    camera.position.z = 18;

    //Enable controls
    var controls = new THREE.TrackballControls(camera, renderer.domElement);

    //Render the image
    function render() {
        text.needsUpdate = true;
        text.minFilter = THREE.LinearFilter;
        controls.update();
        requestAnimationFrame(render);
        renderer.render(scene, camera);

    }

    render();
})()