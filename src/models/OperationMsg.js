import dayjs from "dayjs";

const OP_MSG_LEVEL = {
    HIGH: {
        color: '#e81d1d'
    },
    MIDDLE: {
        color: '#f3c224'
    },
    LOW: {
        color: '#0079b3'
    },
    INFO: {
        color: '#00b14f'
    }
}

export class OperationMsg {
    constructor({id, level, message, sourceCategory, sourceName, sourceUrl, validTime, expireTime}) {
        this.id = id;
        this.level = level;
        this.message = message;
        this.sourceCategory = sourceCategory;
        this.sourceName = sourceName;
        this.sourceUrl = sourceUrl;
        this.validTime = new dayjs(validTime);
        this.expireTime = new dayjs(expireTime);
        this.color = (OP_MSG_LEVEL[level] && OP_MSG_LEVEL[level].color) || OP_MSG_LEVEL.LOW.color
    }
}
