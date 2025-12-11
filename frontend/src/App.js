import { Component } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";

import { ToastContainer } from "react-toastify";

import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Dashboard from "./components/Dashboard";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

class App extends Component {
  render() {
    return (
      <>
        <BrowserRouter>
          <ToastContainer
            position="top-center"
            autoClose={3000}
            limit={3}
            newestOnTop={true}
            preventDuplicate={true}
          />
          <Switch>
            <Route exact path="/sign-in" component={SignIn} />
            <Route exact path="/sign-up" component={SignUp} />
            <ProtectedRoute exact path="/" component={Dashboard} />
            <Route path="/not-found" component={NotFound} />
            <Redirect to="not-found" />
          </Switch>
        </BrowserRouter>
      </>
    );
  }
}

export default App;
