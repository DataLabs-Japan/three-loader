/**
 * Some types of possible point attribute data formats
 *
 * @class
 */
const PointAttributeTypes = {
    DATA_TYPE_DOUBLE: { ordinal: 0, name: 'double', size: 8 },
    DATA_TYPE_FLOAT: { ordinal: 1, name: 'float', size: 4 },
    DATA_TYPE_INT8: { ordinal: 2, name: 'int8', size: 1 },
    DATA_TYPE_UINT8: { ordinal: 3, name: 'uint8', size: 1 },
    DATA_TYPE_INT16: { ordinal: 4, name: 'int16', size: 2 },
    DATA_TYPE_UINT16: { ordinal: 5, name: 'uint16', size: 2 },
    DATA_TYPE_INT32: { ordinal: 6, name: 'int32', size: 4 },
    DATA_TYPE_UINT32: { ordinal: 7, name: 'uint32', size: 4 },
    DATA_TYPE_INT64: { ordinal: 8, name: 'int64', size: 8 },
    DATA_TYPE_UINT64: { ordinal: 9, name: 'uint64', size: 8 },
};
let i = 0;
for (const obj in PointAttributeTypes) {
    PointAttributeTypes[i] = PointAttributeTypes[obj];
    i++;
}
class PointAttribute {
    constructor(name, type, numElements, range = [Infinity, -Infinity], uri = undefined) {
        this.name = name;
        this.type = type;
        this.numElements = numElements;
        this.range = range;
        this.uri = uri;
        this.byteSize = this.numElements * this.type.size;
        this.description = '';
    }
}
const POINT_ATTRIBUTES = {
    POSITION_CARTESIAN: new PointAttribute('POSITION_CARTESIAN', PointAttributeTypes.DATA_TYPE_FLOAT, 3),
    RGBA_PACKED: new PointAttribute('COLOR_PACKED', PointAttributeTypes.DATA_TYPE_INT8, 4),
    COLOR_PACKED: new PointAttribute('COLOR_PACKED', PointAttributeTypes.DATA_TYPE_INT8, 4),
    RGB_PACKED: new PointAttribute('COLOR_PACKED', PointAttributeTypes.DATA_TYPE_INT8, 3),
    NORMAL_FLOATS: new PointAttribute('NORMAL_FLOATS', PointAttributeTypes.DATA_TYPE_FLOAT, 3),
    INTENSITY: new PointAttribute('INTENSITY', PointAttributeTypes.DATA_TYPE_UINT16, 1),
    CLASSIFICATION: new PointAttribute('CLASSIFICATION', PointAttributeTypes.DATA_TYPE_UINT8, 1),
    NORMAL_SPHEREMAPPED: new PointAttribute('NORMAL_SPHEREMAPPED', PointAttributeTypes.DATA_TYPE_UINT8, 2),
    NORMAL_OCT16: new PointAttribute('NORMAL_OCT16', PointAttributeTypes.DATA_TYPE_UINT8, 2),
    NORMAL: new PointAttribute('NORMAL', PointAttributeTypes.DATA_TYPE_FLOAT, 3),
    RETURN_NUMBER: new PointAttribute('RETURN_NUMBER', PointAttributeTypes.DATA_TYPE_UINT8, 1),
    NUMBER_OF_RETURNS: new PointAttribute('NUMBER_OF_RETURNS', PointAttributeTypes.DATA_TYPE_UINT8, 1),
    SOURCE_ID: new PointAttribute('SOURCE_ID', PointAttributeTypes.DATA_TYPE_UINT16, 1),
    INDICES: new PointAttribute('INDICES', PointAttributeTypes.DATA_TYPE_UINT32, 1),
    SPACING: new PointAttribute('SPACING', PointAttributeTypes.DATA_TYPE_FLOAT, 1),
    GPS_TIME: new PointAttribute('GPS_TIME', PointAttributeTypes.DATA_TYPE_DOUBLE, 1),
};
class PointAttributes {
    constructor(pointAttributes, attributes = [], byteSize = 0, size = 0, vectors = []) {
        this.attributes = attributes;
        this.byteSize = byteSize;
        this.size = size;
        this.vectors = vectors;
        if (pointAttributes != null) {
            for (let i = 0; i < pointAttributes.length; i++) {
                const pointAttributeName = pointAttributes[i];
                const pointAttribute = POINT_ATTRIBUTES[pointAttributeName];
                this.attributes.push(pointAttribute);
                this.byteSize += pointAttribute.byteSize;
                this.size++;
            }
        }
    }
    add(pointAttribute) {
        this.attributes.push(pointAttribute);
        this.byteSize += pointAttribute.byteSize;
        this.size++;
    }
    addVector(vector) {
        this.vectors.push(vector);
    }
    hasNormals() {
        for (const name in this.attributes) {
            const pointAttribute = this.attributes[name];
            if (pointAttribute === POINT_ATTRIBUTES.NORMAL_SPHEREMAPPED ||
                pointAttribute === POINT_ATTRIBUTES.NORMAL_FLOATS ||
                pointAttribute === POINT_ATTRIBUTES.NORMAL ||
                pointAttribute === POINT_ATTRIBUTES.NORMAL_OCT16) {
                return true;
            }
        }
        return false;
    }
    getAttribute(attributeName) {
        return this.attributes.find(attr => attr.name === attributeName);
    }
}

export { PointAttributeTypes as P, PointAttribute as a, PointAttributes as b };
//# sourceMappingURL=point-attributes-Ck93P4aI.js.map
