const lamps = document.querySelectorAll(".my-lamp input.toggle");
const lampSlider = document.getElementById("lamp-slider");
const button = document.getElementById("mybutton");
const rainSensor = document.getElementById("rain-sensor");
const lightSensor = document.getElementById("light-sensor");
const tempSensor = document.getElementById("temp-sensor");
const humiSensor = document.getElementById("humi-sensor");

const clientId = "mqttjs_" + Math.random().toString(16).slice(2, 10);
const host = "ws://broker.emqx.io:8083/mqtt";

const options = {
  keepalive: 30,
  clientId,
  protocolId: "MQTT",
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  will: {
    topic: "WillMsg",
    payload: "Connection Closed abnormally..!",
    qos: 0,
    retain: false,
  },
  rejectUnauthorized: false,
};

console.log("connecting mqtt client");
const client = mqtt.connect(host, options);

client.on("error", (err) => {
  console.log(err);
  client.end();
});

///////////////// PUBLISH  //////////////////
client.on("connect", () => {
  console.log("client connected:" + clientId);

  client.subscribe("mqtt/sensor/rain", { qos: 0 });
  client.subscribe("mqtt/sensor/light", { qos: 0 });
  client.subscribe("mqtt/sensor/temp", { qos: 0 });
  client.subscribe("mqtt/sensor/humi", { qos: 0 });
  client.subscribe("mqtt/sensor/temp_info", { qos: 0 });

  lamps.forEach((lamp, index) => {
    lamp.addEventListener("click", (e) => {
      e.stopPropagation();
      if (index == 0) {
        if (lamp.checked) {
          client.publish("mqtt/sensor/led1", "1", { qos: 0, retain: false });
        } else {
          client.publish("mqtt/sensor/led1", "0", { qos: 0, retain: false });
        }
      }
      if (index == 1) {
        if (lamp.checked) {
          client.publish("mqtt/sensor/led2", "1", { qos: 0, retain: false });
        } else {
          client.publish("mqtt/sensor/led2", "0", { qos: 0, retain: false });
        }
      }
    });
  });

  lampSlider.addEventListener("input", (e) => {
    e.stopPropagation();
    client.publish("mqtt/sensor/slider_led", lampSlider.value, { qos: 0, retain: false });
  });

  // DRIYING ROOM SECTION
  button.addEventListener("click", (e) => {
    e.stopPropagation();

    const setInfo = button.checked ? "ON" : "OFF";
    button.setAttribute("aria-label", setInfo);

    if (button.getAttribute("aria-label") == "ON") {
      client.publish("mqtt/sensor/servo", "1", { qos: 0, retain: false });
    } else {
      client.publish("mqtt/sensor/servo", "0", { qos: 0, retain: false });
    }
  });
});

///////////////// SUBSCRIBE  //////////////////
client.on("message", (topic, payload, packet) => {
  if (topic == "mqtt/sensor/rain") {
    rainSensor.style.setProperty("--value", payload);
    if (window.getComputedStyle(rainSensor).getPropertyValue("--value") > 60) {
      document.getElementById("info-rain").innerHTML = "HUJAN !!";
      document.getElementById("info-rain").style.backgroundColor = "red";
    } else {
      document.getElementById("info-rain").innerHTML = "NORMAL";
      document.getElementById("info-rain").style.backgroundColor = "#7480FF";
    }
  }

  if (topic == "mqtt/sensor/light") {
    lightSensor.style.setProperty("--value", payload);
    if (window.getComputedStyle(lightSensor).getPropertyValue("--value") > 40) {
      document.getElementById("info-light").innerHTML = "MENDUNG !!";
      document.getElementById("info-light").style.backgroundColor = "red";
    } else {
      document.getElementById("info-light").innerHTML = "NORMAL";
      document.getElementById("info-light").style.backgroundColor = "#7480FF";
    }
  }

  if (topic == "mqtt/sensor/temp") {
    tempSensor.style.setProperty("--value", payload);
    if (window.getComputedStyle(tempSensor).getPropertyValue("--value") > 35) {
      document.getElementById("info-temp").innerHTML = "PANAS !!";
      document.getElementById("info-temp").style.backgroundColor = "red";
    } else {
      document.getElementById("info-temp").innerHTML = "NORMAL";
      document.getElementById("info-temp").style.backgroundColor = "#7480FF";
    }
  }

  if (topic == "mqtt/sensor/humi") {
    humiSensor.style.setProperty("--value", payload);
    if (window.getComputedStyle(humiSensor).getPropertyValue("--value") < 30) {
      document.getElementById("info-humi").innerHTML = "KERING !!";
      document.getElementById("info-humi").style.backgroundColor = "red";
    } else {
      document.getElementById("info-humi").innerHTML = "NORMAL";
      document.getElementById("info-humi").style.backgroundColor = "#7480FF";
    }
  }

  let tempVal = parseInt(window.getComputedStyle(tempSensor).getPropertyValue("--value"));
  let humiVal = parseInt(window.getComputedStyle(humiSensor).getPropertyValue("--value"));

  if (tempVal > 35 || humiVal < 30) {
    document.getElementById("info-ac").innerHTML = "ON";
    document.getElementById("info-ac").style.backgroundColor = "#7480FF";
  } else {
    document.getElementById("info-ac").innerHTML = "OFF";
    document.getElementById("info-ac").style.backgroundColor = "red";
  }
});

client.on("close", () => {
  console.log(clientId + " disconnected");
});
