import {Scene, PolygonLayer, LineLayer, HeatmapLayer, PointLayer} from '@antv/l7';
import {Mapbox} from '@antv/l7-maps';
import {useEffect} from "react";

// 接入服务器数据
// function AntVL7Demo() {
//
// }
// 本地测试
function AntVL7Demo() {
    const baseUrl = "http://127.0.0.1:1234/";
    const draw = () => {
        const scene = new Scene({
            id: 'map',
            map: new Mapbox({
                style: 'dark',
                pitch: 60,
                center: [116.41286, 40.18294],
                zoom: 8
            })
        });
        scene.on('loaded', () => {
            fetch(
                baseUrl + "gridPolygon", {
                    method: "POST",
                    body: "",
                    headers: new Headers({
                        "Access-Control-Allow-Origin": '*',
                        'Content-Type': 'application/json'
                    })
                }
            )
                .then(response => response.json())
                .then((jsonData) => {
                    const beijingPolygonLayer = new PolygonLayer({
                        autoFit: true,
                    })
                        .source(jsonData)
                        .color('g_jobhouseratio', (value) => {
                            let bValue = value;
                            if (bValue < 5) return '#F5F0BB';
                            else if (bValue < 50) return '#C4DFAA';
                            else if (bValue < 500) return '#90C8AC';
                            else if (bValue < 1000) return '#73A9AD';
                            else if (bValue < 2000) return '#D3CEDF';
                            else return '#F2D7D9';
                        })
                        .shape('extrude')
                        .style({
                            opacity: 1,
                        })
                        .size('g_jobhouseratio', (value) => parseInt(value)*5);
                    scene.addLayer(beijingPolygonLayer);
                });
            fetch(
                baseUrl + "subdistrictLine", {
                    method: "POST",
                    body: "",
                    headers: new Headers({
                        "Access-Control-Allow-Origin": '*',
                        'Content-Type': 'application/json'
                    })
                }
            )
                .then(response => response.json())
                .then((jsonData) => {
                    const beijingLineLayer = new LineLayer({
                        autoFit: true,
                        zIndex: 10
                    })
                        .source(jsonData)
                        .color("#666666")
                        .shape('line')
                        .style({
                            lineType: 'dash',
                            dashArray: [3, 1],
                            vertexHeightScale: 1000
                        })
                        .size(1);
                    scene.addLayer(beijingLineLayer);
                });
            // fetch(baseUrl + "odFlow", {
            //     method: "POST",
            //     body: "",
            //     headers: new Headers({
            //         "Access-Control-Allow-Origin": '*',
            //         'Content-Type': 'application/json'
            //     })
            // }).then(response => response.json()).then(jsonData => {
            //     const lineLayer = new LineLayer({zIndex: 1}).source(jsonData.data, {
            //         parser: {
            //             type: 'json',
            //             x: 'sourceX',
            //             y: 'sourceY',
            //             x1: 'targetX',
            //             y1: 'targetY'
            //         }
            //     }).size("sod_transvolume", (value)=>{
            //       if(value < 10) return 0
            //           else if(value < 100) return 0
            //           else if(value < 1000) return 0
            //           else if(value < 1500) return 0
            //           else if(value < 3000) return 0
            //           else if(value < 5000) return 2
            //           else if(value < 10000) return 5
            //           else if(value < 50000) return 10
            //       else return 15
            //     })
            //         .shape('arc')
            //         // .color('sod_transvolume', (value)=>{
            //         //   if(value < 10) return 'rgba(255,255,255,0)'
            //         //   else if(value < 100) return 'rgba(150, 255, 255, 10)'
            //         //   else if(value < 1000) return 'rgba(155, 255, 201, 180)'
            //         //   else if(value < 2000) return 'rgba(247, 247, 91, 220)'
            //         //   else if(value < 5000) return 'rgba(247, 169, 91, 255)'
            //         //   else return 'rgba(247, 99, 91, 255)'
            //         // })
            //         .style({
            //             opacity: 0.8,
            //             sourceColor: '#3763c9',
            //             targetColor: '#f1e900'
            //         }).setBlend("subtractive");
            //     scene.addLayer(lineLayer);
            // })
        });
    }
    const drawGridLayer = () => {
        const scene = new Scene({
            id: 'map',
            map: new Mapbox({
                style: 'dark',
                pitch: 0,
                center: [116.4510, 39.9767],
                zoom: 8
            })
        });
        scene.on('loaded', () => {
            fetch(
                baseUrl + "gridCentroid", {
                    method: "POST",
                    body: "",
                    headers: new Headers({
                        "Access-Control-Allow-Origin": '*',
                        'Content-Type': 'application/json'
                    })
                }
            )
                .then(response => response.json())
                .then((jsonData) => {
                    const beijingPolygonLayer = new PointLayer()
                        .source(jsonData)
                        .color('g_jobhouseratio', (value) => {
                            let bValue = value;
                            if (bValue < 5) return 'rgba(211, 237, 255, 120)';
                            else if (bValue < 50) return 'rgba(43, 181, 186, 255)';
                            else if (bValue < 500) return 'rgba(171, 221, 164, 255)';
                            else if (bValue < 1000) return 'rgba(255, 255, 191, 255)';
                            else if (bValue < 2000) return 'rgba(253, 174, 97, 255)';
                            else return 'rgba(215, 25, 28, 255)';
                        })
                        .shape('square')
                        .style({
                            opacity: 1,
                        });
                    scene.addLayer(beijingPolygonLayer);
                });
        })
    }
    useEffect(() => {
        draw()
        //drawGridLayer()
    }, [])
    return (
        <div id={"map"}>
        </div>
    )
}

export default AntVL7Demo;