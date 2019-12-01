import React from "react";
import { render } from "react-dom";
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import NotFound from './NotFound/NotFound';
import Repository from './Repository/Repository';
import App from "./App.js";

const routing = (
    <Router>
        <Switch>
            <Route exact path="/" component={ App } />
            <Route path="/repository/:user/:repository" component={ Repository } />
            <Route component={ NotFound } />
        </Switch>
    </Router>
);

render( routing, document.getElementById( "app" ) );
