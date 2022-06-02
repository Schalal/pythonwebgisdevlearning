import React, {useEffect, useState} from 'react';
import DeckGL from '@deck.gl/react';
import {ScreenGridLayer} from '@deck.gl/aggregation-layers';
import {TileLayer} from '@deck.gl/geo-layers';
import {ArcLayer, BitmapLayer, GeoJsonLayer, GridCellLayer, PolygonLayer} from "@deck.gl/layers";

// Viewport settings
const INITIAL_VIEW_STATE = {
    longitude: 116.3846,
    latitude: 40.1653,
    zoom: 8,
    pitch: 30,
    bearing: 0
};


function DeckGlDemo() {
    const [layer, setLayer] = useState();
    const [gridLayer, setGridLayer] = useState();
    const [odLayer, setOdLayer] = useState();
    const [polygonLayer, setPolygonLayer] = useState();
    const baseUrl = "http://127.0.0.1:1234/";
    const tileLayer = new TileLayer({
        // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
        data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',

        minZoom: 0,
        maxZoom: 15,
        tileSize: 256,

        renderSubLayers: props => {
            const {
                bbox: {west, south, east, north}
            } = props.tile;

            return new BitmapLayer(props, {
                data: null,
                image: props.data,
                bounds: [west, south, east, north]
            });
        }
    });
    // useEffect(() => {
    //     fetch(baseUrl + "testQuery", {
    //         method: "POST",
    //         body: "",
    //         headers: new Headers({
    //             "Access-Control-Allow-Origin": '*',
    //             'Content-Type': 'application/json'
    //         })
    //     }).then(response => response.json()
    //     ).then(jsonData => {
    //         setLayer(new ScreenGridLayer({
    //             id: 'screen-grid-layer',
    //             data: jsonData.features,
    //             pickable: false,
    //             opacity: 0.8,
    //             cellSizePixels: 20,
    //             colorRange: [
    //                 [68, 1, 84, 25],
    //                 [58, 83, 139, 85],
    //                 [37, 132, 142, 255],
    //                 [70, 192, 111, 255],
    //                 [202, 225, 31, 255],
    //                 [255, 120, 0, 255]
    //             ],
    //             getPosition: d => d.geometry.coordinates,
    //             getWeight: d => d.properties.value
    //         }));
    //         setGridLayer(new GridCellLayer({
    //             id: 'grid-cell-layer',
    //             data: jsonData.features,
    //             pickable: false,
    //             extruded: true,
    //             cellSize: 600,
    //             getPosition: d => d.geometry.coordinates,
    //             getLineColor: [255, 255, 255, 255],
    //             getFillColor: (d) => {
    //                 let bValue = d.properties.value;
    //                 if (bValue < 0.05) return [211, 237, 255, 120];
    //                 else if (bValue < 0.2) return [43, 181, 186, 255];
    //                 else if (bValue < 0.4) return [171, 221, 164, 255];
    //                 else if (bValue < 0.6) return [255, 255, 191, 255];
    //                 else if (bValue < 0.8) return [253, 174, 97, 255];
    //                 else return [215, 25, 28, 255];
    //             },
    //             getLineWidth: 1,
    //             getElevation: d => parseInt(50000 * d.properties.value)
    //         }))
    //     }).catch((error) => {
    //         console.log(error);
    //     })
    // }, [])
    // useEffect(() => {
    //     fetch(baseUrl + "odFlow", {
    //         method: "POST",
    //         body: "",
    //         headers: new Headers({
    //             "Access-Control-Allow-Origin": '*',
    //             'Content-Type': 'application/json'
    //         })
    //     }).then(response => response.json()
    //     ).then(jsonData => {
    //         setOdLayer(new ArcLayer({
    //             id: 'od-arc-layer',
    //             data: jsonData.data,
    //             pickable: false,
    //             greatCircle: false,
    //             getWidth: d => {
    //                 let widthValue = parseInt(d.sod_transvolume / 1000);
    //                 if (widthValue > 30) widthValue = 30;
    //                 else if (widthValue < 1) widthValue = 0;
    //                 return widthValue;
    //             },
    //             getSourcePosition: (d) => {
    //                 return [d.sourceX, d.sourceY]
    //             },
    //             getTargetPosition: (d) => {
    //                 return [d.targetX, d.targetY]
    //             },
    //             getSourceColor: [105, 129, 192, 220],
    //             getTargetColor: [192, 105, 108, 220]
    //         }));
    //     }).catch((error) => {
    //         console.log(error);
    //     })
    // }, [])
    useEffect(() => {
        fetch(baseUrl + "gridPolygon", {
            method: "POST",
            body: "",
            headers: new Headers({
                "Access-Control-Allow-Origin": '*',
                'Content-Type': 'application/json'
            })
        }).then(response => response.json()
        ).then(jsonData => {
            setPolygonLayer(new PolygonLayer({
                id: 'grid-geojson-layer',
                data: jsonData.features,
                pickable: false,
                extruded: true,
                stroked: true,
                filled: true,
                wireframe: true,
                lineWidthMinPixels: 1,
                getPolygon: d => d.geometry.coordinates,
                getElevation: d => parseInt(d.properties.g_popcount),
                getFillColor: d => [parseInt(d.properties.g_popcount), 255 - parseInt(d.properties.g_popcount/1000), 0, 255],
                getLineColor: [80, 80, 80],
                getLineWidth: 1
            }));
        }).catch((error) => {
            console.log(error);
        })
    }, [])
    return (
        <DeckGL
            initialViewState={INITIAL_VIEW_STATE}
            controller={true}
            layers={[tileLayer, polygonLayer]}
        />
    );
}

export default DeckGlDemo;