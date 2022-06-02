// react
import React, {useState, useEffect, useRef} from 'react';

// openlayers
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import {Projection, transform} from 'ol/proj'
import {toStringXY} from 'ol/coordinate';
import GeoJSON from "ol/format/GeoJSON";
import {Fill, Style} from "ol/style";
import Static from 'ol/source/ImageStatic';
import ImageLayer from 'ol/layer/Image';

function MapWrapper(props) {
    //分类渲染要素
    const getStyle = (feature) => {
        const currentValue = feature.get("g_transvolumerawpc4")
        if (currentValue < 0.1) {
            return new Style(
                {
                    fill: new Fill({color: '#80D6FF'})
                }
            )
        } else if (currentValue < 100) {
            return new Style(
                {
                    fill: new Fill({color: '#F8FE85'})
                }
            )
        } else if (currentValue < 1000) {
            return new Style(
                {
                    fill: new Fill({color: '#FFBD67'})
                }
            )
        } else {
            return new Style(
                {
                    fill: new Fill({color: '#FF6464'})
                }
            )
        }
    }
    //设置初始状态
    const [map, setMap] = useState()
    const [selectedCoord, setSelectedCoord] = useState()
    //map reference
    const mapElement = useRef()
    // create state ref that can be accessed in OpenLayers onclick callback function
    //  https://stackoverflow.com/a/60643670
    const mapRef = useRef()
    mapRef.current = map
    const extent = [12847483.99178350158035755, 4784754.626148940064013,
        13079919.08855985663831234, 5021642.24052394926548004]
    const projection = new Projection({
        code: 'EPSG: 3857'
    });
    const baseUrl = "http://127.0.0.1:1234/";
    useEffect(() => {
        // create map
        const initialMap = new Map({
            target: mapElement.current,
            layers: [
                new TileLayer({
                    source: new XYZ({
                        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    })
                }),
                new VectorLayer({
                    source: new VectorSource({
                        url: props.geojsonUrl,
                        format: new GeoJSON()
                    }),
                    style: getStyle
                }),
                new ImageLayer({
                    source: new Static({
                        // url: 'http://img4.wikia.nocookie.net/__cb20071014061100/freeciv/images/1/1c/Crystal_128_penguin.png',  // image size is 128x128 px
                        imageLoadFunction: function (image) {
                            fetch(baseUrl + "pngString", {
                                method: "POST",
                                body: "",
                                headers: new Headers({
                                    'Content-Type': 'application/json'
                                })
                            }).then(response => response.json()
                            ).then(jsonData => {
                                image.getImage().src = jsonData.code
                            }).catch((error) => {
                                console.log(error);
                            })

                        },
                        projection: projection,
                        imageExtent: extent
                    }),
                    opacity: 1
                })
            ],
            view: new View({
                projection: 'EPSG:3857',
                center: [12954086, 4898463],
                zoom: 8
            }),
            controls: []
        })
        // set map onclick handler
        initialMap.on('click', handleMapClick)
        // save map and vector layer references to state
        setMap(initialMap)
    }, [props])

    // map click handler
    const handleMapClick = (event) => {
        // get clicked coordinate using mapRef to access current React state inside OpenLayers callback
        //  https://stackoverflow.com/a/60643670
        const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);
        // transform coord to EPSG 4326 standard Lat Long
        const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')
        // set React state
        setSelectedCoord(transormedCoord)
    }

    // render component
    return (
        <div>
            <div ref={mapElement} className="map-container"/>
            <div className="clicked-coord-label">
                <p>{(selectedCoord) ? toStringXY(selectedCoord, 5) : ''}</p>
            </div>
        </div>
    )

}

export default MapWrapper