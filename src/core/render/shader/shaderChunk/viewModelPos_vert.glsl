#if defined(USE_POINT_LIGHT) || defined(USE_SPOT_LIGHT) || defined(USE_NORMAL_MAP) || defined(USE_BUMPMAP) || defined(FLAT_SHADED) || defined(USE_PHONG) || defined(USE_PBR) || defined(NUM_CLIPPING_PLANES)
    v_modelPos = (u_Model * vec4(transformed, 1.0)).xyz;
#endif