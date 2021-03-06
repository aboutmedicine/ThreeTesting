// three.js

let camera;
let light;
let scene;
let loader;
let controls;
let raycaster;
let mouse;
let renderer;
let clickLocation;
let noteLocation;
let noteMode = false;
const note = document.querySelector(".note");

init();
animate();

function init() {

    // Camera

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .5, 4000);
    camera.position.x = 5;
    camera.position.y = 7.5;
    camera.position.z = 12.5;

    // Scene

    scene = new THREE.Scene();

    // GLTF Loader

    loader = new THREE.GLTFLoader();
    loader.load('models/gltf/Draco-processed.glb', function (gltf) {
        scene.add(gltf.scene);

        // Light

        light = new THREE.AmbientLight(0xc0c0a0)
        scene.add(light);

        // Raycaster

        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector3();
        clickLocation = new THREE.Vector3();

        // Currently every click attempts to get intersection from mesh to assign to note
        // TODO: this function triggers only once to set note location
        function onDocumentMouseDown(event) {

            if (noteMode === true) {

                // Converts window coords to NDCs
                let mousex = (event.clientX / window.innerWidth) * 2 - 1
                let mousey = -(event.clientY / window.innerHeight) * 2 + 1
                mouse.set(mousex, mousey);

                raycaster.setFromCamera(mouse, camera);

                // Gets intersection
                let intersects = raycaster.intersectObject(gltf.scene, true);
                let intersection = intersects[0];

                if (intersects.length > 0) {

                    note.style.top = `${event.clientY}px`;
                    note.style.left = `${event.clientX}px`;

                    // Passes intersection coords to variable used in updateScreenPosition()
                    clickLocation.copy(intersection.point)
                }
            }
        }

        // Renderer

        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xffffff, 1);
        document.body.appendChild(renderer.domElement);

        // Orbit Controls

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false;
        controls.maxDistance = 3000;
        controls.minDistance = 200;

        window.addEventListener("resize", onWindowResize, false);
        window.addEventListener("mousedown", onDocumentMouseDown, false);

        // Turn on noteMode

        document.querySelector('.modebutton').addEventListener('click', function () {
            if (noteMode === false) {
                noteMode = true;
                document.querySelector('.modebutton').classList.toggle('selected');
            } else {
                noteMode = false;
                document.querySelector('.modebutton').classList.toggle('selected');
            }
            console.log(noteMode)
        })

        // Note interaction

        document.querySelector('.open-button').addEventListener('click', toggleNote);
        document.querySelector('.close-button').addEventListener('click', toggleNote);

        function toggleNote() {
            document.querySelector('.note').classList.toggle('open');
            document.querySelector('.notetitle').classList.toggle('visible');
            document.querySelector('textarea').classList.toggle('visible');
            document.querySelector('.close-button').classList.toggle('visible');
            document.querySelector('.ico.delete').classList.toggle('visible');
            document.querySelector('.ico.save').classList.toggle('visible');
            document.querySelector('.open-button').classList.toggle('invisible');
        }

        // Generate new note

//        function generateNoteHtml(note, index) {
//            return `
//    <div class="note">
//        <div class="open-button">+</div>
//        <input class="notetitle" placeholder="Note">
//        <div class="close-button">&times;</div>
//        <textarea rows="3" placeholder="Type Here..."></textarea>
//        <a href="#" class="ico delete"></a>
//        <a href="#" class="ico save"></a>
//    </div>
//      `;
//        }
//
//
//        addNote(note) {
//            let newNote = {
//                note,
//                isComplete: false,
//            };
//            notes.push(newNote);
//            loadNotes();
//        }
//
//        deleteNote(event, noteIndex) {
//            notes.splice(noteIndex, 1);
//            loadNotes();
//        }
//
//
//        // Get notes list
//
//        function loadNotes() {
//            let notesHtml = this.notes.reduce((html, note, index) => html += this.generateNoteHtml(note, index), '');
//            document.getElementById('noteList').innerHTML = notesHtml;
//        }
//

    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
//    controls.update();
    render();
}

function render() {
    renderer.render(scene, camera);
    updateScreenPosition()
}

function updateScreenPosition() {
    const canvas = renderer.domElement;
    noteLocation = new THREE.Vector3();
    noteLocation.copy(clickLocation);

    noteLocation.project(camera);

    noteLocation.x = (0.5 + noteLocation.x / 2) * (canvas.width / window.devicePixelRatio);
    noteLocation.y = (0.5 - noteLocation.y / 2) * (canvas.height / window.devicePixelRatio);

    note.style.top = `${noteLocation.y}px`;
    note.style.left = `${noteLocation.x}px`;

}
