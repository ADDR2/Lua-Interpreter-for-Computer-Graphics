			var DisplayArray = new Array();
			var arrayLights = new Array();
			var arrayDirLights = new Array();
			var arraySpotLights = new Array();
			var translateCode = false;
			var codeFunctions;
			var svCont = -1;
			var enterActivated = false;

			function enterKey(){
				enterActivated = !enterActivated;
			}

			function modifyShader_Point(){
				var str = document.getElementById("shader-fPhong").innerHTML;
				if(arrayLights.length > 1 )
					str = str.replace("pLights["+(arrayLights.length-1)+"];", "pLights["+arrayLights.length+"];");
				str = str.replace("i<"+(arrayLights.length-1)+";", "i<"+arrayLights.length+";");
				document.getElementById("shader-fPhong").innerHTML = str;
				str = document.getElementById("shader-vFlat").innerHTML;
				if(arrayLights.length > 1 )
					str = str.replace("pLights["+(arrayLights.length-1)+"];", "pLights["+arrayLights.length+"];");
				str = str.replace("i<"+(arrayLights.length-1)+";", "i<"+arrayLights.length+";");
				document.getElementById("shader-vFlat").innerHTML = str;
			}

			function modifyShader_Dir(){
				var str = document.getElementById("shader-fPhong").innerHTML;
				if(arrayDirLights.length > 1 )
					str = str.replace("dLights["+(arrayDirLights.length-1)+"];", "dLights["+arrayDirLights.length+"];");
				str = str.replace("k<"+(arrayDirLights.length-1)+";", "k<"+arrayDirLights.length+";");
				document.getElementById("shader-fPhong").innerHTML = str;
				str = document.getElementById("shader-vFlat").innerHTML;
				if(arrayDirLights.length > 1 )
					str = str.replace("dLights["+(arrayDirLights.length-1)+"];", "dLights["+arrayDirLights.length+"];");
				str = str.replace("k<"+(arrayDirLights.length-1)+";", "k<"+arrayDirLights.length+";");
				document.getElementById("shader-vFlat").innerHTML = str;
			}

			function modifyShader_Spot(){
				var str = document.getElementById("shader-fPhong").innerHTML;
				if(arraySpotLights.length > 1 )
					str = str.replace("spLights["+(arraySpotLights.length-1)+"];", "spLights["+arraySpotLights.length+"];");
				str = str.replace("j<"+(arraySpotLights.length-1)+";", "j<"+arraySpotLights.length+";");
				document.getElementById("shader-fPhong").innerHTML = str;
				str = document.getElementById("shader-vFlat").innerHTML;
				if(arraySpotLights.length > 1 )
					str = str.replace("spLights["+(arraySpotLights.length-1)+"];", "spLights["+arraySpotLights.length+"];");
				str = str.replace("j<"+(arraySpotLights.length-1)+";", "j<"+arraySpotLights.length+";");
				document.getElementById("shader-vFlat").innerHTML = str;
			}

			function addToConsole(string){
				document.getElementById("console").innerHTML = string+"\n"+document.getElementById("console").innerHTML;
			}

			function addTab(size){
				var tabs = "\t";
				for(var i = 0; i < size; i++)
					tabs += "\t";
				return tabs;
			}

			var DataStructures = {
			    stack : function() {                  
			        var elements;
			        
			        this.push = function(element) {
			            if (typeof(elements) === 'undefined') {
			                elements = [];   
			            }                            
			            elements.push(element);
			        }
			        this.pop = function() {
			            return elements.pop();
			        }
			        this.top = function(element) {
			            return elements[elements.length - 1];
			        }
			        this.size = function(){
			        	return elements.length;
			        }
			        this.find = function(index){
			        	return elements[index];
			        }
			    }
			}

			Object.size = function(obj) {
    			var size = 0, key;
    			for (key in obj) {
       			if (obj.hasOwnProperty(key)) size++;
   				}
  			 	return size;
			};

			function AstNode(type, params) {
				this.type = type;
				for(var key in params){ this[key] = params[key];}
				return this;
			}

			Object.size = function(obj) {
    			var size = 0, key;
    			for (key in obj) {
       			if (obj.hasOwnProperty(key)) size++;
   				}
  			 	return size;
			};

			function FindScope(name, index){
				if (index < 0){
					return null;
				}
				if (index >= 0){
					if (name in executionstack.find(index)){
						return executionstack.find(index)[name];
					}
					return FindScope(name, index-1);
				}
			}

			function validNumber(node){
				var val = Number(node.value);
				if(node.type == 'string' && !isNaN(val)){
					node.value = val;
					return true;
				}
				if (node.type == 'number')
					return true;
				return false;
			}

			function validCoord(num){
				if(typeof num == 'number')
					return num;
				var val = Number(num);
				if(typeof num == 'string' && !isNaN(val))
					return val;
				return null;
			}

			function findNParams(content, N, array){
				if (typeof content == 'object'){
					for(var i in content){
						if(array.length < N){
							var aux = validCoord(content[i]);
							if(aux || aux+"" == "0"){
								array.push(aux);
							}
							if(typeof content[i] == 'object'){
								findNParams(content[i], N, array);
							}
						}
					}
				}else{
					var aux = validCoord(content);
					if(aux || aux+"" == "0"){
						array.push(aux);
					}
				}
			}

			function findStringParam(content, N, array){
				if (typeof content == 'object'){
					for(var i in content){
						if(array.length < N){
							if(typeof content[i] == 'string'){
								array.push(content[i]);
							}
							if(typeof content[i] == 'object'){
								findNParams(content[i], N, array);
							}
						}
					}
				}else{
					if(typeof content == 'string'){
						array.push(content);
					}
				}
			}

			function checkObj(filename){
				var str = filename.split(".");
				if(filename == str)
					addToConsole("No se encontro extension en el archivo, el cargador podria fallar");
				else{
					var result = "";
					for(var i = 1; i < str.length; i++){
						result += ".";
						result += str[i];
					}
					if(str[str.length-1] != "obj")
						addToConsole("La extension "+result+" no es obj, el cargador podria fallar");
				}
			}

			function firstValue(exp){
				if(Array.isArray(exp)){
					if(Array.isArray(exp[0]))
						return firstValue(exp[0]);
					else{
						if(!exp[0]){
							exp[0] = new AstNode('undefined', {value: null});
						}
						return exp[0];
					}
				}else{
					if(!exp){
						exp = new AstNode('undefined', {value: null});
					}
					return exp;
				}
			}

			function union(array1, array2){
				for(var key in array2)
					array1.push(array2[key]);
			}

			function findIndex(keys, array){
				if (keys.length > 1){
					if( keys[0] in array && Array.isArray(array[keys[0]]) )
						return findIndex(keys.slice(1), array[keys[0]]);
					else
						return null;
				}else{
					if (keys[0] in array)
						return array[keys[0]];
					else
						return null;
				}
			}

			function setValIndex(keys, array, value){
				if (keys.length > 1){
					if( keys[0] in array && Array.isArray(array[keys[0]]) )
						return setValIndex(keys.slice(1), array[keys[0]], value);
					else
						return false;
				}else{
					array[keys[0]] = value;
					return true;
				}
			}

			function value(exp, explist){
				if(explist){
					var result = [];
					for(var i = 0; i < exp.length-1; i++){
						if(!Array.isArray(exp[i])){
							if(!exp[i]){
								exp[i] = new AstNode('undefined', {value: null});
							}
							result.push(exp[i]);
						}else
							result.push(firstValue(exp[i][0]));
					}
					if(!Array.isArray(exp[exp.length-1])){
						if(!exp[exp.length-1]){
							exp[exp.length-1] = new AstNode('undefined', {value: null});
						}
						result.push(exp[exp.length-1]);
					}else
						union(result, value(exp[exp.length-1], true));
					return result;
				}else{
					if(Array.isArray(exp))
						return firstValue(exp[0]);
					else{
						if(!exp){
							exp = new AstNode('undefined', {value: null});
						}
						return exp;
					}
				}
			}

			function numbers(array){
				for (var i = 0; i < array.length; i++){
					if(typeof array[i] != "number"){
						if(typeof array[i] == "string" && !isNaN(Number(array[i])))
							array[i] = Number(array[i]);
						else
							return false;
					}
				}
				return true;
			}

			function translateColor(array){
				if(array.length > 1){
					for(var i in array){
						if(array[i] > 1.0){
							array[0] /= 255;
							array[1] /= 255;
							array[2] /= 255;
							return true;
						}
					}
					return true;
				}else{
					if(typeof array[0] == "string"){
						if(array[0] in defaultColors){
							var aux = array[0];
							array[0] = defaultColors[aux][0];
							array.push(defaultColors[aux][1]);
							array.push(defaultColors[aux][2]);
							return true;
						}else
							return false;
					}
					return false;
				}
			}

			var program;
			var test = false;
			var cut = false;
			var loopOn = false;

			function eval(astNode){
				var v;
				if (!cut){
					switch(astNode.type) {
						case 'Chunk':
							var left = eval(astNode.left);
							if(left)
								v = left;
							else
								v = eval(astNode.right);
						break;
						case 'Stat':
							v = eval(astNode.left);
							v = eval(astNode.right);
						break;
						case 'Asignation':
							var left = eval(astNode.left).reverse();
							var right = value(eval(astNode.right).reverse(), true);
							var lsize = Object.size(left);
							var rsize = Object.size(right);
							for (var i = 0; i < lsize; i++){
								var val = null;
								if(rsize>0){
									val = right[i].value;
									rsize--;
								}
								var item = FindScope(left[i].name, executionstack.size()-1);
								if (item){
									if (!left[i].keys){
										item.value = val;
									}else{
										if(Array.isArray(item.value)){
											if (!setValIndex(left[i].keys, item.value, val))
												addToConsole("Semantic Error: table position not found");
										}else{
											addToConsole("Semantic Error: variable "+left[i].name+" is not a table");
										}
									}
								}else{
									if (!left[i].keys){
										executionstack.find(0)[left[i].name] = new AstNode('var', {value: val});
									}else
										addToConsole("Semantic Error: table "+left[i].name+" has not been built");
								}		
							}
						break;
						case 'LocalAsignation':
							var left = eval(astNode.left).reverse();
							var right = eval(astNode.right);
							var lsize = Object.size(left);
							var rsize = 0;
							if(right != null){
								right = value(eval(astNode.right).reverse(), true);
								rsize = Object.size(right);
							}
							for (var i = 0; i < lsize; i++){
								var val = null;
								if(rsize>0){
									val = right[i].value;
									rsize--;
								}
								executionstack.top()[left[i].name] = new AstNode('var', {value: val});
							}
						break;
						case 'LastVar':
							v = [];
							v.push(eval(astNode.left));
						break;
						case 'NextVar':
							v = eval(astNode.next);
							v.push(eval(astNode.left));
						break;
						case 'LastExp':
							v = [];
							v.push(eval(astNode.left));
						break;
						case 'NextExp':
							v = eval(astNode.next);
							v.push(eval(astNode.left));
						break;
						case 'While':
							var cond = value(eval(astNode.cond), false);
							var stop = false;
							var moreLoops = loopOn;
							loopOn = true;
							while((cond.value || cond.value+"" == "0" || cond.value+"" == "") && !stop){

								var newstackframe = {};
								executionstack.push(newstackframe);
								v = eval(astNode.block);
								executionstack.pop();

								stop = v;
								v = null;

								cond = value(eval(astNode.cond), false);
							}
							if(cut)
								cut = false;
							if (!moreLoops)
								loopOn = false;
						break;
						case 'Do':
							var newstackframe = {};
							executionstack.push(newstackframe);
							v = eval(astNode.block);
							executionstack.pop();
						break;
						case 'Repeat':
							var cond;
							var stop = false;
							var moreLoops = loopOn;
							loopOn = true;
							do{
								var newstackframe = {};
								executionstack.push(newstackframe);
								v = eval(astNode.block);
								cond = value(eval(astNode.until), false);
								executionstack.pop();

								stop = v;
								v = null;

							}while(!(cond.value || cond.value+"" == "0" || cond.value+"" == "") && !stop);
							if(cut)
								cut = false;
							if (!moreLoops)
								loopOn = false;
						break;
						case 'For':
							var index = eval(astNode.index);
							var item = new AstNode('var', {value: null});
							var val = value(eval(astNode.value), false);
							var end = value(eval(astNode.until), false);
							var inc = eval(astNode.inc);
							var stop = false;
							var moreLoops = loopOn;
							if(val.type == 'number' && end.type == 'number'){
								

								item.value = val.value;
								if(!inc)
									inc = new AstNode('number', {value: 1});
								else{
									inc = value(inc, false);
									if(inc.type != 'number'){
										inc = new AstNode('number', {value: 1});
									}
								}

								loopOn = true;

								while ((( inc.value >= 0 && item.value <= end.value )||( inc.value < 0 && item.value >= end.value )) && !stop){

									var newstackframe = {};
									executionstack.push(newstackframe);

									executionstack.top()[index.name] = new AstNode('var', {value: item.value});

									v = eval(astNode.block);
									executionstack.pop();

									stop = v;
									v = null;
									item.value += inc.value;
								}
								if(cut)
									cut = false;
							}else{
								addToConsole("Semantic Error: for sentence requires numeric values");
							}
							if (!moreLoops)
								loopOn = false;
						break;
						case 'Function':
							var func = eval(astNode.name);
							var body = eval(astNode.body);
							executionstack.top()[func.name] = new AstNode('function', {params: body.params, block: body.block});
						break;
						case 'FuncBody':
							var params = [];
							if(astNode.params){
								var aux = eval(astNode.params);
								for (var i = aux.length-1; i >= 0; i--){
									params.push(aux[i].name);
								}
							}
							v = new AstNode('Function', {params: params, block: astNode.block});
						break;
						case 'If':
							var cond = value(eval(astNode.cond), false);
							if(cond.value || cond.value+"" == "0" || cond.value+"" == ""){

								var newstackframe = {};
								executionstack.push(newstackframe);
								v = eval(astNode.block);
								executionstack.pop();

							}else{
								var left = eval(astNode.eli);
								if(left)
									v = left
								else
									v = eval(astNode.el);
							}
						break;
						case 'Else':
							var newstackframe = {};
							executionstack.push(newstackframe);
							v = eval(astNode.block);
							executionstack.pop();
						break;
						case 'Elseif':
							var cond = value(eval(astNode.cond), false);
							if(cond.value || cond.value+"" == "0" || cond.value+"" == ""){

								var newstackframe = {};
								executionstack.push(newstackframe);
								v = eval(astNode.block);
								executionstack.pop();

							}else{
								eval(astNode.next);
							}
						break;
						case 'Break':
							if(loopOn){
								cut = true;
								v = true;
							}else
								v = null;
						break;
						case 'Or':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if(left.value || left.value+"" == "0" || left.value+"" == "")
								v = new AstNode(typeof left.value, { value: left.value});
							else
								v = new AstNode(typeof right.value, { value: right.value});
						break;
						case 'And':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if(!left.value && left.value+"" != "0" && left.value+"" != "")
								v = new AstNode(typeof left.value, { value: left.value});
							else
								v = new AstNode(typeof right.value, { value: right.value});
						break;
						case '==':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							v = new AstNode('boolean', { value: left.value === right.value});
						break;
						case '~=':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							v = new AstNode('boolean', { value: left.value !== right.value});
						break;
						case '>=':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if (left.type == right.type)
								v = new AstNode('boolean', { value: left.value >= right.value});
							else
								addToConsole("Semantic Error: greater equal operator requires same types for both values");
						break;
						case '<=':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if (left.type == right.type)
								v = new AstNode('boolean', { value: left.value <= right.value});
							else
								addToConsole("Semantic Error: less equal operator requires same types for both values");
						break;
						case '>':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if (left.type == right.type)
								v = new AstNode('boolean', { value: left.value > right.value});
							else
								addToConsole("Semantic Error: greater operator requires same types for both values");
						break;
						case '<':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if (left.type == right.type && left.type == 'number')
								v = new AstNode('boolean', { value: left.value < right.value});
							else
								addToConsole("Semantic Error: less operator requires same types for both values");
						break;
						case '|':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if (validNumber(left) && validNumber(right))
								v = new AstNode('number', { value: left.value | right.value});
							else
								addToConsole("Semantic Error: binary or operator requires numeric values");
						break;
						case '~':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if (validNumber(left) && validNumber(right))
								v = new AstNode('number', { value: left.value ^ right.value});
							else
								addToConsole("Semantic Error: binary negation operator requires numeric values");
						break;
						case '&':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if (validNumber(left) && validNumber(right))
								v = new AstNode('number', { value: left.value & right.value});
							else
								addToConsole("Semantic Error: binary and operator requires numeric values");
						break;
						case '>>':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if (validNumber(left) && validNumber(right))
								v = new AstNode('number', { value: left.value >> right.value});
							else
								addToConsole("Semantic Error: right shift operator requires numeric values");
						break;
						case '<<':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if (validNumber(left) && validNumber(right))
								v = new AstNode('number', { value: left.value << right.value});
							else
								addToConsole("Semantic Error: left shift operator requires numeric values");
						break;
						case '..':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if ((left.type == 'string' || left.type == 'number')&&(right.type == 'string' || right.type == 'number'))
								v = new AstNode('string', { value: ("" + left.value) + ("" + right.value)});
							else
								addToConsole("Semantic Error: concat operator requires string values");
						break;
						case '-':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if (validNumber(left) && validNumber(right))
								v = new AstNode('number', { value: left.value - right.value});
							else
								addToConsole("Semantic Error: subtraction operator requires numeric values");
						break;
						case '+':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if (validNumber(left) && validNumber(right))
								v = new AstNode('number', { value: left.value + right.value});
							else
								addToConsole("Semantic Error: addition operator requires numeric values");
						break;
						case '%':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if (validNumber(left) && validNumber(right))
								v = new AstNode('number', { value: left.value % right.value});
							else
								addToConsole("Semantic Error: mod operator requires numeric values");
						break;
						case '//':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if (validNumber(left) && validNumber(right))
								v = new AstNode('number', { value: Math.floor(left.value / right.value)});
							else
								addToConsole("Semantic Error: integer division operator requires numeric values");
						break;
						case '/':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if (validNumber(left) && validNumber(right))
								v = new AstNode('number', { value: left.value / right.value});
							else
								addToConsole("Semantic Error: division operator requires numeric values");
						break;
						case '*':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if (validNumber(left) && validNumber(right))
								v = new AstNode('number', { value: left.value * right.value});
							else
								addToConsole("Semantic Error: multiplication operator requires numeric values");
						break;
						case 'Bitnot':
							var left = value(eval(astNode.left), false);
							if (validNumber(left))
								v = new AstNode('number', { value: ~ left.value});
							else
								addToConsole("Semantic Error: binary negation operator requires a numeric value");
						break;
						case 'Uminus':
							var left = value(eval(astNode.left), false);
							if ( validNumber(left) )
								v = new AstNode('number', { value: -left.value});
							else
								addToConsole("Semantic Error: unary negation operator requires a numeric value");
						break;
						case '#':
							var left = value(eval(astNode.left), false);
							if (left.type == 'string' || left.type == 'number')
								v = new AstNode('number', { value: ((left.value+"").length)});
							else{
								if(Array.isArray(left.value))
									v = new AstNode('number', { value: (left.value.length)});
								else
									addToConsole("Semantic Error: length operator requires numeric, string or table values");
							}
						break;
						case 'Not':
							var left = value(eval(astNode.left), false);
							v = new AstNode('boolean', { value: (left.value+"" != "0" ) && (!left.value)});
						break;
						case '^':
							var left = value(eval(astNode.left), false);
							var right = value(eval(astNode.right), false);
							if (validNumber(left) && validNumber(right))
								v = new AstNode('number', { value: Math.pow(left.value, right.value)});
							else
								addToConsole("Semantic Error: power operator requires numeric values");
						break;
						case 'KG':
							v = eval(astNode.left);
						break;
						case 'HexFloat':
							v = new AstNode('number', {value : parseFloat(astNode.value, 16)});
						break;
						case 'Num':
							v = new AstNode('number', {value : astNode.value});
						break;
						case 'Var':
							var left = eval(astNode.left);
							var item = FindScope(left.name, executionstack.size()-1);
							if (item){
								if(left.keys){
									if(Array.isArray(item.value)){
										var val = findIndex(left.keys, item.value);
										v = new AstNode(typeof val, {value : val});
									}else{
										addToConsole("Semantic Error: variable: "+left.name+" is not a table");
										v = new AstNode('undefined', {value : null});
									}
								}else
									v = new AstNode(typeof item.value, {value : item.value});
							}else
								v = new AstNode('undefined', {value : null});
						break;
						case 'Bool':
							v = new AstNode('boolean', {value : astNode.value == "true"});
						break;
						case 'String':
							v = new AstNode('string', {value : astNode.value.substr(1, astNode.value.length-2)});
						break;
						case 'NULL':
							v = new AstNode('undefined', {value : null});
						break;
						case 'Constructor':
							if (astNode.left){
								var list = eval(astNode.left).reverse();
								var array = [];
								var cont = 0;
								for (var k = 0; k < list.length-1; k++){
									if(Array.isArray(list[k]) || list[k].type != 'Field'){
										array[cont] = value(list[k], false).value;
										cont++;
									}else{
										array[list[k].key] = list[k].value; 
									}
								}
								var k = list.length-1;
								if(Array.isArray(list[k])){
									var aux = value(list[k], true);
									for (var i = 0; i < aux.length; i++){
										array[cont] = aux[i].value;
										cont++;
									}
								}else{
									if (list[k].type == 'Field'){
										array[list[k].key] = list[k].value;
									}else{
										array[cont] = list[k].value;
									}
								}
								v = new AstNode(typeof array, {value: array});
							}else{
								var val = [];
								v = new AstNode(typeof val, {value: val});
							}
						break;
						case 'FieldExp':
							var key = value(eval(astNode.key), false);
							var val = value(eval(astNode.value), false);
							if (key.type == 'number')
								key.value--;
							v = new AstNode('Field', {key: key.value, value: val.value});
						break;
						case 'FieldName':
							var key = eval(astNode.key);
							var val = value(eval(astNode.value), false);
							v = new AstNode('Field', {key: key.name, value: val.value});
						break;
						case 'Field':
							v = eval(astNode.value);
						break;
						case 'Cube':
							addToConsole("Console Message: drawing a cube");
							var Cube = new Object();
							InitCube(Cube);
							var aux = Cube.center;
							svCont++;
							sceneVertices += "sceneObjects[" + svCont + "] = { verts: [" + Cube.vertices + "], norms: [" + Cube.smoothNormals + "], flatNorms: [" + Cube.flatNormals + "], center: [" + Cube.center + "]};\n";
							codeFunctions += "\t\t\t\tverts = sceneObjects[" + svCont + "].verts;\n\t\t\t\tnorms = sceneObjects[" + svCont + "].norms;\n\t\t\t\tcoords = [];\n\t\t\t\tcenter = sceneObjects[" + svCont + "].center;\n\t\t\t\tflatNorms = sceneObjects[" + svCont + "].flatNorms;\n\t\t\t\tObj = new Object();\n\t\t\t\tInitObj(Obj, verts, norms, coords, center, flatNorms);\n\t\t\t\taux = Obj.center;\n\t\t\t\taux[0] = -aux[0];\n\t\t\t\taux[1] = -aux[1];\n\t\t\t\taux[2] = -aux[2];\n\t\t\t\tObj.Translate(aux);\n\t\t\t\tObj.InitBuffers();\n\t\t\t\tDisplayArray.push(Obj);\n\t\t\t\tisALightTheLastDisplay = 0;\n";
					        aux[0] = -aux[0];
					        aux[1] = -aux[1];
					        aux[2] = -aux[2];
					        Cube.Translate(aux);
							Cube.InitBuffers();
							DisplayArray.push(Cube);
							isALightTheLastDisplay = 0;
							var right = eval(astNode.right);
							if(right){
								right = value(right.reverse(), true);
								var array = [];
								if(right[0].type == "string")
									array.push(right[0].value);
								if(array.length>=1 && typeof array[0] == 'string'){
									Cube.DisplayMode(array[0]);
									codeFunctions += "\n\t\t\t\tObj.DisplayMode(\""+array[0]+"\");\n";
								}
							}
						break;
						case 'Cylinder':
							addToConsole("Console Message: drawing a cylinder");
							var Cylinder = new Object();
							InitCylinder(Cylinder);
							var aux = Cylinder.center;
							svCont++;
							sceneVertices += "sceneObjects[" + svCont + "] = { verts: [" + Cylinder.vertices + "], norms: [" + Cylinder.smoothNormals + "], flatNorms: [" + Cylinder.flatNormals + "], center: [" + Cylinder.center + "]};\n";
							codeFunctions += "\t\t\t\tverts = sceneObjects[" + svCont + "].verts;\n\t\t\t\tnorms = sceneObjects[" + svCont + "].norms;\n\t\t\t\tcoords = [];\n\t\t\t\tcenter = sceneObjects[" + svCont + "].center;\n\t\t\t\tflatNorms = sceneObjects[" + svCont + "].flatNorms;\n\t\t\t\tObj = new Object();\n\t\t\t\tInitObj(Obj, verts, norms, coords, center, flatNorms);\n\t\t\t\taux = Obj.center;\n\t\t\t\taux[0] = -aux[0];\n\t\t\t\taux[1] = -aux[1];\n\t\t\t\taux[2] = -aux[2];\n\t\t\t\tObj.Translate(aux);\n\t\t\t\tObj.InitBuffers();\n\t\t\t\tDisplayArray.push(Obj);\n\t\t\t\tisALightTheLastDisplay = 0;\n";
					        aux[0] = -aux[0];
					        aux[1] = -aux[1];
					        aux[2] = -aux[2];
					        Cylinder.Translate(aux);
							Cylinder.InitBuffers();
							DisplayArray.push(Cylinder);
							isALightTheLastDisplay = 0;
							var right = eval(astNode.right);
							if(right){
								right = value(right.reverse(), true);
								var array = [];
								if(right[0].type == "string")
									array.push(right[0].value);
								if(array.length>=1 && typeof array[0] == 'string'){
									Cylinder.DisplayMode(array[0]);
									codeFunctions += "\n\t\t\t\tObj.DisplayMode(\""+array[0]+"\");\n";
								}
							}
						break;
						case 'Sphere':
							addToConsole("Console Message: drawing a sphere ");
							var Sphere = new Object();
							InitSphere(Sphere);
							var aux = Sphere.center;
							svCont++;
							sceneVertices += "sceneObjects[" + svCont + "] = { verts: [" + Sphere.vertices + "], norms: [" + Sphere.smoothNormals + "], flatNorms: [" + Sphere.flatNormals + "], center: [" + Sphere.center + "]};\n";
							codeFunctions += "\t\t\t\tverts = sceneObjects[" + svCont + "].verts;\n\t\t\t\tnorms = sceneObjects[" + svCont + "].norms;\n\t\t\t\tcoords = [];\n\t\t\t\tcenter = sceneObjects[" + svCont + "].center;\n\t\t\t\tflatNorms = sceneObjects[" + svCont + "].flatNorms;\n\t\t\t\tObj = new Object();\n\t\t\t\tInitObj(Obj, verts, norms, coords, center, flatNorms);\n\t\t\t\taux = Obj.center;\n\t\t\t\taux[0] = -aux[0];\n\t\t\t\taux[1] = -aux[1];\n\t\t\t\taux[2] = -aux[2];\n\t\t\t\tObj.Translate(aux);\n\t\t\t\tObj.InitBuffers();\n\t\t\t\tDisplayArray.push(Obj);\n\t\t\t\tisALightTheLastDisplay = 0;\n";
							aux[0] = -aux[0];
					        aux[1] = -aux[1];
					        aux[2] = -aux[2];
					        Sphere.Translate(aux);
							Sphere.InitBuffers();
							DisplayArray.push(Sphere);
							isALightTheLastDisplay = 0;
							var right = eval(astNode.right);
							if(right){
								right = value(right.reverse(), true);
								var array = [];
								if(right[0].type == "string")
									array.push(right[0].value);
								if(array.length>=1 && typeof array[0] == 'string'){
									Sphere.DisplayMode(array[0]);
									codeFunctions += "\n\t\t\t\tObj.DisplayMode(\""+array[0]+"\");\n";
								}
							}
						break;
						case 'Cone':
							addToConsole("Console Message: drawing a cone");
							var Cone = new Object();
							InitCone(Cone);
							var aux = Cone.center;
							svCont++;
							sceneVertices += "sceneObjects[" + svCont + "] = { verts: [" + Cone.vertices + "], norms: [" + Cone.smoothNormals + "], flatNorms: [" + Cone.flatNormals + "], center: [" + Cone.center + "]};\n";
							codeFunctions += "\t\t\t\tverts = sceneObjects[" + svCont + "].verts;\n\t\t\t\tnorms = sceneObjects[" + svCont + "].norms;\n\t\t\t\tcoords = [];\n\t\t\t\tcenter = sceneObjects[" + svCont + "].center;\n\t\t\t\tflatNorms = sceneObjects[" + svCont + "].flatNorms;\n\t\t\t\tObj = new Object();\n\t\t\t\tInitObj(Obj, verts, norms, coords, center, flatNorms);\n\t\t\t\taux = Obj.center;\n\t\t\t\taux[0] = -aux[0];\n\t\t\t\taux[1] = -aux[1];\n\t\t\t\taux[2] = -aux[2];\n\t\t\t\tObj.Translate(aux);\n\t\t\t\tObj.InitBuffers();\n\t\t\t\tDisplayArray.push(Obj);\n\t\t\t\tisALightTheLastDisplay = 0;\n";
					        aux[0] = -aux[0];
					        aux[1] = -aux[1];
					        aux[2] = -aux[2];
					        Cone.Translate(aux);
							Cone.InitBuffers();
							DisplayArray.push(Cone);
							isALightTheLastDisplay = 0;
							var right = eval(astNode.right);
							if(right){
								right = value(right.reverse(), true);
								var array = [];
								if(right[0].type == "string")
									array.push(right[0].value);
								if(array.length>=1 && typeof array[0] == 'string'){
									Cone.DisplayMode(array[0]);
									codeFunctions += "\n\t\t\t\tObj.DisplayMode(\""+array[0]+"\");\n";
								}
							}
						break;
						case 'Grid':
							addToConsole("Console Message: drawing a grid");
							var Grid = new Object();
							InitGrid(Grid);
							var aux = Grid.center;
							svCont++;
							sceneVertices += "sceneObjects[" + svCont + "] = { verts: [" + Grid.vertices + "], norms: [" + Grid.smoothNormals + "], flatNorms: [" + Grid.flatNormals + "], center: [" + Grid.center + "]};\n";
							codeFunctions += "\t\t\t\tverts = sceneObjects[" + svCont + "].verts;\n\t\t\t\tnorms = sceneObjects[" + svCont + "].norms;\n\t\t\t\tcoords = [];\n\t\t\t\tcenter = sceneObjects[" + svCont + "].center;\n\t\t\t\tflatNorms = sceneObjects[" + svCont + "].flatNorms;\n\t\t\t\tObj = new Object();\n\t\t\t\tInitObj(Obj, verts, norms, coords, center, flatNorms);\n\t\t\t\taux = Obj.center;\n\t\t\t\taux[0] = -aux[0];\n\t\t\t\taux[1] = -aux[1];\n\t\t\t\taux[2] = -aux[2];\n\t\t\t\tObj.Translate(aux);\n\t\t\t\tObj.InitBuffers();\n\t\t\t\tDisplayArray.push(Obj);\n\t\t\t\tisALightTheLastDisplay = 0;\n";
					        aux[0] = -aux[0];
					        aux[1] = -aux[1];
					        aux[2] = -aux[2];
					        Grid.Translate(aux);
							Grid.InitBuffers();
							DisplayArray.push(Grid);
							isALightTheLastDisplay = 0;
							var right = eval(astNode.right);
							if(right){
								right = value(right.reverse(), true);
								var array = [];
								if(right[0].type == "string")
									array.push(right[0].value);
								if(array.length>=1 && typeof array[0] == 'string'){
									Grid.DisplayMode(array[0]);
									codeFunctions += "\n\t\t\t\tObj.DisplayMode(\""+array[0]+"\");\n";
								}
							}
						break;
						case 'Obj':
							var right = eval(astNode.right);
							if(right){
								right = value(right.reverse(), true);
								var array = [];
								var cont = 0;
								if(right[0].type == "string")
									array.push(right[0].value);

								if(right.length > 1 && right[1].type == "string")
									array.push(right[1].value);
								if(array.length>=1 && typeof array[0] == 'string'){
									var verts = [];
									var norms = [];
									var coords = [];
									var center = [];
									var flatNorms = [];
									addToConsole("Console Message: loading and drawing a OBJ model");
									checkObj(array[0]);
									if(loadDoc(array[0], verts, norms, coords, center, flatNorms)){
										var Obj = new Object();
										InitObj(Obj, verts, norms, coords, center, flatNorms);
										var aux = Obj.center;
										svCont++;
										sceneVertices += "sceneObjects[" + svCont + "] = { verts: [" + Obj.vertices + "], norms: [" + Obj.smoothNormals + "], flatNorms: [" + Obj.flatNormals + "], center: [" + Obj.center + "]};\n";
										codeFunctions += "\t\t\t\tverts = sceneObjects[" + svCont + "].verts;\n\t\t\t\tnorms = sceneObjects[" + svCont + "].norms;\n\t\t\t\tcoords = [];\n\t\t\t\tcenter = sceneObjects[" + svCont + "].center;\n\t\t\t\tflatNorms = sceneObjects[" + svCont + "].flatNorms;\n\t\t\t\tObj = new Object();\n\t\t\t\tInitObj(Obj, verts, norms, coords, center, flatNorms);\n\t\t\t\taux = Obj.center;\n\t\t\t\taux[0] = -aux[0];\n\t\t\t\taux[1] = -aux[1];\n\t\t\t\taux[2] = -aux[2];\n\t\t\t\tObj.Translate(aux);\n\t\t\t\tObj.InitBuffers();\n\t\t\t\tDisplayArray.push(Obj);\n\t\t\t\tisALightTheLastDisplay = 0;\n";
								        aux[0] = -aux[0];
								        aux[1] = -aux[1];
								        aux[2] = -aux[2];
								        Obj.Translate(aux);
										Obj.InitBuffers();
										DisplayArray.push(Obj);
										isALightTheLastDisplay = 0;
										if(array.length>=2 && typeof array[1] == 'string'){
											Obj.DisplayMode(array[1]);
											codeFunctions += "\n\t\t\t\tObj.DisplayMode(\""+array[1]+"\");\n";
										}
									}
								}else
									addToConsole("Semantic Error: DrawObject function requires a file name in string format");
							}else
								addToConsole("Console Message: DrawObject with no arguments");
						break;
						case 'Change':
							var right = eval(astNode.right);
							if(right){
								right = value(right.reverse(), true);
								var array = [];
								var cont = 0;
								if(right[0].type == "string")
									array.push(right[0].value);
								if(array.length>=1 && typeof array[0] == 'string'){
									if(array[0] == "Flat" || array[0] == "Phong" || array[0] == "None" || array[0] == "Gouraud"){
										if(array[0] == "Flat" || array[0] == "Phong" || array[0] == "Gouraud"){
											if(arrayLights.length > 0 || arrayDirLights.length > 0 || arraySpotLights.length > 0){
												if(array[0] == "Flat" || array[0] == "Gouraud")
													currentShader = 1;
												if(array[0] == "Phong")
													currentShader = 0;
											}
											currentModel = array[0];
											gl.useProgram(shaderProgram[currentShader]);
											gl.uniform3f(shaderProgram[currentShader].cameraPosUniform, camera.position[0], camera.position[1], camera.position[2]);
											for(var i=0; i<arrayLights.length; i++){
								                gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].center, arrayLights[i].center[0], arrayLights[i].center[1], arrayLights[i].center[2]);
								                gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].la, arrayLights[i].la[0], arrayLights[i].la[1], arrayLights[i].la[2]);
								                gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].ld, arrayLights[i].ld[0], arrayLights[i].ld[1], arrayLights[i].ld[2]);
								                gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].ls, arrayLights[i].ls[0], arrayLights[i].ls[1], arrayLights[i].ls[2]);
								            }
								            for(var i=0; i<arrayDirLights.length; i++){
								                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].center, arrayDirLights[i].center[0], arrayDirLights[i].center[1], arrayDirLights[i].center[2]);
								                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].dir, arrayDirLights[i].dir[0], arrayDirLights[i].dir[1], arrayDirLights[i].dir[2]);
								                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].la, arrayDirLights[i].la[0], arrayDirLights[i].la[1], arrayDirLights[i].la[2]);
								                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].ld, arrayDirLights[i].ld[0], arrayDirLights[i].ld[1], arrayDirLights[i].ld[2]);
								                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].ls, arrayDirLights[i].ls[0], arrayDirLights[i].ls[1], arrayDirLights[i].ls[2]);
								            }
								            for(var i=0; i<arraySpotLights.length; i++){
								                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].center, arraySpotLights[i].center[0], arraySpotLights[i].center[1], arraySpotLights[i].center[2]);
								                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].dir, arraySpotLights[i].dir[0], arraySpotLights[i].dir[1], arraySpotLights[i].dir[2]);
								                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].la, arraySpotLights[i].la[0], arraySpotLights[i].la[1], arraySpotLights[i].la[2]);
								                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].ld, arraySpotLights[i].ld[0], arraySpotLights[i].ld[1], arraySpotLights[i].ld[2]);
								                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].ls, arraySpotLights[i].ls[0], arraySpotLights[i].ls[1], arraySpotLights[i].ls[2]);
								                gl.uniform1f(shaderProgram[currentShader].spotLightUniforms[i].cutoff, arraySpotLights[i].cutoff);
								                gl.uniform1f(shaderProgram[currentShader].spotLightUniforms[i].exponent, arraySpotLights[i].exponent);
								            }
										}
										if(array[0] == "None"){
											currentShader = 2;
											gl.useProgram(shaderProgram[currentShader]);
										}
										codeFunctions += "\t\t\t\tif('" + array[0] + "' == 'Flat' || '" + array[0] + "' == 'Phong' || '" + array[0] + "' == 'Gouraud'){\n\t\t\t\t	if(arrayLights.length > 0 || arrayDirLights.length > 0 || arraySpotLights.length > 0){\n\t\t\t\t		if('" + array[0] + "' == 'Flat' || '" + array[0] + "' == 'Gouraud')\n\t\t\t\t			currentShader = 1;\n\t\t\t\t		if('" + array[0] + "' == 'Phong')\n\t\t\t\t			currentShader = 0;\n\t\t\t\t	}\n\t\t\t\t	currentModel = '" + array[0] + "';\n\t\t\t\t	gl.useProgram(shaderProgram[currentShader]);\n\t\t\t\t	gl.uniform3f(shaderProgram[currentShader].cameraPosUniform, camera.position[0], camera.position[1], camera.position[2]);\n\t\t\t\t	for(var i=0; i<arrayLights.length; i++){\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].center, arrayLights[i].center[0], arrayLights[i].center[1], arrayLights[i].center[2]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].la, arrayLights[i].la[0], arrayLights[i].la[1], arrayLights[i].la[2]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].ld, arrayLights[i].ld[0], arrayLights[i].ld[1], arrayLights[i].ld[2]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].ls, arrayLights[i].ls[0], arrayLights[i].ls[1], arrayLights[i].ls[2]);\n\t\t\t\t    }\n\t\t\t\t    for(var i=0; i<arrayDirLights.length; i++){\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].center, arrayDirLights[i].center[0], arrayDirLights[i].center[1], arrayDirLights[i].center[2]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].dir, arrayDirLights[i].dir[0], arrayDirLights[i].dir[1], arrayDirLights[i].dir[2]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].la, arrayDirLights[i].la[0], arrayDirLights[i].la[1], arrayDirLights[i].la[2]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].ld, arrayDirLights[i].ld[0], arrayDirLights[i].ld[1], arrayDirLights[i].ld[2]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].ls, arrayDirLights[i].ls[0], arrayDirLights[i].ls[1], arrayDirLights[i].ls[2]);\n\t\t\t\t    }\n\t\t\t\t    for(var i=0; i<arraySpotLights.length; i++){\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].center, arraySpotLights[i].center[0], arraySpotLights[i].center[1], arraySpotLights[i].center[2]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].dir, arraySpotLights[i].dir[0], arraySpotLights[i].dir[1], arraySpotLights[i].dir[2]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].la, arraySpotLights[i].la[0], arraySpotLights[i].la[1], arraySpotLights[i].la[2]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].ld, arraySpotLights[i].ld[0], arraySpotLights[i].ld[1], arraySpotLights[i].ld[2]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].ls, arraySpotLights[i].ls[0], arraySpotLights[i].ls[1], arraySpotLights[i].ls[2]);\n\t\t\t\t        gl.uniform1f(shaderProgram[currentShader].spotLightUniforms[i].cutoff, arraySpotLights[i].cutoff);\n\t\t\t\t        gl.uniform1f(shaderProgram[currentShader].spotLightUniforms[i].exponent, arraySpotLights[i].exponent);\n\t\t\t\t    }\n\t\t\t\t}\n\t\t\t\tif('" + array[0] + "' == 'None'){\n\t\t\t\t	currentShader = 2;\n\t\t\t\t	gl.useProgram(shaderProgram[currentShader]);\n\t\t\t\t}\n";
									}else
							        	addToConsole("Execution Exception: unknown shading model");
								}else
									addToConsole("Semantic Error: ChangeLighting function requires a model name in string format");
							}else
								addToConsole("Console Message: ChangeLighting with no arguments");
						break;
						case 'Splight':
							var right = eval(astNode.right);
							if(right){
								right = value(right.reverse(), true);
							}else
								addToConsole("Console Message: DrawSpotLight with no arguments");

								var array = [];
								var cont = 0;
								if (right && right[0].type == "object" && right[0].value.length == 3 && numbers(right[0].value)){
									array.push(right[0].value[0]);
									array.push(right[0].value[1]);
									array.push(right[0].value[2]);
								}else{
									array.push(0);
									array.push(0);
									array.push(0);
									addToConsole("Warning: position light argument invalid, (0,0,0) will be assigned");
								}

								if (right && right.length > 1 && right[1].type == "object" && right[1].value.length == 3 && numbers(right[1].value)){
									array.push(right[1].value[0]);
									array.push(right[1].value[1]);
									array.push(right[1].value[2]);
								}else{
									array.push(1);
									array.push(1);
									array.push(1);
									addToConsole("Warning: direction light argument invalid, (1,1,1) will be assigned");
								}

								if(right && right.length > 2 && right[2].type == "number"){
									array.push(right[2].value);
								}else{
									array.push(0.1);
									addToConsole("Warning: cutoff argument invalid, 0.1 will be assigned");
								}

								if(right && right.length > 3 && right[3].type == "number"){
									array.push(right[3].value);
								}else{
									array.push(40.0);
									addToConsole("Warning: exponent argument invalid, 40.0 will be assigned");
								}

								if(array.length>=8){
									addToConsole("Console Message: drawing a spotlight");
									isALightTheLastDisplay = 3;
									var Light = new Object();
									InitSpotLight(Light, array.slice(0, 3), array.slice(3, 6), array[6], array[7]);
									arraySpotLights.push(Light);
									modifyShader_Spot();
									initShaders();
									if(currentShader == shaderProgram.length-1){
										currentShader = 0;
										currentModel = "Phong";
									}
									gl.useProgram(shaderProgram[currentShader]);
									gl.uniform3f(shaderProgram[currentShader].cameraPosUniform, camera.position[0], camera.position[1], camera.position[2]);
									for(var i=0; i<arrayLights.length; i++){
						                gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].center, arrayLights[i].center[0], arrayLights[i].center[1], arrayLights[i].center[2]);
						                gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].la, arrayLights[i].la[0], arrayLights[i].la[1], arrayLights[i].la[2]);
						                gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].ld, arrayLights[i].ld[0], arrayLights[i].ld[1], arrayLights[i].ld[2]);
						                gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].ls, arrayLights[i].ls[0], arrayLights[i].ls[1], arrayLights[i].ls[2]);
						            }
						            for(var i=0; i<arrayDirLights.length; i++){
						                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].center, arrayDirLights[i].center[0], arrayDirLights[i].center[1], arrayDirLights[i].center[2]);
						                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].dir, arrayDirLights[i].dir[0], arrayDirLights[i].dir[1], arrayDirLights[i].dir[2]);
						                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].la, arrayDirLights[i].la[0], arrayDirLights[i].la[1], arrayDirLights[i].la[2]);
						                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].ld, arrayDirLights[i].ld[0], arrayDirLights[i].ld[1], arrayDirLights[i].ld[2]);
						                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].ls, arrayDirLights[i].ls[0], arrayDirLights[i].ls[1], arrayDirLights[i].ls[2]);
						            }
						            for(var i=0; i<arraySpotLights.length; i++){
						                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].center, arraySpotLights[i].center[0], arraySpotLights[i].center[1], arraySpotLights[i].center[2]);
						                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].dir, arraySpotLights[i].dir[0], arraySpotLights[i].dir[1], arraySpotLights[i].dir[2]);
						                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].la, arraySpotLights[i].la[0], arraySpotLights[i].la[1], arraySpotLights[i].la[2]);
						                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].ld, arraySpotLights[i].ld[0], arraySpotLights[i].ld[1], arraySpotLights[i].ld[2]);
						                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].ls, arraySpotLights[i].ls[0], arraySpotLights[i].ls[1], arraySpotLights[i].ls[2]);
						                gl.uniform1f(shaderProgram[currentShader].spotLightUniforms[i].cutoff, arraySpotLights[i].cutoff);
						                gl.uniform1f(shaderProgram[currentShader].spotLightUniforms[i].exponent, arraySpotLights[i].exponent);
						            }
									var Sphere = new Object();
									InitSphere(Sphere);
									var aux = Sphere.center;
							        aux[0] = -aux[0];
							        aux[1] = -aux[1];
							        aux[2] = -aux[2];
							        Sphere.Translate(aux);
							        Sphere.Translate(array.slice(0, 3));
							        Sphere.Scale([0.3, 0.3, 0.3]);
							        Sphere.ka = vec3.fromValues(0.5, 0.5, 0.5);
							        Sphere.kd = vec3.fromValues(0.0, 0.0, 0.0);
							        Sphere.ks = vec3.fromValues(0.1, 0.1, 0.1);
									Sphere.InitBuffers();
									DisplayArray.push(Sphere);
									codeFunctions += "\t\t\t\tisALightTheLastDisplay = 3;\n\t\t\t\tLight = new Object();\n\t\t\t\tInitSpotLight(Light, [" + array.slice(0, 3) + "], [" + array.slice(3, 6) + "], " + array[6] + ", " + array[7] + ");\n\t\t\t\tarraySpotLights.push(Light);\n\t\t\t\tmodifyShader_Spot();\n\t\t\t\tinitShaders();\n\t\t\t\tif(currentShader == shaderProgram.length-1){\n\t\t\t\t	currentShader = 0;\n\t\t\t\t	currentModel = 'Phong';\n\t\t\t\t}\n\t\t\t\tgl.useProgram(shaderProgram[currentShader]);\n\t\t\t\tgl.uniform3f(shaderProgram[currentShader].cameraPosUniform, camera.position[0], camera.position[1], camera.position[2]);\n\t\t\t\tfor(var i=0; i<arrayLights.length; i++){\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].center, arrayLights[i].center[0], arrayLights[i].center[1], arrayLights[i].center[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].la, arrayLights[i].la[0], arrayLights[i].la[1], arrayLights[i].la[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].ld, arrayLights[i].ld[0], arrayLights[i].ld[1], arrayLights[i].ld[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].ls, arrayLights[i].ls[0], arrayLights[i].ls[1], arrayLights[i].ls[2]);\n\t\t\t\t}\n\t\t\t\tfor(var i=0; i<arrayDirLights.length; i++){\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].center, arrayDirLights[i].center[0], arrayDirLights[i].center[1], arrayDirLights[i].center[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].dir, arrayDirLights[i].dir[0], arrayDirLights[i].dir[1], arrayDirLights[i].dir[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].la, arrayDirLights[i].la[0], arrayDirLights[i].la[1], arrayDirLights[i].la[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].ld, arrayDirLights[i].ld[0], arrayDirLights[i].ld[1], arrayDirLights[i].ld[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].ls, arrayDirLights[i].ls[0], arrayDirLights[i].ls[1], arrayDirLights[i].ls[2]);\n\t\t\t\t}\n\t\t\t\tfor(var i=0; i<arraySpotLights.length; i++){\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].center, arraySpotLights[i].center[0], arraySpotLights[i].center[1], arraySpotLights[i].center[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].dir, arraySpotLights[i].dir[0], arraySpotLights[i].dir[1], arraySpotLights[i].dir[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].la, arraySpotLights[i].la[0], arraySpotLights[i].la[1], arraySpotLights[i].la[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].ld, arraySpotLights[i].ld[0], arraySpotLights[i].ld[1], arraySpotLights[i].ld[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].ls, arraySpotLights[i].ls[0], arraySpotLights[i].ls[1], arraySpotLights[i].ls[2]);\n\t\t\t\t    gl.uniform1f(shaderProgram[currentShader].spotLightUniforms[i].cutoff, arraySpotLights[i].cutoff);\n\t\t\t\t    gl.uniform1f(shaderProgram[currentShader].spotLightUniforms[i].exponent, arraySpotLights[i].exponent);\n\t\t\t\t}\n\t\t\t\tverts = [];\n\t\t\t\tnorms = [];\n\t\t\t\tcoords = [];\n\t\t\t\tcenter = [];\n\t\t\t\tflatNorms = [];\n\t\t\t\tif(loadDoc('sphere.obj', verts, norms, coords, center, flatNorms)){\n\t\t\t\t	var Obj = new Object();\n\t\t\t\t	InitObj(Obj, verts, norms, coords, center, flatNorms);\n\t\t\t\t	var aux = Obj.center;\n\t\t\t\t    aux[0] = -aux[0];\n\t\t\t\t    aux[1] = -aux[1];\n\t\t\t\t    aux[2] = -aux[2];\n\t\t\t\t    Obj.Translate(aux);\n\t\t\t\t	Obj.InitBuffers();\n\t\t\t\t	Obj.Translate([" + array.slice(0, 3) + "]);\n\t\t\t\t    Obj.Scale([0.3, 0.3, 0.3]);\n\t\t\t\t    Obj.ka = vec3.fromValues(0.5, 0.5, 0.5);\n\t\t\t\t    Obj.kd = vec3.fromValues(0.0, 0.0, 0.0);\n\t\t\t\t    Obj.ks = vec3.fromValues(0.1, 0.1, 0.1);\n\t\t\t\t	DisplayArray.push(Obj);\n\t\t\t\t}\n";
								}else
									addToConsole("Semantic Error: missing arguments in DrawSpotLight function");
						break;
						case 'Dlight':
							var right = eval(astNode.right);
							if(right){
								right = value(right.reverse(), true);
							}else
								addToConsole("Console Message: DrawDirectionalLight with no arguments");

								var array = [];
								var cont = 0;

								if (right && right[0].type == "object" && right[0].value.length == 3 && numbers(right[0].value)){
									array.push(right[0].value[0]);
									array.push(right[0].value[1]);
									array.push(right[0].value[2]);
								}else{
									array.push(0);
									array.push(0);
									array.push(0);
									addToConsole("Warning: position light argument invalid, (0,0,0) will be assigned");
								}

								if (right && right.length > 1 && right[1].type == "object" && right[1].value.length == 3 && numbers(right[1].value)){
									array.push(right[1].value[0]);
									array.push(right[1].value[1]);
									array.push(right[1].value[2]);
								}else{
									array.push(1);
									array.push(1);
									array.push(1);
									addToConsole("Warning: direction light argument invalid, (1,1,1) will be assigned");
								}

								if(array.length>=6){
									addToConsole("Console Message: drawing a directional light");
									isALightTheLastDisplay = 2;
									var Light = new Object();
									var newPos = vec3.fromValues(array.slice(0, 3)[0], array.slice(0, 3)[1], array.slice(0, 3)[2]);
									var newDir = vec3.fromValues(array.slice(3)[0], array.slice(3)[1], array.slice(3)[2]);
									var realCenter = vec3.fromValues(newPos[0]*newDir[0], newPos[1]*newDir[1], newPos[2]*newDir[2]);
									console.log(realCenter);
									InitDirectionalLight(Light, realCenter, array.slice(3));
									arrayDirLights.push(Light);
									modifyShader_Dir();
									initShaders();
									if(currentShader == shaderProgram.length-1){
										currentShader = 0;
										currentModel = "Phong";
									}
									gl.useProgram(shaderProgram[currentShader]);
									gl.uniform3f(shaderProgram[currentShader].cameraPosUniform, camera.position[0], camera.position[1], camera.position[2]);
									for(var i=0; i<arrayLights.length; i++){
						                gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].center, arrayLights[i].center[0], arrayLights[i].center[1], arrayLights[i].center[2]);
						                gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].la, arrayLights[i].la[0], arrayLights[i].la[1], arrayLights[i].la[2]);
						                gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].ld, arrayLights[i].ld[0], arrayLights[i].ld[1], arrayLights[i].ld[2]);
						                gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].ls, arrayLights[i].ls[0], arrayLights[i].ls[1], arrayLights[i].ls[2]);
						            }
						            for(var i=0; i<arrayDirLights.length; i++){
						                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].center, arrayDirLights[i].center[0], arrayDirLights[i].center[1], arrayDirLights[i].center[2]);
						                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].dir, arrayDirLights[i].dir[0], arrayDirLights[i].dir[1], arrayDirLights[i].dir[2]);
						                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].la, arrayDirLights[i].la[0], arrayDirLights[i].la[1], arrayDirLights[i].la[2]);
						                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].ld, arrayDirLights[i].ld[0], arrayDirLights[i].ld[1], arrayDirLights[i].ld[2]);
						                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].ls, arrayDirLights[i].ls[0], arrayDirLights[i].ls[1], arrayDirLights[i].ls[2]);
						            }
						            for(var i=0; i<arraySpotLights.length; i++){
						                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].center, arraySpotLights[i].center[0], arraySpotLights[i].center[1], arraySpotLights[i].center[2]);
						                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].dir, arraySpotLights[i].dir[0], arraySpotLights[i].dir[1], arraySpotLights[i].dir[2]);
						                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].la, arraySpotLights[i].la[0], arraySpotLights[i].la[1], arraySpotLights[i].la[2]);
						                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].ld, arraySpotLights[i].ld[0], arraySpotLights[i].ld[1], arraySpotLights[i].ld[2]);
						                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].ls, arraySpotLights[i].ls[0], arraySpotLights[i].ls[1], arraySpotLights[i].ls[2]);
						                gl.uniform1f(shaderProgram[currentShader].spotLightUniforms[i].cutoff, arraySpotLights[i].cutoff);
						                gl.uniform1f(shaderProgram[currentShader].spotLightUniforms[i].exponent, arraySpotLights[i].exponent);
						            }
									var Sphere = new Object();
									InitSphere(Sphere);
									var aux = Sphere.center;
							        aux[0] = -aux[0];
							        aux[1] = -aux[1];
							        aux[2] = -aux[2];
							        Sphere.Translate(aux);
							        Sphere.Translate(realCenter);
							        Sphere.Scale([0.3, 0.3, 0.3]);
							        Sphere.ka = vec3.fromValues(0.5, 0.5, 0.5);
							        Sphere.kd = vec3.fromValues(0.0, 0.0, 0.0);
							        Sphere.ks = vec3.fromValues(0.1, 0.1, 0.1);
									Sphere.InitBuffers();
									DisplayArray.push(Sphere);
									codeFunctions += "\t\t\t\tisALightTheLastDisplay = 2;\n\t\t\t\tLight = new Object();\n\t\t\t\tInitDirectionalLight(Light, [" + array.slice(0, 3) + "], [" + array.slice(3, 6) + "]);\n\t\t\t\tarrayDirLights.push(Light);\n\t\t\t\tmodifyShader_Dir();\n\t\t\t\tinitShaders();\n\t\t\t\tif(currentShader == shaderProgram.length-1){\n\t\t\t\t	currentShader = 0;\n\t\t\t\t	currentModel = 'Phong';\n\t\t\t\t}\n\t\t\t\tgl.useProgram(shaderProgram[currentShader]);\n\t\t\t\tgl.uniform3f(shaderProgram[currentShader].cameraPosUniform, camera.position[0], camera.position[1], camera.position[2]);\n\t\t\t\tfor(var i=0; i<arrayLights.length; i++){\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].center, arrayLights[i].center[0], arrayLights[i].center[1], arrayLights[i].center[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].la, arrayLights[i].la[0], arrayLights[i].la[1], arrayLights[i].la[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].ld, arrayLights[i].ld[0], arrayLights[i].ld[1], arrayLights[i].ld[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].ls, arrayLights[i].ls[0], arrayLights[i].ls[1], arrayLights[i].ls[2]);\n\t\t\t\t}\n\t\t\t\tfor(var i=0; i<arrayDirLights.length; i++){\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].center, arrayDirLights[i].center[0], arrayDirLights[i].center[1], arrayDirLights[i].center[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].dir, arrayDirLights[i].dir[0], arrayDirLights[i].dir[1], arrayDirLights[i].dir[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].la, arrayDirLights[i].la[0], arrayDirLights[i].la[1], arrayDirLights[i].la[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].ld, arrayDirLights[i].ld[0], arrayDirLights[i].ld[1], arrayDirLights[i].ld[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].ls, arrayDirLights[i].ls[0], arrayDirLights[i].ls[1], arrayDirLights[i].ls[2]);\n\t\t\t\t}\n\t\t\t\tfor(var i=0; i<arraySpotLights.length; i++){\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].center, arraySpotLights[i].center[0], arraySpotLights[i].center[1], arraySpotLights[i].center[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].dir, arraySpotLights[i].dir[0], arraySpotLights[i].dir[1], arraySpotLights[i].dir[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].la, arraySpotLights[i].la[0], arraySpotLights[i].la[1], arraySpotLights[i].la[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].ld, arraySpotLights[i].ld[0], arraySpotLights[i].ld[1], arraySpotLights[i].ld[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].ls, arraySpotLights[i].ls[0], arraySpotLights[i].ls[1], arraySpotLights[i].ls[2]);\n\t\t\t\t    gl.uniform1f(shaderProgram[currentShader].spotLightUniforms[i].cutoff, arraySpotLights[i].cutoff);\n\t\t\t\t    gl.uniform1f(shaderProgram[currentShader].spotLightUniforms[i].exponent, arraySpotLights[i].exponent);\n\t\t\t\t}\n\t\t\t\tverts = [];\n\t\t\t\tnorms = [];\n\t\t\t\tcoords = [];\n\t\t\t\tcenter = [];\n\t\t\t\tflatNorms = [];\n\t\t\t\tif(loadDoc('sphere.obj', verts, norms, coords, center, flatNorms)){\n\t\t\t\t	var Obj = new Object();\n\t\t\t\t	InitObj(Obj, verts, norms, coords, center, flatNorms);\n\t\t\t\t	var aux = Obj.center;\n\t\t\t\t    aux[0] = -aux[0];\n\t\t\t\t    aux[1] = -aux[1];\n\t\t\t\t    aux[2] = -aux[2];\n\t\t\t\t    Obj.Translate(aux);\n\t\t\t\t	Obj.InitBuffers();\n\t\t\t\t	Obj.Translate([" + array.slice(0, 3) + "]);\n\t\t\t\t    Obj.Scale([0.3, 0.3, 0.3]);\n\t\t\t\t    Obj.ka = vec3.fromValues(0.5, 0.5, 0.5);\n\t\t\t\t    Obj.kd = vec3.fromValues(0.0, 0.0, 0.0);\n\t\t\t\t    Obj.ks = vec3.fromValues(0.1, 0.1, 0.1);\n\t\t\t\t	DisplayArray.push(Obj);\n\t\t\t\t}\n";
								}else
									addToConsole("Semantic Error: missing arguments in DrawDirectionalLight function");
						break;
						case 'Plight':
							var right = eval(astNode.right);
							if(right){
								right = value(right.reverse(), true);
							}else
								addToConsole("Console Message: DrawPointLight with no arguments");

								var array = [];
								var cont = 0;

								if (right && right[0].type == "object" && right[0].value.length == 3 && numbers(right[0].value)){
									array.push(right[0].value[0]);
									array.push(right[0].value[1]);
									array.push(right[0].value[2]);
								}else{
									array.push(0);
									array.push(0);
									array.push(0);
									addToConsole("Warning: position light argument invalid, (0,0,0) will be assigned");
								}

								if(array.length>=3){
									addToConsole("Console Message: drawing a point light");
									isALightTheLastDisplay = 1;
									var Light = new Object();
									InitPointLight(Light, array);
									arrayLights.push(Light);
									modifyShader_Point();
									initShaders();
									if(currentShader == shaderProgram.length-1){
										currentShader = 0;
										currentModel = "Phong";
									}
									gl.useProgram(shaderProgram[currentShader]);
									gl.uniform3f(shaderProgram[currentShader].cameraPosUniform, camera.position[0], camera.position[1], camera.position[2]);
									for(var i=0; i<arrayLights.length; i++){
						                gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].center, arrayLights[i].center[0], arrayLights[i].center[1], arrayLights[i].center[2]);
						                gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].la, arrayLights[i].la[0], arrayLights[i].la[1], arrayLights[i].la[2]);
						                gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].ld, arrayLights[i].ld[0], arrayLights[i].ld[1], arrayLights[i].ld[2]);
						                gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].ls, arrayLights[i].ls[0], arrayLights[i].ls[1], arrayLights[i].ls[2]);
						            }
						            for(var i=0; i<arrayDirLights.length; i++){
						                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].center, arrayDirLights[i].center[0], arrayDirLights[i].center[1], arrayDirLights[i].center[2]);
						                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].dir, arrayDirLights[i].dir[0], arrayDirLights[i].dir[1], arrayDirLights[i].dir[2]);
						                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].la, arrayDirLights[i].la[0], arrayDirLights[i].la[1], arrayDirLights[i].la[2]);
						                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].ld, arrayDirLights[i].ld[0], arrayDirLights[i].ld[1], arrayDirLights[i].ld[2]);
						                gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].ls, arrayDirLights[i].ls[0], arrayDirLights[i].ls[1], arrayDirLights[i].ls[2]);
						            }
						            for(var i=0; i<arraySpotLights.length; i++){
						                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].center, arraySpotLights[i].center[0], arraySpotLights[i].center[1], arraySpotLights[i].center[2]);
						                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].dir, arraySpotLights[i].dir[0], arraySpotLights[i].dir[1], arraySpotLights[i].dir[2]);
						                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].la, arraySpotLights[i].la[0], arraySpotLights[i].la[1], arraySpotLights[i].la[2]);
						                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].ld, arraySpotLights[i].ld[0], arraySpotLights[i].ld[1], arraySpotLights[i].ld[2]);
						                gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].ls, arraySpotLights[i].ls[0], arraySpotLights[i].ls[1], arraySpotLights[i].ls[2]);
						                gl.uniform1f(shaderProgram[currentShader].spotLightUniforms[i].cutoff, arraySpotLights[i].cutoff);
						                gl.uniform1f(shaderProgram[currentShader].spotLightUniforms[i].exponent, arraySpotLights[i].exponent);
						            }
									var Sphere = new Object();
									InitSphere(Sphere);
									var aux = Sphere.center;
									console.log(array);
									svCont++;
									sceneVertices += "sceneObjects[" + svCont + "] = { verts: [" + Sphere.vertices + "], norms: [" + Sphere.smoothNormals + "], flatNorms: [" + Sphere.flatNormals + "], center: [" + Sphere.center + "]};\n";
									codeFunctions += "\t\t\t\tverts = sceneObjects[" + svCont + "].verts;\n\t\t\t\tnorms = sceneObjects[" + svCont + "].norms;\n\t\t\t\tcoords = [];\n\t\t\t\tcenter = sceneObjects[" + svCont + "].center;\n\t\t\t\tflatNorms = sceneObjects[" + svCont + "].flatNorms;\n\t\t\t\tObj = new Object();\n\t\t\t\tInitObj(Obj, verts, norms, coords, center, flatNorms);\n\t\t\t\taux = Obj.center;\n\t\t\t\taux[0] = -aux[0];\n\t\t\t\taux[1] = -aux[1];\n\t\t\t\taux[2] = -aux[2];\n\t\t\t\tObj.Translate(aux);\n\t\t\t\tObj.Translate([" + array + "]);\n\t\t\t\tObj.Scale([0.3, 0.3, 0.3]);\n\t\t\t\tObj.ka = vec3.fromValues(0.5, 0.5, 0.5);\n\t\t\t\tObj.kd = vec3.fromValues(0.0, 0.0, 0.0);\n\t\t\t\tObj.ks = vec3.fromValues(0.1, 0.1, 0.1);\n\t\t\t\tObj.InitBuffers();\n\t\t\t\tDisplayArray.push(Obj);\n\t\t\t\tisALightTheLastDisplay = 0;\n";
									aux[0] = -aux[0];
							        aux[1] = -aux[1];
							        aux[2] = -aux[2];
							        Sphere.Translate(aux);
							        Sphere.Translate(array);
							        Sphere.Scale([0.3, 0.3, 0.3]);
							        Sphere.ka = vec3.fromValues(0.5, 0.5, 0.5);
							        Sphere.kd = vec3.fromValues(0.0, 0.0, 0.0);
							        Sphere.ks = vec3.fromValues(0.1, 0.1, 0.1);
									Sphere.InitBuffers();
									DisplayArray.push(Sphere);
									codeFunctions += "\t\t\t\tisALightTheLastDisplay = 1;\n\t\t\t\tLight = new Object();\n\t\t\t\tInitPointLight(Light, [" + array + "]);\n\t\t\t\tarrayLights.push(Light);\n\t\t\t\tmodifyShader_Point();\n\t\t\t\tinitShaders();\n\t\t\t\tif(currentShader == shaderProgram.length-1){\n\t\t\t\t	currentShader = 0;\n\t\t\t\t	currentModel = 'Phong';\n\t\t\t\t}\n\t\t\t\tgl.useProgram(shaderProgram[currentShader]);\n\t\t\t\tgl.uniform3f(shaderProgram[currentShader].cameraPosUniform, camera.position[0], camera.position[1], camera.position[2]);\n\t\t\t\tfor(var i=0; i<arrayLights.length; i++){\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].center, arrayLights[i].center[0], arrayLights[i].center[1], arrayLights[i].center[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].la, arrayLights[i].la[0], arrayLights[i].la[1], arrayLights[i].la[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].ld, arrayLights[i].ld[0], arrayLights[i].ld[1], arrayLights[i].ld[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].lightUniforms[i].ls, arrayLights[i].ls[0], arrayLights[i].ls[1], arrayLights[i].ls[2]);\n\t\t\t\t}\n\t\t\t\tfor(var i=0; i<arrayDirLights.length; i++){\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].center, arrayDirLights[i].center[0], arrayDirLights[i].center[1], arrayDirLights[i].center[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].dir, arrayDirLights[i].dir[0], arrayDirLights[i].dir[1], arrayDirLights[i].dir[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].la, arrayDirLights[i].la[0], arrayDirLights[i].la[1], arrayDirLights[i].la[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].ld, arrayDirLights[i].ld[0], arrayDirLights[i].ld[1], arrayDirLights[i].ld[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[i].ls, arrayDirLights[i].ls[0], arrayDirLights[i].ls[1], arrayDirLights[i].ls[2]);\n\t\t\t\t}\n\t\t\t\tfor(var i=0; i<arraySpotLights.length; i++){\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].center, arraySpotLights[i].center[0], arraySpotLights[i].center[1], arraySpotLights[i].center[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].dir, arraySpotLights[i].dir[0], arraySpotLights[i].dir[1], arraySpotLights[i].dir[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].la, arraySpotLights[i].la[0], arraySpotLights[i].la[1], arraySpotLights[i].la[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].ld, arraySpotLights[i].ld[0], arraySpotLights[i].ld[1], arraySpotLights[i].ld[2]);\n\t\t\t\t    gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[i].ls, arraySpotLights[i].ls[0], arraySpotLights[i].ls[1], arraySpotLights[i].ls[2]);\n\t\t\t\t    gl.uniform1f(shaderProgram[currentShader].spotLightUniforms[i].cutoff, arraySpotLights[i].cutoff);\n\t\t\t\t    gl.uniform1f(shaderProgram[currentShader].spotLightUniforms[i].exponent, arraySpotLights[i].exponent);\n\t\t\t\t}\n";
								}else
									addToConsole("Semantic Error: missing arguments in DrawPointLight function");
						break;
						case 'Ambiental':
								var right = eval(astNode.right);
								if(right){
									right = value(right.reverse(), true);
									var array = [];
									var cont = 0;

									if (right[0].type == "object" && right[0].value.length == 3 && numbers(right[0].value)){
										array.push(right[0].value[0]);
										array.push(right[0].value[1]);
										array.push(right[0].value[2]);
									}

									if(right[0].type == "string"){
										array.push(right[0].value);
									}

									if(array.length>=1 && DisplayArray.length > 0 && translateColor(array)){
										DisplayArray[DisplayArray.length-1].ka = vec3.fromValues(array[0], array[1], array[2]);
										if(isALightTheLastDisplay){
											if(isALightTheLastDisplay == 1){
												var ind = arrayLights.length-1;
												arrayLights[ind].setLa(array);
								            	gl.uniform3f(shaderProgram[currentShader].lightUniforms[ind].la, arrayLights[ind].la[0], arrayLights[ind].la[1], arrayLights[ind].la[2]);
											}
											if(isALightTheLastDisplay == 2){
												var ind = arrayDirLights.length-1;
												arrayDirLights[ind].setLa(array);
								            	gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[ind].la, arrayDirLights[ind].la[0], arrayDirLights[ind].la[1], arrayDirLights[ind].la[2]);
											}
											if(isALightTheLastDisplay == 3){
												var ind = arraySpotLights.length-1;
												arraySpotLights[ind].setLa(array);
								            	gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[ind].la, arraySpotLights[ind].la[0], arraySpotLights[ind].la[1], arraySpotLights[ind].la[2]);
											}
										}
										codeFunctions += "\t\t\t\tDisplayArray[DisplayArray.length-1].ka = vec3.fromValues(" + array + ");\n\t\t\t\tif(isALightTheLastDisplay){\n\t\t\t\t    if(isALightTheLastDisplay == 1){\n\t\t\t\t        var ind = arrayLights.length-1;\n\t\t\t\t        arrayLights[ind].setLa([" + array + "]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].lightUniforms[ind].la, arrayLights[ind].la[0], arrayLights[ind].la[1], arrayLights[ind].la[2]);\n\t\t\t\t    }\n\t\t\t\t    if(isALightTheLastDisplay == 2){\n\t\t\t\t        var ind = arrayDirLights.length-1;\n\t\t\t\t        arrayDirLights[ind].setLa([" + array + "]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[ind].la, arrayDirLights[ind].la[0], arrayDirLights[ind].la[1], arrayDirLights[ind].la[2]);\n\t\t\t\t    }\n\t\t\t\t    if(isALightTheLastDisplay == 3){\n\t\t\t\t        var ind = arraySpotLights.length-1;\n\t\t\t\t        arraySpotLights[ind].setLa([" + array + "]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[ind].la, arraySpotLights[ind].la[0], arraySpotLights[ind].la[1], arraySpotLights[ind].la[2]);\n\t\t\t\t    }\n\t\t\t\t}";
									}else
										addToConsole("Execution Exception: no models displayed or invalid arguments");
								}else
									addToConsole("Console Message: AmbientalComponent with no arguments");
						break;
						case 'Diffuse':
								var right = eval(astNode.right);
								if(right){
									right = value(right.reverse(), true);
									var array = [];
									var cont = 0;

									if (right[0].type == "object" && right[0].value.length == 3 && numbers(right[0].value)){
										array.push(right[0].value[0]);
										array.push(right[0].value[1]);
										array.push(right[0].value[2]);
									}

									if(right[0].type == "string"){
										array.push(right[0].value);
									}

									if(array.length>=1 && DisplayArray.length > 0 && translateColor(array)){
										DisplayArray[DisplayArray.length-1].kd = vec3.fromValues(array[0], array[1], array[2]);
										if(isALightTheLastDisplay){
											if(isALightTheLastDisplay == 1){
												var ind = arrayLights.length-1;
												arrayLights[ind].setLd(array);
								            	gl.uniform3f(shaderProgram[currentShader].lightUniforms[ind].ld, arrayLights[ind].ld[0], arrayLights[ind].ld[1], arrayLights[ind].ld[2]);
											}
											if(isALightTheLastDisplay == 2){
												var ind = arrayDirLights.length-1;
												arrayDirLights[ind].setLd(array);
								            	gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[ind].ld, arrayDirLights[ind].ld[0], arrayDirLights[ind].ld[1], arrayDirLights[ind].ld[2]);
											}
											if(isALightTheLastDisplay == 3){
												var ind = arraySpotLights.length-1;
												arraySpotLights[ind].setLd(array);
								            	gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[ind].ld, arraySpotLights[ind].ld[0], arraySpotLights[ind].ld[1], arraySpotLights[ind].ld[2]);
											}
										}
										codeFunctions += "\t\t\t\tDisplayArray[DisplayArray.length-1].kd = vec3.fromValues(" + array + ");\n\t\t\t\tif(isALightTheLastDisplay){\n\t\t\t\t    if(isALightTheLastDisplay == 1){\n\t\t\t\t        var ind = arrayLights.length-1;\n\t\t\t\t        arrayLights[ind].setLd([" + array + "]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].lightUniforms[ind].ld, arrayLights[ind].ld[0], arrayLights[ind].ld[1], arrayLights[ind].ld[2]);\n\t\t\t\t    }\n\t\t\t\t    if(isALightTheLastDisplay == 2){\n\t\t\t\t        var ind = arrayDirLights.length-1;\n\t\t\t\t        arrayDirLights[ind].setLd([" + array + "]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[ind].ld, arrayDirLights[ind].ld[0], arrayDirLights[ind].ld[1], arrayDirLights[ind].ld[2]);\n\t\t\t\t    }\n\t\t\t\t    if(isALightTheLastDisplay == 3){\n\t\t\t\t        var ind = arraySpotLights.length-1;\n\t\t\t\t        arraySpotLights[ind].setLd([" + array + "]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[ind].ld, arraySpotLights[ind].ld[0], arraySpotLights[ind].ld[1], arraySpotLights[ind].ld[2]);\n\t\t\t\t    }\n\t\t\t\t}";
									}else
										addToConsole("Execution Exception: no models displayed or invalid arguments");
								}else
									addToConsole("Console Message: DiffuseComponent with no arguments");
						break;
						case 'Specular':
								var right = eval(astNode.right);
								if(right){
									right = value(right.reverse(), true);
									var array = [];
									var cont = 0;

									if (right[0].type == "object" && right[0].value.length == 3 && numbers(right[0].value)){
										array.push(right[0].value[0]);
										array.push(right[0].value[1]);
										array.push(right[0].value[2]);
									}

									if(right[0].type == "string"){
										array.push(right[0].value);
									}

									if(array.length>=1 && DisplayArray.length > 0 && translateColor(array)){
										DisplayArray[DisplayArray.length-1].ks = vec3.fromValues(array[0], array[1], array[2]);
										if(isALightTheLastDisplay){
											if(isALightTheLastDisplay == 1){
												var ind = arrayLights.length-1;
												arrayLights[ind].setLs(array);
								            	gl.uniform3f(shaderProgram[currentShader].lightUniforms[ind].ls, arrayLights[ind].ls[0], arrayLights[ind].ls[1], arrayLights[ind].ls[2]);
											}
											if(isALightTheLastDisplay == 2){
												var ind = arrayDirLights.length-1;
												arrayDirLights[ind].setLs(array);
								            	gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[ind].ls, arrayDirLights[ind].ls[0], arrayDirLights[ind].ls[1], arrayDirLights[ind].ls[2]);
											}
											if(isALightTheLastDisplay == 3){
												var ind = arraySpotLights.length-1;
												arraySpotLights[ind].setLs(array);
								            	gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[ind].ls, arraySpotLights[ind].ls[0], arraySpotLights[ind].ls[1], arraySpotLights[ind].ls[2]);
											}
										}
										codeFunctions += "\t\t\t\tDisplayArray[DisplayArray.length-1].ks = vec3.fromValues(" + array + ");\n\t\t\t\tif(isALightTheLastDisplay){\n\t\t\t\t    if(isALightTheLastDisplay == 1){\n\t\t\t\t        var ind = arrayLights.length-1;\n\t\t\t\t        arrayLights[ind].setLs([" + array + "]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].lightUniforms[ind].ls, arrayLights[ind].ls[0], arrayLights[ind].ls[1], arrayLights[ind].ls[2]);\n\t\t\t\t    }\n\t\t\t\t    if(isALightTheLastDisplay == 2){\n\t\t\t\t        var ind = arrayDirLights.length-1;\n\t\t\t\t        arrayDirLights[ind].setLs([" + array + "]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[ind].ls, arrayDirLights[ind].ls[0], arrayDirLights[ind].ls[1], arrayDirLights[ind].ls[2]);\n\t\t\t\t    }\n\t\t\t\t    if(isALightTheLastDisplay == 3){\n\t\t\t\t        var ind = arraySpotLights.length-1;\n\t\t\t\t        arraySpotLights[ind].setLs([" + array + "]);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[ind].ls, arraySpotLights[ind].ls[0], arraySpotLights[ind].ls[1], arraySpotLights[ind].ls[2]);\n\t\t\t\t    }\n\t\t\t\t}";
									}else
										addToConsole("Execution Exception: no models displayed or invalid arguments");
								}else
									addToConsole("Console Message: SpecularComponent with no arguments");
						break;
						case 'Translate':
							var right = eval(astNode.right);
							if(right){
								right = value(right.reverse(), true);
								var array = [];
								var cont = 0;

								if (right[0].type == "object" && right[0].value.length == 3 && numbers(right[0].value)){
									array.push(right[0].value[0]);
									array.push(right[0].value[1]);
									array.push(right[0].value[2]);
								}

								if(array.length>=3 && DisplayArray.length > 0){
									DisplayArray[DisplayArray.length-1].Translate(array);
									if(isALightTheLastDisplay){
										if(isALightTheLastDisplay == 1){
											var ind = arrayLights.length-1;
											arrayLights[ind].setCenter(DisplayArray[DisplayArray.length-1].modelMatrix);
							            	gl.uniform3f(shaderProgram[currentShader].lightUniforms[ind].center, arrayLights[ind].center[0], arrayLights[ind].center[1], arrayLights[ind].center[2]);
										}
										if(isALightTheLastDisplay == 2){
											var ind = arrayDirLights.length-1;
											arrayDirLights[ind].setCenter(DisplayArray[DisplayArray.length-1].modelMatrix);
							            	gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[ind].center, arrayDirLights[ind].center[0], arrayDirLights[ind].center[1], arrayDirLights[ind].center[2]);
										}
										if(isALightTheLastDisplay == 3){
											var ind = arraySpotLights.length-1;
											arraySpotLights[ind].setCenter(DisplayArray[DisplayArray.length-1].modelMatrix);
								            gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[ind].center, arraySpotLights[ind].center[0], arraySpotLights[ind].center[1], arraySpotLights[ind].center[2]);
										}
									}
									codeFunctions += "\t\t\t\tDisplayArray[DisplayArray.length-1].Translate([" + array + "]);\n\t\t\t\tif(isALightTheLastDisplay){\n\t\t\t\t	if(isALightTheLastDisplay == 1){\n\t\t\t\t		var ind = arrayLights.length-1;\n\t\t\t\t		arrayLights[ind].setCenter(DisplayArray[DisplayArray.length-1].modelMatrix);\n\t\t\t\t    	gl.uniform3f(shaderProgram[currentShader].lightUniforms[ind].center, arrayLights[ind].center[0], arrayLights[ind].center[1], arrayLights[ind].center[2]);\n\t\t\t\t	}\n\t\t\t\t	if(isALightTheLastDisplay == 2){\n\t\t\t\t		var ind = arrayDirLights.length-1;\n\t\t\t\t		arrayDirLights[ind].setCenter(DisplayArray[DisplayArray.length-1].modelMatrix);\n\t\t\t\t    	gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[ind].center, arrayDirLights[ind].center[0], arrayDirLights[ind].center[1], arrayDirLights[ind].center[2]);\n\t\t\t\t	}\n\t\t\t\t	if(isALightTheLastDisplay == 3){\n\t\t\t\t		var ind = arraySpotLights.length-1;\n\t\t\t\t		arraySpotLights[ind].setCenter(DisplayArray[DisplayArray.length-1].modelMatrix);\n\t\t\t\t        gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[ind].center, arraySpotLights[ind].center[0], arraySpotLights[ind].center[1], arraySpotLights[ind].center[2]);\n\t\t\t\t	}\n\t\t\t\t}";
								}else
									addToConsole("Execution Exception: no models displayed or invalid arguments");
							}else
								addToConsole("Console Message: TranslateObject with no arguments");
						break;
						case 'Rotate':
							var right = eval(astNode.right);
							if(right){
								right = value(right.reverse(), true);
								var infRot = "";
								var array = [];
								var cont = 0;

								if (right[0].type == "number"){
									array.push(right[0].value);
								}

								if (right.length > 1 && right[1].type == "object" && right[1].value.length == 3 && numbers(right[1].value)){
									array.push(right[1].value[0]);
									array.push(right[1].value[1]);
									array.push(right[1].value[2]);
								}

								if (right.length > 2 && right[2].type == "string"){
									array.push(right[2].value);
								}

								if(array.length >= 4 && DisplayArray.length > 0){
									DisplayArray[DisplayArray.length-1].Rotate(degToRad(array[0]), array.slice(1, 4));
									if(array.length > 4 && array[4].toLowerCase() == "inf"){
										DisplayArray[DisplayArray.length-1].rotateForever = true;
										DisplayArray[DisplayArray.length-1].infRotation = array.slice(1, 4);
										DisplayArray[DisplayArray.length-1].infAngle = degToRad(array[0]);
										infRot += "DisplayArray[DisplayArray.length-1].rotateForever = true;\n\t\t\t\tDisplayArray[DisplayArray.length-1].infRotation = ["+ array.slice(1, 4) +"];\n\t\t\t\tDisplayArray[DisplayArray.length-1].infAngle = "+degToRad(array[0])+";";
									}
									if(isALightTheLastDisplay){
										if(isALightTheLastDisplay == 1){
											var ind = arrayLights.length-1;
											arrayLights[ind].setCenter(DisplayArray[DisplayArray.length-1].modelMatrix);
							            	gl.uniform3f(shaderProgram[currentShader].lightUniforms[ind].center, arrayLights[ind].center[0], arrayLights[ind].center[1], arrayLights[ind].center[2]);
										}
										if(isALightTheLastDisplay == 2){
											var ind = arrayDirLights.length-1;
											arrayDirLights[ind].setCenter(DisplayArray[DisplayArray.length-1].modelMatrix);
							            	gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[ind].center, arrayDirLights[ind].center[0], arrayDirLights[ind].center[1], arrayDirLights[ind].center[2]);
										}
										if(isALightTheLastDisplay == 3){
											var ind = arraySpotLights.length-1;
											arraySpotLights[ind].setCenter(DisplayArray[DisplayArray.length-1].modelMatrix);
								            gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[ind].center, arraySpotLights[ind].center[0], arraySpotLights[ind].center[1], arraySpotLights[ind].center[2]);
										}
									}
									codeFunctions += "\t\t\t\tDisplayArray[DisplayArray.length-1].Rotate(" + degToRad(array[0]) + ", [" + array.slice(1, 4) + "]);\n\t\t\t\t" + infRot + "\n";
								}else
									addToConsole("Execution Exception: no models displayed or invalid arguments");
							}else
								addToConsole("Console Message: RotateObject with no arguments");
						break;
						case 'Scale':
							var right = eval(astNode.right);
							if(right){
								right = value(right.reverse(), true);
								var array = [];
								var cont = 0;

								if (right[0].type == "object" && right[0].value.length == 3 && numbers(right[0].value)){
									array.push(right[0].value[0]);
									array.push(right[0].value[1]);
									array.push(right[0].value[2]);
								}

								if(array.length>=3 && DisplayArray.length > 0){
									DisplayArray[DisplayArray.length-1].Scale(array);
									if(isALightTheLastDisplay){
										if(isALightTheLastDisplay == 1){
											var ind = arrayLights.length-1;
											arrayLights[ind].setCenter(DisplayArray[DisplayArray.length-1].modelMatrix);
							            	gl.uniform3f(shaderProgram[currentShader].lightUniforms[ind].center, arrayLights[ind].center[0], arrayLights[ind].center[1], arrayLights[ind].center[2]);
										}
										if(isALightTheLastDisplay == 2){
											var ind = arrayDirLights.length-1;
											arrayDirLights[ind].setCenter(DisplayArray[DisplayArray.length-1].modelMatrix);
							            	gl.uniform3f(shaderProgram[currentShader].dirLightUniforms[ind].center, arrayDirLights[ind].center[0], arrayDirLights[ind].center[1], arrayDirLights[ind].center[2]);
										}
										if(isALightTheLastDisplay == 3){
											var ind = arraySpotLights.length-1;
											arraySpotLights[ind].setCenter(DisplayArray[DisplayArray.length-1].modelMatrix);
								            gl.uniform3f(shaderProgram[currentShader].spotLightUniforms[ind].center, arraySpotLights[ind].center[0], arraySpotLights[ind].center[1], arraySpotLights[ind].center[2]);
										}
									}
									codeFunctions += "\t\t\t\tDisplayArray[DisplayArray.length-1].Scale([" + array + "]);";
								}else
									addToConsole("Execution Exception: no models displayed or invalid arguments");
							}else
								addToConsole("Console Message: ScaleObject with no arguments");
						break;
						case 'Print':
							var right = eval(astNode.right);
							var rsize = Object.size(right);
							var nil = "nil";
							if(right){
								right = value(right.reverse(), true);
								var str = "";
								for (var i in right){
									if(right[i].value == null && right[i].value+"" != "0" && right[i].value+"" != "")
										str += nil + addTab(("nil").length/4);
									else
										str += right[i].value + addTab((right[i].value+"").length/4);
								}
								addToConsole(str);
							}
						break;
						case 'Call':
							var left = eval(astNode.left);
							var right = eval(astNode.right);
							var rsize = Object.size(right);
							var item = FindScope(left.name, executionstack.size()-1);
							if(item && item.type == 'function'){
								var newstackframe = {};
								executionstack.push(newstackframe);
									
								if(item.params){
									var max = 0;
									if(rsize>0){
										right = value(right.reverse(), true);
										max = right.length;
									}
									for(var i = 0; i < item.params.length; i++){
										var val = null;
										if(max > 0){
											val = right[i].value;
											max--;
										}
										executionstack.top()[item.params[i]] = new AstNode('var', {value: val});
									}
								}

								v = eval(item.block);
								executionstack.pop();
							}else{
								addToConsole("Semantic Error: unknown funcion: "+left.name);
							}
						break;
						case 'Return':
							v = eval(astNode.right);
							v.reverse();
						break;
						case 'Type':
							var val = value(eval(astNode.right).reverse(), false).value;
							var type;
							if(!val && val+"" != "false" && val+"" != "0" && val+"" != "")
								type = "nil";
							else if(typeof val == "object")
								type = "table";
							else
								type = typeof val;
							v = new AstNode('string', {value: type});
						break;
						case 'Parentheses':
							v = value(eval(astNode.left), false);
						break;
						case 'TableName':
							v = eval(astNode.next);
							v.push(eval(astNode.name).name);
						break;
						case 'TableExp':
							v = eval(astNode.next);
							var val = value(eval(astNode.value), false);
							if (val.type == 'number')
								val.value--;
							v.push(val.value);
						break;
						case 'EmptyField':
							v = [];
						break;
						case 'ShortVar':
							var keys = eval(astNode.next).reverse();
							if(keys.length <= 0)
								keys = null;
							v = new AstNode('ShortVar', {name : eval(astNode.name).name, keys: keys});
						break;
						case 'NameVar':
							v = new AstNode('ShortVar', {name : astNode.name});
						break;
						case 'Empty':
							v = null;
						break;
					}
				}else
					v = true;
				return v;
			}

			var executionstack = new DataStructures.stack();
			executionstack.push({});