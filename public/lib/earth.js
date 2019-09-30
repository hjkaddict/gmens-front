(function () {

    var webglEl = document.getElementById('webgl');

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage(webglEl);
        return;
    }

    //New scene and camera

    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);

    //New Renderer
    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    var planet = new THREE.Object3D();

    //Create a sphere to make visualization easier.
    var geometry = new THREE.SphereGeometry(10, 32, 32);
    var material = new THREE.MeshBasicMaterial({
        color: 0x333333,
        wireframe: false,
        transparent: true,
        opacity: 0.0
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


    // //Create cube

    for (let i = 0; i < imageUrlArray.length; i++) {
        const loader = new THREE.TextureLoader();
        var lati = 7.326752 
        var long = 6.134813 + (3*i)
        var loc = latLongToVector3(lati, long - 90, 10, 0)

        var geom = new THREE.BoxGeometry(0.5, 0.5, 0.0001);
        var material = new THREE.MeshBasicMaterial({
            //color: 0x00ff00,
            map: loader.load('https://gmens-test-1.s3.eu-central-1.amazonaws.com/'+imageUrlArray[i]),
        });
        var cube = new THREE.Mesh(geom, material);
        cube.position.copy(new THREE.Vector3(loc.x, loc.y, loc.z));
        cube.lookAt(new THREE.Vector3(0, 0, 0));

        planet.add(cube);
    }



    // const loader = new THREE.TextureLoader();

    // var geom = new THREE.BoxGeometry(0.5, 0.5, 0.0001);
    // var material = new THREE.MeshBasicMaterial({
    //     //color: 0x00ff00,
    //     map: loader.load('https://gmens-test-1.s3.eu-central-1.amazonaws.com/philly_1569542850701_1569797314989.jpg'),
    // });
    // var cube = new THREE.Mesh(geom, material);
    // cube.position.copy(new THREE.Vector3(loc.x, loc.y, loc.z));
    // cube.lookAt(new THREE.Vector3(0, 0, 0));

    // planet.add(cube);


    //Draw the GeoJSON

    $.getJSON("test_geojson/countries.json", function (data) {
        drawThreeGeo(data, 10, 'sphere', {
            color: 0xffffff,
            light: true,
        }, planet);
    });

    $.getJSON("test_geojson/rivers.geojson", function (data) {
        drawThreeGeo(data, 10, 'sphere', {
            color: 0x22AFFF,
            transparent: true,
            opacity: 0.7
        }, planet);
    });

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