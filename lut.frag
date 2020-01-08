precision mediump float;
#define GLSLIFY 1

uniform sampler2D uTexture;
uniform sampler2D uLookup1;
uniform sampler2D uLookup2;
uniform sampler2D uLookup3;
uniform sampler2D uLookup4;
uniform float filterAlpha;
uniform float stop;
varying vec2 vUv;

vec4 lookup( vec4 textureColor,  sampler2D lookupTable) {
    #ifndef LUT_NO_CLAMP
        textureColor = clamp(textureColor, 0.0, 1.0);
    #endif

    mediump float blueColor = textureColor.b * 63.0;

    mediump vec2 quad1;
    quad1.y = floor(floor(blueColor) / 8.0);
    quad1.x = floor(blueColor) - (quad1.y * 8.0);

    mediump vec2 quad2;
    quad2.y = floor(ceil(blueColor) / 8.0);
    quad2.x = ceil(blueColor) - (quad2.y * 8.0);

    highp vec2 texPos1;
    texPos1.x = (quad1.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);
    texPos1.y = (quad1.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);

    #ifdef LUT_FLIP_Y
        texPos1.y = 1.0-texPos1.y;
    #endif

    highp vec2 texPos2;
    texPos2.x = (quad2.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);
    texPos2.y = (quad2.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);

    #ifdef LUT_FLIP_Y
        texPos2.y = 1.0-texPos2.y;
    #endif

    lowp vec4 newColor1 = texture2D(lookupTable, texPos1);
    lowp vec4 newColor2 = texture2D(lookupTable, texPos2);

    lowp vec4 newColor = mix(newColor1, newColor2, fract(blueColor));
    return newColor* filterAlpha + textureColor*(1.0-filterAlpha);
}

vec4 gridLookup(vec4 textureColor, vec2 vUv){
    if(vUv.x<0.5 && vUv.y<0.5){
        return lookup(textureColor,uLookup1);
    }else if(vUv.x<0.5 && vUv.y>=0.5){
        return lookup(textureColor,uLookup2);
    }else if(vUv.x>=0.5 && vUv.y<0.5){
        return lookup(textureColor,uLookup3);
    }else if(vUv.x>=0.5 && vUv.y>=0.5){
        return lookup(textureColor,uLookup4);
    }
}

void main() {
	vec4 color = texture2D(uTexture, mod(vUv*2.0,1.0));
    vec4 outputColor = gridLookup(color, vUv);
	gl_FragColor = outputColor;

}