const socket = new WebSocket(`wss://${location.host}`);

socket.addEventListener("open", (event) => {
  console.log(
    `${new Date().toLocaleString()}: WebSocket Connection Established`
  );
});

socket.addEventListener("message", (event) => {
  console.log(`${new Date().toLocaleString()}: Table Data Refreshed`);
  let bodyRows = document.querySelector("tbody").cloneNode(true);
  bodyRows = bodyRows.children;
  let indexOfToggled = [];
  for (let i = 0; i < bodyRows.length; i++) {
    if (bodyRows[i].className === "show-row") {
      indexOfToggled.push(i);
    }
  }
  document.getElementsByTagName("tbody")[0].innerHTML = "";
  generateTable(JSON.parse(event.data));
  for (let index of indexOfToggled) {
    document.querySelector("tbody").children[index].className = "show-row";
  }
});

function generateTable(socketDataArray) {
  function ShownRow() {
    this.tr = ["class", "clickable-row"];
  }
  function HostCell(hostName) {
    this.td = ["scope", "tr", hostName];
  }
  function StockCell(paperStatus, imagePath, altName) {
    this.td = {
      div: [
        "class",
        "flex-container",
        {
          img: ["class", "mark-icon", "src", imagePath, "alt", altName],
          span: paperStatus,
        },
      ],
    };
  }
  function StatusCell(pillColor, deviceStatus) {
    this.td = {
      div: ["class", `status-pill ${pillColor}`, deviceStatus],
    };
  }

  function HiddenRow() {
    this.tr = ["class", "hide-row"];
  }

  function TimeCell(timeStamp) {
    this.td = timeStamp;
  }

  function PaperCell(remaining, full, imagePath, altName) {
    this.td = {
      div: [
        "class",
        "flex-container",
        {
          img: ["class", "paper-icon", "src", imagePath, "alt", altName],
          span: `${remaining}/${full}`,
        },
      ],
    };
  }

  function CodeCell(statusCodes) {
    this.td = statusCodes;
  }

  function setImgPath(loadpath) {
    if (loadpath === "FULL" || loadpath === "GOOD") {
      return ["images/green-mark.png", "Green Mark"];
    } else if (loadpath === "LOW") {
      return ["images/yellow-mark.png", "Yellow Mark"];
    } else if (loadpath === "EMPTY") {
      return ["images/red-mark.png", "Red Mark"];
    }
    if (loadpath === "BTP") {
      return ["images/bt-paper.png", "BT Paper"];
    } else if (loadpath === "BPP") {
      return ["images/bp-paper.png", "BP Paper"];
    }
  }

  function setPillColor(deviceStatus) {
    switch (deviceStatus) {
      case "ONLINE":
        return "green";
      case "INIT":
      case "PAPER OUT":
        return "yellow";
      case "UNKNOWN":
        return "blue";
      case "OFFLINE":
      default:
        return "red";
    }
  }

  function mergeStatusCodes(statusCodes) {
    let codeString = "";
    for (let code of Object.keys(statusCodes)) {
      if (statusCodes[code] === "true") {
        codeString = `${codeString}${code.toUpperCase()}, `;
      }
    }
    codeString = codeString.slice(0, -2);
    return codeString;
  }

  for (let index of socketDataArray) {
    const shownRow = [
      new ShownRow(),
      new HostCell(index._id),
      new StockCell(
        index.btLoadPath,
        setImgPath(index.btLoadPath)[0],
        setImgPath(index.btLoadPath)[1]
      ),
      new StockCell(
        index.bpLoadPathA,
        setImgPath(index.bpLoadPathA)[0],
        setImgPath(index.bpLoadPathA)[1]
      ),
      new StockCell(
        index.bpLoadPathB,
        setImgPath(index.bpLoadPathB)[0],
        setImgPath(index.bpLoadPathB)[1]
      ),
      new StatusCell(setPillColor(index.btStatus.desc), index.btStatus.desc),
      new StatusCell(setPillColor(index.bpStatus.desc), index.bpStatus.desc),
    ];

    const hiddenRow = [
      new HiddenRow(),
      new TimeCell(index.lastUpdated),
      new PaperCell(
        index.btRemaining,
        200,
        setImgPath("BTP")[0],
        setImgPath("BTP")[1]
      ),
      new PaperCell(
        index.bpRemainingA,
        5000,
        setImgPath("BPP")[0],
        setImgPath("BPP")[1]
      ),
      new PaperCell(
        index.bpRemainingB,
        5000,
        setImgPath("BPP")[0],
        setImgPath("BPP")[1]
      ),
      new CodeCell(mergeStatusCodes(index.btStatus)),
      new CodeCell(mergeStatusCodes(index.bpStatus)),
    ];

    const showRow = convertToHtml(shownRow[0]);
    const hideRow = convertToHtml(hiddenRow[0]);

    for (let index = 1; index < shownRow.length; index++) {
      showRow.appendChild(convertToHtml(shownRow[index]));
    }
    for (let index = 1; index < hiddenRow.length; index++) {
      hideRow.appendChild(convertToHtml(hiddenRow[index]));
    }
    const tbody = document.getElementsByTagName("tbody")[0];

    showRow.addEventListener("click", (e) => {
      hideRow.classList.toggle("hide-row");
      hideRow.classList.toggle("show-row");
    });

    tbody.appendChild(showRow);
    tbody.appendChild(hideRow);
  }

  function convertToHtml(htmlData, previousTag) {
    const headKey = Object.keys(htmlData)[0];
    const headTag = document.createElement(headKey);
    if (Array.isArray(htmlData[headKey])) {
      for (let index = 0; index < htmlData[headKey].length; index++) {
        if (index % 2 > 0) {
          headTag.setAttribute(
            `${htmlData[headKey][index - 1]}`,
            `${htmlData[headKey][index]}`
          );
        } else if (typeof htmlData[headKey][index] === "object") {
          headTag.appendChild(convertToHtml(htmlData[headKey][index], headTag));
        } else if (index === htmlData[headKey].length - 1 && index % 2 === 0) {
          headTag.innerHTML = `${htmlData[headKey][index]}`;
        }
        if (
          index === htmlData[headKey].length - 1 &&
          Object.keys(htmlData)[1]
        ) {
          const nextKey = Object.keys(htmlData)[1];
          const tagObj = {};
          tagObj[nextKey] = htmlData[nextKey];
          previousTag.appendChild(convertToHtml(tagObj, previousTag));
        }
      }
    } else if (typeof htmlData[headKey] === "object") {
      headTag.appendChild(convertToHtml(htmlData[headKey], headTag));
    } else {
      headTag.innerHTML = htmlData[headKey];
      if (Object.keys(htmlData)[1]) {
        const nextKey = Object.keys(htmlData)[1];
        const tagObj = {};
        tagObj[nextKey] = htmlData[nextKey];
        previousTag.appendChild(convertToHtml(tagObj, previousTag));
      }
    }
    return headTag;
  }
}
