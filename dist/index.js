import { ShaderMaterial, Color, Vector4, CanvasTexture, LinearFilter, DataTexture, RGBAFormat, NearestFilter, Vector3, Vector2, RawShaderMaterial, Texture, AdditiveBlending, NoBlending, LessEqualDepth, Box3, EventDispatcher, Sphere, BufferGeometry, Points, WebGLRenderTarget, Scene, Object3D, BufferAttribute, Uint8BufferAttribute, LineSegments, LineBasicMaterial, Matrix4, Frustum } from 'three';
import { P as PointAttributes, V as Version, a as PointAttributeName } from './version-DabiREzy.js';
export { c as POINT_ATTRIBUTES, b as POINT_ATTRIBUTE_TYPES } from './version-DabiREzy.js';
import { P as PointAttributeTypes, a as PointAttribute, b as PointAttributes$1 } from './point-attributes-Ck93P4aI.js';

var blurVert = `precision highp float;
precision highp int;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;

void main() {
    vUv = uv;

    gl_Position =   projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

var blurFrag = `precision highp float;
precision highp int;

uniform mat4 projectionMatrix;

uniform float screenWidth;
uniform float screenHeight;

uniform sampler2D map;

varying vec2 vUv;

void main() {

	float dx = 1.0 / screenWidth;
	float dy = 1.0 / screenHeight;

	vec3 color = vec3(0.0, 0.0, 0.0);
	color += texture2D(map, vUv + vec2(-dx, -dy)).rgb;
	color += texture2D(map, vUv + vec2(  0, -dy)).rgb;
	color += texture2D(map, vUv + vec2(+dx, -dy)).rgb;
	color += texture2D(map, vUv + vec2(-dx,   0)).rgb;
	color += texture2D(map, vUv + vec2(  0,   0)).rgb;
	color += texture2D(map, vUv + vec2(+dx,   0)).rgb;
	color += texture2D(map, vUv + vec2(-dx,  dy)).rgb;
	color += texture2D(map, vUv + vec2(  0,  dy)).rgb;
	color += texture2D(map, vUv + vec2(+dx,  dy)).rgb;
    
	color = color / 9.0;
	
	gl_FragColor = vec4(color, 1.0);
	
	
}`;

class BlurMaterial extends ShaderMaterial {
    constructor() {
        super(...arguments);
        this.vertexShader = blurVert;
        this.fragmentShader = blurFrag;
        this.uniforms = {
            screenWidth: { type: 'f', value: 0 },
            screenHeight: { type: 'f', value: 0 },
            map: { type: 't', value: null },
        };
    }
}

var ClipMode;
(function (ClipMode) {
    ClipMode[ClipMode["DISABLED"] = 0] = "DISABLED";
    ClipMode[ClipMode["CLIP_OUTSIDE"] = 1] = "CLIP_OUTSIDE";
    ClipMode[ClipMode["HIGHLIGHT_INSIDE"] = 2] = "HIGHLIGHT_INSIDE";
    ClipMode[ClipMode["CLIP_HORIZONTALLY"] = 3] = "CLIP_HORIZONTALLY";
    ClipMode[ClipMode["CLIP_VERTICALLY"] = 4] = "CLIP_VERTICALLY";
})(ClipMode || (ClipMode = {}));

var PointSizeType;
(function (PointSizeType) {
    PointSizeType[PointSizeType["FIXED"] = 0] = "FIXED";
    PointSizeType[PointSizeType["ATTENUATED"] = 1] = "ATTENUATED";
    PointSizeType[PointSizeType["ADAPTIVE"] = 2] = "ADAPTIVE";
})(PointSizeType || (PointSizeType = {}));
var PointShape;
(function (PointShape) {
    PointShape[PointShape["SQUARE"] = 0] = "SQUARE";
    PointShape[PointShape["CIRCLE"] = 1] = "CIRCLE";
    PointShape[PointShape["PARABOLOID"] = 2] = "PARABOLOID";
})(PointShape || (PointShape = {}));
var TreeType;
(function (TreeType) {
    TreeType[TreeType["OCTREE"] = 0] = "OCTREE";
    TreeType[TreeType["KDTREE"] = 1] = "KDTREE";
})(TreeType || (TreeType = {}));
var PointOpacityType;
(function (PointOpacityType) {
    PointOpacityType[PointOpacityType["FIXED"] = 0] = "FIXED";
    PointOpacityType[PointOpacityType["ATTENUATED"] = 1] = "ATTENUATED";
})(PointOpacityType || (PointOpacityType = {}));
var PointColorType;
(function (PointColorType) {
    PointColorType[PointColorType["RGB"] = 0] = "RGB";
    PointColorType[PointColorType["COLOR"] = 1] = "COLOR";
    PointColorType[PointColorType["DEPTH"] = 2] = "DEPTH";
    PointColorType[PointColorType["HEIGHT"] = 3] = "HEIGHT";
    PointColorType[PointColorType["ELEVATION"] = 3] = "ELEVATION";
    PointColorType[PointColorType["INTENSITY"] = 4] = "INTENSITY";
    PointColorType[PointColorType["INTENSITY_GRADIENT"] = 5] = "INTENSITY_GRADIENT";
    PointColorType[PointColorType["LOD"] = 6] = "LOD";
    PointColorType[PointColorType["LEVEL_OF_DETAIL"] = 6] = "LEVEL_OF_DETAIL";
    PointColorType[PointColorType["POINT_INDEX"] = 7] = "POINT_INDEX";
    PointColorType[PointColorType["CLASSIFICATION"] = 8] = "CLASSIFICATION";
    PointColorType[PointColorType["RETURN_NUMBER"] = 9] = "RETURN_NUMBER";
    PointColorType[PointColorType["SOURCE"] = 10] = "SOURCE";
    PointColorType[PointColorType["NORMAL"] = 11] = "NORMAL";
    PointColorType[PointColorType["PHONG"] = 12] = "PHONG";
    PointColorType[PointColorType["RGB_HEIGHT"] = 13] = "RGB_HEIGHT";
    PointColorType[PointColorType["COMPOSITE"] = 50] = "COMPOSITE";
})(PointColorType || (PointColorType = {}));
var NormalFilteringMode;
(function (NormalFilteringMode) {
    NormalFilteringMode[NormalFilteringMode["ABSOLUTE_NORMAL_FILTERING_MODE"] = 1] = "ABSOLUTE_NORMAL_FILTERING_MODE";
    NormalFilteringMode[NormalFilteringMode["LESS_EQUAL_NORMAL_FILTERING_MODE"] = 2] = "LESS_EQUAL_NORMAL_FILTERING_MODE";
    NormalFilteringMode[NormalFilteringMode["GREATER_NORMAL_FILTERING_MODE"] = 3] = "GREATER_NORMAL_FILTERING_MODE";
})(NormalFilteringMode || (NormalFilteringMode = {}));
var PointCloudMixingMode;
(function (PointCloudMixingMode) {
    PointCloudMixingMode[PointCloudMixingMode["CHECKBOARD"] = 1] = "CHECKBOARD";
    PointCloudMixingMode[PointCloudMixingMode["STRIPES"] = 2] = "STRIPES";
})(PointCloudMixingMode || (PointCloudMixingMode = {}));

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const DEFAULT_RGB_BRIGHTNESS = 0;
const DEFAULT_RGB_CONTRAST = 0;
const DEFAULT_RGB_GAMMA = 1;
const DEFAULT_MAX_POINT_SIZE = 50;
const DEFAULT_MIN_NODE_PIXEL_SIZE = 50;
const DEFAULT_MIN_POINT_SIZE = 2;
const DEFAULT_PICK_WINDOW_SIZE = 15;
const DEFAULT_POINT_BUDGET = 1000000;
const MAX_LOADS_TO_GPU = 2;
const MAX_NUM_NODES_LOADING = 4;
const PERSPECTIVE_CAMERA = 'PerspectiveCamera';
const COLOR_BLACK = new Color(0, 0, 0);
const DEFAULT_HIGHLIGHT_COLOR = new Vector4(1, 0, 0, 1);

function getIndexFromName(name) {
    return parseInt(name.charAt(name.length - 1), 10);
}
/**
 * When passed to `[].sort`, sorts the array by level and index: r, r0, r3, r4, r01, r07, r30, ...
 */
function byLevelAndIndex(a, b) {
    const na = a.name;
    const nb = b.name;
    if (na.length !== nb.length) {
        return na.length - nb.length;
    }
    else if (na < nb) {
        return -1;
    }
    else if (na > nb) {
        return 1;
    }
    else {
        return 0;
    }
}
function handleFailedRequest(response) {
    if (response.status !== 200) {
        throw Error('Response error');
    }
    return response;
}
function handleEmptyBuffer(buffer) {
    if (!buffer || buffer.byteLength === 0) {
        throw Error('Empty buffer');
    }
    return buffer;
}

const DEFAULT_CLASSIFICATION = {
    0: new Vector4(0.5, 0.5, 0.5, 1.0),
    1: new Vector4(0.5, 0.5, 0.5, 1.0),
    2: new Vector4(0.63, 0.32, 0.18, 1.0),
    3: new Vector4(0.0, 1.0, 0.0, 1.0),
    4: new Vector4(0.0, 0.8, 0.0, 1.0),
    5: new Vector4(0.0, 0.6, 0.0, 1.0),
    6: new Vector4(1.0, 0.66, 0.0, 1.0),
    7: new Vector4(1.0, 0, 1.0, 1.0),
    8: new Vector4(1.0, 0, 0.0, 1.0),
    9: new Vector4(0.0, 0.0, 1.0, 1.0),
    12: new Vector4(1.0, 1.0, 0.0, 1.0),
    DEFAULT: new Vector4(0.3, 0.6, 0.6, 0.5),
};

const GRAYSCALE = [
    [0, new Color(0, 0, 0)],
    [1, new Color(1, 1, 1)],
];

const INFERNO = [
    [0.0, new Color(0.077, 0.042, 0.206)],
    [0.1, new Color(0.225, 0.036, 0.388)],
    [0.2, new Color(0.373, 0.074, 0.432)],
    [0.3, new Color(0.522, 0.128, 0.42)],
    [0.4, new Color(0.665, 0.182, 0.37)],
    [0.5, new Color(0.797, 0.255, 0.287)],
    [0.6, new Color(0.902, 0.364, 0.184)],
    [0.7, new Color(0.969, 0.516, 0.063)],
    [0.8, new Color(0.988, 0.683, 0.072)],
    [0.9, new Color(0.961, 0.859, 0.298)],
    [1.0, new Color(0.988, 0.998, 0.645)],
];

const PLASMA = [
    [0.0, new Color(0.241, 0.015, 0.61)],
    [0.1, new Color(0.387, 0.001, 0.654)],
    [0.2, new Color(0.524, 0.025, 0.653)],
    [0.3, new Color(0.651, 0.125, 0.596)],
    [0.4, new Color(0.752, 0.227, 0.513)],
    [0.5, new Color(0.837, 0.329, 0.431)],
    [0.6, new Color(0.907, 0.435, 0.353)],
    [0.7, new Color(0.963, 0.554, 0.272)],
    [0.8, new Color(0.992, 0.681, 0.195)],
    [0.9, new Color(0.987, 0.822, 0.144)],
    [1.0, new Color(0.94, 0.975, 0.131)],
];

const RAINBOW = [
    [0, new Color(0.278, 0, 0.714)],
    [1 / 6, new Color(0, 0, 1)],
    [2 / 6, new Color(0, 1, 1)],
    [3 / 6, new Color(0, 1, 0)],
    [4 / 6, new Color(1, 1, 0)],
    [5 / 6, new Color(1, 0.64, 0)],
    [1, new Color(1, 0, 0)],
];

// From chroma spectral http://gka.github.io/chroma.js/
const SPECTRAL = [
    [0, new Color(0.3686, 0.3098, 0.6353)],
    [0.1, new Color(0.1961, 0.5333, 0.7412)],
    [0.2, new Color(0.4, 0.7608, 0.6471)],
    [0.3, new Color(0.6706, 0.8667, 0.6431)],
    [0.4, new Color(0.902, 0.9608, 0.5961)],
    [0.5, new Color(1.0, 1.0, 0.749)],
    [0.6, new Color(0.9961, 0.8784, 0.5451)],
    [0.7, new Color(0.9922, 0.6824, 0.3804)],
    [0.8, new Color(0.9569, 0.4275, 0.2627)],
    [0.9, new Color(0.8353, 0.2431, 0.3098)],
    [1, new Color(0.6196, 0.0039, 0.2588)],
];

const VIRIDIS = [
    [0.0, new Color(0.267, 0.005, 0.329)],
    [0.1, new Color(0.283, 0.141, 0.458)],
    [0.2, new Color(0.254, 0.265, 0.53)],
    [0.3, new Color(0.207, 0.372, 0.553)],
    [0.4, new Color(0.164, 0.471, 0.558)],
    [0.5, new Color(0.128, 0.567, 0.551)],
    [0.6, new Color(0.135, 0.659, 0.518)],
    [0.7, new Color(0.267, 0.749, 0.441)],
    [0.8, new Color(0.478, 0.821, 0.318)],
    [0.9, new Color(0.741, 0.873, 0.15)],
    [1.0, new Color(0.993, 0.906, 0.144)],
];

const YELLOW_GREEN = [
    [0, new Color(0.1647, 0.2824, 0.3451)],
    [0.1, new Color(0.1338, 0.3555, 0.4227)],
    [0.2, new Color(0.061, 0.4319, 0.4864)],
    [0.3, new Color(0.0, 0.5099, 0.5319)],
    [0.4, new Color(0.0, 0.5881, 0.5569)],
    [0.5, new Color(0.137, 0.665, 0.5614)],
    [0.6, new Color(0.2906, 0.7395, 0.5477)],
    [0.7, new Color(0.4453, 0.8099, 0.5201)],
    [0.8, new Color(0.6102, 0.8748, 0.485)],
    [0.9, new Color(0.7883, 0.9323, 0.4514)],
    [1, new Color(0.9804, 0.9804, 0.4314)],
];

function generateDataTexture(width, height, color) {
    const size = width * height;
    const data = new Uint8Array(4 * size);
    const r = Math.floor(color.r * 255);
    const g = Math.floor(color.g * 255);
    const b = Math.floor(color.b * 255);
    for (let i = 0; i < size; i++) {
        data[i * 3] = r;
        data[i * 3 + 1] = g;
        data[i * 3 + 2] = b;
    }
    const texture = new DataTexture(data, width, height, RGBAFormat);
    texture.needsUpdate = true;
    texture.magFilter = NearestFilter;
    return texture;
}
function generateGradientTexture(gradient) {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    context.rect(0, 0, size, size);
    const ctxGradient = context.createLinearGradient(0, 0, size, size);
    for (let i = 0; i < gradient.length; i++) {
        const step = gradient[i];
        ctxGradient.addColorStop(step[0], `#${step[1].getHexString()}`);
    }
    context.fillStyle = ctxGradient;
    context.fill();
    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = LinearFilter;
    // textureImage = texture.image;
    return texture;
}
function generateClassificationTexture(classification) {
    const width = 256;
    const height = 256;
    const size = width * height;
    const data = new Uint8Array(4 * size);
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const i = x + width * y;
            let color;
            if (classification[x]) {
                color = classification[x];
            }
            else if (classification[x % 32]) {
                color = classification[x % 32];
            }
            else {
                color = classification.DEFAULT;
            }
            data[4 * i + 0] = 255 * color.x;
            data[4 * i + 1] = 255 * color.y;
            data[4 * i + 2] = 255 * color.z;
            data[4 * i + 3] = 255 * color.w;
        }
    }
    const texture = new DataTexture(data, width, height, RGBAFormat);
    texture.magFilter = NearestFilter;
    texture.needsUpdate = true;
    return texture;
}

