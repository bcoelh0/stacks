function countUpFromTime(countFrom, idEl) {
  var now = new Date(),
    countFrom = new Date(countFrom),
    timeDifference = now - countFrom;

  var secondsInADay = 60 * 60 * 1000 * 24,
    secondsInAHour = 60 * 60 * 1000;

  hours = Math.floor(((timeDifference % secondsInADay) / secondsInAHour) * 1)
    .toString()
    .replace("-", "");
  if (hours.length === 1) {
    hours = "0" + hours;
  }
  mins = Math.floor(
    (((timeDifference % secondsInADay) % secondsInAHour) / (60 * 1000)) * 1
  )
    .toString()
    .replace("-", "");
  if (mins.length === 1) {
    mins = "0" + mins;
  }
  secs = Math.floor(
    ((((timeDifference % secondsInADay) % secondsInAHour) % (60 * 1000)) /
      1000) *
      1
  )
    .toString()
    .replace("-", "");
  if (secs.length === 1) {
    secs = "0" + secs;
  }

  idEl.getElementsByClassName("hours")[0].innerHTML = (hours + "")[0];
  idEl.getElementsByClassName("hours")[1].innerHTML = (hours + "")[1];
  idEl.getElementsByClassName("minutes")[0].innerHTML = (mins + "")[0];
  idEl.getElementsByClassName("minutes")[1].innerHTML = (mins + "")[1];
  idEl.getElementsByClassName("seconds")[0].innerHTML = (secs + "")[0];
  idEl.getElementsByClassName("seconds")[1].innerHTML = (secs + "")[1];
  // idEl.getElementsByClassName("seconds")[0].innerHTML = secs;

  clearTimeout(countUpFromTime.interval);
  countUpFromTime.interval = setTimeout(function () {
    countUpFromTime(countFrom, idEl);
  }, 1000);
}
