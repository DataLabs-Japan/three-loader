import { V as Version, a as PointAttributeName, c as POINT_ATTRIBUTES } from './version-DabiREzy.js';

/**
 * Adapted from Potree.js http://potree.org
 * Potree License: https://github.com/potree/potree/blob/1.5/LICENSE
 */
// http://jsperf.com/uint8array-vs-dataview3/3
// tslint:disable:no-bitwise
class CustomArrayView {
    constructor(buffer) {
        this.tmp = new ArrayBuffer(4);
        this.tmpf = new Float32Array(this.tmp);
        this.tmpu8 = new Uint8Array(this.tmp);
        this.u8 = new Uint8Array(buffer);
    }
    getUint32(i) {
        return (this.u8[i + 3] << 24) | (this.u8[i + 2] << 16) | (this.u8[i + 1] << 8) | this.u8[i];
    }
    getUint16(i) {
        return (this.u8[i + 1] << 8) | this.u8[i];
    }
    getFloat32(i) {
        const tmpu8 = this.tmpu8;
        const u8 = this.u8;
        const tmpf = this.tmpf;
        tmpu8[0] = u8[i + 0];
        tmpu8[1] = u8[i + 1];
        tmpu8[2] = u8[i + 2];
        tmpu8[3] = u8[i + 3];
        return tmpf[0];
    }
    getUint8(i) {
        return this.u8[i];
    }
}
// tslint:enable:no-bitwise

/**
 * Adapted from Potree.js http://potree.org
 * Potree License: https://github.com/potree/potree/blob/1.5/LICENSE
 */
// IE11 does not have Math.sign(), this has been adapted from CoreJS es6.math.sign.js for TypeScript
const mathSign = Math.sign ||
    function (x) {
        // tslint:disable-next-line:triple-equals
        return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
    };
