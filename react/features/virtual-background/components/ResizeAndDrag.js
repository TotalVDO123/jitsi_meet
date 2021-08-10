
// @flow

import Konva from 'konva';
import React, { useEffect, useRef, useState } from 'react';

import { createLocalTrack } from '../../base/lib-jitsi-meet/functions';
import { connect } from '../../base/redux';
import { getCurrentCameraDeviceId } from '../../base/settings';
import { createLocalTracksF } from '../../base/tracks/functions';
import { toggleBackgroundEffect } from '../actions';
import { VIRTUAL_BACKGROUND_TYPE, DESKTOP_SHARE_DIMENSIONS } from '../constants';

type Props = {

    /**
     * The deviceId of the camera device currently being used.
     */
    _currentCameraDeviceId: string,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function
};

/**
 * Renders resize and drag element.
 *
 * @returns {ReactElement}
 */
function ResizeAndDrag({ _currentCameraDeviceId, dispatch }: Props) {
    const [ containerWidth ] = useState(DESKTOP_SHARE_DIMENSIONS.CONTAINER_WIDTH);
    const [ containerHeight ] = useState(DESKTOP_SHARE_DIMENSIONS.CONTAINER_HEIGHT);
    const dragAndResizeRef = useRef(null);
    const createLocalJitsiTrack = async () => {
        const [ jitsiTrack ] = await createLocalTracksF({
            cameraDeviceId: _currentCameraDeviceId,
            devices: [ 'video' ]
        });
        const transparentOptions = {
            backgroundType: VIRTUAL_BACKGROUND_TYPE.TRANSPARENT,
            enabled: true,
            selectedThumbnail: 'transparent'
        };

        await dispatch(toggleBackgroundEffect(transparentOptions, jitsiTrack));
        if (dragAndResizeRef.current && jitsiTrack) {
            const stage = new Konva.Stage({
                container: dragAndResizeRef.current,
                width: containerWidth,
                height: containerHeight,
                scale: {x: 0.5, y: 0.5}
            });

            const layer = new Konva.Layer();

            stage.add(layer);
            const desktopVideo = document.createElement('video');
            const url = await createLocalTrack('desktop', '');

            desktopVideo.srcObject = await url.stream;

            const desktopImage = new Konva.Image({
                image: desktopVideo,
                x: stage.width()/2,
                y: stage.height()/2 - containerHeight/2,
                scaleX: 0.5,
                scaleY: 0.5,
            });
            desktopVideo.onresize = () => {
                desktopImage.width(desktopVideo.videoWidth);
                desktopImage.height(desktopVideo.videoHeight + containerHeight/2);

            }
            layer.add(desktopImage);
            desktopVideo.addEventListener('loadedmetadata', () => {
                desktopVideo.play();

                /**
                 * Method takes a callback as an argument to be invoked before the repaint.
                 *
                 * @returns {void}
                 */
                function step() {
                    layer.draw();
                    window.requestAnimationFrame(step);
                }
                window.requestAnimationFrame(step);
            });

            // Create new transformer
            const desktopTr = new Konva.Transformer({
                centeredScaling: false,
                node: desktopImage

                // ignoreStroke: true
            });

            // Enable specific anchors.
            desktopTr.enabledAnchors([]);

            // Disable rotation.
            desktopTr.rotateEnabled(false);
            layer.add(desktopTr);
            desktopTr.nodes([ desktopImage ]);

            const video = document.createElement('video');

            video.srcObject = await jitsiTrack.stream;

            const image = new Konva.Image({
                image: video,
                draggable: true,
                x: stage.width() - DESKTOP_SHARE_DIMENSIONS.RECTANGLE_WIDTH,
                y: stage.height() - DESKTOP_SHARE_DIMENSIONS.RECTANGLE_HEIGHT
            });

            layer.add(image);
            video.addEventListener('loadedmetadata', () => {
                image.width(DESKTOP_SHARE_DIMENSIONS.RECTANGLE_WIDTH);
                image.height(DESKTOP_SHARE_DIMENSIONS.RECTANGLE_HEIGHT);
                video.play();

                /**
                 * Method takes a callback as an argument to be invoked before the repaint.
                 *
                 * @returns {void}
                 */
                function step() {
                    layer.draw();
                    window.requestAnimationFrame(step);
                }
                window.requestAnimationFrame(step);
            });

            // create new transformer
            const tr = new Konva.Transformer({
                node: image,
                ignoreStroke: true
            });

            // Enable specific anchors.
            tr.enabledAnchors([ 'top-left', 'top-right', 'bottom-left', 'bottom-right' ]);

            // Disable rotation.
            tr.rotateEnabled(false);
            layer.add(tr);
            tr.nodes([ image ]);
        }
    };

    useEffect(() => {
        if (dragAndResizeRef.current) {
            createLocalJitsiTrack();
        }
    }, [ dragAndResizeRef ]);

    return (<div
        className = 'drag-and-resize-area video-preview'
        ref = { dragAndResizeRef } />);
}

/**
 * Maps (parts of) the redux state to the associated props for the
 * {@code VirtualBackgroundPreview} component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {{Props}}
 */
function _mapStateToProps(state): Object {
    return {
        _currentCameraDeviceId: getCurrentCameraDeviceId(state)
    };
}

export default connect(_mapStateToProps)(ResizeAndDrag);
