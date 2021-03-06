#ifdef USE_ENV_MAP

    vec3 envDir;
    #if defined(USE_NORMAL_MAP) || defined(USE_BUMPMAP)
        envDir = reflect(normalize(v_worldPos - u_CameraPosition), N);
    #else
        envDir = v_EnvPos;
    #endif

    vec4 envColor = textureCube(envMap, envDir);

    envColor = envMapTexelToLinear( envColor );

    #ifdef ENVMAP_BLENDING_MULTIPLY
		outColor = mix(outColor, envColor * outColor, u_EnvMap_Intensity);
	#elif defined( ENVMAP_BLENDING_MIX )
		outColor = mix(outColor, envColor, u_EnvMap_Intensity);
	#elif defined( ENVMAP_BLENDING_ADD )
		outColor += envColor * u_EnvMap_Intensity;
	#endif
#endif