%lex

%%
\s+                          /* skip whitespace */

"--[["[^\[\]]*"]]"          return  'longcomment'
"--"[^\n]*                  return  'linecomment'

/* Values */
"true"                return 'true'
"false"               return 'false'
"nil"                 return 'nil'

/* Op Rel */
"or"                  return 'or'
"and"                 return 'and'
"not"                 return 'not'

/* Control */
"for"                 return 'for'
"while"               return 'while'
"do"                  return 'do'
"if"                  return 'if'
"then"                return 'then'
"elseif"              return 'elseif'
"else"                return 'else'
"until"               return 'until'
"repeat"              return 'repeat'
"end"                 return 'end'
"in"                  return 'in'
"break"               return 'break'
"return"              return 'return'
"goto"                return 'goto'
"local"				  return 'local'

/* Functions */
"print"				  return 'print'
"function"            return 'function'

/* Others */
"type"				  return 'type'
"local"               return 'local'

/* Extension */
"DrawCube"			   return 'cube'     
"DrawCone"			   return 'cone'   
"DrawSphere"		   return 'sphere'     
"DrawCylinder"		   return 'cylinder'   
"DrawGrid"			   return 'grid'
"DrawObject"		   return 'obj'      
"TranslateObject"	   return 'translate'
"RotateObject"		   return 'rotate'    
"ScaleObject"	  	   return 'scale'
"DrawPointLight"	   return 'plight'
"DrawDirectionalLight" return 'dlight'
"DrawSpotLight"		   return 'splight'
"ChangeLighting"	   return 'change'
"AmbientalComponent"   return 'ambiental'
"DiffuseComponent"	   return 'diffuse'
"SpecularComponent"	   return 'specular'   