var fragShader = `precision highp float;
precision highp int;

#if defined paraboloid_point_shape
	#extension GL_EXT_frag_depth : enable
#endif

uniform mat4 viewMatrix;
uniform vec3 cameraPosition;

uniform mat4 projectionMatrix;
uniform float opacity;

uniform float blendHardness;
uniform float blendDepthSupplement;
uniform float fov;
uniform float spacing;
uniform float pcIndex;
uniform float screenWidth;
uniform float screenHeight;

uniform sampler2D depthMap;

#if defined (clip_horizontally) || defined (clip_vertically)
	uniform vec4 clipExtent;
#endif

#ifdef use_texture_blending
	uniform sampler2D backgroundMap;
#endif


#ifdef use_point_cloud_mixing
	uniform int pointCloudMixingMode;
	uniform float pointCloudID;
	uniform float pointCloudMixAngle;
	uniform float stripeDistanceX;
	uniform float stripeDistanceY;

	uniform float stripeDivisorX;
	uniform float stripeDivisorY;
#endif

#ifdef highlight_point
	uniform vec4 highlightedPointColor;
#endif

varying vec3 vColor;
varying vec3 overridedColor;

#if !defined(color_type_point_index)
	varying float vOpacity;
#endif

#if defined(weighted_splats)
	varying float vLinearDepth;
#endif

#if !defined(paraboloid_point_shape) && defined(use_edl)
	varying float vLogDepth;
#endif

#if defined(color_type_phong) && (MAX_POINT_LIGHTS > 0 || MAX_DIR_LIGHTS > 0) || defined(paraboloid_point_shape)
	varying vec3 vViewPosition;
#endif

#if defined(weighted_splats) || defined(paraboloid_point_shape)
	varying float vRadius;
#endif

#if defined(color_type_phong) && (MAX_POINT_LIGHTS > 0 || MAX_DIR_LIGHTS > 0)
	varying vec3 vNormal;
#endif

#ifdef highlight_point
	varying float vHighlight;
#endif

float specularStrength = 1.0;

#if defined mask_region_length
	struct Region {
		mat4 modelMatrix;
		vec3 min;
		vec3 max;
		float opacity;
	};
	uniform float opacityOutOfMasks;
	uniform Region maskRegions[mask_region_length];
	varying vec4 fragPosition;

	bool checkWithin(Region region)
	{
		// we need fragment position localized to the mask region
		vec4 localPos = region.modelMatrix * fragPosition;

		// Check if the fragment is inside the cube in its local space
		return all(greaterThanEqual(localPos.xyz, region.min)) && all(lessThanEqual(localPos.xyz, region.max));
	}
#endif

varying float vIsHighlighted;
uniform int highlightedType;
uniform int step2;
uniform float highlightedOuterOpacity;

vec4 addTint(vec4 originalColor, vec3 tintColor, float intensity) {
	return vec4(mix(originalColor.rgb, tintColor, intensity), originalColor.a);
}

void main() {
	#if defined mask_region_length
		bool isFragmentInAnyMaskRegions = false;
		float updatedOpacity = 0.0;

		// check whether this fragment is inside any mask regions.
		// if fragment is within a mask region,
		// set the fragment's opacity to the max opacity found among all overlapping mask regions the fragment is within.
		for (int i = 0; i < mask_region_length; i++) {
			if (checkWithin(maskRegions[i])) {
				isFragmentInAnyMaskRegions = true;
				updatedOpacity = max(updatedOpacity, maskRegions[i].opacity);
			}
		}

		// if this fragment is outside all mask regions, set the fragment's opacity to opacityOutOfMasks.
		if (!isFragmentInAnyMaskRegions) {
			updatedOpacity = opacityOutOfMasks;
		}

		// discard fragment if fragment's opacity <= 0.0
		if (updatedOpacity <= 0.0) {
			discard;
			return;
		}
	#endif

	vec3 color = vColor;
	float depth = gl_FragCoord.z;

	#if defined (clip_horizontally) || defined (clip_vertically)
	vec2 ndc = vec2((gl_FragCoord.x / screenWidth), 1.0 - (gl_FragCoord.y / screenHeight));

	if(highlightedType(clipExtent.x, ndc.x) * highlightedType(ndc.x, clipExtent.z) < 1.0)
	{
		discard;
	}

	if(highlightedType(clipExtent.y, ndc.y) * highlightedType(ndc.y, clipExtent.w) < 1.0)
	{
		discard;
	}
	#endif  

	#if defined(circle_point_shape) || defined(paraboloid_point_shape) || defined (weighted_splats)
		float u = 2.0 * gl_PointCoord.x - 1.0;
		float v = 2.0 * gl_PointCoord.y - 1.0;
	#endif

	#if defined(circle_point_shape) || defined (weighted_splats)
		float cc = u*u + v*v;
		if(cc > 1.0){
			discard;
		}
	#endif

	#if defined weighted_splats
		vec2 uv = gl_FragCoord.xy / vec2(screenWidth, screenHeight);
		float sDepth = texture2D(depthMap, uv).r;
		if(vLinearDepth > sDepth + vRadius + blendDepthSupplement){
			discard;
		}
	#endif

	#if defined color_type_point_index
		gl_FragColor = vec4(color, pcIndex / 255.0);
	#else
		gl_FragColor = vec4(color, vOpacity);
	#endif

	#ifdef use_point_cloud_mixing
		bool discardFragment = false;

		if (pointCloudMixingMode == 1) {  // Checkboard
			float vPointCloudID = pointCloudID > 10. ? pointCloudID/10.: pointCloudID;
			discardFragment = mod(gl_FragCoord.x, vPointCloudID) > 0.5 && mod(gl_FragCoord.y, vPointCloudID) > 0.5;
		}
		else if (pointCloudMixingMode == 2) {  // Stripes
			float angle = pointCloudMixAngle * pointCloudID / 180.;
			float u = cos(angle) * gl_FragCoord.x + sin(angle) * gl_FragCoord.y;
			float v = -sin(angle) * gl_FragCoord.x + cos(angle) * gl_FragCoord.y;

			discardFragment = mod(u, stripeDistanceX) >= stripeDistanceX/stripeDivisorX && mod(v, stripeDistanceY) >= stripeDistanceY/stripeDivisorY;
		}
		if (discardFragment) {
			discard;
		}
	#endif

	#ifdef use_texture_blending
		vec2 vUv = gl_FragCoord.xy / vec2(screenWidth, screenHeight);

		vec4 tColor = texture2D(backgroundMap, vUv);
		gl_FragColor = vec4(vOpacity * color, 1.) + vec4((1. - vOpacity) * tColor.rgb, 0.);
	#endif

	#if defined(color_type_phong)
		#if MAX_POINT_LIGHTS > 0 || MAX_DIR_LIGHTS > 0
			vec3 normal = normalize( vNormal );
			normal.z = abs(normal.z);

			vec3 viewPosition = normalize( vViewPosition );
		#endif

		// code taken from three.js phong light fragment shader

		#if MAX_POINT_LIGHTS > 0

			vec3 pointDiffuse = vec3( 0.0 );
			vec3 pointSpecular = vec3( 0.0 );

			for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

				vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );
				vec3 lVector = lPosition.xyz + vViewPosition.xyz;

				float lDistance = 1.0;
				if ( pointLightDistance[ i ] > 0.0 )
					lDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );

				lVector = normalize( lVector );

						// diffuse

				float dotProduct = dot( normal, lVector );

				#ifdef WRAP_AROUND

					float pointDiffuseWeightFull = max( dotProduct, 0.0 );
					float pointDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );

					vec3 pointDiffuseWeight = mix( vec3( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );

				#else

					float pointDiffuseWeight = max( dotProduct, 0.0 );

				#endif

				pointDiffuse += diffuse * pointLightColor[ i ] * pointDiffuseWeight * lDistance;

				// specular

				vec3 pointHalfVector = normalize( lVector + viewPosition );
				float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );
				float pointSpecularWeight = specularStrength * max( pow( pointDotNormalHalf, shininess ), 0.0 );

				float specularNormalization = ( shininess + 2.0 ) / 8.0;

				vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, pointHalfVector ), 0.0 ), 5.0 );
				pointSpecular += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * lDistance * specularNormalization;
				pointSpecular = vec3(0.0, 0.0, 0.0);
			}

		#endif

		#if MAX_DIR_LIGHTS > 0

			vec3 dirDiffuse = vec3( 0.0 );
			vec3 dirSpecular = vec3( 0.0 );

			for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

				vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );
				vec3 dirVector = normalize( lDirection.xyz );

						// diffuse

				float dotProduct = dot( normal, dirVector );

				#ifdef WRAP_AROUND

					float dirDiffuseWeightFull = max( dotProduct, 0.0 );
					float dirDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );

					vec3 dirDiffuseWeight = mix( vec3( dirDiffuseWeightFull ), vec3( dirDiffuseWeightHalf ), wrapRGB );

				#else

					float dirDiffuseWeight = max( dotProduct, 0.0 );

				#endif

				dirDiffuse += diffuse * directionalLightColor[ i ] * dirDiffuseWeight;

				// specular

				vec3 dirHalfVector = normalize( dirVector + viewPosition );
				float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );
				float dirSpecularWeight = specularStrength * max( pow( dirDotNormalHalf, shininess ), 0.0 );

				float specularNormalization = ( shininess + 2.0 ) / 8.0;

				vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( dirVector, dirHalfVector ), 0.0 ), 5.0 );
				dirSpecular += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;
			}

		#endif

		vec3 totalDiffuse = vec3( 0.0 );
		vec3 totalSpecular = vec3( 0.0 );

		#if MAX_POINT_LIGHTS > 0

			totalDiffuse += pointDiffuse;
			totalSpecular += pointSpecular;

		#endif

		#if MAX_DIR_LIGHTS > 0

			totalDiffuse += dirDiffuse;
			totalSpecular += dirSpecular;

		#endif

		gl_FragColor.xyz = gl_FragColor.xyz * ( emissive + totalDiffuse + ambientLightColor * ambient ) + totalSpecular;

	#endif

	#if defined weighted_splats
	    //float w = pow(1.0 - (u*u + v*v), blendHardness);

		float wx = 2.0 * length(2.0 * gl_PointCoord - 1.0);
		float w = exp(-wx * wx * 0.5);

		//float distance = length(2.0 * gl_PointCoord - 1.0);
		//float w = exp( -(distance * distance) / blendHardness);

		gl_FragColor.rgb = gl_FragColor.rgb * w;
		gl_FragColor.a = w;
	#endif

	#if defined paraboloid_point_shape
		float wi = 0.0 - ( u*u + v*v);
		vec4 pos = vec4(vViewPosition, 1.0);
		pos.z += wi * vRadius;
		float linearDepth = -pos.z;
		pos = projectionMatrix * pos;
		pos = pos / pos.w;
		float expDepth = pos.z;
		depth = (pos.z + 1.0) / 2.0;
		gl_FragDepthEXT = depth;

		#if defined(color_type_depth)
			gl_FragColor.r = linearDepth;
			gl_FragColor.g = expDepth;
		#endif

		#if defined(use_edl)
			gl_FragColor.a = log2(linearDepth);
		#endif

	#else
		#if defined(use_edl)
			gl_FragColor.a = vLogDepth;
		#endif
	#endif

	#ifdef highlight_point
		if (vHighlight > 0.0) {
			gl_FragColor = highlightedPointColor;
		}
	#endif

	// gl_FragColor = vec4(overridedColor, 0.2);

	#ifdef override_opacity
		gl_FragColor.a = updatedOpacity;
	#endif

	if (highlightedType == 2 || highlightedType == 3) {
		if (vIsHighlighted == 1.0) {
			gl_FragColor = addTint(gl_FragColor, vec3(0.75, 1.0, 0.0), 0.7);
		} else {
			gl_FragColor = vec4(gl_FragColor.rgb, highlightedOuterOpacity);
		}
	}
}
`;

var vertShader = `precision highp float;
precision highp int;

#define max_clip_boxes 30

attribute vec3 position;
attribute vec3 color;

#ifdef color_rgba
	attribute vec4 rgba;
#endif

attribute vec3 normal;
attribute float intensity;
attribute float classification;
attribute float returnNumber;
attribute float numberOfReturns;
attribute float pointSourceID;
attribute vec4 indices;
attribute vec2 uv;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;

uniform float pcIndex;

uniform float screenWidth;
uniform float screenHeight;
uniform float fov;
uniform float spacing;

#if defined use_clip_box
	uniform mat4 clipBoxes[max_clip_boxes];
#endif

uniform float heightMin;
uniform float heightMax;
uniform float size; // pixel size factor
uniform float minSize; // minimum pixel size
uniform float maxSize; // maximum pixel size
uniform float octreeSize;
uniform vec3 bbSize;
uniform vec3 uColor;
uniform float opacity;
uniform float clipBoxCount;
uniform float level;
uniform float vnStart;
uniform bool isLeafNode;

uniform float filterByNormalThreshold;
uniform vec2 intensityRange;
uniform float opacityAttenuation;
uniform float intensityGamma;
uniform float intensityContrast;
uniform float intensityBrightness;
uniform float rgbGamma;
uniform float rgbContrast;
uniform float rgbBrightness;
uniform float transition;
uniform float wRGB;
uniform float wIntensity;
uniform float wElevation;
uniform float wClassification;
uniform float wReturnNumber;
uniform float wSourceID;

uniform sampler2D visibleNodes;
uniform sampler2D gradient;
uniform sampler2D classificationLUT;
uniform sampler2D depthMap;

#ifdef use_texture_blending
	uniform sampler2D backgroundMap;
#endif

#ifdef use_point_cloud_mixing
	uniform int pointCloudMixingMode;
	uniform float pointCloudID;

	uniform float pointCloudMixAngle;
	uniform float stripeDistanceX;
	uniform float stripeDistanceY;

	uniform float stripeDivisorX;
	uniform float stripeDivisorY;
#endif

#ifdef highlight_point
	uniform vec3 highlightedPointCoordinate;
	uniform bool enablePointHighlighting;
	uniform float highlightedPointScale;
#endif

#ifdef use_filter_by_normal
	uniform int normalFilteringMode;
#endif

varying vec3 vColor;
varying vec3 overridedColor;

#if !defined(color_type_point_index)
	varying float vOpacity;
#endif

#if defined(weighted_splats)
	varying float vLinearDepth;
#endif

#if !defined(paraboloid_point_shape) && defined(use_edl)
	varying float vLogDepth;
#endif

#if defined(color_type_phong) && (MAX_POINT_LIGHTS > 0 || MAX_DIR_LIGHTS > 0) || defined(paraboloid_point_shape)
	varying vec3 vViewPosition;
#endif

#if defined(weighted_splats) || defined(paraboloid_point_shape)
	varying float vRadius;
#endif

#if defined(color_type_phong) && (MAX_POINT_LIGHTS > 0 || MAX_DIR_LIGHTS > 0)
	varying vec3 vNormal;
#endif

#ifdef highlight_point
	varying float vHighlight;
#endif

// ---------------------
// OCTREE
// ---------------------

#if (defined(adaptive_point_size) || defined(color_type_lod)) && defined(tree_type_octree)

/**
 * Rounds the specified number to the closest integer.
 */
float round(float number){
	return floor(number + 0.5);
}

/**
 * Gets the number of 1-bits up to inclusive index position.
 *
 * number is treated as if it were an integer in the range 0-255
 */
int numberOfOnes(int number, int index) {
	int numOnes = 0;
	int tmp = 128;
	for (int i = 7; i >= 0; i--) {

		if (number >= tmp) {
			number = number - tmp;

			if (i <= index) {
				numOnes++;
			}
		}

		tmp = tmp / 2;
	}

	return numOnes;
}

/**
 * Checks whether the bit at index is 1.0
 *
 * number is treated as if it were an integer in the range 0-255
 */
bool isBitSet(int number, int index){

	// weird multi else if due to lack of proper array, int and bitwise support in WebGL 1.0
	int powi = 1;
	if (index == 0) {
		powi = 1;
	} else if (index == 1) {
		powi = 2;
	} else if (index == 2) {
		powi = 4;
	} else if (index == 3) {
		powi = 8;
	} else if (index == 4) {
		powi = 16;
	} else if (index == 5) {
		powi = 32;
	} else if (index == 6) {
		powi = 64;
	} else if (index == 7) {
		powi = 128;
	}

	int ndp = number / powi;

	return mod(float(ndp), 2.0) != 0.0;
}

/**
 * Gets the the LOD at the point position.
 */
float getLOD() {
	vec3 offset = vec3(0.0, 0.0, 0.0);
	int iOffset = int(vnStart);
	float depth = level;

	for (float i = 0.0; i <= 30.0; i++) {
		float nodeSizeAtLevel = octreeSize  / pow(2.0, i + level + 0.0);

		vec3 index3d = (position-offset) / nodeSizeAtLevel;
		index3d = floor(index3d + 0.5);
		int index = int(round(4.0 * index3d.x + 2.0 * index3d.y + index3d.z));

		vec4 value = texture2D(visibleNodes, vec2(float(iOffset) / 2048.0, 0.0));
		int mask = int(round(value.r * 255.0));

		if (isBitSet(mask, index)) {
			// there are more visible child nodes at this position
			int advanceG = int(round(value.g * 255.0)) * 256;
			int advanceB = int(round(value.b * 255.0));
			int advanceChild = numberOfOnes(mask, index - 1);
			int advance = advanceG + advanceB + advanceChild;

			iOffset = iOffset + advance;

			depth++;
		} else {
			return value.a * 255.0; // no more visible child nodes at this position
		}

		offset = offset + (vec3(1.0, 1.0, 1.0) * nodeSizeAtLevel * 0.5) * index3d;
	}

	return depth;
}

float getPointSizeAttenuation() {
	return 0.5 * pow(2.0, getLOD());
}

#endif

// ---------------------
// KD-TREE
// ---------------------

#if (defined(adaptive_point_size) || defined(color_type_lod)) && defined(tree_type_kdtree)

float getLOD() {
	vec3 offset = vec3(0.0, 0.0, 0.0);
	float intOffset = 0.0;
	float depth = 0.0;

	vec3 size = bbSize;
	vec3 pos = position;

	for (float i = 0.0; i <= 1000.0; i++) {

		vec4 value = texture2D(visibleNodes, vec2(intOffset / 2048.0, 0.0));

		int children = int(value.r * 255.0);
		float next = value.g * 255.0;
		int split = int(value.b * 255.0);

		if (next == 0.0) {
		 	return depth;
		}

		vec3 splitv = vec3(0.0, 0.0, 0.0);
		if (split == 1) {
			splitv.x = 1.0;
		} else if (split == 2) {
		 	splitv.y = 1.0;
		} else if (split == 4) {
		 	splitv.z = 1.0;
		}

		intOffset = intOffset + next;

		float factor = length(pos * splitv / size);
		if (factor < 0.5) {
		 	// left
			if (children == 0 || children == 2) {
				return depth;
			}
		} else {
			// right
			pos = pos - size * splitv * 0.5;
			if (children == 0 || children == 1) {
				return depth;
			}
			if (children == 3) {
				intOffset = intOffset + 1.0;
			}
		}
		size = size * ((1.0 - (splitv + 1.0) / 2.0) + 0.5);

		depth++;
	}


	return depth;
}

float getPointSizeAttenuation() {
	return 0.5 * pow(1.3, getLOD());
}

#endif

// formula adapted from: http://www.dfstudios.co.uk/articles/programming/image-programming-algorithms/image-processing-algorithms-part-5-contrast-adjustment/
float getContrastFactor(float contrast) {
	return (1.0158730158730156 * (contrast + 1.0)) / (1.0158730158730156 - contrast);
}

vec3 getRGB() {
	
	#ifdef color_rgba
		vec3 rgb = rgba.rgb;
	#else	
		vec3 rgb = color;
	#endif		

	#if defined(use_rgb_gamma_contrast_brightness)
		rgb = pow(rgb, vec3(rgbGamma));
		rgb = rgb + rgbBrightness;
		rgb = (rgb - 0.5) * getContrastFactor(rgbContrast) + 0.5;
		rgb = clamp(rgb, 0.0, 1.0);
		return rgb;
	#else
		return rgb;
	#endif
}

float getIntensity() {
	float w = (intensity - intensityRange.x) / (intensityRange.y - intensityRange.x);
	w = pow(w, intensityGamma);
	w = w + intensityBrightness;
	w = (w - 0.5) * getContrastFactor(intensityContrast) + 0.5;
	w = clamp(w, 0.0, 1.0);

	return w;
}

vec3 getElevation() {
	vec4 world = modelMatrix * vec4( position, 1.0 );
	float w = (world.z - heightMin) / (heightMax-heightMin);
	vec3 cElevation = texture2D(gradient, vec2(w,1.0-w)).rgb;

	return cElevation;
}

vec4 getClassification() {
	vec2 uv = vec2(classification / 255.0, 0.5);
	vec4 classColor = texture2D(classificationLUT, uv);

	return classColor;
}

vec3 getReturnNumber() {
	if (numberOfReturns == 1.0) {
		return vec3(1.0, 1.0, 0.0);
	} else {
		if (returnNumber == 1.0) {
			return vec3(1.0, 0.0, 0.0);
		} else if (returnNumber == numberOfReturns) {
			return vec3(0.0, 0.0, 1.0);
		} else {
			return vec3(0.0, 1.0, 0.0);
		}
	}
}

vec3 getSourceID() {
	float w = mod(pointSourceID, 10.0) / 10.0;
	return texture2D(gradient, vec2(w, 1.0 - w)).rgb;
}

vec3 getCompositeColor() {
	vec3 c;
	float w;

	c += wRGB * getRGB();
	w += wRGB;

	c += wIntensity * getIntensity() * vec3(1.0, 1.0, 1.0);
	w += wIntensity;

	c += wElevation * getElevation();
	w += wElevation;

	c += wReturnNumber * getReturnNumber();
	w += wReturnNumber;

	c += wSourceID * getSourceID();
	w += wSourceID;

	vec4 cl = wClassification * getClassification();
	c += cl.a * cl.rgb;
	w += wClassification * cl.a;

	c = c / w;

	if (w == 0.0) {
		gl_Position = vec4(100.0, 100.0, 100.0, 0.0);
	}

	return c;
}

/**
 * Converts a float-based hex color to an RGB vec3.
 * The hex color should be in the format RRGGBB (e.g., 16711680 for 0xFF0000).
 * @param hex A float representing the hex color (e.g., 16711680 for red).
 * @return The RGB color as a vec3 (values in [0,1]).
 */
vec3 hexToRGB(float hex) {
    float r = floor(hex / 65536.0);
    float g = floor(mod(hex, 65536.0) / 256.0);
    float b = mod(hex, 256.0);
    return vec3(r, g, b) / 255.0;
}

/**
 * Linearly interpolates between two hex colors based on a value in the range [0, 1].
 * @param color1 The first hex color (e.g., 0xFF0000 for red).
 * @param color2 The second hex color (e.g., 0x0000FF for blue).
 * @param t A float in the range [0,1] indicating the interpolation factor.
 * @return The interpolated RGB color as a vec3.
 */
vec3 getColorStop(float color1, float color2, float t) {
    vec3 c1 = hexToRGB(color1);
    vec3 c2 = hexToRGB(color2);
    return mix(c1, c2, clamp(t, 0.0, 1.0));
}
varying vec4 fragPosition;

varying float vIsHighlighted;

uniform vec3 highlightedPoint0;
uniform vec3 highlightedPoint1;
uniform vec3 highlightedPoint2;
uniform float highlightedMinDistance;
uniform float highlightedMaxDistance;
uniform float highlightedDistanceProximityThreshold;
uniform int highlightedType;

/**
	* Computes the perpendicular intersection of a point onto a line defined by two points.
	* @param p1 - First point of the line.
	* @param p2 - Second point of the line.
	* @param p3 - Point to project onto the line.
	* @returns The intersection point.
	*/
vec3 getPerpendicularIntersection(vec3 p1, vec3 p2, vec3 p3) {
	vec3 lineDir = normalize(p2 - p1); // Line direction unit vector
	vec3 p1ToP3 = p3 - p1; // Vector from P1 to P3

	float projectionLength = dot(p1ToP3, lineDir); // Projection scalar
	vec3 intersection = p1 + lineDir * projectionLength; // Compute intersection

	return intersection;
}

void main() {
	fragPosition = modelMatrix * vec4(position, 1.0);
	vec3 vAnchor0Position = highlightedPoint0;
	float vMinDistance = highlightedMinDistance;
	float vMaxDistance = highlightedMaxDistance;

	vIsHighlighted = 0.0;

	if (highlightedType == 2) {
		float distance = distance(fragPosition.xyz, highlightedPoint0);
		
		// anything within min/max distance will be highlighted
		if (distance > vMinDistance && distance < vMaxDistance) {
			vIsHighlighted = 1.0;
		}
	} else if (highlightedType == 3) {
		vec3 currPerpPosition = getPerpendicularIntersection(highlightedPoint0, highlightedPoint1, fragPosition.xyz);
		float perpDistance = distance(highlightedPoint2, currPerpPosition);  // Distance between calculated perpendicular and target perpendicular
		float currDistance = distance(currPerpPosition, fragPosition.xyz);   // Distance between current position and calculated perpendicular

		if (currDistance >= highlightedMinDistance  && currDistance <= highlightedMaxDistance  && perpDistance <= highlightedDistanceProximityThreshold) {
			vIsHighlighted = 1.0;
		}
	}
	vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

	gl_Position = projectionMatrix * mvPosition;

	#if defined(color_type_phong) && (MAX_POINT_LIGHTS > 0 || MAX_DIR_LIGHTS > 0) || defined(paraboloid_point_shape)
		vViewPosition = mvPosition.xyz;
	#endif

	#if defined weighted_splats
		vLinearDepth = gl_Position.w;
	#endif

	#if defined(color_type_phong) && (MAX_POINT_LIGHTS > 0 || MAX_DIR_LIGHTS > 0)
		vNormal = normalize(normalMatrix * normal);
	#endif

	#if !defined(paraboloid_point_shape) && defined(use_edl)
		vLogDepth = log2(-mvPosition.z);
	#endif

	// ---------------------
	// POINT SIZE
	// ---------------------

	float pointSize = 1.0;
	float slope = tan(fov / 2.0);
	float projFactor =  -0.5 * screenHeight / (slope * mvPosition.z);

	#if defined fixed_point_size
		pointSize = size;
	#elif defined attenuated_point_size
		pointSize = size * spacing * projFactor;
	#elif defined adaptive_point_size
		float worldSpaceSize = 2.0 * size * spacing / getPointSizeAttenuation();
		pointSize = worldSpaceSize * projFactor;
	#endif

	pointSize = max(minSize, pointSize);
	pointSize = min(maxSize, pointSize);

	#if defined(weighted_splats) || defined(paraboloid_point_shape)
		vRadius = pointSize / projFactor;
	#endif

	gl_PointSize = pointSize;
	// overridedColor = getColorStop(65280.0, 16711680.0, pointSize/maxSize);
	overridedColor = getColorStop(65280.0, 16711680.0, getLOD());

	// ---------------------
	// HIGHLIGHTING
	// ---------------------

	#ifdef highlight_point
		vec4 mPosition = modelMatrix * vec4(position, 1.0);
		if (enablePointHighlighting && abs(mPosition.x - highlightedPointCoordinate.x) < 0.0001 &&
			abs(mPosition.y - highlightedPointCoordinate.y) < 0.0001 &&
			abs(mPosition.z - highlightedPointCoordinate.z) < 0.0001) {
			vHighlight = 1.0;
			gl_PointSize = pointSize * highlightedPointScale;
		} else {
			vHighlight = 0.0;
		}
	#endif

	// ---------------------
	// OPACITY
	// ---------------------

	#ifndef color_type_point_index
		#ifdef attenuated_opacity
			vOpacity = opacity * exp(-length(-mvPosition.xyz) / opacityAttenuation);
		#else
			vOpacity = opacity;
		#endif
	#endif

	// ---------------------
	// FILTERING
	// ---------------------

	#ifdef use_filter_by_normal
		bool discardPoint = false;
		// Absolute normal filtering
		if (normalFilteringMode == 1) {
			discardPoint = (abs((modelViewMatrix * vec4(normal, 0.0)).z) > filterByNormalThreshold);
		}
		// less than equal to
		else if (normalFilteringMode == 2) {
			discardPoint = (modelViewMatrix * vec4(normal, 0.0)).z <= filterByNormalThreshold;
			}
		// greater than
		else if(normalFilteringMode == 3) {
			discardPoint = (modelViewMatrix * vec4(normal, 0.0)).z > filterByNormalThreshold;
			}

		if (discardPoint)
		{
			gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
		}
	#endif

	// ---------------------
	// POINT COLOR
	// ---------------------

	#ifdef color_type_rgb
		vColor = getRGB();
	#elif defined color_type_height
		vColor = getElevation();
	#elif defined color_type_rgb_height
		vec3 cHeight = getElevation();
		vColor = (1.0 - transition) * getRGB() + transition * cHeight;
	#elif defined color_type_depth
		float linearDepth = -mvPosition.z ;
		float expDepth = (gl_Position.z / gl_Position.w) * 0.5 + 0.5;
		vColor = vec3(linearDepth, expDepth, 0.0);
	#elif defined color_type_intensity
		float w = getIntensity();
		vColor = vec3(w, w, w);
	#elif defined color_type_intensity_gradient
		float w = getIntensity();
		vColor = texture2D(gradient, vec2(w, 1.0 - w)).rgb;
	#elif defined color_type_color
		vColor = uColor;
	#elif defined color_type_lod
	float w = getLOD() / 10.0;
	vColor = texture2D(gradient, vec2(w, 1.0 - w)).rgb;
	#elif defined color_type_point_index
		vColor = indices.rgb;
	#elif defined color_type_classification
	  vec4 cl = getClassification();
		vColor = cl.rgb;
	#elif defined color_type_return_number
		vColor = getReturnNumber();
	#elif defined color_type_source
		vColor = getSourceID();
	#elif defined color_type_normal
		vColor = (modelMatrix * vec4(normal, 0.0)).xyz;
	#elif defined color_type_phong
		vColor = color;
	#elif defined color_type_composite
		vColor = getCompositeColor();
	#endif

	#if !defined color_type_composite && defined color_type_classification
		if (cl.a == 0.0) {
			gl_Position = vec4(100.0, 100.0, 100.0, 0.0);
			return;
		}
	#endif

	// ---------------------
	// CLIPPING
	// ---------------------

	#if defined use_clip_box
		bool insideAny = false;
		for (int i = 0; i < max_clip_boxes; i++) {
			if (i == int(clipBoxCount)) {
				break;
			}

			vec4 clipPosition = clipBoxes[i] * modelMatrix * vec4(position, 1.0);
			bool inside = -0.5 <= clipPosition.x && clipPosition.x <= 0.5;
			inside = inside && -0.5 <= clipPosition.y && clipPosition.y <= 0.5;
			inside = inside && -0.5 <= clipPosition.z && clipPosition.z <= 0.5;
			insideAny = insideAny || inside;
		}

		if (!insideAny) {
			#if defined clip_outside
				gl_Position = vec4(1000.0, 1000.0, 1000.0, 1.0);
			#elif defined clip_highlight_inside && !defined(color_type_depth)
				float c = (vColor.r + vColor.g + vColor.b) / 6.0;
			#endif
		} else {
			#if defined clip_highlight_inside
				vColor.r += 0.5;
			#endif
		}
	#endif
}
`;

