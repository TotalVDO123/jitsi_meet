// @flow

import * as wasmCheck from 'wasm-check';

import JitsiStreamBlurEffect from './JitsiStreamBlurEffect';
import createTFLiteModule from './vendor/tflite/tflite';
import createTFLiteSIMDModule from './vendor/tflite/tflite-simd';

const models = {
    '96': 'libs/segm_lite_v681.tflite',
    '144': 'libs/segm_full_v679.tflite'
};

const segmentationDimensions = {
    'version96': {
        'segmentationHeight': 96,
        'segmentationWidth': 160
    },
    'version144': {
        'segmentationHeight': 144,
        'segmentationWidth': 256
    }
};

/**
 * Creates a new instance of JitsiStreamBlurEffect. This loads the bodyPix model that is used to
 * extract person segmentation.
 *
 * @returns {Promise<JitsiStreamBlurEffect>}
 */
export async function createBlurEffect() {
    if (!MediaStreamTrack.prototype.getSettings && !MediaStreamTrack.prototype.getConstraints) {
        throw new Error('JitsiStreamBlurEffect not supported!');
    }
    let tflite;

    if (wasmCheck.feature.simd) {
        tflite = await createTFLiteSIMDModule();
    } else {
        tflite = await createTFLiteModule();
    }

    const modelBufferOffset = tflite._getModelBufferMemoryOffset();
    const modelResponse = await fetch(
        wasmCheck.feature.simd ? models['144'] : models['96']
    );

    if (!modelResponse.ok) {
        throw new Error('Failed to download tflite model!');
    }

    const model = await modelResponse.arrayBuffer();

    tflite.HEAPU8.set(new Uint8Array(model), modelBufferOffset);

    tflite._loadModel(model.byteLength);

    const options = wasmCheck.feature.simd ? segmentationDimensions.version144 : segmentationDimensions.version96;

    return new JitsiStreamBlurEffect(tflite, options);
}
