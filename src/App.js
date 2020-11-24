import axios from "axios";
import Cookie from "js-cookie";
import * as SurveyJS from "survey-react";
import "survey-react/modern.css";
import questions from "./questions.js";

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
} from "react-router-dom";

import Userfront from "@userfront/react";
Userfront.init("5xbpy4nz");
const Signup = Userfront.build({
  toolId: "mnbrak",
  tenantId: "5xbpy4nz",
});
const Login = Userfront.build({
  toolId: "nadrrd",
  tenantId: "5xbpy4nz",
});

SurveyJS.StylesManager.applyTheme("modern");
const survey = new SurveyJS.Model(questions);

survey.onComplete.add(({ data }) => {
  axios.post(
    "http://localhost:5000/survey-responses",
    { data },
    {
      headers: {
        Authorization: `Bearer ${Cookie.get("access.5xbpy4nz")}`,
      },
    }
  );
});

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg py-4">
          <NavLink to="/" className="navbar-brand">
            Survey.dev
          </NavLink>

          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <NavLink to="/survey" className="nav-link">
                Survey
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/results" className="nav-link">
                Results
              </NavLink>
            </li>
          </ul>

          <LoginLogout />
        </nav>

        <div className="container my-5">
          <Switch>
            <Route path="/results">
              <Results />
            </Route>
            <Route path="/survey">
              <Survey />
            </Route>
            <Route path="/login">
              <Login />
            </Route>
            <Route path="/signup">
              <Signup />
            </Route>
            <Route path="/">
              <Landing />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;

function Landing() {
  return (
    <div className="row">
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-body">
            <h5 className="card-title">
              2020 Survey of Web Development Freelancers & Agencies
            </h5>
            <h6 class="card-subtitle mb-2 text-muted">survey.dev</h6>
            <p class="card-text">
              Take the 2020 survey to share and learn about pay trends across
              regions and technologies.
            </p>
            <Link to="/survey" className="card-link">
              Survey
            </Link>
            <Link to="/results" className="card-link">
              Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Survey() {
  const [response, setResponse] = useState({});
  useEffect(() => {
    if (!response.id) {
      axios
        .get("http://localhost:5000/survey-responses", {
          headers: {
            Authorization: `Bearer ${Cookie.get("access.5xbpy4nz")}`,
          },
        })
        .then(({ data }) => {
          setResponse(data.surveyResponses[0]);
        });
    }
  });
  if (response.data) {
    const surveyView = new SurveyJS.Model(questions);
    surveyView.data = response.data;
    surveyView.mode = "display";

    return (
      <div>
        <SurveyJS.Survey model={surveyView} />
      </div>
    );
  } else {
    return (
      <div>
        <SurveyJS.Survey model={survey} />
      </div>
    );
  }
}

function LoginLogout() {
  const isLoggedIn = () => Cookie.get("access.5xbpy4nz");
  if (isLoggedIn()) {
    return (
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <a
            href="javascript:void(0);"
            className="nav-link"
            onClick={Userfront.logout}
          >
            Logout
          </a>
        </li>
      </ul>
    );
  } else {
    return (
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <NavLink to="/login" className="nav-link">
            Login
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/signup" className="nav-link">
            Signup
          </NavLink>
        </li>
      </ul>
    );
  }
}

function Results() {
  return (
    <div>
      <h2>Results</h2>
    </div>
  );
}