const TREE_TYPE_DEFS = {
    [TreeType.OCTREE]: 'tree_type_octree',
    [TreeType.KDTREE]: 'tree_type_kdtree',
};
const SIZE_TYPE_DEFS = {
    [PointSizeType.FIXED]: 'fixed_point_size',
    [PointSizeType.ATTENUATED]: 'attenuated_point_size',
    [PointSizeType.ADAPTIVE]: 'adaptive_point_size',
};
const OPACITY_DEFS = {
    [PointOpacityType.ATTENUATED]: 'attenuated_opacity',
    [PointOpacityType.FIXED]: 'fixed_opacity',
};
const SHAPE_DEFS = {
    [PointShape.SQUARE]: 'square_point_shape',
    [PointShape.CIRCLE]: 'circle_point_shape',
    [PointShape.PARABOLOID]: 'paraboloid_point_shape',
};
const COLOR_DEFS = {
    [PointColorType.RGB]: 'color_type_rgb',
    [PointColorType.COLOR]: 'color_type_color',
    [PointColorType.DEPTH]: 'color_type_depth',
    [PointColorType.HEIGHT]: 'color_type_height',
    [PointColorType.INTENSITY]: 'color_type_intensity',
    [PointColorType.INTENSITY_GRADIENT]: 'color_type_intensity_gradient',
    [PointColorType.LOD]: 'color_type_lod',
    [PointColorType.POINT_INDEX]: 'color_type_point_index',
    [PointColorType.CLASSIFICATION]: 'color_type_classification',
    [PointColorType.RETURN_NUMBER]: 'color_type_return_number',
    [PointColorType.SOURCE]: 'color_type_source',
    [PointColorType.NORMAL]: 'color_type_normal',
    [PointColorType.PHONG]: 'color_type_phong',
    [PointColorType.RGB_HEIGHT]: 'color_type_rgb_height',
    [PointColorType.COMPOSITE]: 'color_type_composite',
};
const CLIP_MODE_DEFS = {
    [ClipMode.DISABLED]: 'clip_disabled',
    [ClipMode.CLIP_OUTSIDE]: 'clip_outside',
    [ClipMode.HIGHLIGHT_INSIDE]: 'clip_highlight_inside',
    [ClipMode.CLIP_HORIZONTALLY]: 'clip_horizontally',
    [ClipMode.CLIP_VERTICALLY]: 'clip_vertically',
};
class PointCloudMaterial extends RawShaderMaterial {
    constructor(parameters = {}) {
        super();
        /**
         * Use the drawing buffer size instead of the dom client width and height when passing the screen height and screen width uniforms to the
         * shader. This is useful if you have offscreen canvases (which in some browsers return 0 as client width and client height).
         */
        this.useDrawingBufferSize = false;
        this.lights = false;
        this.fog = false;
        this.colorRgba = false;
        this.numClipBoxes = 0;
        this.clipBoxes = [];
        this.visibleNodeTextureOffsets = new Map();
        this._gradient = SPECTRAL;
        this.gradientTexture = generateGradientTexture(this._gradient);
        this._classification = DEFAULT_CLASSIFICATION;
        this.classificationTexture = generateClassificationTexture(this._classification);
        this.maskRegionLength = 0;
        this.uniforms = {
            bbSize: makeUniform('fv', [0, 0, 0]),
            blendDepthSupplement: makeUniform('f', 0.0),
            blendHardness: makeUniform('f', 2.0),
            classificationLUT: makeUniform('t', this.classificationTexture || new Texture()),
            clipBoxCount: makeUniform('f', 0),
            clipBoxes: makeUniform('Matrix4fv', []),
            clipExtent: makeUniform('fv', [0.0, 0.0, 1.0, 1.0]),
            depthMap: makeUniform('t', null),
            diffuse: makeUniform('fv', [1, 1, 1]),
            opacityOutOfMasks: makeUniform('f', 1.0),
            fov: makeUniform('f', 1.0),
            gradient: makeUniform('t', this.gradientTexture || new Texture()),
            heightMax: makeUniform('f', 1.0),
            heightMin: makeUniform('f', 0.0),
            intensityBrightness: makeUniform('f', 0),
            intensityContrast: makeUniform('f', 0),
            intensityGamma: makeUniform('f', 1),
            intensityRange: makeUniform('fv', [0, 65000]),
            isLeafNode: makeUniform('b', 0),
            level: makeUniform('f', 0.0),
            maxSize: makeUniform('f', DEFAULT_MAX_POINT_SIZE),
            minSize: makeUniform('f', DEFAULT_MIN_POINT_SIZE),
            octreeSize: makeUniform('f', 0),
            opacity: makeUniform('f', 1.0),
            pcIndex: makeUniform('f', 0),
            rgbBrightness: makeUniform('f', DEFAULT_RGB_BRIGHTNESS),
            rgbContrast: makeUniform('f', DEFAULT_RGB_CONTRAST),
            rgbGamma: makeUniform('f', DEFAULT_RGB_GAMMA),
            screenHeight: makeUniform('f', 1.0),
            screenWidth: makeUniform('f', 1.0),
            size: makeUniform('f', 1),
            spacing: makeUniform('f', 1.0),
            toModel: makeUniform('Matrix4f', []),
            transition: makeUniform('f', 0.5),
            uColor: makeUniform('c', new Color(0xffffff)),
            // @ts-ignore
            visibleNodes: makeUniform('t', this.visibleNodesTexture || new Texture()),
            vnStart: makeUniform('f', 0.0),
            wClassification: makeUniform('f', 0),
            wElevation: makeUniform('f', 0),
            wIntensity: makeUniform('f', 0),
            wReturnNumber: makeUniform('f', 0),
            wRGB: makeUniform('f', 1),
            wSourceID: makeUniform('f', 0),
            opacityAttenuation: makeUniform('f', 1),
            filterByNormalThreshold: makeUniform('f', 0),
            backgroundMap: makeUniform('t', null),
            normalFilteringMode: makeUniform('i', NormalFilteringMode.ABSOLUTE_NORMAL_FILTERING_MODE),
            pointCloudID: makeUniform('f', 2),
            pointCloudMixingMode: makeUniform('i', PointCloudMixingMode.CHECKBOARD),
            stripeDistanceX: makeUniform('f', 5),
            stripeDistanceY: makeUniform('f', 5),
            stripeDivisorX: makeUniform('f', 2),
            stripeDivisorY: makeUniform('f', 2),
            pointCloudMixAngle: makeUniform('f', 31),
            maskRegions: makeUniform('a', []),
            highlightedType: makeUniform('i', 0),
            highlightedPoint0: makeUniform('fv', new Vector3()),
            highlightedPoint1: makeUniform('fv', new Vector3()),
            highlightedPoint2: makeUniform('fv', new Vector3()),
            highlightedMinDistance: makeUniform('f', 0),
            highlightedMaxDistance: makeUniform('f', 0),
            highlightedDistanceProximityThreshold: makeUniform('f', 0.005),
            highlightedOuterOpacity: makeUniform('f', 1),
            enablePointHighlighting: makeUniform('b', true),
            highlightedPointCoordinate: makeUniform('fv', new Vector3()),
            highlightedPointColor: makeUniform('fv', DEFAULT_HIGHLIGHT_COLOR.clone()),
            highlightedPointScale: makeUniform('f', 2.0),
        };
        this.useClipBox = false;
        this.weighted = false;
        this.pointColorType = PointColorType.RGB;
        this.pointSizeType = PointSizeType.ADAPTIVE;
        this.clipMode = ClipMode.DISABLED;
        this.useEDL = false;
        this.shape = PointShape.SQUARE;
        this.treeType = TreeType.OCTREE;
        this.pointOpacityType = PointOpacityType.FIXED;
        this.useFilterByNormal = false;
        this.useTextureBlending = false;
        this.usePointCloudMixing = false;
        this.highlightPoint = false;
        this.attributes = {
            position: { type: 'fv', value: [] },
            color: { type: 'fv', value: [] },
            normal: { type: 'fv', value: [] },
            intensity: { type: 'f', value: [] },
            classification: { type: 'f', value: [] },
            returnNumber: { type: 'f', value: [] },
            numberOfReturns: { type: 'f', value: [] },
            pointSourceID: { type: 'f', value: [] },
            indices: { type: 'fv', value: [] },
        };
        const tex = (this.visibleNodesTexture = generateDataTexture(2048, 1, new Color(0xffffff)));
        tex.minFilter = NearestFilter;
        tex.magFilter = NearestFilter;
        this.setUniform('visibleNodes', tex);
        this.treeType = getValid(parameters.treeType, TreeType.OCTREE);
        this.size = getValid(parameters.size, 1.0);
        this.minSize = getValid(parameters.minSize, 2.0);
        this.maxSize = getValid(parameters.maxSize, 50.0);
        this.colorRgba = Boolean(parameters.colorRgba);
        this.classification = DEFAULT_CLASSIFICATION;
        this.defaultAttributeValues.normal = [0, 0, 0];
        this.defaultAttributeValues.classification = [0, 0, 0];
        this.defaultAttributeValues.indices = [0, 0, 0, 0];
        this.vertexColors = true;
        this.updateShaderSource();
    }
    dispose() {
        super.dispose();
        if (this.gradientTexture) {
            this.gradientTexture.dispose();
            this.gradientTexture = undefined;
        }
        if (this.visibleNodesTexture) {
            this.visibleNodesTexture.dispose();
            this.visibleNodesTexture = undefined;
        }
        this.clearVisibleNodeTextureOffsets();
        if (this.classificationTexture) {
            this.classificationTexture.dispose();
            this.classificationTexture = undefined;
        }
        if (this.depthMap) {
            this.depthMap.dispose();
            this.depthMap = undefined;
        }
        if (this.backgroundMap) {
            this.backgroundMap.dispose();
            this.backgroundMap = undefined;
        }
    }
    clearVisibleNodeTextureOffsets() {
        this.visibleNodeTextureOffsets.clear();
    }
    enableTransparency() {
        this.blending = AdditiveBlending;
        this.transparent = true;
        this.depthTest = false;
        this.depthWrite = true;
    }
    disableTransparency() {
        this.blending = NoBlending;
        this.transparent = false;
        this.depthTest = true;
        this.depthWrite = true;
        this.depthFunc = LessEqualDepth;
    }
    updateShaders() {
        this.vertexShader = this.applyDefines(vertShader);
        this.fragmentShader = this.applyDefines(fragShader);
    }
    updateShaderSource() {
        this.updateShaders();
        if (this.opacity === 1.0) {
            this.disableTransparency();
        }
        else if (this.opacity < 1.0 && !this.useEDL) {
            this.enableTransparency();
        }
        if (this.weighted) {
            this.blending = AdditiveBlending;
            this.transparent = true;
            this.depthTest = true;
            this.depthWrite = false;
            this.depthFunc = LessEqualDepth;
        }
        this.needsUpdate = true;
    }
    applyDefines(shaderSrc) {
        const parts = [];
        function define(value) {
            if (value) {
                parts.push(`#define ${value}`);
            }
        }
        define(TREE_TYPE_DEFS[this.treeType]);
        define(SIZE_TYPE_DEFS[this.pointSizeType]);
        define(SHAPE_DEFS[this.shape]);
        define(COLOR_DEFS[this.pointColorType]);
        define(CLIP_MODE_DEFS[this.clipMode]);
        define(OPACITY_DEFS[this.pointOpacityType]);
        // We only perform gamma and brightness/contrast calculations per point if values are specified.
        if (this.rgbGamma !== DEFAULT_RGB_GAMMA ||
            this.rgbBrightness !== DEFAULT_RGB_BRIGHTNESS ||
            this.rgbContrast !== DEFAULT_RGB_CONTRAST) {
            define('use_rgb_gamma_contrast_brightness');
        }
        if (this.useFilterByNormal) {
            define('use_filter_by_normal');
        }
        if (this.useEDL) {
            define('use_edl');
        }
        if (this.weighted) {
            define('weighted_splats');
        }
        if (this.numClipBoxes > 0) {
            define('use_clip_box');
        }
        if (this.highlightPoint) {
            define('highlight_point');
        }
        if (this.useTextureBlending) {
            define('use_texture_blending');
        }
        if (this.usePointCloudMixing) {
            define('use_point_cloud_mixing');
        }
        if (this.colorRgba) {
            define('color_rgba');
        }
        if (this.maskRegionLength > 0) {
            define(`mask_region_length ${this.maskRegionLength}`);
            define('override_opacity true');
        }
        define('MAX_POINT_LIGHTS 0');
        define('MAX_DIR_LIGHTS 0');
        parts.push(shaderSrc);
        return parts.join('\n');
    }
    setPointCloudMixingMode(mode) {
        this.pointCloudMixingMode = mode;
    }
    getPointCloudMixingMode() {
        if (this.pointCloudMixingMode === PointCloudMixingMode.STRIPES) {
            return PointCloudMixingMode.STRIPES;
        }
        return PointCloudMixingMode.CHECKBOARD;
    }
    setClipBoxes(clipBoxes) {
        if (!clipBoxes) {
            return;
        }
        this.clipBoxes = clipBoxes;
        const doUpdate = this.numClipBoxes !== clipBoxes.length && (clipBoxes.length === 0 || this.numClipBoxes === 0);
        this.numClipBoxes = clipBoxes.length;
        this.setUniform('clipBoxCount', this.numClipBoxes);
        if (doUpdate) {
            this.updateShaderSource();
        }
        const clipBoxesLength = this.numClipBoxes * 16;
        const clipBoxesArray = new Float32Array(clipBoxesLength);
        for (let i = 0; i < this.numClipBoxes; i++) {
            clipBoxesArray.set(clipBoxes[i].inverse.elements, 16 * i);
        }
        for (let i = 0; i < clipBoxesLength; i++) {
            if (isNaN(clipBoxesArray[i])) {
                clipBoxesArray[i] = Infinity;
            }
        }
        this.setUniform('clipBoxes', clipBoxesArray);
    }
    get gradient() {
        return this._gradient;
    }
    set gradient(value) {
        if (this._gradient !== value) {
            this._gradient = value;
            this.gradientTexture = generateGradientTexture(this._gradient);
            this.setUniform('gradient', this.gradientTexture);
        }
    }
    get classification() {
        return this._classification;
    }
    set classification(value) {
        const copy = {};
        for (const key of Object.keys(value)) {
            copy[key] = value[key].clone();
        }
        let isEqual = false;
        if (this._classification === undefined) {
            isEqual = false;
        }
        else {
            isEqual = Object.keys(copy).length === Object.keys(this._classification).length;
            for (const key of Object.keys(copy)) {
                isEqual = isEqual && this._classification[key] !== undefined;
                isEqual = isEqual && copy[key].equals(this._classification[key]);
            }
        }
        if (!isEqual) {
            this._classification = copy;
            this.recomputeClassification();
        }
    }
    recomputeClassification() {
        this.classificationTexture = generateClassificationTexture(this._classification);
        this.setUniform('classificationLUT', this.classificationTexture);
    }
    get elevationRange() {
        return [this.heightMin, this.heightMax];
    }
    set elevationRange(value) {
        this.heightMin = value[0];
        this.heightMax = value[1];
    }
    getUniform(name) {
        return this.uniforms === undefined ? undefined : this.uniforms[name].value;
    }
    setUniform(name, value) {
        if (this.uniforms === undefined) {
            return;
        }
        const uObj = this.uniforms[name];
        if (uObj.type === 'c') {
            uObj.value.copy(value);
        }
        else if (value !== uObj.value) {
            uObj.value = value;
        }
    }
    updateMaterial(octree, visibleNodes, camera, renderer) {
        const pixelRatio = renderer.getPixelRatio();
        if (camera.type === PERSPECTIVE_CAMERA) {
            this.fov = camera.fov * (Math.PI / 180);
        }
        else {
            this.fov = Math.PI / 2; // will result in slope = 1 in the shader
        }
        const renderTarget = renderer.getRenderTarget();
        if (renderTarget !== null) {
            this.screenWidth = renderTarget.width;
            this.screenHeight = renderTarget.height;
        }
        else {
            this.screenWidth = renderer.domElement.clientWidth * pixelRatio;
            this.screenHeight = renderer.domElement.clientHeight * pixelRatio;
        }
        if (this.useDrawingBufferSize) {
            renderer.getDrawingBufferSize(PointCloudMaterial.helperVec2);
            this.screenWidth = PointCloudMaterial.helperVec2.width;
            this.screenHeight = PointCloudMaterial.helperVec2.height;
        }
        const maxScale = Math.max(octree.scale.x, octree.scale.y, octree.scale.z);
        this.spacing = octree.pcoGeometry.spacing * maxScale;
        this.octreeSize = octree.pcoGeometry.boundingBox.getSize(PointCloudMaterial.helperVec3).x;
        if (this.pointSizeType === PointSizeType.ADAPTIVE ||
            this.pointColorType === PointColorType.LOD) {
            this.updateVisibilityTextureData(visibleNodes);
        }
    }
    updateVisibilityTextureData(nodes) {
        nodes.sort(byLevelAndIndex);
        const data = new Uint8Array(nodes.length * 4);
        const offsetsToChild = new Array(nodes.length).fill(Infinity);
        this.visibleNodeTextureOffsets.clear();
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            this.visibleNodeTextureOffsets.set(node.name, i);
            if (i > 0) {
                const parentName = node.name.slice(0, -1);
                const parentOffset = this.visibleNodeTextureOffsets.get(parentName);
                const parentOffsetToChild = i - parentOffset;
                offsetsToChild[parentOffset] = Math.min(offsetsToChild[parentOffset], parentOffsetToChild);
                // tslint:disable:no-bitwise
                const offset = parentOffset * 4;
                data[offset] = data[offset] | (1 << node.index);
                data[offset + 1] = offsetsToChild[parentOffset] >> 8;
                data[offset + 2] = offsetsToChild[parentOffset] % 256;
                // tslint:enable:no-bitwise
            }
            data[i * 4 + 3] = node.name.length;
        }
        const texture = this.visibleNodesTexture;
        if (texture) {
            texture.image.data.set(data);
            texture.needsUpdate = true;
        }
    }
    static makeOnBeforeRender(octree, node, pcIndex) {
        return (_renderer, _scene, _camera, _geometry, material) => {
            const pointCloudMaterial = material;
            const materialUniforms = pointCloudMaterial.uniforms;
            materialUniforms.level.value = node.level;
            materialUniforms.isLeafNode.value = node.isLeafNode;
            const vnStart = pointCloudMaterial.visibleNodeTextureOffsets.get(node.name);
            if (vnStart !== undefined) {
                materialUniforms.vnStart.value = vnStart;
            }
            materialUniforms.pcIndex.value =
                pcIndex !== undefined ? pcIndex : octree.visibleNodes.indexOf(node);
            // Note: when changing uniforms in onBeforeRender, the flag uniformsNeedUpdate has to be
            // set to true to instruct ThreeJS to upload them. See also
            // https://github.com/mrdoob/three.js/issues/9870#issuecomment-368750182.
            // Remove the cast to any after updating to Three.JS >= r113
            material /*ShaderMaterial*/.uniformsNeedUpdate = true;
        };
    }
}
PointCloudMaterial.helperVec3 = new Vector3();
PointCloudMaterial.helperVec2 = new Vector2();
__decorate([
    uniform('bbSize')
], PointCloudMaterial.prototype, "bbSize", undefined);
__decorate([
    uniform('clipExtent')
], PointCloudMaterial.prototype, "clipExtent", undefined);
__decorate([
    uniform('depthMap')
], PointCloudMaterial.prototype, "depthMap", undefined);
__decorate([
    uniform('opacityOutOfMasks')
], PointCloudMaterial.prototype, "opacityOutOfMasks", undefined);
__decorate([
    uniform('fov')
], PointCloudMaterial.prototype, "fov", undefined);
__decorate([
    uniform('heightMax')
], PointCloudMaterial.prototype, "heightMax", undefined);
__decorate([
    uniform('heightMin')
], PointCloudMaterial.prototype, "heightMin", undefined);
__decorate([
    uniform('intensityBrightness')
], PointCloudMaterial.prototype, "intensityBrightness", undefined);
__decorate([
    uniform('intensityContrast')
], PointCloudMaterial.prototype, "intensityContrast", undefined);
__decorate([
    uniform('intensityGamma')
], PointCloudMaterial.prototype, "intensityGamma", undefined);
__decorate([
    uniform('intensityRange')
], PointCloudMaterial.prototype, "intensityRange", undefined);
__decorate([
    uniform('maskRegions')
], PointCloudMaterial.prototype, "maskRegions", undefined);
__decorate([
    uniform('maxSize')
], PointCloudMaterial.prototype, "maxSize", undefined);
__decorate([
    uniform('minSize')
], PointCloudMaterial.prototype, "minSize", undefined);
__decorate([
    uniform('octreeSize')
], PointCloudMaterial.prototype, "octreeSize", undefined);
__decorate([
    uniform('opacity', true)
], PointCloudMaterial.prototype, "opacity", undefined);
__decorate([
    uniform('rgbBrightness', true)
], PointCloudMaterial.prototype, "rgbBrightness", undefined);
__decorate([
    uniform('rgbContrast', true)
], PointCloudMaterial.prototype, "rgbContrast", undefined);
__decorate([
    uniform('rgbGamma', true)
], PointCloudMaterial.prototype, "rgbGamma", undefined);
__decorate([
    uniform('screenHeight')
], PointCloudMaterial.prototype, "screenHeight", undefined);
__decorate([
    uniform('screenWidth')
], PointCloudMaterial.prototype, "screenWidth", undefined);
__decorate([
    uniform('size')
], PointCloudMaterial.prototype, "size", undefined);
__decorate([
    uniform('spacing')
], PointCloudMaterial.prototype, "spacing", undefined);
__decorate([
    uniform('transition')
], PointCloudMaterial.prototype, "transition", undefined);
__decorate([
    uniform('uColor')
], PointCloudMaterial.prototype, "color", undefined);
__decorate([
    uniform('wClassification')
], PointCloudMaterial.prototype, "weightClassification", undefined);
__decorate([
    uniform('wElevation')
], PointCloudMaterial.prototype, "weightElevation", undefined);
__decorate([
    uniform('wIntensity')
], PointCloudMaterial.prototype, "weightIntensity", undefined);
__decorate([
    uniform('wReturnNumber')
], PointCloudMaterial.prototype, "weightReturnNumber", undefined);
__decorate([
    uniform('wRGB')
], PointCloudMaterial.prototype, "weightRGB", undefined);
__decorate([
    uniform('wSourceID')
], PointCloudMaterial.prototype, "weightSourceID", undefined);
__decorate([
    uniform('opacityAttenuation')
], PointCloudMaterial.prototype, "opacityAttenuation", undefined);
__decorate([
    uniform('filterByNormalThreshold')
], PointCloudMaterial.prototype, "filterByNormalThreshold", undefined);
__decorate([
    uniform('normalFilteringMode')
], PointCloudMaterial.prototype, "normalFilteringMode", undefined);
__decorate([
    uniform('backgroundMap')
], PointCloudMaterial.prototype, "backgroundMap", undefined);
__decorate([
    uniform('pointCloudID')
], PointCloudMaterial.prototype, "pointCloudID", undefined);
__decorate([
    uniform('pointCloudMixingMode')
], PointCloudMaterial.prototype, "pointCloudMixingMode", undefined);
__decorate([
    uniform('stripeDistanceX')
], PointCloudMaterial.prototype, "stripeDistanceX", undefined);
__decorate([
    uniform('stripeDistanceY')
], PointCloudMaterial.prototype, "stripeDistanceY", undefined);
__decorate([
    uniform('stripeDivisorX')
], PointCloudMaterial.prototype, "stripeDivisorX", undefined);
__decorate([
    uniform('stripeDivisorY')
], PointCloudMaterial.prototype, "stripeDivisorY", undefined);
__decorate([
    uniform('pointCloudMixAngle')
], PointCloudMaterial.prototype, "pointCloudMixAngle", undefined);
__decorate([
    uniform('highlightedType')
], PointCloudMaterial.prototype, "highlightedType", undefined);
__decorate([
    uniform('highlightedPoint0')
], PointCloudMaterial.prototype, "highlightedPoint0", undefined);
__decorate([
    uniform('highlightedPoint1')
], PointCloudMaterial.prototype, "highlightedPoint1", undefined);
__decorate([
    uniform('highlightedPoint2')
], PointCloudMaterial.prototype, "highlightedPoint2", undefined);
__decorate([
    uniform('highlightedMinDistance')
], PointCloudMaterial.prototype, "highlightedMinDistance", undefined);
__decorate([
    uniform('highlightedMaxDistance')
], PointCloudMaterial.prototype, "highlightedMaxDistance", undefined);
__decorate([
    uniform('highlightedDistanceProximityThreshold')
], PointCloudMaterial.prototype, "highlightedDistanceProximityThreshold", undefined);
__decorate([
    uniform('highlightedOuterOpacity')
], PointCloudMaterial.prototype, "highlightedOuterOpacity", undefined);
__decorate([
    uniform('enablePointHighlighting')
], PointCloudMaterial.prototype, "enablePointHighlighting", undefined);
__decorate([
    uniform('highlightedPointCoordinate')
], PointCloudMaterial.prototype, "highlightedPointCoordinate", undefined);
__decorate([
    uniform('highlightedPointColor')
], PointCloudMaterial.prototype, "highlightedPointColor", undefined);
__decorate([
    uniform('highlightedPointScale')
], PointCloudMaterial.prototype, "highlightedPointScale", undefined);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "useClipBox", undefined);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "weighted", undefined);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "pointColorType", undefined);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "pointSizeType", undefined);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "clipMode", undefined);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "useEDL", undefined);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "shape", undefined);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "treeType", undefined);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "pointOpacityType", undefined);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "useFilterByNormal", undefined);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "useTextureBlending", undefined);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "usePointCloudMixing", undefined);
__decorate([
    requiresShaderUpdate()
], PointCloudMaterial.prototype, "highlightPoint", undefined);
function makeUniform(type, value) {
    return { type, value };
}
function getValid(a, b) {
    return a === undefined ? b : a;
}
// tslint:disable:no-invalid-this
function uniform(uniformName, requireSrcUpdate = false) {
    return (target, propertyKey) => {
        Object.defineProperty(target, propertyKey, {
            get() {
                return this.getUniform(uniformName);
            },
            set(value) {
                if (value !== this.getUniform(uniformName)) {
                    this.setUniform(uniformName, value);
                    if (requireSrcUpdate) {
                        this.updateShaderSource();
                    }
                }
            },
        });
    };
}
function requiresShaderUpdate() {
    return (target, propertyKey) => {
        const fieldName = `_${propertyKey.toString()}`;
        Object.defineProperty(target, propertyKey, {
            get() {
                return this[fieldName];
            },
            set(value) {
                if (value !== this[fieldName]) {
                    this[fieldName] = value;
                    this.updateShaderSource();
                }
            },
        });
    };
}

