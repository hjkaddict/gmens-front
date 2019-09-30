(function () {

    var webglEl = document.getElementById('webgl');

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage(webglEl);
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

    //New scene and camera

    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);

    //New Renderer
    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    var planet = new THREE.Object3D();

    // //Create cube
    console.log(imageUrlArray.length)

    // for (let i = 0; i < imageUrlArray.length; i++) {
    //     const loader = new THREE.TextureLoader();
    //     loader.minFilter = THREE.LinearFilter;
    //     var lati = 0
    //     var long = 0 + (2 * i)
    //     var loc = latLongToVector3(lati, long - 90, 10, -0.1)

    //     var geom = new THREE.BoxGeometry(0.3, 0.3, 0.0001);
    //     var material = new THREE.MeshBasicMaterial({
    //         map: loader.load('https://gmens-test-1.s3.eu-central-1.amazonaws.com/' + imageUrlArray[i]),
    //     });
    //     var cube = new THREE.Mesh(geom, material);
    //     cube.position.copy(new THREE.Vector3(loc.x, loc.y, loc.z));
    //     cube.lookAt(new THREE.Vector3(0, 0, 0));

    //     planet.add(cube);

    // }


    //dummy start
    for (let j = 0; j < 15; j++) {
        shuffle(imageUrlArray)
        for (let i = 0; i < imageUrlArray.length; i++) {
            const loader = new THREE.TextureLoader();
            
            var lati = 5 * j
            var long = -20 + (5 * i)
            var loc = latLongToVector3(lati, long - 90, 10, -0.1)

            var geom = new THREE.PlaneGeometry(0.7, 0.8, 2);
            var material = new THREE.MeshBasicMaterial({
                map: loader.load('https://gmens-test-1.s3.eu-central-1.amazonaws.com/' + imageUrlArray[i], function (loader) {
                    loader.wrapS = THREE.RepeatWrapping;
                    loader.wrapT = THREE.RepeatWrapping;
                    loader.offset.set(0, 0)
                    loader.repeat.set(1, 1)
                    loader.minFilter = THREE.LinearFilter;
                }),
                side: THREE.DoubleSide
            });
            var cube = new THREE.Mesh(geom, material);
            cube.position.copy(new THREE.Vector3(loc.x, loc.y, loc.z));
            cube.lookAt(new THREE.Vector3(0, 0, 0));

            planet.add(cube);
        }
    }

    for (let j = 0; j < 15; j++) {
        shuffle(imageUrlArray)
        for (let i = 0; i < imageUrlArray.length; i++) {
            const loader = new THREE.TextureLoader();
            loader.minFilter = THREE.LinearFilter;
            var lati = 5 * j * -1
            var long = -20 + (5 * i)
            var loc = latLongToVector3(lati, long - 90, 10, -0.1)

            var geom = new THREE.PlaneGeometry(0.7, 0.8, 2);
            var material = new THREE.MeshBasicMaterial({
                map: loader.load('https://gmens-test-1.s3.eu-central-1.amazonaws.com/' + imageUrlArray[i], function (loader) {
                    loader.wrapS = THREE.RepeatWrapping;
                    loader.wrapT = THREE.RepeatWrapping;
                    loader.offset.set(0, 0)
                    loader.repeat.set(1, 1)
                }),
                side: THREE.DoubleSide
            });
            var cube = new THREE.Mesh(geom, material);
            cube.position.copy(new THREE.Vector3(loc.x, loc.y, loc.z));
            cube.lookAt(new THREE.Vector3(0, 0, 0));

            planet.add(cube);
        }
    }





    //dummy end






    //Create a sphere to make visualization easier.
    var geometry = new THREE.SphereGeometry(10, 32, 32);
    var transpTexture = new THREE.TextureLoader();

    var material = new THREE.MeshBasicMaterial({
        map: transpTexture.load('https://gmens-test-1.s3.eu-central-1.amazonaws.com/imageData/2_no_clouds_4k+black.png', function (transpTexture) {
            transpTexture.wrapS = THREE.RepeatWrapping;
            transpTexture.wrapT = THREE.RepeatWrapping;
            transpTexture.offset.set(0.25, 0)
            transpTexture.repeat.set(1, 1)
        }),
        color: 0xffffff,
        transparent: true,
        opacity: 1.0
    });

    var sphere = new THREE.Mesh(geometry, material);

    planet.add(sphere);

    function latLongToVector3(lat_, lon_, radius_, heigth_) {
        var phi = (lat_) * Math.PI / 180;
        var theta = (lon_ - 180) * Math.PI / 180;

        var x = -(radius_ + heigth_) * Math.cos(phi) * Math.cos(theta);
        var y = (radius_ + heigth_) * Math.sin(phi);
        var z = (radius_ + heigth_) * Math.cos(phi) * Math.sin(theta);

        return new THREE.Vector3(x, y, z);
    }


    $.getJSON("test_geojson/countries.json", function (data) {
        drawThreeGeo(data, 10, 'sphere', {
            color: 0xffffff
        }, planet);
    });

    // $.getJSON("test_geojson/rivers.geojson", function (data) {
    //     drawThreeGeo(data, 10, 'sphere', {
    //         color: 0x22AFFF,
    //         transparent: true,
    //         opacity: 1
    //     }, planet);
    // });

    webglEl.appendChild(renderer.domElement);

    scene.add(planet);

    // testing

    //Set the camera position
    camera.position.z = 20;

    //Enable controls
    var controls = new THREE.TrackballControls(camera);

    //Render the image
    function render() {
        controls.update();
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    render();
})()