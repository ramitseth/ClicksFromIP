const fs = require("fs");

let fileData = fs.readFileSync("clicks.json").toString();
fileData = JSON.parse(fileData);

filterAndWriteData(fileData);

function filterAndWriteData(oldData) {
  let newData = [];

  oldData.forEach(element => {
    const timePeriod = calculateTimeperiod(element.timestamp);
    let ipFound = false;
    let ipCount = 0;
    let dataFound = false;
    for (let i = 0; i < newData.length; i++) {
      if (newData[i].ip == element.ip) {
        newData[i].count++;
        ipCount = newData[i].count;
        ipFound = true;
        if (
          newData[i].startdate == timePeriod.startDate &&
          newData[i].enddate == timePeriod.endDate
        ) {
          if (parseFloat(newData[i].amount) < parseFloat(element.amount)) {
            newData[i].amount = element.amount;
          } else if (
            parseFloat(newData[i].amount) == parseFloat(element.amount)
          ) {
            /* logic for choosing ip with earlier timestamp when date, hour and amount are same */

            const newDataTime = newData[i].timestamp.split(" ")[1];
            const elementTime = element.timestamp.split(" ")[1];
            if (elementTime.split(":")[1] < newDataTime.split(":")[1]) {
              newData[i].timestamp = element.timestamp;
            } else if (elementTime.split(":")[1] == newDataTime.split(":")[1] && elementTime.split(":")[2] < newDataTime.split(":")[2]) {
              newData[i].timestamp = element.timestamp;
            }
          }
          dataFound = true;
        }
      }
    }
    if (!dataFound) {
      const count = ipFound ? ipCount : 1;
      newData.push({
        ip: element.ip,
        timestamp: element.timestamp,
        startdate: timePeriod.startDate,
        enddate: timePeriod.endDate,
        amount: element.amount,
        count: count
      });
    }
  });

  newData = newData
    .filter(data => data.count <= 10)
    .map(data => {
      delete data.count;
      delete data.startdate;
      delete data.enddate;
      return data;
    });

  fs.writeFileSync("resultset.json", JSON.stringify(newData));
}

function calculateTimeperiod(timestamp) {
  const [date, time] = timestamp.split(" ");
  const startTime = `${time.split(":")[0]}:00:00`;
  const endTime = `${time.split(":")[0]}:59:59`;
  return { startDate: `${date} ${startTime}`, endDate: `${date} ${endTime}` };
}