/**
 * adapted from mhluska at https://github.com/mrdoob/three.js/issues/1561
 */
function computeTransformedBoundingBox(box, transform) {
    return new Box3().setFromPoints([
        new Vector3(box.min.x, box.min.y, box.min.z).applyMatrix4(transform),
        new Vector3(box.min.x, box.min.y, box.min.z).applyMatrix4(transform),
        new Vector3(box.max.x, box.min.y, box.min.z).applyMatrix4(transform),
        new Vector3(box.min.x, box.max.y, box.min.z).applyMatrix4(transform),
        new Vector3(box.min.x, box.min.y, box.max.z).applyMatrix4(transform),
        new Vector3(box.min.x, box.max.y, box.max.z).applyMatrix4(transform),
        new Vector3(box.max.x, box.max.y, box.min.z).applyMatrix4(transform),
        new Vector3(box.max.x, box.min.y, box.max.z).applyMatrix4(transform),
        new Vector3(box.max.x, box.max.y, box.max.z).applyMatrix4(transform),
    ]);
}
function createChildAABB$1(aabb, index) {
    const min = aabb.min.clone();
    const max = aabb.max.clone();
    const size = new Vector3().subVectors(max, min);
    // tslint:disable-next-line:no-bitwise
    if ((index & 0b0001) > 0) {
        min.z += size.z / 2;
    }
    else {
        max.z -= size.z / 2;
    }
    // tslint:disable-next-line:no-bitwise
    if ((index & 0b0010) > 0) {
        min.y += size.y / 2;
    }
    else {
        max.y -= size.y / 2;
    }
    // tslint:disable-next-line:no-bitwise
    if ((index & 0b0100) > 0) {
        min.x += size.x / 2;
    }
    else {
        max.x -= size.x / 2;
    }
    return new Box3(min, max);
}

/**
 * Adapted from Potree.js http://potree.org
 * Potree License: https://github.com/potree/potree/blob/1.5/LICENSE
 */
