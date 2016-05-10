var cameraReady = false;
var currentlyPressedKeys = {};
var cursorPosX;
var cursorPosY;
var lastPosX = -9000;
var lastPosY = -9000;
var currentRotX = -0.5;
var lastRotX = 0.0;

function handleKeyDown(event) {
    if(cameraReady)
		currentlyPressedKeys[event.keyCode] = true;
	if(event.keyCode == 13)
		Do();
}


function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleMouseDown (event){
    if(event.button == 1){
        cameraReady = !cameraReady;
        editor.setReadOnly(cameraReady);
    }
}

function handleMouseMove(event) {

	var canvas = document.getElementById("canvas");

    cursorPosX = event.x - canvas.offsetLeft;
    cursorPosY = event.y - canvas.offsetTop;
}


var camera = new Object();

camera.position = vec3.create();
camera.view = vec3.create();
camera.upVector = vec3.create();
camera.strafe = vec3.fromValues(0,0,0);
camera.frameInterval = 0.0;
camera.frameTime = 0.0;
camera.viewMatrix = mat4.create();
mat4.identity(camera.viewMatrix);

camera.calculateFrameRate = function(){
	var currentTime = new Date().getTime();				
 	camera.frameInterval = currentTime - camera.frameTime;
	camera.frameTime = currentTime;
}

camera.changeAttributes = function(pos, view, up){
	vec3.set(camera.position, pos[0], pos[1], pos[2]);
	vec3.set(camera.view, view[0], view[1], view[2]);
	vec3.set(camera.upVector, up[0], up[1], up[2]);
}

function convertQuaternionToMatrix3(quat, mode){
	var mat = mat3.create();
    var yy2 = 2.0 * quat[1] * quat[1];
    var xy2 = 2.0 * quat[0] * quat[1];
    var xz2 = 2.0 * quat[0] * quat[2];
    var yz2 = 2.0 * quat[1] * quat[2];
    var zz2 = 2.0 * quat[2] * quat[2];
    var wz2 = 2.0 * quat[3] * quat[2];
    var wy2 = 2.0 * quat[3] * quat[1];
    var wx2 = 2.0 * quat[3] * quat[0];
    var xx2 = 2.0 * quat[0] * quat[0];
    mat[0] = - yy2 - zz2 + 1.0;
    mat[1] = xy2 - mode * wz2;
    mat[2] = xz2 + mode * wy2;
    mat[3] = xy2 + mode * wz2;
    mat[4] = - xx2 - zz2 + 1.0;
    mat[5] = yz2 - mode * wx2;
    mat[6] = xz2 - mode * wy2;
    mat[7] = yz2 + mode * wx2;
    mat[9] = - xx2 - yy2 + 1.0;
	return mat;
}

function setQuaternionFromAxisAngle(axis, angle){
	var qua = quat.create();
    var sina2;
    sina2 = Math.sin(0.5 * angle);
    qua[0] = sina2 * axis[0];
    qua[1] = sina2 * axis[1];
    qua[2] = sina2 * axis[2];
    qua[3] = Math.cos(0.5 * angle);
	return qua;
}

function multiplyVec3ByMat3(vec, mat){
	var result = vec3.create();
	result[0] = vec[0]*mat[0] + vec[1]*mat[1] + vec[2]*mat[2];
	result[1] = vec[0]*mat[3] + vec[1]*mat[4] + vec[2]*mat[5];
	result[2] = vec[0]*mat[6] + vec[1]*mat[7] + vec[2]*mat[8];
	return result;
}

camera.setViewByMouse = function(){								
	var middleX = gl.viewportWidth / 2;			
	var middleY = gl.viewportHeight / 2;				
	var angleY = 0.0;
	var angleZ = 0.0;



	angleY = ( (middleX - cursorPosX) ) / 11000.0;		
	angleZ = ( (middleY - cursorPosY) ) / 11000.0;		

	lastRotX = currentRotX;

	currentRotX += angleZ;
	
	var axis = vec3.create();
	vec3.cross(axis, vec3.fromValues(-camera.view[0] + camera.position[0],-camera.view[1] + camera.position[1],-camera.view[2] + camera.position[2]), camera.upVector);
	vec3.normalize(axis, axis);
	vec3.negate(axis, axis);

	if(currentRotX > 1.5){
		currentRotX = 1.5 ;
		if(lastRotX != 1.5 )
			camera.rotateView(1.5  - lastRotX, axis);

	}else if(currentRotX < -1.5){
		currentRotX = -1.5;
		if(lastRotX != -1.5)
			camera.rotateView(-1.5 - lastRotX, axis);

	}else
        camera.rotateView(angleZ, axis);
	camera.rotateView(angleY, [0, 1, 0]);
}

camera.rotateView = function(degrees, dir){
	var view = vec3.fromValues(camera.view[0]-camera.position[0],camera.view[1]-camera.position[1],camera.view[2]-camera.position[2]);		
	var qua = quat.create();
	quat.setAxisAngle(qua, dir, degrees);

	var newView = vec3.create();
	vec3.transformQuat(newView, view, qua);

	vec3.set(camera.view, camera.position[0]+newView[0],camera.position[1]+newView[1],camera.position[2]+newView[2]);
}

camera.strafeCamera = function(speed){	
	camera.position[0] += camera.strafe[0] * speed;
	camera.position[2] += camera.strafe[2] * speed;

	camera.view[0] += camera.strafe[0] * speed;
	camera.view[2] += camera.strafe[2] * speed;
}

camera.moveCamera = function(speed){
	var vector = vec3.fromValues(camera.view[0] - camera.position[0],camera.view[1] - camera.position[1],camera.view[2] - camera.position[2]);
	vec3.normalize(vector, vector);

	camera.position[0] += vector[0] * speed;		
	camera.position[1] += vector[1] * speed;		
	camera.position[2] += vector[2] * speed;		
	camera.view[0] += vector[0] * speed;		
	camera.view[1] += vector[1] * speed;		
	camera.view[2] += vector[2] * speed;		
}

camera.checkForMovement = function(){	
	var speed = camera.frameInterval / 100.0;

	if (currentlyPressedKeys[38] || currentlyPressedKeys[87])
        camera.moveCamera(speed);

    if (currentlyPressedKeys[40] || currentlyPressedKeys[83])
        camera.moveCamera(-speed);

    if (currentlyPressedKeys[37] || currentlyPressedKeys[65])
        camera.strafeCamera(-speed);

    if (currentlyPressedKeys[39] || currentlyPressedKeys[68])
        camera.strafeCamera(speed);
}

camera.update = function(){

	var cross = vec3.create();
	vec3.cross(cross, vec3.fromValues(camera.view[0] - camera.position[0],camera.view[1] - camera.position[1],camera.view[2] - camera.position[2]), camera.upVector);

	vec3.normalize(camera.strafe, cross);

	if(cameraReady && (cursorPosX != lastPosX || cursorPosY != lastPosY))
		camera.setViewByMouse();

	lastPosX = cursorPosX;
	lastPosY = cursorPosY;

	camera.checkForMovement();

	camera.calculateFrameRate();
}

camera.look = function(){
	mat4.lookAt(camera.viewMatrix, camera.position, camera.view, camera.upVector);
}