function handleMessage(event) {
    const buffer = event.data.buffer;
    const pointAttributes = event.data.pointAttributes;
    if (!buffer) {
        return;
    }
    const ctx = {
        attributeBuffers: {},
        currentOffset: 0,
        data: new CustomArrayView(buffer),
        mean: [0, 0, 0],
        nodeOffset: event.data.offset,
        numPoints: event.data.buffer.byteLength / pointAttributes.byteSize,
        pointAttributes,
        scale: event.data.scale,
        tightBoxMax: [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
        tightBoxMin: [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
        transferables: [],
        version: new Version(event.data.version),
    };
    for (const pointAttribute of ctx.pointAttributes.attributes) {
        decodeAndAddAttribute(pointAttribute, ctx);
        ctx.currentOffset += pointAttribute.byteSize;
    }
    const indices = new ArrayBuffer(ctx.numPoints * 4);
    const iIndices = new Uint32Array(indices);
    for (let i = 0; i < ctx.numPoints; i++) {
        iIndices[i] = i;
    }
    if (!ctx.attributeBuffers[PointAttributeName.CLASSIFICATION]) {
        addEmptyClassificationBuffer(ctx);
    }
    const message = {
        buffer: buffer,
        mean: ctx.mean,
        attributeBuffers: ctx.attributeBuffers,
        tightBoundingBox: { min: ctx.tightBoxMin, max: ctx.tightBoxMax },
        indices,
    };
    postMessage(message, ctx.transferables);
}
function addEmptyClassificationBuffer(ctx) {
    const buffer = new ArrayBuffer(ctx.numPoints * 4);
    const classifications = new Float32Array(buffer);
    for (let i = 0; i < ctx.numPoints; i++) {
        classifications[i] = 0;
    }
    ctx.attributeBuffers[PointAttributeName.CLASSIFICATION] = {
        buffer,
        attribute: POINT_ATTRIBUTES.CLASSIFICATION,
    };
}
function decodeAndAddAttribute(attribute, ctx) {
    const decodedAttribute = decodePointAttribute(attribute, ctx);
    if (decodedAttribute === undefined) {
        return;
    }
    ctx.attributeBuffers[decodedAttribute.attribute.name] = decodedAttribute;
    ctx.transferables.push(decodedAttribute.buffer);
}
function decodePointAttribute(attribute, ctx) {
    switch (attribute.name) {
        case PointAttributeName.POSITION_CARTESIAN:
            return decodePositionCartesian(attribute, ctx);
        case PointAttributeName.COLOR_PACKED:
            return decodeColor(attribute, ctx);
        case PointAttributeName.INTENSITY:
            return decodeIntensity(attribute, ctx);
        case PointAttributeName.CLASSIFICATION:
            return decodeClassification(attribute, ctx);
        case PointAttributeName.NORMAL_SPHEREMAPPED:
            return decodeNormalSphereMapped(attribute, ctx);
        case PointAttributeName.NORMAL_OCT16:
            return decodeNormalOct16(attribute, ctx);
        case PointAttributeName.NORMAL:
            return decodeNormal(attribute, ctx);
        default:
            return undefined;
    }
}
function decodePositionCartesian(attribute, ctx) {
    const buffer = new ArrayBuffer(ctx.numPoints * 4 * 3);
    const positions = new Float32Array(buffer);
    for (let i = 0; i < ctx.numPoints; i++) {
        let x;
        let y;
        let z;
        if (ctx.version.newerThan('1.3')) {
            x = ctx.data.getUint32(ctx.currentOffset + i * ctx.pointAttributes.byteSize + 0) * ctx.scale;
            y = ctx.data.getUint32(ctx.currentOffset + i * ctx.pointAttributes.byteSize + 4) * ctx.scale;
            z = ctx.data.getUint32(ctx.currentOffset + i * ctx.pointAttributes.byteSize + 8) * ctx.scale;
        }
        else {
            x = ctx.data.getFloat32(i * ctx.pointAttributes.byteSize + 0) + ctx.nodeOffset[0];
            y = ctx.data.getFloat32(i * ctx.pointAttributes.byteSize + 4) + ctx.nodeOffset[1];
            z = ctx.data.getFloat32(i * ctx.pointAttributes.byteSize + 8) + ctx.nodeOffset[2];
        }
        positions[3 * i + 0] = x;
        positions[3 * i + 1] = y;
        positions[3 * i + 2] = z;
        ctx.mean[0] += x / ctx.numPoints;
        ctx.mean[1] += y / ctx.numPoints;
        ctx.mean[2] += z / ctx.numPoints;
        ctx.tightBoxMin[0] = Math.min(ctx.tightBoxMin[0], x);
        ctx.tightBoxMin[1] = Math.min(ctx.tightBoxMin[1], y);
        ctx.tightBoxMin[2] = Math.min(ctx.tightBoxMin[2], z);
        ctx.tightBoxMax[0] = Math.max(ctx.tightBoxMax[0], x);
        ctx.tightBoxMax[1] = Math.max(ctx.tightBoxMax[1], y);
        ctx.tightBoxMax[2] = Math.max(ctx.tightBoxMax[2], z);
    }
    return { buffer, attribute };
}
function decodeColor(attribute, ctx) {
    const buffer = new ArrayBuffer(ctx.numPoints * 3);
    const colors = new Uint8Array(buffer);
    for (let i = 0; i < ctx.numPoints; i++) {
        colors[3 * i + 0] = ctx.data.getUint8(ctx.currentOffset + i * ctx.pointAttributes.byteSize + 0);
        colors[3 * i + 1] = ctx.data.getUint8(ctx.currentOffset + i * ctx.pointAttributes.byteSize + 1);
        colors[3 * i + 2] = ctx.data.getUint8(ctx.currentOffset + i * ctx.pointAttributes.byteSize + 2);
    }
    return { buffer, attribute };
}
function decodeIntensity(attribute, ctx) {
    const buffer = new ArrayBuffer(ctx.numPoints * 4);
    const intensities = new Float32Array(buffer);
    for (let i = 0; i < ctx.numPoints; i++) {
        intensities[i] = ctx.data.getUint16(ctx.currentOffset + i * ctx.pointAttributes.byteSize);
    }
    return { buffer, attribute };
}
function decodeClassification(attribute, ctx) {
    const buffer = new ArrayBuffer(ctx.numPoints);
    const classifications = new Uint8Array(buffer);
    for (let j = 0; j < ctx.numPoints; j++) {
        classifications[j] = ctx.data.getUint8(ctx.currentOffset + j * ctx.pointAttributes.byteSize);
    }
    return { buffer, attribute };
}
function decodeNormalSphereMapped(attribute, ctx) {
    const buffer = new ArrayBuffer(ctx.numPoints * 4 * 3);
    const normals = new Float32Array(buffer);
    for (let j = 0; j < ctx.numPoints; j++) {
        const bx = ctx.data.getUint8(ctx.currentOffset + j * ctx.pointAttributes.byteSize + 0);
        const by = ctx.data.getUint8(ctx.currentOffset + j * ctx.pointAttributes.byteSize + 1);
        const ex = bx / 255;
        const ey = by / 255;
        let nx = ex * 2 - 1;
        let ny = ey * 2 - 1;
        let nz = 1;
        const l = nx * -nx + ny * -ny + nz * 1;
        nz = l;
        nx = nx * Math.sqrt(l);
        ny = ny * Math.sqrt(l);
        nx = nx * 2;
        ny = ny * 2;
        nz = nz * 2 - 1;
        normals[3 * j + 0] = nx;
        normals[3 * j + 1] = ny;
        normals[3 * j + 2] = nz;
    }
    return { buffer, attribute };
}
function decodeNormalOct16(attribute, ctx) {
    const buff = new ArrayBuffer(ctx.numPoints * 4 * 3);
    const normals = new Float32Array(buff);
    for (let j = 0; j < ctx.numPoints; j++) {
        const bx = ctx.data.getUint8(ctx.currentOffset + j * ctx.pointAttributes.byteSize + 0);
        const by = ctx.data.getUint8(ctx.currentOffset + j * ctx.pointAttributes.byteSize + 1);
        const u = (bx / 255) * 2 - 1;
        const v = (by / 255) * 2 - 1;
        let z = 1 - Math.abs(u) - Math.abs(v);
        let x = 0;
        let y = 0;
        if (z >= 0) {
            x = u;
            y = v;
        }
        else {
            x = -(v / mathSign(v) - 1) / mathSign(u);
            y = -(u / mathSign(u) - 1) / mathSign(v);
        }
        const length = Math.sqrt(x * x + y * y + z * z);
        x = x / length;
        y = y / length;
        z = z / length;
        normals[3 * j + 0] = x;
        normals[3 * j + 1] = y;
        normals[3 * j + 2] = z;
    }
    return { buffer: buff, attribute };
}
function decodeNormal(attribute, ctx) {
    const buffer = new ArrayBuffer(ctx.numPoints * 4 * 3);
    const normals = new Float32Array(buffer);
    for (let j = 0; j < ctx.numPoints; j++) {
        const x = ctx.data.getFloat32(ctx.currentOffset + j * ctx.pointAttributes.byteSize + 0);
        const y = ctx.data.getFloat32(ctx.currentOffset + j * ctx.pointAttributes.byteSize + 4);
        const z = ctx.data.getFloat32(ctx.currentOffset + j * ctx.pointAttributes.byteSize + 8);
        normals[3 * j + 0] = x;
        normals[3 * j + 1] = y;
        normals[3 * j + 2] = z;
    }
    return { buffer, attribute };
}

/*eslint-disable */
onmessage = handleMessage;
//# sourceMappingURL=binary-decoder.worker.js.map