/* Complex data */
"0"(x|X)[0-9a-fA-F]+(\.)[0-9a-fA-F]*[(e|E)[+-][0-9]+]?              	 return 'hexfloat'
"0"(x|X)[0-9a-fA-F]+((e|E)[+-][0-9]+)?                            		 return 'hexint'
[0-9]*\.[0-9]+([eE][+-]?[0-9]+)?                                         return 'float'
[0-9]+([eE][+-]?[0-9]+)?                                                 return 'int'
[a-zA-Z][a-zA-Z_0-9]*                                                    return 'name'
[\'][^\'\n]*[\']                                                         return 'charstring'
["][^\"\n]*["]                                                           return 'string'

/* Symbols */
"+"					  return '+'
"-"					  return '-'
"*"					  return '*'
"//"				  return '//'
"/"					  return '/'
"^"					  return '^'
"%"					  return '%'
"<<"				  return "<<"
">>"				  return ">>"
"<="				  return '<='
">="				  return '>='
"<"					  return '<'
">"					  return '>'
"~="				  return '~='
"=="				  return '=='
"#"					  return '#'
"~"					  return '~'
"="					  return '='
"["					  return '['
"]"					  return ']'
"("					  return '('
")"					  return ')'
"{"					  return '{'
"}"					  return '}'
"::"				  return '::'
"$"					  return '$'
"@"					  return '@'
"&"					  return '&'
"`"					  return '`'
"|"					  return '|'
":"					  return ':'
"..."				  return '...'
".."				  return '..'
"."					  return '.' 
";"					  return ';'
","					  return ','


<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex


%start START

%% /* language grammar */

START   : CHUNK { program = $1;}
        ;

CHUNK	: BLOCK LASTSTAT EOF { $$ = new AstNode('Chunk', {left: $1, right: $2, line: yylineno}); }
		| BLOCK LASTSTAT { $$ = new AstNode('Chunk', {left: $1, right: $2, line: yylineno}); }
		;


BLOCK	: BLOCK STAT { $$ = new AstNode('Stat', {left: $1, right: $2, line: yylineno}); }
		| { $$ = new AstNode('Empty'); }
		;

LASTSTAT	: return EXPLIST SEMICOLON { $$ = new AstNode('Return', {right: $2, end: $3, line: yylineno}); }
			| return { $$ = new AstNode('Empty'); }
			| { $$ = new AstNode('Empty'); }
			;

SEMICOLON	: ';' { $$ = new AstNode('Empty'); }
			| { $$ = new AstNode('Empty'); }
			;

NAME	: name { $$ = new AstNode('NameVar', {name: yytext, line: yylineno}); }
		;

NAMELIST : NAME { $$ = new AstNode('LastVar', {left: $1, line: yylineno}); }
		 | NAME ',' NAMELIST { $$ = new AstNode('NextVar', {left: $1, next: $3, line: yylineno}); }
		 ;

FUNCBODY	: '(' NAMELIST ')' CHUNK end { $$ = new AstNode('FuncBody', {params: $2, block: $4 , line: yylineno}); }
			| '(' ')' CHUNK end { $$ = new AstNode('FuncBody', {params: null, block: $3, line: yylineno}); }
			;

STAT	: local NAMELIST ASIG { $$ = new AstNode('LocalAsignation', {left: $2, right: $3, line: yylineno}); }
		| ';' { $$ = new AstNode('Empty'); }
		| VARLIST '=' EXPLIST { $$ = new AstNode('Asignation', {left: $1, right: $3, line: yylineno}); }
		| FUNCALL { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
		| while EXP do CHUNK end { $$ = new AstNode('While', {cond: $2, block: $4, line: yylineno}); }
		| do CHUNK end { $$ = new AstNode('Do', {block: $2 , line: yylineno}); }
		| if EXP then CHUNK ELSEIF ELSE end { $$ = new AstNode('If', {cond: $2, block: $4, eli: $5, el: $6, line: yylineno}); }
		| for NAME '=' EXP ',' EXP OPTIONAL do CHUNK end { $$ = new AstNode('For', {index: $2, value: $4, until: $6, inc: $7, block: $9, line: yylineno}); }
		| repeat CHUNK until EXP { $$ = new AstNode('Repeat', {block: $2, until: $4 , line: yylineno}); }
		| function NAME FUNCBODY { $$ = new AstNode('Function', {name: $2, body: $3 , line: yylineno}); }
		| break { $$ = new AstNode('Break', {line: yylineno}); }
		| linecomment { $$ = new AstNode('Empty'); }
		| longcomment { $$ = new AstNode('Empty'); }
		;

ASIG 	: '=' EXPLIST { $$ = new AstNode('KG', {left: $2, line: yylineno}); }
		| { $$ = new AstNode('Empty'); }
		;

ELSE 	: else CHUNK { $$ = new AstNode('Else', {block: $2, line: yylineno}); }
		| { $$ = new AstNode('Empty'); }
		;

ELSEIF 	: elseif EXP then CHUNK ELSEIF { $$ = new AstNode('Elseif', {cond: $2, block: $4, next: $5, line: yylineno}); }
		| { $$ = new AstNode('Empty'); }
		;

OPTIONAL	: ',' EXP { $$ = new AstNode('KG', {left: $2, line: yylineno}); }
			| { $$ = new AstNode('Empty'); }
			;

VARLIST	: VAR { $$ = new AstNode('LastVar', {left: $1, line: yylineno}); }
		| VAR ',' VARLIST { $$ = new AstNode('NextVar', {left: $1, next: $3, line: yylineno}); }
		;

VAR 	: NAME TABLE { $$ = new AstNode('ShortVar', {name: $1, next: $2, line: yylineno}); }
		;

TABLE	: '.' NAME TABLE { $$ = new AstNode('TableName', {name: $2, next: $3, line: yylineno}); }
		| '[' EXP ']' TABLE { $$ = new AstNode('TableExp', {value: $2, next: $4, line: yylineno}); }
		| { $$ = new AstNode('EmptyField'); }
		;

EXPLIST	: EXP { $$ = new AstNode('LastExp', {left: $1, line: yylineno}); }
		| EXP ',' EXPLIST { $$ = new AstNode('NextExp', {left: $1, next: $3, line: yylineno}); }
		;

EXP	: EXP or ANDOP { $$ = new AstNode('Or', {left: $1, right: $3, line: yylineno}); }
	| ANDOP { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
	;
	
ANDOP	: ANDOP and EQUALOP { $$ = new AstNode('And', {left: $1, right: $3, line: yylineno}); }
		| EQUALOP { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
		;

EQUALOP : EQUALOP '==' NOTEQUALOP { $$ = new AstNode('==', {left: $1, right: $3, line: yylineno}); }
        | NOTEQUALOP { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
        ;

NOTEQUALOP  : NOTEQUALOP '~=' GEOP { $$ = new AstNode('~=', {left: $1, right: $3, line: yylineno}); }
            | GEOP { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
            ;

GEOP	: GEOP '>=' MEOP { $$ = new AstNode('>=', {left: $1, right: $3, line: yylineno}); }
		| MEOP { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
		;

MEOP    : MEOP '<=' GREATEROP { $$ = new AstNode('<=', {left: $1, right: $3, line: yylineno}); }
        | GREATEROP { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
        ;

GREATEROP	: GREATEROP '>' LESSOP { $$ = new AstNode('>', {left: $1, right: $3, line: yylineno}); }
			| LESSOP { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
			;

LESSOP  : LESSOP '<' BITOR { $$ = new AstNode('<', {left: $1, right: $3, line: yylineno}); }
        | BITOR { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
        ;

BITOR	: BITOR '|' EXBITOR { $$ = new AstNode('|', {left: $1, right: $3, line: yylineno}); }
		| EXBITOR { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
		;

EXBITOR	: EXBITOR '~' BITAND { $$ = new AstNode('~', {left: $1, right: $3, line: yylineno}); }
		| BITAND { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
		;

BITAND	: BITAND '&' RIGHTS { $$ = new AstNode('&', {left: $1, right: $3, line: yylineno}); }
		| RIGHTS { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
		;

RIGHTS	: RIGHTS '>>' LEFTS { $$ = new AstNode('>>', {left: $1, right: $3, line: yylineno}); }
		| LEFTS { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
		;

LEFTS	: LEFTS '<<' CONCATOP { $$ = new AstNode('<<', {left: $1, right: $3, line: yylineno}); }
		| CONCATOP { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
		;
	
CONCATOP	: MINUSOP '..' CONCATOP { $$ = new AstNode('..', {left: $1, right: $3, line: yylineno}); }
			| MINUSOP { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
			;
			
MINUSOP : MINUSOP '-' PLUSOP { $$ = new AstNode('-', {left: $1, right: $3, line: yylineno}); }
        | PLUSOP { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
        ;

PLUSOP  : PLUSOP '+' MOD { $$ = new AstNode('+', {left: $1, right: $3, line: yylineno}); }
        | MOD { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
        ;

MOD		: MOD '%' FDIV { $$ = new AstNode('%', {left: $1, right: $3, line: yylineno}); }
        | FDIV { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
        ;

FDIV	: FDIV '//' DIVOP { $$ = new AstNode('//', {left: $1, right: $3, line: yylineno}); }
        | DIVOP { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
        ;
			
DIVOP   : DIVOP '/' MULTOP { $$ = new AstNode('/', {left: $1, right: $3, line: yylineno}); }
        | MULTOP { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
        ;

MULTOP  : MULTOP '*' BITNOT { $$ = new AstNode('*', {left: $1, right: $3, line: yylineno}); }
        | BITNOT { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
        ;

BITNOT	: '~' BITNOT { $$ = new AstNode('Bitnot', {left: $2, line: yylineno}); }
		| UMINUS { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
		;
			
UMINUS	: '-' BITNOT { $$ = new AstNode('Uminus', {left: $2, line: yylineno}); }
		| LENGTH { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
		;

LENGTH	: '#' BITNOT { $$ = new AstNode('#', {left: $2, line: yylineno}); }
		| NOT { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
		;
			
NOT 	: not BITNOT { $$ = new AstNode('Not', {left: $2, line: yylineno}); }
		| POWEROP { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
		;
		
POWEROP : BACKTRACK '^' POWEROP { $$ = new AstNode('^', {left: $1, right: $3, line: yylineno}); }
        | BACKTRACK { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
        ;
	
BACKTRACK	: '(' EXP ')' { $$ = new AstNode('Parentheses', {left: $2, line: yylineno}); }
			| nil { $$ = new AstNode('NULL', {value: yytext, line: yylineno}); }
			| true { $$ = new AstNode('Bool', {value: yytext, line: yylineno}); }
			| false { $$ = new AstNode('Bool', {value: yytext, line: yylineno}); }
			| string { $$ = new AstNode('String', {value: yytext, line: yylineno}); }
			| charstring { $$ = new AstNode('String', {value: yytext, line: yylineno}); }
			| NUMERAL { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
			| VAR { $$ = new AstNode('Var', {left: $1, line: yylineno}); }
			| FUNCALL { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
			| TABLECONST { $$ = new AstNode('KG', {left: $1, line: yylineno}); }
			;

TABLECONST	: '{' FIELDLIST '}' { $$ = new AstNode('Constructor', {left: $2, line: yylineno}); }
			| '{' '}' { $$ = new AstNode('Constructor', {left: null, line: yylineno}); }
			;

FIELDLIST 	: FIELD { $$ = new AstNode('LastVar', {left: $1, line: yylineno}); }
			| FIELD SEP FIELDLIST { $$ = new AstNode('NextVar', {left: $1, next: $3, line: yylineno}); }
			;

FIELD 	: '[' EXP ']' '=' EXP { $$ = new AstNode('FieldExp', {key: $2, value: $5, line: yylineno}); }
		| NAME '=' EXP { $$ = new AstNode('FieldName', {key: $1, value: $3, line: yylineno}); }
		| EXP { $$ = new AstNode('Field', {value: $1, line: yylineno}); }
		;

SEP	: ';' {;}
	| ',' {;}
	;

NUMERAL	: hexfloat { $$ = new AstNode('HexFloat', {value: yytext, line: yylineno}); }
		| hexint { $$ = new AstNode('Num', {value: parseInt(yytext, 16), line: yylineno}); }
		| float { $$ = new AstNode('Num', {value: parseFloat(yytext, 10), line: yylineno}); }
		| int { $$ = new AstNode('Num', {value: parseInt(yytext, 10), line: yylineno}); }
		;

FUNCALL	: cube ARGS { $$ = new AstNode('Cube', {right: $2, line: yylineno}); }
		| cone ARGS { $$ = new AstNode('Cone', {right: $2, line: yylineno}); }
		| sphere ARGS { $$ = new AstNode('Sphere', {right: $2, line: yylineno}); }
		| cylinder ARGS { $$ = new AstNode('Cylinder', {right: $2, line: yylineno}); }
		| grid ARGS { $$ = new AstNode('Grid', {right: $2, line: yylineno}); }
		| translate ARGS { $$ = new AstNode('Translate', {right: $2, line: yylineno}); }
		| rotate ARGS { $$ = new AstNode('Rotate', {right: $2, line: yylineno}); }
		| scale ARGS { $$ = new AstNode('Scale', {right: $2, line: yylineno}); }
		| obj ARGS { $$ = new AstNode('Obj', {right: $2, line: yylineno}); }
		| plight ARGS { $$ = new AstNode('Plight', {right: $2, line: yylineno}); }
		| dlight ARGS { $$ = new AstNode('Dlight', {right: $2, line: yylineno}); }
		| splight ARGS { $$ = new AstNode('Splight', {right: $2, line: yylineno}); }
		| change ARGS { $$ = new AstNode('Change', {right: $2, line: yylineno}); }
		| ambiental ARGS { $$ = new AstNode('Ambiental', {right: $2, line: yylineno}); }
		| diffuse ARGS { $$ = new AstNode('Diffuse', {right: $2, line: yylineno}); }
		| specular ARGS { $$ = new AstNode('Specular', {right: $2, line: yylineno}); }
		| print ARGS { $$ = new AstNode('Print', {right: $2, line: yylineno}); }
		| type ARGS { $$ = new AstNode('Type', {right: $2, line: yylineno}); }
		| VAR ARGS { $$ = new AstNode('Call', {left: $1, right: $2, line: yylineno}); }
		;

ARGS	: '(' EXPLIST ')' { $$ = new AstNode('KG', {left: $2, line: yylineno}); }
		| '(' ')' { $$ = new AstNode('Empty'); }
		;


