import { processEvents } from "../../lib/event-processor-service";
import { addEvent } from "../../model/events";
import axios from "axios";

export const sourceName = "SpdPublicArrestsDataset";
export const cronExpression = "*/3 * * * * *"; // This is a default and can be changed in the database
export const description = "Seattle Police Department Public Arrests Dataset";
export const link =
  "https://data.seattle.gov/Public-Safety/SPD-Arrest-Data/9bjs-7a7w/";

export function getUniqueKey(event: any) {
  return `SPD_Public_Arrests_${event.arrest_number}`;
}

const LIMIT = 100;

export async function fetchData() {
  let offsetMultiplier = 0;
  try {
    while (true) {
      const response = await axios.get(
        `https://data.seattle.gov/resource/9bjs-7a7w.json?$limit=${LIMIT}&$offset=${
          offsetMultiplier * LIMIT
        }&$order=arrest_occurred_date_time DESC`
      );
      const arrestEvents = response.data;

      if (arrestEvents.length === 0) {
        break;
      }

      const eventsToProcess = arrestEvents.map((event: any) => {
        return {
          uniqueKey: getUniqueKey(event),
          sourceName,
          link: "https://data.seattle.gov/resource/28ny-9ts8.json",
          customFields: event,
        };
      });

      processEvents(eventsToProcess);
      offsetMultiplier++;
    }
  } catch (error) {
    console.log(error);
  }
}
