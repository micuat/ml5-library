// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
/* eslint no-await-in-loop: "off" */
/*
BodyPix
*/


import * as tf from '@tensorflow/tfjs';
import * as bp from '@tensorflow-models/body-pix';
import callCallback from '../utils/callcallback';
import * as p5Utils from '../utils/p5Utils';
// import Video from '../utils/Video';

const DEFAULTS = {
    "multiplier": 0.75,
    "outputStride": 16,
    "segmentationThreshold": 0.5
}

class BodyPix {
    constructor(video, options, callback) {
        this.video = video;
        this.model = null;
        this.modelReady = false;
        this.modelPath = ''
        this.config = {
            multiplier: options.multiplier || DEFAULTS.multiplier,
            outputStride: options.outputStride || DEFAULTS.outputStride,
            segmentationThreshold: options.segmentationThreshold || DEFAULTS.segmentationThreshold,
        }

        this.ready = callCallback(this.loadModel(), callback);
    }

    async loadModel() {
        this.model = await bp.load(this.config.multiplier);
        this.modelReady = true;
        return this;
    }

    async segmentWithPartsInternal(imgToSegment){
        // estimatePartSegmentation
        await this.ready;
        await tf.nextFrame();

        if (this.video && this.video.readyState === 0) {
            await new Promise(resolve => {
                this.video.onloadeddata = () => resolve();
            });
        }

        const rainbow = [
            [110, 64, 170], [106, 72, 183], [100, 81, 196], [92, 91, 206],
            [84, 101, 214], [75, 113, 221], [66, 125, 224], [56, 138, 226],
            [48, 150, 224], [40, 163, 220], [33, 176, 214], [29, 188, 205],
            [26, 199, 194], [26, 210, 182], [28, 219, 169], [33, 227, 155],
            [41, 234, 141], [51, 240, 128], [64, 243, 116], [79, 246, 105],
            [96, 247, 97],  [115, 246, 91], [134, 245, 88], [155, 243, 88]
          ];
          

        const segmentation = await this.model.estimatePartSegmentation(imgToSegment)
        
        // // wrap up the final js result object
        const result = {};
        result.image = bp.toColoredPartImageData(segmentation, rainbow)
        // result.maskPerson = bp.toColoredPartImageData(segmentation, rainbow)

        if (p5Utils.checkP5()) {
            const blob1 = await p5Utils.rawToBlob(result.image.data, segmentation.width, segmentation.height);
            // const blob2 = await p5Utils.rawToBlob(result.maskPerson.data, segmentation.width, segmentation.height);
            const p5Image1 = await p5Utils.blobToP5Image(blob1);
            // const p5Image2 = await p5Utils.blobToP5Image(blob2);

            result.image = p5Image1;
            // result.maskPerson = p5Image2;
        }

        return result;

    }

    async segmentWithParts(optionsOrCallback, cb){
        let imgToSegment = this.video;
        let callback;

        // Handle the image to predict
        if (typeof optionsOrCallback === 'function') {
            imgToSegment = this.video;
            callback = optionsOrCallback;
            // clean the following conditional statement up!
        } else if (optionsOrCallback instanceof HTMLImageElement) {
            imgToSegment = optionsOrCallback;
        } else if (
            typeof optionsOrCallback === 'object' &&
            optionsOrCallback.elt instanceof HTMLImageElement
        ) {
            imgToSegment = optionsOrCallback.elt; // Handle p5.js image
        } else if (optionsOrCallback instanceof HTMLCanvasElement) {
            imgToSegment = optionsOrCallback;
        } else if (
            typeof optionsOrCallback === 'object' &&
            optionsOrCallback.elt instanceof HTMLCanvasElement
        ) {
            imgToSegment = optionsOrCallback.elt; // Handle p5.js image
        } else if (
            typeof optionsOrCallback === 'object' &&
            optionsOrCallback.canvas instanceof HTMLCanvasElement
        ) {
            imgToSegment = optionsOrCallback.canvas; // Handle p5.js image
        } else if (!(this.video instanceof HTMLVideoElement)) {
            // Handle unsupported input
            throw new Error(
                'No input image provided. If you want to classify a video, pass the video element in the constructor. ',
            );
        }

        if (typeof cb === 'function') {
            callback = cb;
        }

        return callCallback(this.segmentWithPartsInternal(imgToSegment), callback);

    }

