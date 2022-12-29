import "./styles.css";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import utc from "dayjs/plugin/utc";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(localeData);
dayjs.extend(utc); // utc plugin
dayjs.extend(LocalizedFormat); // https://day.js.org/docs/zh-CN/display/format#%E6%9C%AC%E5%9C%B0%E5%8C%96%E6%A0%BC%E5%BC%8F
dayjs.extend(timezone);

const LOCALE = "en";

// 背景：在部分欧洲国家因为冬令时&夏令时存在导致前端通过dayjs处理的时间不对，需要给后台返回0点的时间戳
// ------------------------------------------------------------------------------------------------------------------------
// 找一个冬令时case from https://github.com/iamkun/dayjs/issues/1271#issuecomment-772542205
// 但是只能挨个方法改，而且只有add没有/substract
const addDaysExtended = (dateWithTZ, days) => {
  const clone = dayjs(dateWithTZ);
  console.log("clone", clone);
  const tz = clone.$x.$timezone;
  console.log("tz", tz);
  return clone.date(clone.date() + days).tz(tz, true);
};

// ！！！可以发现这里 dayjs 增加一天后，发生突变
// 1603580400 可以表示 2020-10-24 23:00:00 也可以表示 2020-10-25 00:00:00
const date1 = dayjs.tz("2020-10-24", "Europe/London").add(7, "day");
const date2 = dayjs.tz("2020-10-30", "Europe/London");

const date3 = addDaysExtended(dayjs.tz("2020-10-24", "Europe/London"), 6);
// ------------------------------------------------------------------------------------------------------------------------
// 这里的修复，通过寻找最近一天0点实现
function fixDaylightSavingGap(time) {
  return dayjs.utc(+time).startOf("day");
}
const date4 = fixDaylightSavingGap(
  dayjs.tz("2020-10-24", "Europe/London").add(7, "day").valueOf()
);

// dynamic load locale data
import(`dayjs/locale/${LOCALE}`).then(() => {
  dayjs.locale(LOCALE);
  document.getElementById("app").innerHTML = `
  <h1>TimeRange</h1>
  <ul>
    <li>date1: ${getFormatTimeAndUnixTime(date1)}</li>
    <li>date2: ${getFormatTimeAndUnixTime(date2)}</li>
    <li>date3: ${getFormatTimeAndUnixTime(date3)}</li>
    <li>date4: ${getFormatTimeAndUnixTime(date4)}</li>
  </ul>
  `;
});

function getFormatTimeAndUnixTime(time) {
  return `${time.toISOString()}(${time.unix()})`;
}
