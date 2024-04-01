import { Component } from "react";
import "./App.css";
import BasicTabs from "./Tabs";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      prev_control: localStorage.prev_control
        ? JSON.parse(localStorage.prev_control).length > 10
          ? JSON.parse(localStorage.prev_control).slice(
              JSON.parse(localStorage.prev_control).length - 10
            )
          : JSON.parse(localStorage.prev_control)
        : [],
      prev_variant: localStorage.prev_variant
        ? JSON.parse(localStorage.prev_variant).length > 10
          ? JSON.parse(localStorage.prev_variant).slice(
              JSON.parse(localStorage.prev_variant).length - 10
            )
          : JSON.parse(localStorage.prev_variant)
        : [],
      control: localStorage.control
        ? JSON.parse(localStorage.control)
        : {
            raw: "",
            decoded: "",
          },
      variant: localStorage.variant
        ? JSON.parse(localStorage.variant)
        : {
            raw: "",
            decoded: "",
          },
    };
    this.decode = this.decode.bind(this);
    this.updateStorage = this.updateStorage.bind(this);
    this.update = this.update.bind(this);
    this.levDistance = this.levDistance.bind(this);
  }
  decode(beacon) {
    const replacedBeacon = beacon.replace(/&D=/g, "&D||");
    const events = replacedBeacon.split("\n"); // Split by line breaks to handle multiple events
    const parsedEvents = [];

    events.forEach((event) => {
      const aBeacon = event.split("&");
      const aPrefixes = [];
      const oCleanedVals = {};

      for (let i = 0; i < aBeacon.length; i++) {
        const aPairs = aBeacon[i].split(/=(.+)/);
        const prefixStart = /\w+\.$/gi;
        const prefixEnd = /^\.\w+/gi;

        if (aPairs[0] !== "c." && prefixStart.test(aPairs[0])) {
          aPrefixes.push(aPairs[0]);
        }
        if (prefixEnd.test(aPairs[0])) {
          aPrefixes.pop();
        }

        if (typeof aPairs[1] != "undefined") {
          const key = aPrefixes.join("") + aPairs[0];
          const val = aPairs[1].replace("D||", "D=");
          oCleanedVals[key] = decodeURIComponent(val);
        }
      }
      parsedEvents.push(oCleanedVals);
    });

    return parsedEvents;
  }
  updateStorage() {
    localStorage.prev_control = JSON.stringify(this.state.prev_control);
    localStorage.prev_variant = JSON.stringify(this.state.prev_variant);
    localStorage.control = JSON.stringify(this.state.control);
    localStorage.variant = JSON.stringify(this.state.variant);
  }
  update(controlOrVariant, beacon) {
    if (this.state[controlOrVariant].raw.length === 0) {
      this.setState(
        {
          [`prev_${controlOrVariant}`]: [
            ...this.state[`prev_${controlOrVariant}`],
          ],
          [controlOrVariant]: {
            raw: beacon,
            decoded: this.decode(beacon),
          },
        },
        this.updateStorage
      );
    } else {
      this.setState(
        {
          [`prev_${controlOrVariant}`]: [
            ...this.state[`prev_${controlOrVariant}`],
            this.state[controlOrVariant],
          ],
          [controlOrVariant]: {
            raw: beacon,
            decoded: this.decode(beacon),
          },
        },
        this.updateStorage
      );
    }
  }

  levDistance(str1 = "", str2 = "") {
    const track = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // deletion
          track[j - 1][i] + 1, // insertion
          track[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    return track[str2.length][str1.length];
  }
  render() {
    console.log(this.state);
    return (
      <div className="App">
        <BasicTabs
          update={this.update}
          control={this.state.control}
          variant={this.state.variant}
        />
      </div>
    );
  }
}

export default App;
