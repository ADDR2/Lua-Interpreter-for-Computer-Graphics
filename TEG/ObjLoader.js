function loadDoc(file, verts, norms, coords, center, flatNorms) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", file, false);
  xhttp.send();
    if(xhttp.responseText != ""){
        compileObjModel(xhttp.responseText, verts, norms, coords, center, flatNorms);
        return true;
    }
    console.log("El archivo "+file+" no se encontro o no contiene nada");
    return false;
}


function store(line, array, limit){
    var nonSpace = /[^\t\s\v\0]/;
    var helper = [];
    var cont = 0;
    helper = line.split(/[\t\s\v\0]/);
    for (var j = 0; j < helper.length && cont < limit; j++){
        if(nonSpace.test(helper[j])){
            var c = Number(helper[j]);
            if(!isNaN(c)){
                array.push(c);
                cont++;
            }
        }
    }
}

function compileObjModel(fileText, iVerts, iNorms, iCoords, center,flatNorms){
    var lines = fileText.split("\n");
    var nonIndex = /[^0-9\/]/;
    var number = /[0-9]/;
    var vertex = /[v][\s\t\v\0]/;
    var normal = /[v][n][\s\t\v\0]/;
    var texCoord = /[v][t][\s\t\v\0]/;
    var index = /[f][\s\t\v\0]/
    var verts = [];
    var normals = [];
    var texCoords = [];
    var indexes = [];
    
    var max_x = -Number.MAX_VALUE;
    var max_y = -Number.MAX_VALUE;
    var max_z = -Number.MAX_VALUE;
    var min_x = Number.MAX_VALUE;
    var min_y = Number.MAX_VALUE;
    var min_z = Number.MAX_VALUE;
    for (var i = 0; i < lines.length; i++){
        if(vertex.test(lines[i]))
            store(lines[i], verts, 3);

        if(normal.test(lines[i]))
            store(lines[i], normals, 3);

        if(texCoord.test(lines[i]))
            store(lines[i], texCoords, 2);

        if(index.test(lines[i])){
            lines[i] = lines[i].split(/[\t\s\v\0]/);
            var cont = 0;
            var ind = iVerts.length-1;
            var ind_cond = iCoords.length-1;
            for (var j = 0; j < lines[i].length; j++){
                if(!nonIndex.test(lines[i][j]) && number.test(lines[i][j][0])){
                    var helper = lines[i][j].split("/");
                    if(cont < 3){
                        if(helper != lines[i][j]){
                            if (number.test(helper[0])){
                                iVerts.push(verts[(Number(helper[0])-1)*3]);
                                iVerts.push(verts[(Number(helper[0])-1)*3+1]);
                                iVerts.push(verts[(Number(helper[0])-1)*3+2]);

                                if(iVerts[iVerts.length-3] > max_x)
                                    max_x = iVerts[iVerts.length-3];
                                if(iVerts[iVerts.length-2] > max_y)
                                    max_y = iVerts[iVerts.length-2];
                                if(iVerts[iVerts.length-1] > max_z)
                                    max_z = iVerts[iVerts.length-1];
                                if(iVerts[iVerts.length-3] < min_x)
                                    min_x = iVerts[iVerts.length-3];
                                if(iVerts[iVerts.length-2] < min_y)
                                    min_y = iVerts[iVerts.length-2];
                                if(iVerts[iVerts.length-1] < min_z)
                                    min_z = iVerts[iVerts.length-1];
                            }
                                //iVerts.push(Number(helper[0])-1);
                            if (number.test(helper[1])){
                                iCoords.push(texCoords[(Number(helper[1])-1)*2]);
                                iCoords.push(texCoords[(Number(helper[1])-1)*2+1]);
                            }

                            if (helper.length >= 3 && number.test(helper[2])){
                                iNorms.push(normals[(Number(helper[2])-1)*3]);
                                iNorms.push(normals[(Number(helper[2])-1)*3+1]);
                                iNorms.push(normals[(Number(helper[2])-1)*3+2]);
                            }

                        }else{
                            iVerts.push(verts[(Number(lines[i][j])-1)*3]);
                            iVerts.push(verts[(Number(lines[i][j])-1)*3+1]);
                            iVerts.push(verts[(Number(lines[i][j])-1)*3+2]);

                            if(iVerts[iVerts.length-3] > max_x)
                                max_x = iVerts[iVerts.length-3];
                            if(iVerts[iVerts.length-2] > max_y)
                                max_y = iVerts[iVerts.length-2];
                            if(iVerts[iVerts.length-1] > max_z)
                                max_z = iVerts[iVerts.length-1];
                            if(iVerts[iVerts.length-3] < min_x)
                                min_x = iVerts[iVerts.length-3];
                            if(iVerts[iVerts.length-2] < min_y)
                                min_y = iVerts[iVerts.length-2];
                            if(iVerts[iVerts.length-1] < min_z)
                                min_z = iVerts[iVerts.length-1];
                        }
                    }else{
                        if(helper != lines[i][j]){
                            if (number.test(helper[0])){
                                iVerts.push(iVerts[ind+1]);
                                iVerts.push(iVerts[ind+2]);
                                iVerts.push(iVerts[ind+3]);

                                iVerts.push(iVerts[iVerts.length-6]);
                                iVerts.push(iVerts[iVerts.length-6]);
                                iVerts.push(iVerts[iVerts.length-6]);

                                iVerts.push(verts[(Number(helper[0])-1)*3]);
                                iVerts.push(verts[(Number(helper[0])-1)*3+1]);
                                iVerts.push(verts[(Number(helper[0])-1)*3+2]);

                                if(iVerts[iVerts.length-3] > max_x)
                                    max_x = iVerts[iVerts.length-3];
                                if(iVerts[iVerts.length-2] > max_y)
                                    max_y = iVerts[iVerts.length-2];
                                if(iVerts[iVerts.length-1] > max_z)
                                    max_z = iVerts[iVerts.length-1];
                                if(iVerts[iVerts.length-3] < min_x)
                                    min_x = iVerts[iVerts.length-3];
                                if(iVerts[iVerts.length-2] < min_y)
                                    min_y = iVerts[iVerts.length-2];
                                if(iVerts[iVerts.length-1] < min_z)
                                    min_z = iVerts[iVerts.length-1];
                            }
                                //iVerts.push(Number(helper[0])-1);
                            if (number.test(helper[1])){
                                iCoords.push(iCoords[ind_cond+1]);
                                iCoords.push(iCoords[ind_cond+2]);

                                iCoords.push(iCoords[iCoords.length-4]);
                                iCoords.push(iCoords[iCoords.length-4]);

                                iCoords.push(texCoords[(Number(helper[1])-1)*2]);
                                iCoords.push(texCoords[(Number(helper[1])-1)*2+1]);
                            }

                            if (helper.length >= 3 && number.test(helper[2])){
                                iNorms.push(iNorms[ind+1]);
                                iNorms.push(iNorms[ind+2]);
                                iNorms.push(iNorms[ind+3]);

                                iNorms.push(iNorms[iNorms.length-6]);
                                iNorms.push(iNorms[iNorms.length-6]);
                                iNorms.push(iNorms[iNorms.length-6]);

                                iNorms.push(normals[(Number(helper[2])-1)*3]);
                                iNorms.push(normals[(Number(helper[2])-1)*3+1]);
                                iNorms.push(normals[(Number(helper[2])-1)*3+2]);
                            }

                        }else{
                            iVerts.push(iVerts[ind+1]);
                            iVerts.push(iVerts[ind+2]);
                            iVerts.push(iVerts[ind+3]);

                            iVerts.push(iVerts[iVerts.length-6]);
                            iVerts.push(iVerts[iVerts.length-6]);
                            iVerts.push(iVerts[iVerts.length-6]);

                            iVerts.push(verts[(Number(lines[i][j])-1)*3]);
                            iVerts.push(verts[(Number(lines[i][j])-1)*3+1]);
                            iVerts.push(verts[(Number(lines[i][j])-1)*3+2]);

                            if(iVerts[iVerts.length-3] > max_x)
                                max_x = iVerts[iVerts.length-3];
                            if(iVerts[iVerts.length-2] > max_y)
                                max_y = iVerts[iVerts.length-2];
                            if(iVerts[iVerts.length-1] > max_z)
                                max_z = iVerts[iVerts.length-1];
                            if(iVerts[iVerts.length-3] < min_x)
                                min_x = iVerts[iVerts.length-3];
                            if(iVerts[iVerts.length-2] < min_y)
                                min_y = iVerts[iVerts.length-2];
                            if(iVerts[iVerts.length-1] < min_z)
                                min_z = iVerts[iVerts.length-1];
                        }
                    }
                    cont++;
                    if((iVerts.length/3)%3 == 0){
                        var v1 = [];
                        var v2 = [];
                        var v3 = [];
                        v1.push(iVerts[iVerts.length-9]);
                        v1.push(iVerts[iVerts.length-8]);
                        v1.push(iVerts[iVerts.length-7]);
                        v2.push(iVerts[iVerts.length-6]);
                        v2.push(iVerts[iVerts.length-5]);
                        v2.push(iVerts[iVerts.length-4]);
                        v3.push(iVerts[iVerts.length-3]);
                        v3.push(iVerts[iVerts.length-2]);
                        v3.push(iVerts[iVerts.length-1]);
                        var V1 = [v1[0]-v2[0], v1[1]-v2[1], v1[2]-v2[2]];
                        var V2 = [v1[0]-v3[0], v1[1]-v3[1], v1[2]-v3[2]];
                        var V = [V1[1] * V2[2] - V1[2] * V2[1], V1[2] * V2[0] - V1[0] * V2[2], V1[0] * V2[1] - V1[1] * V2[0]];
                        var len = Math.sqrt(V[0]*V[0]+V[1]*V[1]+V[2]*V[2]);
                        V = [V[0]/len, V[1]/len, V[2]/len];
                        for(var k = iVerts.length-9; k < iVerts.length; k+=3){
                            flatNorms[k] = V[0];
                            flatNorms[k+1] = V[1];
                            flatNorms[k+2] = V[2];
                            if(!("("+iVerts[k]+","+iVerts[k+1]+","+iVerts[k+2]+")" in indexes)){
                                indexes["("+iVerts[k]+","+iVerts[k+1]+","+iVerts[k+2]+")"] = {faces: [], inds: []};
                                indexes["("+iVerts[k]+","+iVerts[k+1]+","+iVerts[k+2]+")"].faces.push(V);
                                indexes["("+iVerts[k]+","+iVerts[k+1]+","+iVerts[k+2]+")"].inds.push(k);
                            }else{
                                indexes["("+iVerts[k]+","+iVerts[k+1]+","+iVerts[k+2]+")"].faces.push(V);
                                indexes["("+iVerts[k]+","+iVerts[k+1]+","+iVerts[k+2]+")"].inds.push(k);
                            }
                        }
                    }
                }
            }
        }
    }
    for(var k in indexes){
        var norm = [0, 0, 0];
        for(var q = 0; q < indexes[k].faces.length; q++){
            norm[0] += indexes[k].faces[q][0];
            norm[1] += indexes[k].faces[q][1];
            norm[2] += indexes[k].faces[q][2];
        }
        norm[0] = norm[0]/indexes[k].faces.length;
        norm[1] = norm[1]/indexes[k].faces.length;
        norm[2] = norm[2]/indexes[k].faces.length;
        for (var q = 0; q < indexes[k].inds.length; q++){
            iNorms[indexes[k].inds[q]] = norm[0];
            iNorms[indexes[k].inds[q]+1] = norm[1];
            iNorms[indexes[k].inds[q]+2] = norm[2];
        }
    }
    var out = "";
    /*out += "["+verts[0]+", "+verts[1]+", "+verts[2]+",\n";
    for (var i = 3; i < verts.length-3; i+=3){
        out += verts[i]+", "+verts[i+1]+", "+verts[i+2]+",\n";
    }
    out += verts[verts.length-3]+", "+verts[verts.length-2]+", "+verts[verts.length-1]+"]";
    console.log(out);
    out = "";
    out += "["+iVerts[0]+", "+iVerts[1]+", "+iVerts[2]+",\n";
    for (var i = 3; i < iVerts.length-3; i+=3){
        out += iVerts[i]+", "+iVerts[i+1]+", "+iVerts[i+2]+",\n";
    }
    out += iVerts[iVerts.length-3]+", "+iVerts[iVerts.length-2]+", "+iVerts[iVerts.length-1]+"]";
    console.log(out);
    out = "";
    out += "["+normals[0]+", "+normals[1]+", "+normals[2]+",\n";
    for (var i = 3; i < normals.length-3; i+=3){
        out += normals[i]+", "+normals[i+1]+", "+normals[i+2]+",\n";
    }
    out += normals[normals.length-3]+", "+normals[normals.length-2]+", "+normals[normals.length-1]+"]";
    console.log(out);
    out = "";
    out += "["+iNorms[0]+", "+iNorms[1]+", "+iNorms[2]+",\n";
    for (var i = 3; i < iNorms.length-3; i+=3){
        out += iNorms[i]+", "+iNorms[i+1]+", "+iNorms[i+2]+",\n";
    }
    out += iNorms[iNorms.length-3]+", "+iNorms[iNorms.length-2]+", "+iNorms[iNorms.length-1]+"]";
    console.log(out);
    out = "";
    out += "["+flatNorms[0]+", "+flatNorms[1]+", "+flatNorms[2]+",\n";
    for (var i = 3; i < flatNorms.length-3; i+=3){
        out += flatNorms[i]+", "+flatNorms[i+1]+", "+flatNorms[i+2]+",\n";
    }
    out += flatNorms[flatNorms.length-3]+", "+flatNorms[flatNorms.length-2]+", "+flatNorms[flatNorms.length-1]+"]";
    console.log(out);*/
    center.push((max_x+min_x)/2);
    center.push((max_y+min_y)/2);
    center.push((max_z+min_z)/2);
    console.log("El centro es: "+((max_x+min_x)/2) +" ,"+ ((max_y+min_y)/2) +" ,"+((max_z+min_z)/2));
    console.log("triangulos: "+iVerts.length/3);
    console.log("norms: "+iNorms.length);
    console.log("flatnorms: "+flatNorms.length);
    console.log("coords: "+iCoords.length);
}

//loadDoc("sphere.obj");

//var defaultColors = [];

//load();

function load() {
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "help.js", false);
  xhttp.send();
    if(xhttp.responseText != ""){
        compileColors(xhttp.responseText);
        return true;
    }
    console.log("El archivo "+"Translation.js"+" no se encontro o no contiene nada");
    return false;
}

function compileColors(text){
    var code = text.replace(/[\n]/g, "\\n");
    console.log(code);
}