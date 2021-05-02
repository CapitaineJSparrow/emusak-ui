import React from "react";
import {
  Route,
  Switch,
  HashRouter as Router
} from "react-router-dom";
import RyujinxHome from "./page/ryujinx/RyujinxHome";
import YuzuHome from "./page/yuzu/YuzuHome";

const AppRouter = () => (
  <Router>
    <Switch>
      <Route exact path="/">
        <RyujinxHome />
      </Route>
      <Route exact path="/yuzu">
        <YuzuHome />
      </Route>
    </Switch>
  </Router>
);

export default AppRouter;