const NODE_STRIDE = 5;
class PointCloudOctreeGeometryNode extends EventDispatcher {
    constructor(name, pcoGeometry, boundingBox) {
        super();
        this.id = PointCloudOctreeGeometryNode.idCount++;
        this.level = 0;
        this.spacing = 0;
        this.hasChildren = false;
        this.children = [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
        ];
        this.mean = new Vector3();
        this.numPoints = 0;
        this.loaded = false;
        this.loading = false;
        this.failed = false;
        this.parent = null;
        this.oneTimeDisposeHandlers = [];
        this.isLeafNode = true;
        this.isTreeNode = false;
        this.isGeometryNode = true;
        this.name = name;
        this.index = getIndexFromName(name);
        this.pcoGeometry = pcoGeometry;
        this.boundingBox = boundingBox;
        this.tightBoundingBox = boundingBox.clone();
        this.boundingSphere = boundingBox.getBoundingSphere(new Sphere());
    }
    dispose() {
        if (!this.geometry || !this.parent) {
            return;
        }
        this.geometry.dispose();
        this.geometry = undefined;
        this.loaded = false;
        this.oneTimeDisposeHandlers.forEach(handler => handler());
        this.oneTimeDisposeHandlers = [];
    }
    /**
     * Gets the url of the binary file for this node.
     */
    getUrl() {
        const geometry = this.pcoGeometry;
        const version = geometry.loader.version;
        const pathParts = [geometry.octreeDir];
        if (geometry.loader && version.equalOrHigher('1.5')) {
            pathParts.push(this.getHierarchyBaseUrl());
            pathParts.push(this.name);
        }
        else if (version.equalOrHigher('1.4')) {
            pathParts.push(this.name);
        }
        else if (version.upTo('1.3')) {
            pathParts.push(this.name);
        }
        return pathParts.join('/');
    }
    /**
     * Gets the url of the hierarchy file for this node.
     */
    getHierarchyUrl() {
        return `${this.pcoGeometry.octreeDir}/${this.getHierarchyBaseUrl()}/${this.name}.hrc`;
    }
    /**
     * Adds the specified node as a child of the current node.
     *
     * @param child
     *    The node which is to be added as a child.
     */
    addChild(child) {
        this.children[child.index] = child;
        this.isLeafNode = false;
        child.parent = this;
    }
    /**
     * Calls the specified callback for the current node (if includeSelf is set to true) and all its
     * children.
     *
     * @param cb
     *    The function which is to be called for each node.
     */
    traverse(cb, includeSelf = true) {
        const stack = includeSelf ? [this] : [];
        let current;
        while ((current = stack.pop()) !== undefined) {
            cb(current);
            for (const child of current.children) {
                if (child !== null) {
                    stack.push(child);
                }
            }
        }
    }
    load() {
        if (!this.canLoad()) {
            return Promise.resolve();
        }
        this.loading = true;
        this.pcoGeometry.numNodesLoading++;
        this.pcoGeometry.needsUpdate = true;
        let promise;
        if (this.pcoGeometry.loader.version.equalOrHigher('1.5') &&
            this.level % this.pcoGeometry.hierarchyStepSize === 0 &&
            this.hasChildren) {
            promise = this.loadHierachyThenPoints();
        }
        else {
            promise = this.loadPoints();
        }
        return promise.catch(reason => {
            this.loading = false;
            this.failed = true;
            this.pcoGeometry.numNodesLoading--;
            throw reason;
        });
    }
    canLoad() {
        return (!this.loading &&
            !this.loaded &&
            !this.pcoGeometry.disposed &&
            !this.pcoGeometry.loader.disposed &&
            this.pcoGeometry.numNodesLoading < this.pcoGeometry.maxNumNodesLoading);
    }
    loadPoints() {
        this.pcoGeometry.needsUpdate = true;
        return this.pcoGeometry.loader.load(this);
    }
    loadHierachyThenPoints() {
        if (this.level % this.pcoGeometry.hierarchyStepSize !== 0) {
            return Promise.resolve();
        }
        return Promise.resolve(this.pcoGeometry.loader.getUrl(this.getHierarchyUrl()))
            .then(url => this.pcoGeometry.xhrRequest(url, { mode: 'cors' }))
            .then(res => handleFailedRequest(res))
            .then(okRes => okRes.arrayBuffer())
            .then(buffer => handleEmptyBuffer(buffer))
            .then(okBuffer => this.loadHierarchy(this, okBuffer));
    }
    /**
     * Gets the url of the folder where the hierarchy is, relative to the octreeDir.
     */
    getHierarchyBaseUrl() {
        const hierarchyStepSize = this.pcoGeometry.hierarchyStepSize;
        const indices = this.name.substr(1);
        const numParts = Math.floor(indices.length / hierarchyStepSize);
        let path = 'r/';
        for (let i = 0; i < numParts; i++) {
            path += `${indices.substr(i * hierarchyStepSize, hierarchyStepSize)}/`;
        }
        return path.slice(0, -1);
    }
    // tslint:disable:no-bitwise
    loadHierarchy(node, buffer) {
        const view = new DataView(buffer);
        const firstNodeData = this.getNodeData(node.name, 0, view);
        node.numPoints = firstNodeData.numPoints;
        // Nodes which need be visited.
        const stack = [firstNodeData];
        // Nodes which have already been decoded. We will take nodes from the stack and place them here.
        const decoded = [];
        let offset = NODE_STRIDE;
        while (stack.length > 0) {
            const stackNodeData = stack.shift();
            // From the last bit, all the way to the 8th one from the right.
            let mask = 1;
            for (let i = 0; i < 8 && offset + 1 < buffer.byteLength; i++) {
                if ((stackNodeData.children & mask) !== 0) {
                    const nodeData = this.getNodeData(stackNodeData.name + i, offset, view);
                    decoded.push(nodeData); // Node is decoded.
                    stack.push(nodeData); // Need to check its children.
                    offset += NODE_STRIDE; // Move over to the next node in the buffer.
                }
                mask = mask * 2;
            }
        }
        node.pcoGeometry.needsUpdate = true;
        // Map containing all the nodes.
        const nodes = new Map();
        nodes.set(node.name, node);
        decoded.forEach(nodeData => this.addNode(nodeData, node.pcoGeometry, nodes));
        node.loadPoints();
    }
    // tslint:enable:no-bitwise
    getNodeData(name, offset, view) {
        const children = view.getUint8(offset);
        const numPoints = view.getUint32(offset + 1, true);
        return { children: children, numPoints: numPoints, name };
    }
    addNode({ name, numPoints, children }, pco, nodes) {
        const index = getIndexFromName(name);
        const parentName = name.substring(0, name.length - 1);
        const parentNode = nodes.get(parentName);
        const level = name.length - 1;
        const boundingBox = createChildAABB$1(parentNode.boundingBox, index);
        const node = new PointCloudOctreeGeometryNode(name, pco, boundingBox);
        node.level = level;
        node.numPoints = numPoints;
        node.hasChildren = children > 0;
        node.spacing = pco.spacing / Math.pow(2, level);
        parentNode.addChild(node);
        nodes.set(name, node);
    }
}
PointCloudOctreeGeometryNode.idCount = 0;

class PointCloudOctreeGeometry {
    constructor(loader, boundingBox, tightBoundingBox, offset, xhrRequest) {
        this.loader = loader;
        this.boundingBox = boundingBox;
        this.tightBoundingBox = tightBoundingBox;
        this.offset = offset;
        this.xhrRequest = xhrRequest;
        this.disposed = false;
        this.needsUpdate = true;
        this.octreeDir = '';
        this.hierarchyStepSize = -1;
        this.nodes = {};
        this.numNodesLoading = 0;
        this.maxNumNodesLoading = 3;
        this.spacing = 0;
        this.pointAttributes = new PointAttributes([]);
        this.projection = null;
        this.url = null;
    }
    dispose() {
        this.loader.dispose();
        this.root.traverse(node => node.dispose());
        this.disposed = true;
    }
    addNodeLoadedCallback(callback) {
        this.loader.callbacks.push(callback);
    }
    clearNodeLoadedCallbacks() {
        this.loader.callbacks = [];
    }
}

class PointCloudOctreeNode extends EventDispatcher {
    constructor(geometryNode, sceneNode) {
        super();
        this.pcIndex = undefined;
        this.boundingBoxNode = null;
        this.loaded = true;
        this.isTreeNode = true;
        this.isGeometryNode = false;
        this.geometryNode = geometryNode;
        this.sceneNode = sceneNode;
        this.children = geometryNode.children.slice();
    }
    dispose() {
        this.geometryNode.dispose();
    }
    disposeSceneNode() {
        const node = this.sceneNode;
        if (node.geometry instanceof BufferGeometry) {
            const attributes = node.geometry.attributes;
            // tslint:disable-next-line:forin
            for (const key in attributes) {
                if (key === 'position') {
                    delete attributes[key].array;
                }
                delete attributes[key];
            }
            node.geometry.dispose();
            node.geometry = undefined;
        }
    }
    traverse(cb, includeSelf) {
        this.geometryNode.traverse(cb, includeSelf);
    }
    get id() {
        return this.geometryNode.id;
    }
    get name() {
        return this.geometryNode.name;
    }
    get level() {
        return this.geometryNode.level;
    }
    get isLeafNode() {
        return this.geometryNode.isLeafNode;
    }
    get numPoints() {
        return this.geometryNode.numPoints;
    }
    get index() {
        return this.geometryNode.index;
    }
    get boundingSphere() {
        return this.geometryNode.boundingSphere;
    }
    get boundingBox() {
        return this.geometryNode.boundingBox;
    }
    get spacing() {
        return this.geometryNode.spacing;
    }
}

function clamp(value, min, max) {
    return Math.min(Math.max(min, value), max);
}

class PointCloudOctreePicker {
    dispose() {
        if (this.pickState) {
            this.pickState.material.dispose();
            this.pickState.renderTarget.dispose();
        }
    }
    pick(renderer, camera, ray, octrees, params = {}) {
        if (octrees.length === 0) {
            return null;
        }
        const pickState = this.pickState
            ? this.pickState
            : (this.pickState = PointCloudOctreePicker.getPickState());
        const pickMaterial = pickState.material;
        const pixelRatio = renderer.getPixelRatio();
        const width = Math.ceil(renderer.domElement.clientWidth * pixelRatio);
        const height = Math.ceil(renderer.domElement.clientHeight * pixelRatio);
        PointCloudOctreePicker.updatePickRenderTarget(this.pickState, width, height);
        const pixelPosition = PointCloudOctreePicker.helperVec3; // Use helper vector to prevent extra allocations.
        if (params.pixelPosition) {
            pixelPosition.copy(params.pixelPosition);
        }
        else {
            pixelPosition.addVectors(camera.position, ray.direction).project(camera);
            pixelPosition.x = (pixelPosition.x + 1) * width * 0.5;
            pixelPosition.y = (pixelPosition.y + 1) * height * 0.5;
        }
        const pickWndSize = Math.floor((params.pickWindowSize || DEFAULT_PICK_WINDOW_SIZE) * pixelRatio);
        const halfPickWndSize = (pickWndSize - 1) / 2;
        const x = Math.floor(clamp(pixelPosition.x - halfPickWndSize, 0, width));
        const y = Math.floor(clamp(pixelPosition.y - halfPickWndSize, 0, height));
        PointCloudOctreePicker.prepareRender(renderer, x, y, pickWndSize, pickMaterial, pickState);
        const renderedNodes = PointCloudOctreePicker.render(renderer, camera, pickMaterial, octrees, ray, pickState, params);
        // Cleanup
        pickMaterial.clearVisibleNodeTextureOffsets();
        // Read back image and decode hit point
        const pixels = PointCloudOctreePicker.readPixels(renderer, x, y, pickWndSize);
        const hit = PointCloudOctreePicker.findHit(pixels, pickWndSize);
        return PointCloudOctreePicker.getPickPoint(hit, renderedNodes);
    }
    static prepareRender(renderer, x, y, pickWndSize, pickMaterial, pickState) {
        // Render the intersected nodes onto the pick render target, clipping to a small pick window.
        renderer.setScissor(x, y, pickWndSize, pickWndSize);
        renderer.setScissorTest(true);
        renderer.state.buffers.depth.setTest(pickMaterial.depthTest);
        renderer.state.buffers.depth.setMask(pickMaterial.depthWrite);
        renderer.state.setBlending(NoBlending);
        renderer.setRenderTarget(pickState.renderTarget);
        // Save the current clear color and clear the renderer with black color and alpha 0.
        renderer.getClearColor(this.clearColor);
        const oldClearAlpha = renderer.getClearAlpha();
        renderer.setClearColor(COLOR_BLACK, 0);
        renderer.clear(true, true, true);
        renderer.setClearColor(this.clearColor, oldClearAlpha);
    }
    static render(renderer, camera, pickMaterial, octrees, ray, pickState, params) {
        const renderedNodes = [];
        for (const octree of octrees) {
            // Get all the octree nodes which intersect the picking ray. We only need to render those.
            const nodes = PointCloudOctreePicker.nodesOnRay(octree, ray);
            if (!nodes.length) {
                continue;
            }
            PointCloudOctreePicker.updatePickMaterial(pickMaterial, octree.material, params);
            pickMaterial.updateMaterial(octree, nodes, camera, renderer);
            if (params.onBeforePickRender) {
                params.onBeforePickRender(pickMaterial, pickState.renderTarget);
            }
            // Create copies of the nodes so we can render them differently than in the normal point cloud.
            pickState.scene.children = PointCloudOctreePicker.createTempNodes(octree, nodes, pickMaterial, renderedNodes.length);
            renderer.render(pickState.scene, camera);
            nodes.forEach(node => renderedNodes.push({ node, octree }));
        }
        return renderedNodes;
    }
    static nodesOnRay(octree, ray) {
        const nodesOnRay = [];
        const rayClone = ray.clone();
        for (const node of octree.visibleNodes) {
            const sphere = PointCloudOctreePicker.helperSphere
                .copy(node.boundingSphere)
                .applyMatrix4(octree.matrixWorld);
            if (rayClone.intersectsSphere(sphere)) {
                nodesOnRay.push(node);
            }
        }
        return nodesOnRay;
    }
    static readPixels(renderer, x, y, pickWndSize) {
        // Read the pixel from the pick render target.
        const pixels = new Uint8Array(4 * pickWndSize * pickWndSize);
        renderer.readRenderTargetPixels(renderer.getRenderTarget(), x, y, pickWndSize, pickWndSize, pixels);
        renderer.setScissorTest(false);
        renderer.setRenderTarget(null);
        return pixels;
    }
    static createTempNodes(octree, nodes, pickMaterial, nodeIndexOffset) {
        const tempNodes = [];
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const sceneNode = node.sceneNode;
            const tempNode = new Points(sceneNode.geometry, pickMaterial);
            tempNode.matrix = sceneNode.matrix;
            tempNode.matrixWorld = sceneNode.matrixWorld;
            tempNode.matrixAutoUpdate = false;
            tempNode.frustumCulled = false;
            const nodeIndex = nodeIndexOffset + i + 1;
            if (nodeIndex > 255) {
                console.error('More than 255 nodes for pick are not supported.');
            }
            tempNode.onBeforeRender = PointCloudMaterial.makeOnBeforeRender(octree, node, nodeIndex);
            tempNodes.push(tempNode);
        }
        return tempNodes;
    }
    static updatePickMaterial(pickMaterial, nodeMaterial, params) {
        pickMaterial.pointSizeType = nodeMaterial.pointSizeType;
        pickMaterial.shape = nodeMaterial.shape;
        pickMaterial.size = nodeMaterial.size;
        pickMaterial.minSize = nodeMaterial.minSize;
        pickMaterial.maxSize = nodeMaterial.maxSize;
        pickMaterial.classification = nodeMaterial.classification;
        pickMaterial.useFilterByNormal = nodeMaterial.useFilterByNormal;
        pickMaterial.filterByNormalThreshold = nodeMaterial.filterByNormalThreshold;
        if (params.pickOutsideClipRegion) {
            pickMaterial.clipMode = ClipMode.DISABLED;
        }
        else {
            pickMaterial.clipMode = nodeMaterial.clipMode;
            pickMaterial.setClipBoxes(nodeMaterial.clipMode === ClipMode.CLIP_OUTSIDE ? nodeMaterial.clipBoxes : []);
        }
    }
    static updatePickRenderTarget(pickState, width, height) {
        if (pickState.renderTarget.width === width && pickState.renderTarget.height === height) {
            return;
        }
        pickState.renderTarget.dispose();
        pickState.renderTarget = PointCloudOctreePicker.makePickRenderTarget();
        pickState.renderTarget.setSize(width, height);
    }
    static makePickRenderTarget() {
        return new WebGLRenderTarget(1, 1, {
            minFilter: LinearFilter,
            magFilter: NearestFilter,
            format: RGBAFormat,
        });
    }
    static findHit(pixels, pickWndSize) {
        const ibuffer = new Uint32Array(pixels.buffer);
        // Find closest hit inside pixelWindow boundaries
        let min = Number.MAX_VALUE;
        let hit = null;
        for (let u = 0; u < pickWndSize; u++) {
            for (let v = 0; v < pickWndSize; v++) {
                const offset = u + v * pickWndSize;
                const distance = Math.pow(u - (pickWndSize - 1) / 2, 2) + Math.pow(v - (pickWndSize - 1) / 2, 2);
                const pcIndex = pixels[4 * offset + 3];
                pixels[4 * offset + 3] = 0;
                const pIndex = ibuffer[offset];
                if (pcIndex > 0 && distance < min) {
                    hit = {
                        pIndex: pIndex,
                        pcIndex: pcIndex - 1,
                    };
                    min = distance;
                }
            }
        }
        return hit;
    }
    static getPickPoint(hit, nodes) {
        if (!hit) {
            return null;
        }
        const point = {};
        const points = nodes[hit.pcIndex] && nodes[hit.pcIndex].node.sceneNode;
        if (!points) {
            return null;
        }
        point.pointCloud = nodes[hit.pcIndex].octree;
        const attributes = points.geometry.attributes;
        for (const property in attributes) {
            if (!attributes.hasOwnProperty(property)) {
                continue;
            }
            const values = attributes[property];
            // tslint:disable-next-line:prefer-switch
            if (property === 'position') {
                PointCloudOctreePicker.addPositionToPickPoint(point, hit, values, points);
            }
            else if (property === 'normal') {
                PointCloudOctreePicker.addNormalToPickPoint(point, hit, values, points);
            }
            else if (property === 'indices') ;
            else {
                if (values.itemSize === 1) {
                    point[property] = values.array[hit.pIndex];
                }
                else {
                    const value = [];
                    for (let j = 0; j < values.itemSize; j++) {
                        value.push(values.array[values.itemSize * hit.pIndex + j]);
                    }
                    point[property] = value;
                }
            }
        }
        return point;
    }
    static addPositionToPickPoint(point, hit, values, points) {
        point.position = new Vector3()
            .fromBufferAttribute(values, hit.pIndex)
            .applyMatrix4(points.matrixWorld);
    }
    static addNormalToPickPoint(point, hit, values, points) {
        const normal = new Vector3().fromBufferAttribute(values, hit.pIndex);
        const normal4 = new Vector4(normal.x, normal.y, normal.z, 0).applyMatrix4(points.matrixWorld);
        normal.set(normal4.x, normal4.y, normal4.z);
        point.normal = normal;
    }
    static getPickState() {
        const scene = new Scene();
        scene.matrixAutoUpdate = false;
        const material = new PointCloudMaterial();
        material.pointColorType = PointColorType.POINT_INDEX;
        return {
            renderTarget: PointCloudOctreePicker.makePickRenderTarget(),
            material: material,
            scene: scene,
        };
    }
}
PointCloudOctreePicker.helperVec3 = new Vector3();
PointCloudOctreePicker.helperSphere = new Sphere();
PointCloudOctreePicker.clearColor = new Color();