    async segmentInternal(imgToSegment) {
        await this.ready;
        await tf.nextFrame();

        if (this.video && this.video.readyState === 0) {
            await new Promise(resolve => {
                this.video.onloadeddata = () => resolve();
            });
        }

        const segmentation = await this.model.estimatePersonSegmentation(imgToSegment)

        // // wrap up the final js result object
        const result = {};
        result.maskBackground = bp.toMaskImageData(segmentation, true);
        result.maskPerson = bp.toMaskImageData(segmentation, false);


        if (p5Utils.checkP5()) {
            const blob1 = await p5Utils.rawToBlob(result.maskBackground.data, segmentation.width, segmentation.height);
            const blob2 = await p5Utils.rawToBlob(result.maskPerson.data, segmentation.width, segmentation.height);
            const p5Image1 = await p5Utils.blobToP5Image(blob1);
            const p5Image2 = await p5Utils.blobToP5Image(blob2);

            result.maskBackground = p5Image1;
            result.maskPerson = p5Image2;
        }

        return result;

    }


    async segment(optionsOrCallback, cb) {
        let imgToSegment = this.video;
        let callback;

        // Handle the image to predict
        if (typeof optionsOrCallback === 'function') {
            imgToSegment = this.video;
            callback = optionsOrCallback;
            // clean the following conditional statement up!
        } else if (optionsOrCallback instanceof HTMLImageElement) {
            imgToSegment = optionsOrCallback;
        } else if (
            typeof optionsOrCallback === 'object' &&
            optionsOrCallback.elt instanceof HTMLImageElement
        ) {
            imgToSegment = optionsOrCallback.elt; // Handle p5.js image
        } else if (optionsOrCallback instanceof HTMLCanvasElement) {
            imgToSegment = optionsOrCallback;
        } else if (
            typeof optionsOrCallback === 'object' &&
            optionsOrCallback.elt instanceof HTMLCanvasElement
        ) {
            imgToSegment = optionsOrCallback.elt; // Handle p5.js image
        } else if (
            typeof optionsOrCallback === 'object' &&
            optionsOrCallback.canvas instanceof HTMLCanvasElement
        ) {
            imgToSegment = optionsOrCallback.canvas; // Handle p5.js image
        } else if (!(this.video instanceof HTMLVideoElement)) {
            // Handle unsupported input
            throw new Error(
                'No input image provided. If you want to classify a video, pass the video element in the constructor. ',
            );
        }

        if (typeof cb === 'function') {
            callback = cb;
        }

        return callCallback(this.segmentInternal(imgToSegment), callback);
    }



}

const bodyPix = (videoOrOptionsOrCallback, optionsOrCallback, cb) => {
    let video;
    let options = {};
    let callback = cb;

    if (videoOrOptionsOrCallback instanceof HTMLVideoElement) {
        video = videoOrOptionsOrCallback;
    } else if (
        typeof videoOrOptionsOrCallback === 'object' &&
        videoOrOptionsOrCallback.elt instanceof HTMLVideoElement
    ) {
        video = videoOrOptionsOrCallback.elt; // Handle a p5.js video element
    } else if (typeof videoOrOptionsOrCallback === 'object') {
        options = videoOrOptionsOrCallback;
    } else if (typeof videoOrOptionsOrCallback === 'function') {
        callback = videoOrOptionsOrCallback;
    }

    if (typeof optionsOrCallback === 'object') {
        options = optionsOrCallback;
    } else if (typeof optionsOrCallback === 'function') {
        callback = optionsOrCallback;
    }

    const instance = new BodyPix(video, options, callback);
    return callback ? instance : instance.ready;
}

export default bodyPix;