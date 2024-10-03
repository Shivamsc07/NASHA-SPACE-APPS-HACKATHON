function startOrrery() {
    alert("3D Orrery visualization coming soon!");
    
}

let scene, camera, renderer, controls;
let sun, planets = {}, planetOrbits = {};
let stars;

function init() {
    createScene();
    createCamera();
    createRenderer();
    createControls();
    addLighting();
    createSun();
    createPlanets();
    addStars();
    animate();
    // Import the galaxy creation function
    createGalaxy();
}

function createScene() {
    scene = new THREE.Scene();
}

function createCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100; // Increased camera distance for better view
}

function createRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function createControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function addLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 2, 300);
    scene.add(pointLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1).normalize();
    scene.add(directionalLight);
}

function createSun() {
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFDB813, 
        emissive: 0xFDB813, 
        emissiveIntensity: 1 
    });
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
}

function createPlanets() {
    // Increased distances for planets
    createPlanet("Mercury", 0.4, 12, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTORdzdwfM7t3gPHwI267R9fiN8-Fqe2Dr8yg&s", 0.02, 0.01);
    createPlanet("Venus", 0.9, 18, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-OMXsZFqfhTgoP2i4r0KdOAsGMHxuHKD0PQ&s", 0.015, 0.009);
    createPlanet("Earth", 1, 24, "https://t3.ftcdn.net/jpg/03/64/91/04/360_F_364910470_DCjyTv7AlFX0or7TGEcJWkz7JDLnCE5G.jpg", 0.01, 0.02, false, true);
    createPlanet("Mars", 0.5, 30, "https://t3.ftcdn.net/jpg/06/96/83/32/360_F_696833251_1ahM6zJxrkzigXzDG4bpDXzaaCZ9Yzco.jpg", 0.008, 0.015);
    createPlanet("Jupiter", 2, 36, "https://external-preview.redd.it/JJTceYLFNKh1trdhGTiDAku5dMw24H61e8xyi2_TS6g.jpg?auto=webp&s=1f3d29a36611e75f0fa8bf6e25865809a41771ad", 0.004, 0.05, false, true);
    createPlanet("Saturn", 1.7, 42, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_ABVh6X-rxANutcMkEqX0Q6fQtFt7ERZPkQ&s", 0.003, 0.04, true);
    createPlanet("Uranus", 1.4, 48, "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/9ca15be5-bdef-4bda-8172-2eac787b4d57/df3vhx1-53594e61-6d84-4f4f-97d9-7d9c0f0ea8db.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzljYTE1YmU1LWJkZWYtNGJkYS04MTcyLTJlYWM3ODdiNGQ1N1wvZGYzdmh4MS01MzU5NGU2MS02ZDg0LTRmNGYtOTdkOS03ZDljMGYwZWE4ZGIucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.P55nUJM5J1N5nd9NPCc-0cbv3HuUBRHZsykE_3zf8_M", 0.002, 0.03);
    createPlanet("Neptune", 1.3, 54, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5m6I1cNvdxJo1hMYBzgmMzcD1viyiItRiyg&s", 0.001, 0.02);
}

function createPlanet(name, size, distance, textureURL, speed, rotationSpeed, hasRings = false, hasMoon = false) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(textureURL, function (texture) {
        const material = new THREE.MeshPhongMaterial({ map: texture });
        
        const planet = new THREE.Mesh(geometry, material);
        planet.position.x = distance; // Increased distance for planets
        scene.add(planet);

        // Orbit path (circular line around the planet)
        createOrbit(distance);

        if (hasRings) {
            createRings(planet, size);
        }

        // Adding moons
        if (hasMoon) {
            addMoon(planet, size / 3, 3.5, 0.001); // Increased distance for the moon
        }

        planets[name] = { 
            obj: planet, 
            distance: distance, 
            speed: speed, 
            rotationSpeed: rotationSpeed, 
            angle: Math.random() * Math.PI * 2 
        };
    });
}

function createOrbit(distance) {
    const orbitGeometry = new THREE.RingGeometry(distance - 0.05, distance + 0.05, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        side: THREE.DoubleSide, 
        opacity: 0.5, 
        transparent: true 
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2; // Rotate orbit to align it flat
    scene.add(orbit);
    planetOrbits[distance] = orbit; // Store orbit for future reference
}

function createRings(planet, size) {
    const ringGeometry = new THREE.RingGeometry(size + 0.5, size + 1, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    planet.add(ring);
}

function addMoon(planet, size, distance, moonSpeed) {
    const moonGeometry = new THREE.SphereGeometry(size, 32, 32);
    const moonMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.x = distance; // Adjusted distance for the moon
    planet.add(moon);

    planet.moon = { obj: moon, speed: moonSpeed, distance: distance, angle: Math.random() * Math.PI * 2 };
}

function addStars() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < 10000; i++) {
        vertices.push(
            THREE.MathUtils.randFloatSpread(2000),
            THREE.MathUtils.randFloatSpread(2000),
            THREE.MathUtils.randFloatSpread(2000)
        );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({ color: 0x888888 });
    stars = new THREE.Points(geometry, material);
    scene.add(stars);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Rotate planets
    for (const planetName in planets) {
        const planetData = planets[planetName];
        planetData.angle += planetData.speed;
        planetData.obj.position.x = Math.cos(planetData.angle) * planetData.distance;
        planetData.obj.position.z = Math.sin(planetData.angle) * planetData.distance;

        if (planetData.rotationSpeed) {
            planetData.obj.rotation.y += planetData.rotationSpeed;
        }

        // Update moon position if exists
        if (planetData.obj.moon) {
            const moon = planetData.obj.moon;
            moon.angle += moon.speed;
            moon.obj.position.x = Math.cos(moon.angle) * moon.distance;
            moon.obj.position.z = Math.sin(moon.angle) * moon.distance;
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

init();
