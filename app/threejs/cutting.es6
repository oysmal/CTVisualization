let cutting_x, cutting_y, cutting_z;
let cut_dir_x, cut_dir_y, cut_dir_z;
let tex;

let hasSetupListners = false;
let scene;

function init(init_scene) {
  scene = init_scene;
  tex = new THREE.TextureLoader().load('assets/images/cutting.png');
  cutting_x = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({map: tex, color: 0xFF0000, opacity: 0.4, side: THREE.DoubleSide, transparent:true}));
  cutting_x.name = "cutting_x";
  cut_dir_x = -1.0;

  cutting_y = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({map: tex, color: 0x00FF00, opacity: 0.4, side: THREE.DoubleSide, transparent:true}));
  cutting_y.name = "cutting_y";
  cut_dir_y = -1.0;

  cutting_z = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({map: tex, color: 0x0000FF, opacity: 0.4, side: THREE.DoubleSide, transparent:true}));
  cutting_z.name = "cutting_z";
  cut_dir_z = -1.0;

  cutting_x.position.set(0.5,0,0);
  cutting_x.rotation.y = Math.PI/2;
  cutting_x.material.side = THREE.DoubleSide;
  scene.add(cutting_x);

  cutting_y.position.set(0,-0.5,0);
  cutting_y.rotation.x = -Math.PI/2;
  cutting_y.material.side = THREE.DoubleSide;
  scene.add(cutting_y);

  cutting_z.position.set(0,0,-0.5);
  cutting_z.material.side = THREE.DoubleSide;
  scene.add(cutting_z);

  if(!hasSetupListners) {
    setUpListeners();
    hasSetupListners = true;
  }

}

function removeFromScene(x) {
  if(scene.getObjectByName(x.name)) {
    scene.remove(x);
  }
}

function getCuttingPosX() {
  if(scene.getObjectByName(cutting_x.name)) {
    return cutting_x.position.x;
  } else {
    return 10.0;
  }
}

function getCuttingPosY() {
  if(scene.getObjectByName(cutting_y.name)) {
    return cutting_y.position.y;
  } else {
    return -10.0;
  }
}

function getCuttingPosZ() {
  if(scene.getObjectByName(cutting_z.name)) {
    return cutting_z.position.z;
  } else {
    return -10.0;
  }
}

function getCuttingDirX() {
  return cut_dir_x;
}

function getCuttingDirY() {
  return cut_dir_y;
}

function getCuttingDirZ() {
  return cut_dir_z;
}

function toggleCutDirX(val) {
  cut_dir_x = val;
}

function toggleCutDirY(val) {
  cut_dir_y = val;
}

function toggleCutDirZ(val) {
  cut_dir_z = val;
}


/**
*   plane to move
*   d distance to move
*   axis to move on
*/
function movePlane(plane, d, axis) {
  if (axis == 'x') {
    plane.x += d;
  } else if (axis == 'y'){
    plane.y += d;
  } else {
    plane.z += d;
  }
}

function getObjects() {
  return {
    cutting_x: cutting_x,
    cutting_y: cutting_y,
    cutting_z: cutting_z
  }
}

function setUpListeners() {
  $(document).on('move_xplane', (e, param) => {
    cutting_x.position.x = 0.5-(0.001*param.value);
  });

  $(document).on('move_yplane', (e, param) => {
    cutting_y.position.y = -0.5+(0.001*param.value);
  });

  $(document).on('move_zplane', (e, param) => {
    cutting_z.position.z = -0.5+(0.001*param.value);
  });

  //-------------------------------------//

  $(document).on('toggle_xplane', (e) => {
    if(!scene.getObjectByName(cutting_x.name)) {
      scene.add(cutting_x);
    } else {
      removeFromScene(cutting_x);
    }
  });

  $(document).on('toggle_yplane', (e) => {
    if(!scene.getObjectByName(cutting_y.name)) {
      scene.add(cutting_y);
    } else {
      removeFromScene(cutting_y);
    }
  });

  $(document).on('toggle_zplane', (e) => {
    if(!scene.getObjectByName(cutting_z.name)) {
      scene.add(cutting_z);
    } else {
      removeFromScene(cutting_z);
    }
  });


  $(document).on('toggleCutDirX', (e, obj) => {
    toggleCutDirX(obj.val);
  });

  $(document).on('toggleCutDirY', (e, obj) => {
    toggleCutDirY(obj.val);
  });

  $(document).on('toggleCutDirZ', (e, obj) => {
    toggleCutDirZ(obj.val);
  });

}

export default {init, removeFromScene, movePlane, getCuttingPosX, getCuttingPosY, getCuttingPosZ, getCuttingDirX, getCuttingDirY, getCuttingDirZ};
