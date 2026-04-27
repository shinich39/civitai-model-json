import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";

/**
 * dayjs with plugins: utc, timezone, duration, relativeTime, customParseFormat
 *
 * @example
 * dt().format();                                 // "2024-01-02T00:00:00+09:00"
 * dt("01/02/2024", "MM/DD/YYYY").format();       // "2024-01-02T00:00:00+09:00"
 * dt("01/02/2024", "MM/DD/YYYY").utc().format(); // "2024-01-01T15:00:00Z"
 *
 * // utc
 * dt.utc().format();                             // "2024-01-01T15:00:00Z"
 * dt.utc("2024-01-02T00:00:00Z").format();       // "2024-01-02T00:00:00Z" (recommended)
 * dt.utc("01/02/2024", "MM/DD/YYYY").format();   // "2024-01-02T00:00:00Z" (recommended)
 *
 * // timezone
 * dt.tz("2024-01-02 00:00:00", "Asia/Seoul").format();     // "2024-01-02T00:00:00+09:00"
 * dt.utc("2024-01-02 00:00:00").tz("Asia/Seoul").format(); // "2024-01-01T15:00:00+09:00"
 *
 * // duration
 * dt.duration(3, "hours").asMinutes();                // 180
 * dt.duration({ hours: 1, minutes: 30 }).asMinutes(); // 90
 *
 * // format output
 * dt.utc().format("YYYY-MM-DD HH:mm:ss"); // "2024-01-01 00:00:00"
 */
const dt = dayjs;

/** @see https://day.js.org/docs/en/durations/humanize */
dt.extend(duration);
dt.extend(relativeTime);

/** @see https://day.js.org/docs/en/plugin/utc */
dt.extend(utc);

/** @see https://day.js.org/docs/en/timezone/timezone */
dt.extend(timezone);

/** @see https://day.js.org/docs/en/plugin/custom-parse-format */
dt.extend(customParseFormat);

export default dt;
export type { Dayjs } from "dayjs";
