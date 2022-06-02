import '../App.css';
import React, {useEffect, useState} from 'react';
import MapWrapper from './olwrapper'

function OpenLayersMap() {
    const [geojsonUrl, setGeojsonUrl] = useState(["/testGrid.geojson"])
    return (
        <div className={"olApp"}>
            <MapWrapper geojsonUrl={geojsonUrl}/>
        </div>
    )
}

export default OpenLayersMap