class OctreeGeometry {
    constructor(loader, boundingBox) {
        this.loader = loader;
        this.boundingBox = boundingBox;
        this.maxNumNodesLoading = 3;
        this.numNodesLoading = 0;
        this.needsUpdate = true;
        this.disposed = false;
        this.pointAttributes = null;
        this.spacing = 0;
        this.url = null;
        this.tightBoundingBox = this.boundingBox.clone();
        this.boundingSphere = this.boundingBox.getBoundingSphere(new Sphere());
        this.tightBoundingSphere = this.boundingSphere.clone();
    }
    dispose() {
        this.root.traverse(node => node.dispose());
        this.disposed = true;
    }
}

class PointCloudTree extends Object3D {
    constructor() {
        super(...arguments);
        this.root = null;
    }
    initialized() {
        return this.root !== null;
    }
}

class PointCloudOctree extends PointCloudTree {
    constructor(potree, pcoGeometry, material) {
        super();
        this.disposed = false;
        this.level = 0;
        this.maxLevel = Infinity;
        /**
         * The minimum radius of a node's bounding sphere on the screen in order to be displayed.
         */
        this.minNodePixelSize = DEFAULT_MIN_NODE_PIXEL_SIZE;
        this.root = null;
        this.boundingBoxNodes = [];
        this.visibleNodes = [];
        this.visibleGeometry = [];
        this.numVisiblePoints = 0;
        this.showBoundingBox = false;
        this.visibleBounds = new Box3();
        this.name = '';
        this.potree = potree;
        this.root = pcoGeometry.root;
        this.pcoGeometry = pcoGeometry;
        this.boundingBox = pcoGeometry.boundingBox;
        this.boundingSphere = this.boundingBox.getBoundingSphere(new Sphere());
        this.position.copy(pcoGeometry.offset);
        this.updateMatrix();
        this.material =
            material || pcoGeometry instanceof OctreeGeometry
                ? new PointCloudMaterial({ colorRgba: true })
                : new PointCloudMaterial();
        this.initMaterial(this.material);
    }
    initMaterial(material) {
        this.updateMatrixWorld(true);
        const { min, max } = computeTransformedBoundingBox(this.pcoGeometry.tightBoundingBox || this.getBoundingBoxWorld(), this.matrixWorld);
        const bWidth = max.z - min.z;
        material.heightMin = min.z - 0.2 * bWidth;
        material.heightMax = max.z + 0.2 * bWidth;
    }
    dispose() {
        if (this.root) {
            this.root.dispose();
        }
        this.pcoGeometry.root.traverse(n => this.potree.lru.remove(n));
        this.pcoGeometry.dispose();
        this.material.dispose();
        this.visibleNodes = [];
        this.visibleGeometry = [];
        if (this.picker) {
            this.picker.dispose();
            this.picker = undefined;
        }
        this.disposed = true;
    }
    get pointSizeType() {
        return this.material.pointSizeType;
    }
    set pointSizeType(value) {
        this.material.pointSizeType = value;
    }
    toTreeNode(geometryNode, parent) {
        const points = new Points(geometryNode.geometry, this.material);
        const node = new PointCloudOctreeNode(geometryNode, points);
        points.name = geometryNode.name;
        points.position.copy(geometryNode.boundingBox.min);
        points.frustumCulled = false;
        points.onBeforeRender = PointCloudMaterial.makeOnBeforeRender(this, node);
        if (parent) {
            parent.sceneNode.add(points);
            parent.children[geometryNode.index] = node;
            geometryNode.oneTimeDisposeHandlers.push(() => {
                node.disposeSceneNode();
                parent.sceneNode.remove(node.sceneNode);
                // Replace the tree node (rendered and in the GPU) with the geometry node.
                parent.children[geometryNode.index] = geometryNode;
            });
        }
        else {
            this.root = node;
            this.add(points);
        }
        return node;
    }
    updateVisibleBounds() {
        const bounds = this.visibleBounds;
        bounds.min.set(Infinity, Infinity, Infinity);
        bounds.max.set(-Infinity, -Infinity, -Infinity);
        for (const node of this.visibleNodes) {
            if (node.isLeafNode) {
                bounds.expandByPoint(node.boundingBox.min);
                bounds.expandByPoint(node.boundingBox.max);
            }
        }
    }
    updateBoundingBoxes() {
        if (!this.showBoundingBox || !this.parent) {
            return;
        }
        let bbRoot = this.parent.getObjectByName('bbroot');
        if (!bbRoot) {
            bbRoot = new Object3D();
            bbRoot.name = 'bbroot';
            this.parent.add(bbRoot);
        }
        const visibleBoxes = [];
        for (const node of this.visibleNodes) {
            if (node.boundingBoxNode !== undefined && node.isLeafNode) {
                visibleBoxes.push(node.boundingBoxNode);
            }
        }
        bbRoot.children = visibleBoxes;
    }
    updateMatrixWorld(force) {
        if (this.matrixAutoUpdate === true) {
            this.updateMatrix();
        }
        if (this.matrixWorldNeedsUpdate === true || force === true) {
            if (!this.parent) {
                this.matrixWorld.copy(this.matrix);
            }
            else {
                this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
            }
            this.matrixWorldNeedsUpdate = false;
            force = true;
        }
    }
    hideDescendants(object) {
        const toHide = [];
        addVisibleChildren(object);
        while (toHide.length > 0) {
            const objToHide = toHide.shift();
            objToHide.visible = false;
            addVisibleChildren(objToHide);
        }
        function addVisibleChildren(obj) {
            for (const child of obj.children) {
                if (child.visible) {
                    toHide.push(child);
                }
            }
        }
    }
    moveToOrigin() {
        this.position.set(0, 0, 0); // Reset, then the matrix will be updated in getBoundingBoxWorld()
        this.position.set(0, 0, 0).sub(this.getBoundingBoxWorld().getCenter(new Vector3()));
    }
    moveToGroundPlane() {
        this.position.y += -this.getBoundingBoxWorld().min.y;
    }
    getBoundingBoxWorld() {
        this.updateMatrixWorld(true);
        return computeTransformedBoundingBox(this.boundingBox, this.matrixWorld);
    }
    getVisibleExtent() {
        return this.visibleBounds.applyMatrix4(this.matrixWorld);
    }
    pick(renderer, camera, ray, params = {}) {
        this.picker = this.picker || new PointCloudOctreePicker();
        return this.picker.pick(renderer, camera, ray, [this], params);
    }
    get progress() {
        return this.visibleGeometry.length === 0
            ? 0
            : this.visibleNodes.length / this.visibleGeometry.length;
    }
}

const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl');
const FEATURES = {
    SHADER_INTERPOLATION: hasExtension('EXT_frag_depth') && hasMinVaryingVectors(8),
    SHADER_SPLATS: hasExtension('EXT_frag_depth') && hasExtension('OES_texture_float') && hasMinVaryingVectors(8),
    SHADER_EDL: hasExtension('OES_texture_float') && hasMinVaryingVectors(8),
    precision: getPrecision(),
};
function hasExtension(ext) {
    return gl !== null && Boolean(gl.getExtension(ext));
}
function hasMinVaryingVectors(value) {
    return gl !== null && gl.getParameter(gl.MAX_VARYING_VECTORS) >= value;
}
function getPrecision() {
    if (gl === null) {
        return '';
    }
    const vsHighpFloat = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT);
    const vsMediumpFloat = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT);
    const fsHighpFloat = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    const fsMediumpFloat = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT);
    const highpAvailable = vsHighpFloat && fsHighpFloat && vsHighpFloat.precision > 0 && fsHighpFloat.precision > 0;
    const mediumpAvailable = vsMediumpFloat &&
        fsMediumpFloat &&
        vsMediumpFloat.precision > 0 &&
        fsMediumpFloat.precision > 0;
    return highpAvailable ? 'highp' : mediumpAvailable ? 'mediump' : 'lowp';
}

class AsyncBlockingQueue {
    constructor() {
        this.resolvers = [];
        this.promises = [];
    }
    enqueue(t) {
        if (!this.resolvers.length) {
            this.add();
        }
        const resolve = this.resolvers.shift();
        resolve(t);
    }
    dequeue() {
        if (!this.promises.length) {
            this.add();
        }
        return this.promises.shift();
    }
    add() {
        this.promises.push(new Promise(resolve => {
            this.resolvers.push(resolve);
        }));
    }
}

class AutoTerminatingWorker {
    constructor(wrappedWorker, maxIdle) {
        this.wrappedWorker = wrappedWorker;
        this.maxIdle = maxIdle;
        this.timeoutId = undefined;
        this.terminated = false;
    }
    get worker() {
        return this.wrappedWorker;
    }
    get isTerminated() {
        return this.terminated;
    }
    markIdle() {
        this.timeoutId = window.setTimeout(() => {
            this.terminated = true;
            this.wrappedWorker.terminate();
        }, this.maxIdle);
    }
    markInUse() {
        if (this.timeoutId) {
            window.clearTimeout(this.timeoutId);
        }
    }
}
let WorkerPool$1 = class WorkerPool {
    constructor(maxWorkers, worker) {
        this.maxWorkers = maxWorkers;
        this.worker = worker;
        this.pool = new AsyncBlockingQueue();
        this.poolSize = 0;
    }
    /**
     * Returns a worker promise which is resolved when one is available.
     */
    getWorker() {
        // If the number of active workers is smaller than the maximum, return a new one.
        // Otherwise, return a promise for worker from the pool.
        if (this.poolSize < this.maxWorkers) {
            this.poolSize++;
            return Promise.resolve(new AutoTerminatingWorker(this.worker, WorkerPool.POOL_MAX_IDLE));
        }
        else {
            return this.pool.dequeue().then(worker => {
                worker.markInUse();
                // If the dequeued worker has been terminated, decrease the pool size and make a recursive call to get a new worker
                if (worker.isTerminated) {
                    this.poolSize--;
                    return this.getWorker();
                }
                return worker;
            });
        }
    }
    /**
     * Releases a Worker back into the pool
     * @param worker
     */
    releaseWorker(worker) {
        worker.markIdle();
        this.pool.enqueue(worker);
    }
};
/**
 * The maximum amount of idle time that can elapse before a worker from this pool is automatically terminated
 */
WorkerPool$1.POOL_MAX_IDLE = 7000;

// -------------------------------------------------------------------------------------------------
// Converted to Typescript and adapted from https://github.com/potree/potree
// -------------------------------------------------------------------------------------------------
class BinaryLoader {
    constructor({ getUrl = s => Promise.resolve(s), version, boundingBox, scale, xhrRequest, }) {
        this.disposed = false;
        if (typeof version === 'string') {
            this.version = new Version(version);
        }
        else {
            this.version = version;
        }
        this.xhrRequest = xhrRequest;
        this.getUrl = getUrl;
        this.boundingBox = boundingBox;
        this.scale = scale;
        this.callbacks = [];
    }
    dispose() {
        this.disposed = true;
    }
    load(node) {
        if (node.loaded || this.disposed) {
            return Promise.resolve();
        }
        return Promise.resolve(this.getUrl(this.getNodeUrl(node)))
            .then(url => this.xhrRequest(url, { mode: 'cors' }))
            .then(res => handleFailedRequest(res))
            .then(okRes => okRes.arrayBuffer())
            .then(buffer => handleEmptyBuffer(buffer))
            .then(okBuffer => {
            return new Promise(resolve => this.parse(node, okBuffer, resolve));
        });
    }
    getNodeUrl(node) {
        let url = node.getUrl();
        if (this.version.equalOrHigher('1.4')) {
            url += '.bin';
        }
        return url;
    }
    parse(node, buffer, resolve) {
        if (this.disposed) {
            resolve();
            return;
        }
        BinaryLoader.WORKER_POOL.getWorker().then(autoTerminatingWorker => {
            const pointAttributes = node.pcoGeometry.pointAttributes;
            const numPoints = buffer.byteLength / pointAttributes.byteSize;
            if (this.version.upTo('1.5')) {
                node.numPoints = numPoints;
            }
            autoTerminatingWorker.worker.onmessage = (e) => {
                if (this.disposed) {
                    resolve();
                    BinaryLoader.WORKER_POOL.releaseWorker(autoTerminatingWorker);
                    return;
                }
                const data = e.data;
                const geometry = (node.geometry = node.geometry || new BufferGeometry());
                geometry.boundingBox = node.boundingBox;
                this.addBufferAttributes(geometry, data.attributeBuffers);
                this.addIndices(geometry, data.indices);
                this.addNormalAttribute(geometry, numPoints);
                node.mean = new Vector3().fromArray(data.mean);
                node.tightBoundingBox = this.getTightBoundingBox(data.tightBoundingBox);
                node.loaded = true;
                node.loading = false;
                node.failed = false;
                node.pcoGeometry.numNodesLoading--;
                node.pcoGeometry.needsUpdate = true;
                this.callbacks.forEach(callback => callback(node));
                resolve();
                BinaryLoader.WORKER_POOL.releaseWorker(autoTerminatingWorker);
            };
            const message = {
                buffer,
                pointAttributes,
                version: this.version.version,
                min: node.boundingBox.min.toArray(),
                offset: node.pcoGeometry.offset.toArray(),
                scale: this.scale,
                spacing: node.spacing,
                hasChildren: node.hasChildren,
            };
            autoTerminatingWorker.worker.postMessage(message, [message.buffer]);
        });
    }
    getTightBoundingBox({ min, max }) {
        const box = new Box3(new Vector3().fromArray(min), new Vector3().fromArray(max));
        box.max.sub(box.min);
        box.min.set(0, 0, 0);
        return box;
    }
    addBufferAttributes(geometry, buffers) {
        Object.keys(buffers).forEach(property => {
            const buffer = buffers[property].buffer;
            if (this.isAttribute(property, PointAttributeName.POSITION_CARTESIAN)) {
                geometry.setAttribute('position', new BufferAttribute(new Float32Array(buffer), 3));
            }
            else if (this.isAttribute(property, PointAttributeName.COLOR_PACKED)) {
                geometry.setAttribute('color', new BufferAttribute(new Uint8Array(buffer), 3, true));
            }
            else if (this.isAttribute(property, PointAttributeName.INTENSITY)) {
                geometry.setAttribute('intensity', new BufferAttribute(new Float32Array(buffer), 1));
            }
            else if (this.isAttribute(property, PointAttributeName.CLASSIFICATION)) {
                geometry.setAttribute('classification', new BufferAttribute(new Uint8Array(buffer), 1));
            }
            else if (this.isAttribute(property, PointAttributeName.NORMAL_SPHEREMAPPED)) {
                geometry.setAttribute('normal', new BufferAttribute(new Float32Array(buffer), 3));
            }
            else if (this.isAttribute(property, PointAttributeName.NORMAL_OCT16)) {
                geometry.setAttribute('normal', new BufferAttribute(new Float32Array(buffer), 3));
            }
            else if (this.isAttribute(property, PointAttributeName.NORMAL)) {
                geometry.setAttribute('normal', new BufferAttribute(new Float32Array(buffer), 3));
            }
        });
    }
    addIndices(geometry, indices) {
        const indicesAttribute = new Uint8BufferAttribute(indices, 4);
        indicesAttribute.normalized = true;
        geometry.setAttribute('indices', indicesAttribute);
    }
    addNormalAttribute(geometry, numPoints) {
        if (!geometry.getAttribute('normal')) {
            const buffer = new Float32Array(numPoints * 3);
            geometry.setAttribute('normal', new BufferAttribute(new Float32Array(buffer), 3));
        }
    }
    isAttribute(property, name) {
        return parseInt(property, 10) === name;
    }
}
BinaryLoader.WORKER_POOL = new WorkerPool$1(32, new Worker(new URL('./binary-decoder.worker.js', import.meta.url)));

// -------------------------------------------------------------------------------------------------
// Converted to Typescript and adapted from https://github.com/potree/potree
// -------------------------------------------------------------------------------------------------
/**
 *
 * @param url
 *    The url of the point cloud file (usually cloud.js).
 * @param getUrl
 *    Function which receives the relative URL of a point cloud chunk file which is to be loaded
 *    and shoud return a new url (e.g. signed) in the form of a string or a promise.
 * @param xhrRequest An arrow function for a fetch request
 * @returns
 *    An observable which emits once when the first LOD of the point cloud is loaded.
 */
function loadPOC(url, getUrl, xhrRequest) {
    return Promise.resolve(getUrl(url)).then(transformedUrl => {
        return xhrRequest(transformedUrl, { mode: 'cors' })
            .then(res => handleFailedRequest(res))
            .then(okRes => okRes.json())
            .then(parse(transformedUrl, getUrl, xhrRequest));
    });
}
function parse(url, getUrl, xhrRequest) {
    return (data) => {
        const { offset, boundingBox, tightBoundingBox } = getBoundingBoxes(data);
        const loader = new BinaryLoader({
            getUrl,
            version: data.version,
            boundingBox,
            scale: data.scale,
            xhrRequest,
        });
        const pco = new PointCloudOctreeGeometry(loader, boundingBox, tightBoundingBox, offset, xhrRequest);
        pco.url = url;
        pco.octreeDir = data.octreeDir;
        pco.needsUpdate = true;
        pco.spacing = data.spacing;
        pco.hierarchyStepSize = data.hierarchyStepSize;
        pco.projection = data.projection;
        pco.offset = offset;
        pco.pointAttributes = new PointAttributes(data.pointAttributes);
        const nodes = {};
        const version = new Version(data.version);
        return loadRoot(pco, data, nodes, version).then(() => {
            if (version.upTo('1.4')) {
                loadRemainingHierarchy(pco, data, nodes);
            }
            pco.nodes = nodes;
            return pco;
        });
    };
}
function getBoundingBoxes(data) {
    const min = new Vector3(data.boundingBox.lx, data.boundingBox.ly, data.boundingBox.lz);
    const max = new Vector3(data.boundingBox.ux, data.boundingBox.uy, data.boundingBox.uz);
    const boundingBox = new Box3(min, max);
    const tightBoundingBox = boundingBox.clone();
    const offset = min.clone();
    if (data.tightBoundingBox) {
        const { lx, ly, lz, ux, uy, uz } = data.tightBoundingBox;
        tightBoundingBox.min.set(lx, ly, lz);
        tightBoundingBox.max.set(ux, uy, uz);
    }
    boundingBox.min.sub(offset);
    boundingBox.max.sub(offset);
    tightBoundingBox.min.sub(offset);
    tightBoundingBox.max.sub(offset);
    return { offset, boundingBox, tightBoundingBox };
}
function loadRoot(pco, data, nodes, version) {
    const name = 'r';
    const root = new PointCloudOctreeGeometryNode(name, pco, pco.boundingBox);
    root.hasChildren = true;
    root.spacing = pco.spacing;
    if (version.upTo('1.5')) {
        root.numPoints = data.hierarchy[0][1];
    }
    else {
        root.numPoints = 0;
    }
    pco.root = root;
    nodes[name] = root;
    return pco.root.load();
}
function loadRemainingHierarchy(pco, data, nodes) {
    for (let i = 1; i < data.hierarchy.length; i++) {
        const [name, numPoints] = data.hierarchy[i];
        const { index, parentName, level } = parseName(name);
        const parentNode = nodes[parentName];
        const boundingBox = createChildAABB$1(parentNode.boundingBox, index);
        const node = new PointCloudOctreeGeometryNode(name, pco, boundingBox);
        node.level = level;
        node.numPoints = numPoints;
        node.spacing = pco.spacing / Math.pow(2, node.level);
        nodes[name] = node;
        parentNode.addChild(node);
    }
}
function parseName(name) {
    return {
        index: getIndexFromName(name),
        parentName: name.substring(0, name.length - 1),
        level: name.length - 1,
    };
}

