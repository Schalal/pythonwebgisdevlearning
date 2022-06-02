import {BrowserRouter, Route, Switch} from "react-router-dom";
import OpenLayersMap from "./component/olpage";
import MapboxLayer from "./component/mapboxpage";
import DeckGlDemo from "./component/deckgldemo";
import AntVL7Demo from "./component/antvdemo";
function App() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/OpenLayersMap" exact component={OpenLayersMap}>
                    <OpenLayersMap/>
                </Route>
                <Route path="/MapboxLayer" exact component={MapboxLayer}>
                    <MapboxLayer/>
                </Route>
                <Route path={"/DeckGlDemo"} exact component={DeckGlDemo}>
                    <DeckGlDemo/>
                </Route>
                <Route path={"/AntVL7Demo"} exact component={AntVL7Demo}>
                    <AntVL7Demo/>
                </Route>
                <Route component={MapboxLayer}>
                    <MapboxLayer/>
                </Route>
            </Switch>
        </BrowserRouter>
    )
}

export default App;