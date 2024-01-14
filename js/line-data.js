﻿export const LINES = {
    "1": {"id": 1, "code": "1", "name": "1号线", "foreign_name": "Line 1", "color": "#009ACE"},
    "2": {"id": 2, "code": "2", "name": "2号线", "foreign_name": "Line 2", "color": "#A6093D"},
    "3": {"id": 3, "code": "3", "name": "3号线", "foreign_name": "Line 3", "color": "#009A44"},
    "4": {"id": 4, "code": "4", "name": "4号线", "foreign_name": "Line 4", "color": "#7D55C7"},
    "7": {"id": 7, "code": "7", "name": "7号线", "foreign_name": "Line 7", "color": "#4A7729"},
    "10": {"id": 10, "code": "10", "name": "10号线", "foreign_name": "Line 10", "color": "#B9975B"},
    "S1": {"id": 51, "code": "S1", "name": "S1机场线", "foreign_name": "Airport Line (S1)", "color": "#00B2A9"},
    "S3": {"id": 53, "code": "S3", "name": "S3宁和线", "foreign_name": "Line S3", "color": "#B06C96"},
    "S6": {"id": 56, "code": "S6", "name": "S6宁句线", "foreign_name": "Line S6", "color": "#C98BDB"},
    "S7": {"id": 57, "code": "S7", "name": "S7宁溧线", "foreign_name": "Line S7", "color": "#E89CAE"},
    "S8": {"id": 58, "code": "S8", "name": "S8宁天线", "foreign_name": "Line S8", "color": "#EA7600"},
    "S9": {"id": 59, "code": "S9", "name": "S9宁高线", "foreign_name": "Line S9", "color": "#F1B434"}
}

const LINE_STATION = {
    "1": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
    "2": [61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 13, 46, 45, 44, 43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33],
    "3": [87, 86, 85, 84, 83, 82, 81, 21, 80, 79, 78, 77, 76, 75, 74, 47, 73, 72, 71, 8, 70, 69, 68, 67, 66, 65, 64, 63, 62],
    "4": [102, 101, 100, 99, 98, 97, 55, 96, 95, 94, 93, 92, 91, 72, 11, 90, 89, 88],
    "7": [110, 69, 109, 5, 108, 107, 106, 105, 104, 103],
    "10": [122, 121, 120, 119, 118, 117, 116, 115, 114, 113, 39, 112, 111, 17],
    "S1": [21, 123, 124, 125, 126, 127, 128, 129, 130],
    "S3": [155, 154, 153, 152, 151, 150, 149, 148, 147, 146, 145, 144, 143, 37, 142, 141, 140, 139, 21],
    "S6": [156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 54],
    "S7": [130, 131, 132, 133, 134, 135, 136, 137, 138],
    "S8": [168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 65, 183, 184, 185],
    "S9": [128, 186, 187, 188, 189, 190]
}

export const getLineStation = (lineCode) => LINE_STATION[lineCode.toString()];