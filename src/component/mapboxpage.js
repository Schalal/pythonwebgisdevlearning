import '../App.css';
import {useEffect, useRef, useState} from "react";
import { useHistory } from 'react-router-dom';
import mapboxgl from "mapbox-gl"
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = "pk.eyJ1Ijoic2hjaHlhbiIsImEiOiJja21sZWN2aGYxNnprMnZsZjk5MWZxODAxIn0.j_4_OgU6PrrM1W10uTMp2g"

function MapboxLayer() {
    const mapContainer = useRef();
    const map = useRef();
    const [latitude, setLatitude] = useState(114.31211);
    const [longitude, setLongitude] = useState(30.56268);
    const [zoomLevel, setZoomLevel] = useState(11);
    const [featureCount, setFeatureCount] = useState(0);
    const baseUrl = "http://127.0.0.1:1234/";
    const history = useHistory();
    useEffect(() => {
        if (map.current) return;
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [latitude, longitude],
            zoom: zoomLevel,
            projection: "albers",
            attributionControl: false
        })
    })
    useEffect(() => {
        if (!map.current) return;
        map.current.on('move', () => {
            setLatitude(map.current.getCenter().lat.toFixed(5));
            setLongitude(map.current.getCenter().lng.toFixed(5));
            setZoomLevel(map.current.getZoom().toFixed(1));
        })
    })
    useEffect(() => {
        if (map.current) return;
        map.current.on('idle', () => {
            map.current.resize()
        })
    })
    const CenterInfo = () => {
        return (
            <div className={"center-info"}>
                当前地图的中心为：{longitude},{latitude}，地图缩放级别为：{zoomLevel}
            </div>
        )
    }

    function getFeatureCount() {
        fetch(baseUrl + "featureCount", {
            method: "POST",
            body: JSON.stringify({
                path: "E:\\DEM\\landCoverage.shp"
            }),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }).then(response => response.json()
        ).then(jsonData => {
            console.log(jsonData.count)
            setFeatureCount(jsonData.count)
        }).catch((error) => {
            console.log(error);
        })
    }

    const FlaskInfo = () => {
        return (
            <div className={"test-flask"}>
                {featureCount}
            </div>
        )
    }


    return (
        <div className={"App"}>
            <div className={"mapbox-map"} ref={mapContainer}/>
            <CenterInfo/>
            <FlaskInfo/>
            <button onClick={()=>{history.push('/DeckGlDemo')}}
                    style={{position: "absolute", bottom: "150px", right: "100px"}}>跳转至DeckGLDemo页面</button>
            <button onClick={getFeatureCount} style={{position: "absolute", bottom: "50px", right: "100px"}}>GET
            </button>
            <button onClick={()=>{history.push("/AntVL7Demo")}}
                    style={{position: "absolute", bottom: "200px", right: "100px"}}>跳转至antvl7页面</button>
            <button onClick={()=>{history.push('/OpenLayersMap')}}
                    style={{position: "absolute", bottom: "100px", right: "100px"}}>跳转至OpenLayers页面</button>
        </div>
    );
}

export default MapboxLayer;
