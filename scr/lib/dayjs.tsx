import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import updateLocale from "dayjs/plugin/updateLocale";
import timezone from "dayjs/plugin/timezone";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import viVn from "dayjs/locale/vi";

dayjs.locale(viVn);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(weekday);
dayjs.extend(weekOfYear);

export default dayjs;
