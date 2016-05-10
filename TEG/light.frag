#version 400
	
in vec3 Position;
in vec3 Normal;

struct PosLight
{
	vec4 Position;  // Light position in eye coords.
	vec3 La;		// Light Ambient
	vec3 Ld;		// Light Diffuse
	vec3 Ls;		// Light Specular
	float LinearAtt;
	float QuadraticAtt;
};

struct SpotLight
{
	vec4 Position;   // Light position in eye coords.
	vec3 Direction;  // Light direction in eye coords.
	vec3 La;		 // Light Ambient
	vec3 Ld;		 // Light Diffuse
	vec3 Ls;		 // Light Specular
	float Exponent;  // Light exponent
	float Cutoff;    // Light cutoff
	float LinearAtt;
	float QuadraticAtt;
};

struct DirLight
{
	vec3 Direction;  // Light position in eye coords.
	vec3 La;		// Light Ambient
	vec3 Ld;		// Light Diffuse
	vec3 Ls;		// Light Specular
};

struct MaterialInfo
{
	vec3 Ka;         // Ambient reflectivity
	vec3 Kd;         // Diffuse reflectivity
	vec3 Ks;         // Specular reflectivity
	float Shininess; // Specular shininess factor
};

uniform PosLight PLight[4];
uniform SpotLight SLight[4];
uniform DirLight DLight[2];
uniform MaterialInfo Material;
uniform vec4 CameraPos;

layout( location = 0 ) out vec4 FragColor;

void main()
{
	vec3 n = normalize(Normal);
	vec3 v = normalize(vec3(CameraPos) - Position);
	vec3 color = vec3(0.0,0.0,0.0);

	for(int i=0; i<4; i++)
	{
		float dist = distance(vec3(PLight[i].Position),Position);
		float att  = 1.0/(1.0 + (PLight[i].LinearAtt*dist) + (PLight[i].QuadraticAtt*dist*dist));
	
		vec3 s = normalize(vec3(PLight[i].Position) - Position);
		vec3 r = reflect(-s, n);
		
		vec3 ambient  =  Material.Ka * PLight[i].La;
		vec3 diffuse  =  Material.Kd * PLight[i].Ld * max( dot(s,n), 0.0 );
		vec3 specular =  Material.Ks * PLight[i].Ls * pow(max(dot(r,v), 0.0),Material.Shininess);
		
		color += ambient + att * (diffuse + specular);
	}
	
	for(int i=0; i<4; i++)
	{
		vec3 s = normalize(vec3(SLight[i].Position) - Position);
		
		float angle = dot(-s,SLight[i].Direction);
		float cutoff = SLight[i].Cutoff;
		
		vec3 ambient = Material.Ka * SLight[i].La;
		
		if(angle > cutoff)
		{
			float dist = distance(vec3(SLight[i].Position), Position);
			float att  = 1.0/(1.0 + (SLight[i].LinearAtt * dist) + (SLight[i].QuadraticAtt * dist * dist));
		
			float fDif = 1.0 - cutoff;
			float fFactor = clamp((angle-cutoff)/fDif, 0.0, 1.0);
			
			float spotFactor = pow(fFactor,SLight[i].Exponent);
			vec3 r = reflect(-s, n);
			vec3 diffuse  =  spotFactor * Material.Kd * SLight[i].Ld * max( dot(s, n), 0.0 );
			vec3 specular =  Material.Ks * SLight[i].Ls * pow(max(dot(r,v), 0.0), Material.Shininess);
			
			color += ambient + att * (diffuse + specular);
		}else
			color += ambient;
	}
	
	for(int i=0; i<2; i++)
	{
		vec3 s = normalize(vec3(DLight[i].Direction));
		vec3 r = reflect(-s, n);

		vec3 ambient =  Material.Ka * DLight[i].La;
		vec3 diffuse =  Material.Kd * DLight[i].Ld * max( dot(s,n), 0.0 );
		vec3 specular = Material.Ks * DLight[i].Ls * pow(max(dot(r,v), 0.0),Material.Shininess);
		
		color += ambient + diffuse + specular;
	}
	
	FragColor = vec4(color,1.0);
}
//