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
    var picSize = 14;

    //Raycaster
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var onClickPosition = new THREE.Vector2();

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
    var selCanvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d');
    var selCtx = selCanvas.getContext('2d');
    canvas.width = 2048;
    canvas.height = 1024;
    selCanvas.width = 2048;
    selCanvas.height = 1024;


    var canvasTexture = new THREE.CanvasTexture(canvas);
    var selCanvasTexture = new THREE.CanvasTexture(selCanvas)

    canvasTexture.wrapS = THREE.RepeatWrapping;
    canvasTexture.wrapT = THREE.RepeatWrapping;
    canvasTexture.offset.set(0.25, 0)
    canvasTexture.repeat.set(1, 1)

    selCanvasTexture.wrapS = THREE.RepeatWrapping;
    selCanvasTexture.wrapT = THREE.RepeatWrapping;
    selCanvasTexture.offset.set(0.25, 0)
    selCanvasTexture.repeat.set(1, 1)


    var selCanvasMaterial = new THREE.MeshBasicMaterial({
        map: selCanvasTexture,
        alphaTest: 0.5,
        side: THREE.DoubleSide
    });


    var canvasMaterial = new THREE.MeshBasicMaterial({
        map: canvasTexture,
        alphaTest: 0.5,
        side: THREE.DoubleSide
    });

    var canvasSphereGeometry = new THREE.SphereGeometry(10, 64, 64);
    var selCanvasSphereGeometry = new THREE.SphereGeometry(10, 64, 64);

    //Import Img Position on globe and draw

    var imgPosition_data = []
    var imgUrlName = [];

    $.getJSON("test_geojson/imgPosition.json", function (data) {

        imgPosition_data.push(data)
        for (let i = 0; i < data.length; i++) {
            var loader = new THREE.ImageLoader();
            let randNum = getRandomInt(imageUrlArray.length);
            var address = 'https://gmens-test-1.s3.eu-central-1.amazonaws.com/' + imageUrlArray[randNum];
            imgUrlName.push(address)
            loader.load(address, function (image) {

                var imageXpos = data[i].FIELD2 * 16,
                    imageYpos = data[i].FIELD1 * 16;
                var radius = 11;

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
                    ctx.drawImage(image, imageXpos, imageYpos, picSize, picSize);
                }

                //imgUrlName.push(image.src);
            },
                undefined,
                function () {
                    console.error('An error happend.');
                })
        }
    }

    );



    var canvasSphere = new THREE.Mesh(canvasSphereGeometry, canvasMaterial)
    var selCanvasSphere = new THREE.Mesh(selCanvasSphereGeometry, selCanvasMaterial)

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
    planet.add(selCanvasSphere);
    planet.add(transSphere);

    //Create preview border box
    var previewBoxBorderGeometry = new THREE.PlaneGeometry(1.5, 1.5, 0);
    var previewBoxBorderMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        color: 'black',
        needsUpdate: true,
        depthTest: false,
    });
    var previewBoxBorderCube = new THREE.Mesh(previewBoxBorderGeometry, previewBoxBorderMaterial);
    planet.add(previewBoxBorderCube);


    //Create preview box
    var previewBoxGeometry = new THREE.PlaneGeometry(1.5, 1.5, 0);
    var previewBoxTexture = new THREE.TextureLoader();
    var previewBoxMaterial = new THREE.MeshBasicMaterial({
        map: previewBoxTexture.load(''),
        transparent: true,
        opacity: 0,
        needsUpdate: true,
        depthTest: false,
        side: THREE.FrontSide

    });
    var previewBoxCube = new THREE.Mesh(previewBoxGeometry, previewBoxMaterial);
    planet.add(previewBoxCube);



    //Draw lines
    $.getJSON("test_geojson/countries.json", function (data) {
        drawThreeGeo(data, 10, 'sphere', {
            color: 0xffffff
        }, planet);
    });

    var loading = false;
    var preview = false;

    var previewAddress = ''

    function drawSelection() {

        selCtx.clearRect(0, 0, 2048, 1024);
        loading = false;

        if (imgPosition_data[0] !== undefined) {
            for (let i = 0; i < imgPosition_data[0].length; i++) {
                var xPos = imgPosition_data[0][i].FIELD2 * 16;
                var yPos = imgPosition_data[0][i].FIELD1 * 16;
                if (xCross > xPos && xCross < xPos + picSize && yCross > yPos && yCross < yPos + picSize && loading === false) {
                    selCtx.fillStyle = 'blue';
                    selCtx.fillRect(xPos - 1, yPos - 1, 16, 16);
                    previewAddress = imgUrlName[i];
                    loading = true;
                }
            }
        }
        selCanvasTexture.needsUpdate = true;
        selCanvasTexture.minFilter = THREE.LinearFilter;
    }

    function displayPreview() {

        if (loading === true && preview === false) {
            previewBoxMaterial.map = previewBoxTexture.load(previewAddress, function (previewBoxTexture) {
                if (previewBoxTexture.image.width >= previewBoxTexture.image.height) {
                    previewBoxCube.scale.set(1, previewBoxTexture.image.height / previewBoxTexture.image.width);
                    previewBoxBorderCube.scale.set(1.1, (previewBoxTexture.image.height / previewBoxTexture.image.width) * 1.1);
                } else {
                    previewBoxCube.scale.set(previewBoxTexture.image.width / previewBoxTexture.image.height, 1);
                    previewBoxBorderCube.scale.set((previewBoxTexture.image.width / previewBoxTexture.image.height) * 1.1, 1.1);
                }

                previewBoxTexture.minFilter = THREE.LinearFilter;

            })
            previewBoxBorderMaterial.opacity = 0.8;
            previewBoxMaterial.opacity = 0.9;
            preview = true;
        } else if (loading === false) {
            previewBoxBorderMaterial.opacity = 0;
            previewBoxMaterial.opacity = 0;
            preview = false;
        }
    }




    globe.appendChild(renderer.domElement);
    scene.add(planet);

    globe.addEventListener('mousemove', onMouseMove, false);

    //Render the image
    function render() {

        drawSelection();
        canvasTexture.needsUpdate = true;
        canvasTexture.minFilter = THREE.LinearFilter;

        controls.update();
        TWEEN.update(); //TWEENing
        previewBoxBorderCube.position.copy(camera.position)
        previewBoxBorderCube.rotation.copy(camera.rotation)
        previewBoxBorderCube.updateMatrix();
        previewBoxBorderCube.translateX(1.7);
        previewBoxBorderCube.translateY(-0.5);
        previewBoxBorderCube.translateZ(-2);
        previewBoxCube.position.copy(camera.position)
        previewBoxCube.rotation.copy(camera.rotation)
        previewBoxCube.updateMatrix();
        previewBoxCube.translateX(1.7);
        previewBoxCube.translateY(-0.5);
        previewBoxCube.translateZ(-2);
        

        displayPreview();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    render();
    var tmp = []
    tmp.push(scene.children[0].children[0]);
    var xCross, yCross;

    //functions below:
    function onMouseMove(evt) {
        evt.preventDefault();
        var array = getMousePosition(globe, evt.clientX, evt.clientY);
        onClickPosition.fromArray(array);
        var intersects = getIntersects(onClickPosition, tmp);
        if (intersects.length > 0 && intersects[0].uv) {
            var uv = intersects[0].uv;
            intersects[0].object.material.map.transformUv(uv);
            xCross = uv.x * 2048;
            yCross = uv.y * 1024;
        }
    }
    var getMousePosition = function (dom, x, y) {
        var rect = dom.getBoundingClientRect();
        return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
    };
    var getIntersects = function (point, objects) {
        mouse.set((point.x * 2) - 1, - (point.y * 2) + 1);
        raycaster.setFromCamera(mouse, camera);
        return raycaster.intersectObjects(objects);
    };


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

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

})()