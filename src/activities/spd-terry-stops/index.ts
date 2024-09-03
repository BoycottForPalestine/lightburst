import { processEvents } from "../../lib/event-processor-service";
import { addEvent } from "../../model/events";
import axios from "axios";

export const sourceName = "SpdTerryStopsDataset";
export const cronExpression = "*/30 * * * * *"; // This is a default and can be changed in the database
export const description = "Seattle Police Department Terry Stops Dataset";
export const link =
  "https://data.seattle.gov/Public-Safety/Terry-Stops/28ny-9ts8/";

export function getUniqueKey(event: any) {
  return `SPD_Terry_Stop_${event.terry_stop_id}`;
}

const LIMIT = 100;

export async function fetchData() {
  let offsetMultiplier = 0;
  try {
    // Gets the most recent 300 events
    // Assumes that no more than 300 events is pushed daily
    while (true) {
      const response = await axios.get(
        `https://data.seattle.gov/resource/28ny-9ts8.json?$limit=${LIMIT}&$offset=${
          offsetMultiplier * LIMIT
        }&$order=reported_date DESC`
      );
      const terryStopsEvents = response.data;

      if (terryStopsEvents.length === 0) {
        break;
      }

      const eventsToProcess = terryStopsEvents.map((event: any) => {
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