class OctreeGeometryNode {
    constructor(name, octreeGeometry, boundingBox) {
        this.name = name;
        this.octreeGeometry = octreeGeometry;
        this.boundingBox = boundingBox;
        this.loaded = false;
        this.loading = false;
        this.failed = false;
        this.parent = null;
        this.hasChildren = false;
        this.isLeafNode = true;
        this.isTreeNode = false;
        this.isGeometryNode = true;
        this.children = [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
        ];
        this.id = OctreeGeometryNode.IDCount++;
        this.index = parseInt(name.charAt(name.length - 1));
        this.boundingSphere = boundingBox.getBoundingSphere(new Sphere());
        this.tightBoundingBox = boundingBox.clone();
        this.numPoints = 0;
        this.oneTimeDisposeHandlers = [];
    }
    getLevel() {
        return this.level;
    }
    isLoaded() {
        return this.loaded;
    }
    getBoundingSphere() {
        return this.boundingSphere;
    }
    getBoundingBox() {
        return this.boundingBox;
    }
    load() {
        if (this.octreeGeometry.numNodesLoading >= this.octreeGeometry.maxNumNodesLoading) {
            return Promise.resolve();
        }
        if (!this.octreeGeometry.loader) {
            this.loading = false;
            this.failed = true;
            return Promise.reject(`Loader not initialized for ${this.name}`);
        }
        return this.octreeGeometry.loader.load(this);
    }
    getNumPoints() {
        return this.numPoints;
    }
    dispose() {
        if (this.geometry && this.parent != null) {
            this.geometry.dispose();
            this.geometry = undefined;
            this.loaded = false;
            for (let i = 0; i < this.oneTimeDisposeHandlers.length; i++) {
                const handler = this.oneTimeDisposeHandlers[i];
                handler();
            }
            this.oneTimeDisposeHandlers = [];
        }
    }
    traverse(cb, includeSelf = true) {
        const stack = includeSelf ? [this] : [];
        let current;
        while ((current = stack.pop()) !== undefined) {
            cb(current);
            for (const child of current.children) {
                if (child !== null) {
                    stack.push(child);
                }
            }
        }
    }
}
OctreeGeometryNode.IDCount = 0;
OctreeGeometryNode.IDCount = 0;

// Create enums for different types of workers
var WorkerType;
(function (WorkerType) {
    WorkerType["DECODER_WORKER"] = "DECODER_WORKER";
    WorkerType["DECODER_WORKER_GLTF"] = "DECODER_WORKER_GLTF";
})(WorkerType || (WorkerType = {}));
// Worker JS names: 'BinaryDecoderWorker.js', 'DEMWorker.js', 'EptBinaryDecoderWorker.js', 'EptLaszipDecoderWorker.js',
// EptZstandardDecoder_preamble.js', 'EptZstandardDecoderWorker.js', 'LASDecoderWorker.js', 'LASLAZWorker.js', 'LazLoaderWorker.js'
function createWorker(type) {
    switch (type) {
        case WorkerType.DECODER_WORKER: {
            const worker = new Worker(new URL('./decoder.worker.js', import.meta.url));
            return worker;
        }
        case WorkerType.DECODER_WORKER_GLTF: {
            const worker = new Worker(new URL('./gltf-decoder.worker.js', import.meta.url));
            return worker;
        }
        default:
            throw new Error('Unknown worker type');
    }
}
class WorkerPool {
    constructor() {
        // Workers will be an object that has a key for each worker type and the value is an array of Workers that can be empty
        this.workers = {
            DECODER_WORKER: [],
            DECODER_WORKER_GLTF: [],
        };
    }
    getWorker(workerType) {
        // Throw error if workerType is not recognized
        if (this.workers[workerType] === undefined) {
            throw new Error('Unknown worker type');
        }
        // Given a worker URL, if URL does not exist in the worker object, create a new array with the URL as a key
        if (this.workers[workerType].length === 0) {
            const worker = createWorker(workerType);
            this.workers[workerType].push(worker);
        }
        const worker = this.workers[workerType].pop();
        if (worker === undefined) {
            // Typescript needs this
            throw new Error('No workers available');
        }
        // Return the last worker in the array and remove it from the array
        return worker;
    }
    returnWorker(workerType, worker) {
        this.workers[workerType].push(worker);
    }
}

function extractBasePath(url) {
    return url.substring(0, url.lastIndexOf('/') + 1);
}
function buildUrl(basePath, fileName) {
    return `${basePath}${fileName}`;
}

// Buffer files for DEFAULT encoding
const HIERARCHY_FILE = 'hierarchy.bin';
const OCTREE_FILE = 'octree.bin';
// Default buffer files for GLTF encoding
const GLTF_COLORS_FILE = 'colors.glbin';
const GLTF_POSITIONS_FILE = 'positions.glbin';
class NodeLoader {
    constructor(getUrl, url, workerPool, metadata) {
        this.getUrl = getUrl;
        this.url = url;
        this.workerPool = workerPool;
        this.metadata = metadata;
        this.hierarchyPath = '';
        this.octreePath = '';
        this.gltfColorsPath = '';
        this.gltfPositionsPath = '';
    }
    async load(node) {
        if (node.loaded || node.loading) {
            return;
        }
        node.loading = true;
        node.octreeGeometry.numNodesLoading++;
        try {
            if (node.nodeType === 2) {
                await this.loadHierarchy(node);
            }
            const { byteOffset, byteSize } = node;
            if (byteOffset === undefined || byteSize === undefined) {
                throw new Error('byteOffset and byteSize are required');
            }
            let buffer;
            if (this.metadata.encoding === 'GLTF') {
                const urlColors = await this.getUrl(this.gltfColorsPath);
                const urlPositions = await this.getUrl(this.gltfPositionsPath);
                if (byteSize === BigInt(0)) {
                    buffer = new ArrayBuffer(0);
                    console.warn(`loaded node with 0 bytes: ${node.name}`);
                }
                else {
                    const firstPositions = byteOffset * 4n * 3n;
                    const lastPositions = byteOffset * 4n * 3n + byteSize * 4n * 3n - 1n;
                    const headersPositions = { Range: `bytes=${firstPositions}-${lastPositions}` };
                    const responsePositions = await fetch(urlPositions, { headers: headersPositions });
                    const bufferPositions = await responsePositions.arrayBuffer();
                    const firstColors = byteOffset * 4n;
                    const lastColors = byteOffset * 4n + byteSize * 4n - 1n;
                    const headersColors = { Range: `bytes=${firstColors}-${lastColors}` };
                    const responseColors = await fetch(urlColors, { headers: headersColors });
                    const bufferColors = await responseColors.arrayBuffer();
                    buffer = appendBuffer(bufferPositions, bufferColors);
                }
            }
            else {
                const urlOctree = await this.getUrl(this.octreePath);
                const first = byteOffset;
                const last = byteOffset + byteSize - BigInt(1);
                if (byteSize === BigInt(0)) {
                    buffer = new ArrayBuffer(0);
                    console.warn(`loaded node with 0 bytes: ${node.name}`);
                }
                else {
                    const headers = { Range: `bytes=${first}-${last}` };
                    const response = await fetch(urlOctree, { headers });
                    buffer = await response.arrayBuffer();
                }
            }
            const workerType = this.metadata.encoding === 'GLTF'
                ? WorkerType.DECODER_WORKER_GLTF
                : WorkerType.DECODER_WORKER;
            const worker = this.workerPool.getWorker(workerType);
            worker.onmessage = e => {
                const data = e.data;
                const buffers = data.attributeBuffers;
                this.workerPool.returnWorker(workerType, worker);
                const geometry = new BufferGeometry();
                for (const property in buffers) {
                    const buffer = buffers[property].buffer;
                    if (property === 'position') {
                        geometry.setAttribute('position', new BufferAttribute(new Float32Array(buffer), 3));
                    }
                    else if (property === 'rgba') {
                        geometry.setAttribute('rgba', new BufferAttribute(new Uint8Array(buffer), 4, true));
                    }
                    else if (property === 'NORMAL') {
                        geometry.setAttribute('normal', new BufferAttribute(new Float32Array(buffer), 3));
                    }
                    else if (property === 'INDICES') {
                        const bufferAttribute = new BufferAttribute(new Uint8Array(buffer), 4);
                        bufferAttribute.normalized = true;
                        geometry.setAttribute('indices', bufferAttribute);
                    }
                    else {
                        const bufferAttribute = new BufferAttribute(new Float32Array(buffer), 1);
                        const batchAttribute = buffers[property].attribute;
                        bufferAttribute.potree = {
                            offset: buffers[property].offset,
                            scale: buffers[property].scale,
                            preciseBuffer: buffers[property].preciseBuffer,
                            range: batchAttribute.range,
                        };
                        geometry.setAttribute(property, bufferAttribute);
                    }
                }
                node.density = data.density;
                node.geometry = geometry;
                node.loaded = true;
                node.loading = false;
                node.octreeGeometry.numNodesLoading--;
                node.octreeGeometry.needsUpdate = true;
                node.tightBoundingBox = this.getTightBoundingBox(data.tightBoundingBox);
            };
            const pointAttributes = node.octreeGeometry.pointAttributes;
            const scale = node.octreeGeometry.scale;
            const box = node.boundingBox;
            const min = node.octreeGeometry.offset.clone().add(box.min);
            const size = box.max.clone().sub(box.min);
            const max = min.clone().add(size);
            const numPoints = node.numPoints;
            const offset = node.octreeGeometry.loader.offset;
            const message = {
                name: node.name,
                buffer: buffer,
                pointAttributes: pointAttributes,
                scale: scale,
                min: min,
                max: max,
                size: size,
                offset: offset,
                numPoints: numPoints,
            };
            worker.postMessage(message, [message.buffer]);
        }
        catch (e) {
            node.loaded = false;
            node.loading = false;
            node.octreeGeometry.numNodesLoading--;
        }
    }
    parseHierarchy(node, buffer) {
        const view = new DataView(buffer);
        const bytesPerNode = 22;
        const numNodes = buffer.byteLength / bytesPerNode;
        const octree = node.octreeGeometry;
        const nodes = new Array(numNodes);
        nodes[0] = node;
        let nodePos = 1;
        for (let i = 0; i < numNodes; i++) {
            const current = nodes[i];
            const type = view.getUint8(i * bytesPerNode + 0);
            const childMask = view.getUint8(i * bytesPerNode + 1);
            const numPoints = view.getUint32(i * bytesPerNode + 2, true);
            const byteOffset = view.getBigInt64(i * bytesPerNode + 6, true);
            const byteSize = view.getBigInt64(i * bytesPerNode + 14, true);
            if (current.nodeType === 2) {
                // replace proxy with real node
                current.byteOffset = byteOffset;
                current.byteSize = byteSize;
                current.numPoints = numPoints;
            }
            else if (type === 2) {
                // load proxy
                current.hierarchyByteOffset = byteOffset;
                current.hierarchyByteSize = byteSize;
                current.numPoints = numPoints;
            }
            else {
                // load real node
                current.byteOffset = byteOffset;
                current.byteSize = byteSize;
                current.numPoints = numPoints;
            }
            current.nodeType = type;
            if (current.nodeType === 2) {
                continue;
            }
            for (let childIndex = 0; childIndex < 8; childIndex++) {
                const childExists = ((1 << childIndex) & childMask) !== 0;
                if (!childExists) {
                    continue;
                }
                const childName = current.name + childIndex;
                const childAABB = createChildAABB(current.boundingBox, childIndex);
                const child = new OctreeGeometryNode(childName, octree, childAABB);
                child.name = childName;
                child.spacing = current.spacing / 2;
                child.level = current.level + 1;
                current.children[childIndex] = child;
                child.parent = current;
                nodes[nodePos] = child;
                nodePos++;
            }
        }
    }
    async loadHierarchy(node) {
        const { hierarchyByteOffset, hierarchyByteSize } = node;
        if (hierarchyByteOffset === undefined || hierarchyByteSize === undefined) {
            throw new Error(`hierarchyByteOffset and hierarchyByteSize are undefined for node ${node.name}`);
        }
        const hierarchyUrl = await this.getUrl(this.hierarchyPath);
        const first = hierarchyByteOffset;
        const last = first + hierarchyByteSize - BigInt(1);
        const headers = { Range: `bytes=${first}-${last}` };
        const response = await fetch(hierarchyUrl, { headers });
        const buffer = await response.arrayBuffer();
        this.parseHierarchy(node, buffer);
    }
    getTightBoundingBox({ min, max }) {
        const box = new Box3(new Vector3().fromArray(min), new Vector3().fromArray(max));
        box.max.sub(box.min);
        box.min.set(0, 0, 0);
        return box;
    }
}
const tmpVec3 = new Vector3();
function createChildAABB(aabb, index) {
    const min = aabb.min.clone();
    const max = aabb.max.clone();
    const size = tmpVec3.subVectors(max, min);
    if ((index & 0b0001) > 0) {
        min.z += size.z / 2;
    }
    else {
        max.z -= size.z / 2;
    }
    if ((index & 0b0010) > 0) {
        min.y += size.y / 2;
    }
    else {
        max.y -= size.y / 2;
    }
    if ((index & 0b0100) > 0) {
        min.x += size.x / 2;
    }
    else {
        max.x -= size.x / 2;
    }
    return new Box3(min, max);
}
function appendBuffer(buffer1, buffer2) {
    const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
}
const typenameTypeattributeMap = {
    double: PointAttributeTypes.DATA_TYPE_DOUBLE,
    float: PointAttributeTypes.DATA_TYPE_FLOAT,
    int8: PointAttributeTypes.DATA_TYPE_INT8,
    uint8: PointAttributeTypes.DATA_TYPE_UINT8,
    int16: PointAttributeTypes.DATA_TYPE_INT16,
    uint16: PointAttributeTypes.DATA_TYPE_UINT16,
    int32: PointAttributeTypes.DATA_TYPE_INT32,
    uint32: PointAttributeTypes.DATA_TYPE_UINT32,
    int64: PointAttributeTypes.DATA_TYPE_INT64,
    uint64: PointAttributeTypes.DATA_TYPE_UINT64,
};
class OctreeLoader {
    constructor(getUrl, url) {
        this.workerPool = new WorkerPool();
        this.basePath = '';
        this.hierarchyPath = '';
        this.octreePath = '';
        this.gltfColorsPath = '';
        this.gltfPositionsPath = '';
        this.getUrl = getUrl;
        this.basePath = extractBasePath(url);
        this.hierarchyPath = buildUrl(this.basePath, HIERARCHY_FILE);
        this.octreePath = buildUrl(this.basePath, OCTREE_FILE);
        // We default to the known naming convention for glTF datasets
        this.gltfColorsPath = buildUrl(this.basePath, GLTF_COLORS_FILE);
        this.gltfPositionsPath = buildUrl(this.basePath, GLTF_POSITIONS_FILE);
    }
    static parseAttributes(jsonAttributes) {
        const attributes = new PointAttributes$1();
        const replacements = { rgb: 'rgba' };
        for (const jsonAttribute of jsonAttributes) {
            const { name, numElements, min, max, bufferView } = jsonAttribute;
            const type = typenameTypeattributeMap[jsonAttribute.type];
            const potreeAttributeName = replacements[name] ? replacements[name] : name;
            const attribute = new PointAttribute(potreeAttributeName, type, numElements);
            if (bufferView) {
                attribute.uri = bufferView.uri;
            }
            if (numElements === 1 && min && max) {
                attribute.range = [min[0], max[0]];
            }
            else {
                attribute.range = [min, max];
            }
            if (name === 'gps-time') {
                // HACK: Guard against bad gpsTime range in metadata, see potree/potree#909
                if (typeof attribute.range[0] === 'number' && attribute.range[0] === attribute.range[1]) {
                    attribute.range[1] += 1;
                }
            }
            attribute.initialRange = attribute.range;
            attributes.add(attribute);
        }
        {
            const hasNormals = attributes.attributes.find(a => a.name === 'NormalX') !== undefined &&
                attributes.attributes.find(a => a.name === 'NormalY') !== undefined &&
                attributes.attributes.find(a => a.name === 'NormalZ') !== undefined;
            if (hasNormals) {
                const vector = {
                    name: 'NORMAL',
                    attributes: ['NormalX', 'NormalY', 'NormalZ'],
                };
                attributes.addVector(vector);
            }
        }
        return attributes;
    }
    async load(url, xhrRequest) {
        const metadata = await this.fetchMetadata(url, xhrRequest);
        const attributes = OctreeLoader.parseAttributes(metadata.attributes);
        this.applyCustomBufferURI(metadata.encoding, attributes);
        const loader = this.createLoader(url, metadata, attributes);
        const boundingBox = this.createBoundingBox(metadata);
        const offset = this.getOffset(boundingBox);
        const octree = this.initializeOctree(loader, url, metadata, boundingBox, offset, attributes);
        const root = this.initializeRootNode(octree, boundingBox, metadata);
        octree.root = root;
        loader.load(root);
        return { geometry: octree };
    }
    async fetchMetadata(url, xhrRequest) {
        const response = await xhrRequest(url);
        return response.json();
    }
    applyCustomBufferURI(encoding, attributes) {
        // Only datasets with GLTF encoding support custom buffer URIs -
        // as opposed to datasets with DEFAULT encoding coming from PotreeConverter
        if (encoding === 'GLTF') {
            this.gltfPositionsPath = attributes.getAttribute('position')?.uri ?? this.gltfPositionsPath;
            this.gltfColorsPath = attributes.getAttribute('rgba')?.uri ?? this.gltfColorsPath;
        }
    }
    createLoader(url, metadata, attributes) {
        const loader = new NodeLoader(this.getUrl, url, this.workerPool, metadata);
        loader.attributes = attributes;
        loader.scale = metadata.scale;
        loader.offset = metadata.offset;
        loader.hierarchyPath = this.hierarchyPath;
        loader.octreePath = this.octreePath;
        loader.gltfColorsPath = this.gltfColorsPath;
        loader.gltfPositionsPath = this.gltfPositionsPath;
        return loader;
    }
    createBoundingBox(metadata) {
        const min = new Vector3(...metadata.boundingBox.min);
        const max = new Vector3(...metadata.boundingBox.max);
        const boundingBox = new Box3(min, max);
        return boundingBox;
    }
    getOffset(boundingBox) {
        const offset = boundingBox.min.clone();
        boundingBox.min.sub(offset);
        boundingBox.max.sub(offset);
        return offset;
    }
    initializeOctree(loader, url, metadata, boundingBox, offset, attributes) {
        const octree = new OctreeGeometry(loader, boundingBox);
        octree.url = url;
        octree.spacing = metadata.spacing;
        octree.scale = metadata.scale;
        octree.projection = metadata.projection;
        octree.boundingBox = boundingBox;
        octree.boundingSphere = boundingBox.getBoundingSphere(new Sphere());
        octree.tightBoundingSphere = boundingBox.getBoundingSphere(new Sphere());
        octree.tightBoundingBox = this.getTightBoundingBox(metadata);
        octree.offset = offset;
        octree.pointAttributes = attributes;
        return octree;
    }
    initializeRootNode(octree, boundingBox, metadata) {
        const root = new OctreeGeometryNode('r', octree, boundingBox);
        root.level = 0;
        root.nodeType = 2;
        root.hierarchyByteOffset = BigInt(0);
        root.hierarchyByteSize = BigInt(metadata.hierarchy.firstChunkSize);
        root.spacing = octree.spacing;
        root.byteOffset = BigInt(0);
        return root;
    }
    getTightBoundingBox(metadata) {
        const positionAttribute = metadata.attributes.find(attr => attr.name === 'position');
        if (!positionAttribute || !positionAttribute.min || !positionAttribute.max) {
            console.warn('Position attribute (min, max) not found. Falling back to boundingBox for tightBoundingBox');
            return new Box3(new Vector3(...metadata.boundingBox.min), new Vector3(...metadata.boundingBox.max));
        }
        const offset = metadata.boundingBox.min;
        const tightBoundingBox = new Box3(new Vector3(positionAttribute.min[0] - offset[0], positionAttribute.min[1] - offset[1], positionAttribute.min[2] - offset[2]), new Vector3(positionAttribute.max[0] - offset[0], positionAttribute.max[1] - offset[1], positionAttribute.max[2] - offset[2]));
        return tightBoundingBox;
    }
}

