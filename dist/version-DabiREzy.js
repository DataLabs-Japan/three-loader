// -------------------------------------------------------------------------------------------------
// Converted to Typescript and adapted from https://github.com/potree/potree
// -------------------------------------------------------------------------------------------------
var PointAttributeName;
(function (PointAttributeName) {
    PointAttributeName[PointAttributeName["POSITION_CARTESIAN"] = 0] = "POSITION_CARTESIAN";
    PointAttributeName[PointAttributeName["COLOR_PACKED"] = 1] = "COLOR_PACKED";
    PointAttributeName[PointAttributeName["COLOR_FLOATS_1"] = 2] = "COLOR_FLOATS_1";
    PointAttributeName[PointAttributeName["COLOR_FLOATS_255"] = 3] = "COLOR_FLOATS_255";
    PointAttributeName[PointAttributeName["NORMAL_FLOATS"] = 4] = "NORMAL_FLOATS";
    PointAttributeName[PointAttributeName["FILLER"] = 5] = "FILLER";
    PointAttributeName[PointAttributeName["INTENSITY"] = 6] = "INTENSITY";
    PointAttributeName[PointAttributeName["CLASSIFICATION"] = 7] = "CLASSIFICATION";
    PointAttributeName[PointAttributeName["NORMAL_SPHEREMAPPED"] = 8] = "NORMAL_SPHEREMAPPED";
    PointAttributeName[PointAttributeName["NORMAL_OCT16"] = 9] = "NORMAL_OCT16";
    PointAttributeName[PointAttributeName["NORMAL"] = 10] = "NORMAL";
})(PointAttributeName || (PointAttributeName = {}));
const POINT_ATTRIBUTE_TYPES = {
    DATA_TYPE_FLOAT: { ordinal: 1, size: 4 },
    DATA_TYPE_INT8: { ordinal: 2, size: 1 },
    DATA_TYPE_UINT8: { ordinal: 3, size: 1 },
    DATA_TYPE_UINT16: { ordinal: 5, size: 2 }};
function makePointAttribute(name, type, numElements) {
    return {
        name,
        type,
        numElements,
        byteSize: numElements * type.size,
    };
}
const RGBA_PACKED = makePointAttribute(PointAttributeName.COLOR_PACKED, POINT_ATTRIBUTE_TYPES.DATA_TYPE_INT8, 4);
const POINT_ATTRIBUTES = {
    POSITION_CARTESIAN: makePointAttribute(PointAttributeName.POSITION_CARTESIAN, POINT_ATTRIBUTE_TYPES.DATA_TYPE_FLOAT, 3),
    RGBA_PACKED,
    COLOR_PACKED: RGBA_PACKED,
    RGB_PACKED: makePointAttribute(PointAttributeName.COLOR_PACKED, POINT_ATTRIBUTE_TYPES.DATA_TYPE_INT8, 3),
    NORMAL_FLOATS: makePointAttribute(PointAttributeName.NORMAL_FLOATS, POINT_ATTRIBUTE_TYPES.DATA_TYPE_FLOAT, 3),
    FILLER_1B: makePointAttribute(PointAttributeName.FILLER, POINT_ATTRIBUTE_TYPES.DATA_TYPE_UINT8, 1),
    INTENSITY: makePointAttribute(PointAttributeName.INTENSITY, POINT_ATTRIBUTE_TYPES.DATA_TYPE_UINT16, 1),
    CLASSIFICATION: makePointAttribute(PointAttributeName.CLASSIFICATION, POINT_ATTRIBUTE_TYPES.DATA_TYPE_UINT8, 1),
    NORMAL_SPHEREMAPPED: makePointAttribute(PointAttributeName.NORMAL_SPHEREMAPPED, POINT_ATTRIBUTE_TYPES.DATA_TYPE_UINT8, 2),
    NORMAL_OCT16: makePointAttribute(PointAttributeName.NORMAL_OCT16, POINT_ATTRIBUTE_TYPES.DATA_TYPE_UINT8, 2),
    NORMAL: makePointAttribute(PointAttributeName.NORMAL, POINT_ATTRIBUTE_TYPES.DATA_TYPE_FLOAT, 3),
};
class PointAttributes {
    constructor(pointAttributeNames = []) {
        this.attributes = [];
        this.byteSize = 0;
        this.size = 0;
        for (let i = 0; i < pointAttributeNames.length; i++) {
            const pointAttributeName = pointAttributeNames[i];
            const pointAttribute = POINT_ATTRIBUTES[pointAttributeName];
            this.attributes.push(pointAttribute);
            this.byteSize += pointAttribute.byteSize;
            this.size++;
        }
    }
    add(pointAttribute) {
        this.attributes.push(pointAttribute);
        this.byteSize += pointAttribute.byteSize;
        this.size++;
    }
    hasColors() {
        return this.attributes.find(isColorAttribute) !== undefined;
    }
    hasNormals() {
        return this.attributes.find(isNormalAttribute) !== undefined;
    }
}
function isColorAttribute({ name }) {
    return name === PointAttributeName.COLOR_PACKED;
}
function isNormalAttribute({ name }) {
    return (name === PointAttributeName.NORMAL_SPHEREMAPPED ||
        name === PointAttributeName.NORMAL_FLOATS ||
        name === PointAttributeName.NORMAL ||
        name === PointAttributeName.NORMAL_OCT16);
}

class Version {
    constructor(version) {
        this.versionMinor = 0;
        this.version = version;
        const vmLength = version.indexOf('.') === -1 ? version.length : version.indexOf('.');
        this.versionMajor = parseInt(version.substr(0, vmLength), 10);
        this.versionMinor = parseInt(version.substr(vmLength + 1), 10);
        if (isNaN(this.versionMinor)) {
            this.versionMinor = 0;
        }
    }
    newerThan(version) {
        const v = new Version(version);
        if (this.versionMajor > v.versionMajor) {
            return true;
        }
        else if (this.versionMajor === v.versionMajor && this.versionMinor > v.versionMinor) {
            return true;
        }
        else {
            return false;
        }
    }
    equalOrHigher(version) {
        const v = new Version(version);
        if (this.versionMajor > v.versionMajor) {
            return true;
        }
        else if (this.versionMajor === v.versionMajor && this.versionMinor >= v.versionMinor) {
            return true;
        }
        else {
            return false;
        }
    }
    upTo(version) {
        return !this.newerThan(version);
    }
}

export { PointAttributes as P, Version as V, PointAttributeName as a, POINT_ATTRIBUTE_TYPES as b, POINT_ATTRIBUTES as c };
//# sourceMappingURL=version-DabiREzy.js.map
