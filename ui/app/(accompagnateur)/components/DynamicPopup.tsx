import {
  type EventedProps,
  type LeafletContextInterface,
  type LeafletElement,
  type SetOpenFunc,
  createElementObject,
  createOverlayComponent,
} from "@react-leaflet/core";
import { type LatLngExpression, Popup as LeafletPopup, type PopupEvent, type PopupOptions } from "leaflet";
import { type ReactNode, useEffect } from "react";
import * as L from "leaflet";

import "#/common/leaflet/leaflet.rrose";
import "#/common/leaflet/leaflet.rrose.css";

export interface PopupProps extends PopupOptions, EventedProps {
  children?: ReactNode;
  position?: LatLngExpression;
  offsets?: {
    n?: L.Point;
    ne?: L.Point;
    nw?: L.Point;
    s?: L.Point;
    se?: L.Point;
    sw?: L.Point;
    e?: L.Point;
    w?: L.Point;
  };
  bounds?: {
    y?: number;
    x?: number;
  };
  onOpen?: (event: PopupEvent) => void;
}

export const DynamicPopup = createOverlayComponent<LeafletPopup, PopupProps>(
  function createPopup(props, context) {
    // @ts-expect-error exception for Rrose
    const popup = new L.Rrose(
      {
        offset: new L.Point(0, 0),
        closeButton: false,
        autoPan: false,
        ...props,
      },
      context.overlayContainer
    );
    return createElementObject(popup, context);
  },
  function usePopupLifecycle(
    element: LeafletElement<LeafletPopup>,
    context: LeafletContextInterface,
    props: PopupProps,
    setOpen: SetOpenFunc
  ) {
    const { position, onOpen } = props;

    useEffect(
      function addPopup() {
        const { instance } = element;

        function onPopupOpen(event: PopupEvent) {
          if (event.popup === instance) {
            instance.update();
            setOpen(true);
            onOpen && onOpen(event);
          }
        }

        function onPopupClose(event: PopupEvent) {
          if (event.popup === instance) {
            setOpen(false);
          }
        }

        context.map.on({
          popupopen: onPopupOpen,
          popupclose: onPopupClose,
        });

        if (context.overlayContainer == null) {
          // Attach to a Map
          if (position != null) {
            instance.setLatLng(position);
          }
          instance.openOn(context.map);
        } else {
          // Attach to container component
          context.overlayContainer.bindPopup(instance);
        }

        return function removePopup() {
          context.map.off({
            popupopen: onPopupOpen,
            popupclose: onPopupClose,
          });
          context.overlayContainer?.unbindPopup();
          context.map.removeLayer(instance);
        };
      },
      [element, context, onOpen, setOpen, position]
    );
  }
);

export default DynamicPopup;