async function loadOctree(url, getUrl, xhrRequest) {
    const trueUrl = await getUrl(url);
    const loader = new OctreeLoader(getUrl, url);
    const { geometry } = await loader.load(trueUrl, xhrRequest);
    return geometry;
}

function isGeometryNode(node) {
    return node !== undefined && node !== null && node.isGeometryNode;
}
function isTreeNode(node) {
    return node !== undefined && node !== null && node.isTreeNode;
}

/**
 * from: http://eloquentjavascript.net/1st_edition/appendix2.html
 *
 */

function BinaryHeap(scoreFunction) {
  this.content = [];
  this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
  push: function(element) {
    // Add the new element to the end of the array.
    this.content.push(element);
    // Allow it to bubble up.
    this.bubbleUp(this.content.length - 1);
  },

  pop: function() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it sink down.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }
    return result;
  },

  remove: function(node) {
    var length = this.content.length;
    // To remove a value, we must search through the array to find
    // it.
    for (var i = 0; i < length; i++) {
      if (this.content[i] != node) continue;
      // When it is found, the process seen in 'pop' is repeated
      // to fill up the hole.
      var end = this.content.pop();
      // If the element we popped was the one we needed to remove,
      // we're done.
      if (i == length - 1) break;
      // Otherwise, we replace the removed element with the popped
      // one, and allow it to float up or sink down as appropriate.
      this.content[i] = end;
      this.bubbleUp(i);
      this.sinkDown(i);
      break;
    }
  },

  size: function() {
    return this.content.length;
  },

  bubbleUp: function(n) {
    // Fetch the element that has to be moved.
    var element = this.content[n],
      score = this.scoreFunction(element);
    // When at 0, an element can not go up any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      var parentN = Math.floor((n + 1) / 2) - 1,
        parent = this.content[parentN];
      // If the parent has a lesser score, things are in order and we
      // are done.
      if (score >= this.scoreFunction(parent)) break;

      // Otherwise, swap the parent with the current element and
      // continue.
      this.content[parentN] = element;
      this.content[n] = parent;
      n = parentN;
    }
  },

  sinkDown: function(n) {
    // Look up the target element and its score.
    var length = this.content.length,
      element = this.content[n],
      elemScore = this.scoreFunction(element);

    while (true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) * 2,
        child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      var swap = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N],
          child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore) swap = child1N;
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N],
          child2Score = this.scoreFunction(child2);
        if (child2Score < (swap == null ? elemScore : child1Score)) swap = child2N;
      }

      // No need to swap further, we are done.
      if (swap == null) break;

      // Otherwise, swap and continue.
      this.content[n] = this.content[swap];
      this.content[swap] = element;
      n = swap;
    }
  },
};

/**
 *
 * code adapted from three.js BoxHelper.js
 * https://github.com/mrdoob/three.js/blob/dev/src/helpers/BoxHelper.js
 *
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / http://github.com/Mugen87
 * @author mschuetz / http://potree.org
 */
class Box3Helper extends LineSegments {
    constructor(box, color = new Color(0xffff00)) {
        // prettier-ignore
        const indices = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]);
        // prettier-ignore
        const positions = new Float32Array([
            box.min.x, box.min.y, box.min.z,
            box.max.x, box.min.y, box.min.z,
            box.max.x, box.min.y, box.max.z,
            box.min.x, box.min.y, box.max.z,
            box.min.x, box.max.y, box.min.z,
            box.max.x, box.max.y, box.min.z,
            box.max.x, box.max.y, box.max.z,
            box.min.x, box.max.y, box.max.z
        ]);
        const geometry = new BufferGeometry();
        geometry.setIndex(new BufferAttribute(indices, 1));
        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        const material = new LineBasicMaterial({ color: color });
        super(geometry, material);
    }
}

class LRUItem {
    constructor(node) {
        this.node = node;
        this.next = null;
        this.previous = null;
    }
}
/**
 * A doubly-linked-list of the least recently used elements.
 */
class LRU {
    constructor(pointBudget = 1000000) {
        this.pointBudget = pointBudget;
        // the least recently used item
        this.first = null;
        // the most recently used item
        this.last = null;
        this.numPoints = 0;
        this.items = new Map();
    }
    get size() {
        return this.items.size;
    }
    has(node) {
        return this.items.has(node.id);
    }
    /**
     * Makes the specified the most recently used item. if the list does not contain node, it will
     * be added.
     */
    touch(node) {
        if (!node.loaded) {
            return;
        }
        const item = this.items.get(node.id);
        if (item) {
            this.touchExisting(item);
        }
        else {
            this.addNew(node);
        }
    }
    addNew(node) {
        const item = new LRUItem(node);
        item.previous = this.last;
        this.last = item;
        if (item.previous) {
            item.previous.next = item;
        }
        if (!this.first) {
            this.first = item;
        }
        this.items.set(node.id, item);
        this.numPoints += node.numPoints;
    }
    touchExisting(item) {
        if (!item.previous) {
            // handle touch on first element
            if (item.next) {
                this.first = item.next;
                this.first.previous = null;
                item.previous = this.last;
                item.next = null;
                this.last = item;
                if (item.previous) {
                    item.previous.next = item;
                }
            }
        }
        else if (!item.next) ;
        else {
            // handle touch on any other element
            item.previous.next = item.next;
            item.next.previous = item.previous;
            item.previous = this.last;
            item.next = null;
            this.last = item;
            if (item.previous) {
                item.previous.next = item;
            }
        }
    }
    remove(node) {
        const item = this.items.get(node.id);
        if (!item) {
            return;
        }
        if (this.items.size === 1) {
            this.first = null;
            this.last = null;
        }
        else {
            if (!item.previous) {
                this.first = item.next;
                this.first.previous = null;
            }
            if (!item.next) {
                this.last = item.previous;
                this.last.next = null;
            }
            if (item.previous && item.next) {
                item.previous.next = item.next;
                item.next.previous = item.previous;
            }
        }
        this.items.delete(node.id);
        this.numPoints -= node.numPoints;
    }
    getLRUItem() {
        return this.first ? this.first.node : undefined;
    }
    freeMemory() {
        if (this.items.size <= 1) {
            return;
        }
        while (this.numPoints > this.pointBudget * 2) {
            const node = this.getLRUItem();
            if (node) {
                this.disposeSubtree(node);
            }
        }
    }
    disposeSubtree(node) {
        // Collect all the nodes which are to be disposed and removed.
        const nodesToDispose = [node];
        node.traverse(n => {
            if (n.loaded) {
                nodesToDispose.push(n);
            }
        });
        // Dispose of all the nodes in one go.
        for (const n of nodesToDispose) {
            n.dispose();
            this.remove(n);
        }
    }
}

class QueueItem {
    constructor(pointCloudIndex, weight, node, parent) {
        this.pointCloudIndex = pointCloudIndex;
        this.weight = weight;
        this.node = node;
        this.parent = parent;
    }
}
const GEOMETRY_LOADERS = {
    v1: loadPOC,
    v2: loadOctree,
};
class Potree {
    constructor(version = 'v1') {
        this._pointBudget = DEFAULT_POINT_BUDGET;
        this._rendererSize = new Vector2();
        this.maxNumNodesLoading = MAX_NUM_NODES_LOADING;
        this.features = FEATURES;
        this.lru = new LRU(this._pointBudget);
        this.updateVisibilityStructures = (() => {
            const frustumMatrix = new Matrix4();
            const inverseWorldMatrix = new Matrix4();
            const cameraMatrix = new Matrix4();
            return (pointClouds, camera) => {
                const frustums = [];
                const cameraPositions = [];
                const priorityQueue = new BinaryHeap((x) => 1 / x.weight);
                for (let i = 0; i < pointClouds.length; i++) {
                    const pointCloud = pointClouds[i];
                    if (!pointCloud.initialized()) {
                        continue;
                    }
                    pointCloud.numVisiblePoints = 0;
                    pointCloud.visibleNodes = [];
                    pointCloud.visibleGeometry = [];
                    camera.updateMatrixWorld(false);
                    // Furstum in object space.
                    const inverseViewMatrix = camera.matrixWorldInverse;
                    const worldMatrix = pointCloud.matrixWorld;
                    frustumMatrix.identity().multiply(camera.projectionMatrix).multiply(inverseViewMatrix).multiply(worldMatrix);
                    frustums.push(new Frustum().setFromProjectionMatrix(frustumMatrix));
                    // Camera position in object space
                    inverseWorldMatrix.copy(worldMatrix).invert();
                    cameraMatrix.identity().multiply(inverseWorldMatrix).multiply(camera.matrixWorld);
                    cameraPositions.push(new Vector3().setFromMatrixPosition(cameraMatrix));
                    if (pointCloud.visible && pointCloud.root !== null) {
                        const weight = Number.MAX_VALUE;
                        priorityQueue.push(new QueueItem(i, weight, pointCloud.root));
                    }
                    // Hide any previously visible nodes. We will later show only the needed ones.
                    if (isTreeNode(pointCloud.root)) {
                        pointCloud.hideDescendants(pointCloud.root.sceneNode);
                    }
                    for (const boundingBoxNode of pointCloud.boundingBoxNodes) {
                        boundingBoxNode.visible = false;
                    }
                }
                return { frustums, cameraPositions, priorityQueue };
            };
        })();
        this.loadGeometry = GEOMETRY_LOADERS[version];
    }
    loadPointCloud(url, getUrl, xhrRequest = (input, init) => fetch(input, init)) {
        return this.loadGeometry(url, getUrl, xhrRequest).then((geometry) => new PointCloudOctree(this, geometry));
    }
    updatePointClouds(pointClouds, camera, renderer) {
        const result = this.updateVisibility(pointClouds, camera, renderer);
        for (let i = 0; i < pointClouds.length; i++) {
            const pointCloud = pointClouds[i];
            if (pointCloud.disposed) {
                continue;
            }
            pointCloud.material.updateMaterial(pointCloud, pointCloud.visibleNodes, camera, renderer);
            pointCloud.updateVisibleBounds();
            pointCloud.updateBoundingBoxes();
        }
        this.lru.freeMemory();
        return result;
    }
    static pick(pointClouds, renderer, camera, ray, params = {}) {
        Potree.picker = Potree.picker || new PointCloudOctreePicker();
        return Potree.picker.pick(renderer, camera, ray, pointClouds, params);
    }
    get pointBudget() {
        return this._pointBudget;
    }
    set pointBudget(value) {
        if (value !== this._pointBudget) {
            this._pointBudget = value;
            this.lru.pointBudget = value;
            this.lru.freeMemory();
        }
    }
    static set maxLoaderWorkers(value) {
        BinaryLoader.WORKER_POOL.maxWorkers = value;
    }
    static get maxLoaderWorkers() {
        return BinaryLoader.WORKER_POOL.maxWorkers;
    }
    updateVisibility(pointClouds, camera, renderer) {
        let numVisiblePoints = 0;
        const visibleNodes = [];
        const unloadedGeometry = [];
        // calculate object space frustum and cam pos and setup priority queue
        const { frustums, cameraPositions, priorityQueue } = this.updateVisibilityStructures(pointClouds, camera);
        let loadedToGPUThisFrame = 0;
        let exceededMaxLoadsToGPU = false;
        let nodeLoadFailed = false;
        let queueItem;
        while ((queueItem = priorityQueue.pop()) !== undefined) {
            let node = queueItem.node;
            // If we will end up with too many points, we stop right away.
            if (numVisiblePoints + node.numPoints > this.pointBudget) {
                break;
            }
            const pointCloudIndex = queueItem.pointCloudIndex;
            const pointCloud = pointClouds[pointCloudIndex];
            const maxLevel = pointCloud.maxLevel !== undefined ? pointCloud.maxLevel : Infinity;
            if (node.level > maxLevel ||
                !frustums[pointCloudIndex].intersectsBox(node.boundingBox) ||
                this.shouldClip(pointCloud, node.boundingBox)) {
                continue;
            }
            numVisiblePoints += node.numPoints;
            pointCloud.numVisiblePoints += node.numPoints;
            const parentNode = queueItem.parent;
            if (isGeometryNode(node) && (!parentNode || isTreeNode(parentNode))) {
                if (node.loaded && loadedToGPUThisFrame < MAX_LOADS_TO_GPU) {
                    node = pointCloud.toTreeNode(node, parentNode);
                    loadedToGPUThisFrame++;
                }
                else if (!node.failed) {
                    if (node.loaded && loadedToGPUThisFrame >= MAX_LOADS_TO_GPU) {
                        exceededMaxLoadsToGPU = true;
                    }
                    unloadedGeometry.push(node);
                    pointCloud.visibleGeometry.push(node);
                }
                else {
                    nodeLoadFailed = true;
                    continue;
                }
            }
            if (isTreeNode(node)) {
                this.updateTreeNodeVisibility(pointCloud, node, visibleNodes);
                pointCloud.visibleGeometry.push(node.geometryNode);
            }
            const halfHeight = 0.5 * renderer.getSize(this._rendererSize).height * renderer.getPixelRatio();
            this.updateChildVisibility(queueItem, priorityQueue, pointCloud, node, cameraPositions[pointCloudIndex], camera, halfHeight);
        } // end priority queue loop
        const numNodesToLoad = Math.min(this.maxNumNodesLoading, unloadedGeometry.length);
        const nodeLoadPromises = [];
        for (let i = 0; i < numNodesToLoad; i++) {
            nodeLoadPromises.push(unloadedGeometry[i].load());
        }
        return {
            visibleNodes: visibleNodes,
            numVisiblePoints: numVisiblePoints,
            exceededMaxLoadsToGPU: exceededMaxLoadsToGPU,
            nodeLoadFailed: nodeLoadFailed,
            nodeLoadPromises: nodeLoadPromises,
        };
    }
    updateTreeNodeVisibility(pointCloud, node, visibleNodes) {
        this.lru.touch(node.geometryNode);
        const sceneNode = node.sceneNode;
        sceneNode.visible = true;
        sceneNode.material = pointCloud.material;
        sceneNode.updateMatrix();
        sceneNode.matrixWorld.multiplyMatrices(pointCloud.matrixWorld, sceneNode.matrix);
        visibleNodes.push(node);
        pointCloud.visibleNodes.push(node);
        this.updateBoundingBoxVisibility(pointCloud, node);
    }
    updateChildVisibility(queueItem, priorityQueue, pointCloud, node, cameraPosition, camera, halfHeight) {
        const children = node.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child === null) {
                continue;
            }
            const sphere = child.boundingSphere;
            const distance = sphere.center.distanceTo(cameraPosition);
            const radius = sphere.radius;
            let projectionFactor = 0.0;
            if (camera.type === PERSPECTIVE_CAMERA) {
                const perspective = camera;
                const fov = (perspective.fov * Math.PI) / 180.0;
                const slope = Math.tan(fov / 2.0);
                projectionFactor = halfHeight / (slope * distance);
            }
            else {
                const orthographic = camera;
                projectionFactor = (2 * halfHeight) / (orthographic.top - orthographic.bottom);
            }
            const screenPixelRadius = radius * projectionFactor;
            // Don't add the node if it'll be too small on the screen.
            if (screenPixelRadius < pointCloud.minNodePixelSize) {
                continue;
            }
            // Nodes which are larger will have priority in loading/displaying.
            const weight = distance < radius ? Number.MAX_VALUE : screenPixelRadius + 1 / distance;
            priorityQueue.push(new QueueItem(queueItem.pointCloudIndex, weight, child, node));
        }
    }
    updateBoundingBoxVisibility(pointCloud, node) {
        if (pointCloud.showBoundingBox && !node.boundingBoxNode) {
            const boxHelper = new Box3Helper(node.boundingBox);
            boxHelper.matrixAutoUpdate = false;
            pointCloud.boundingBoxNodes.push(boxHelper);
            node.boundingBoxNode = boxHelper;
            node.boundingBoxNode.matrix.copy(pointCloud.matrixWorld);
        }
        else if (pointCloud.showBoundingBox && node.boundingBoxNode) {
            node.boundingBoxNode.visible = true;
            node.boundingBoxNode.matrix.copy(pointCloud.matrixWorld);
        }
        else if (!pointCloud.showBoundingBox && node.boundingBoxNode) {
            node.boundingBoxNode.visible = false;
        }
    }
    shouldClip(pointCloud, boundingBox) {
        const material = pointCloud.material;
        if (material.numClipBoxes === 0 || material.clipMode !== ClipMode.CLIP_OUTSIDE) {
            return false;
        }
        const box2 = boundingBox.clone();
        pointCloud.updateMatrixWorld(true);
        box2.applyMatrix4(pointCloud.matrixWorld);
        const clipBoxes = material.clipBoxes;
        for (let i = 0; i < clipBoxes.length; i++) {
            const clipMatrixWorld = clipBoxes[i].matrix;
            const clipBoxWorld = new Box3(new Vector3(-0.5, -0.5, -0.5), new Vector3(0.5, 0.5, 0.5)).applyMatrix4(clipMatrixWorld);
            if (box2.intersectsBox(clipBoxWorld)) {
                return false;
            }
        }
        return true;
    }
}

export { BlurMaterial, ClipMode, GRAYSCALE, INFERNO, NormalFilteringMode, PLASMA, PointAttributeName, PointAttributes, PointCloudMaterial, PointCloudMixingMode, PointCloudOctree, PointCloudOctreeGeometry, PointCloudOctreeGeometryNode, PointCloudOctreeNode, PointCloudOctreePicker, PointCloudTree, PointColorType, PointOpacityType, PointShape, PointSizeType, Potree, QueueItem, RAINBOW, SPECTRAL, TreeType, loadPOC as V1_LOADER, loadOctree as V2_LOADER, VIRIDIS, Version, YELLOW_GREEN, generateClassificationTexture, generateDataTexture, generateGradientTexture };
//# sourceMappingURL=index.js.map
