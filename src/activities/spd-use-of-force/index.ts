import { processEvents } from "../../lib/event-processor-service";
import { addEvent } from "../../model/events";
import axios from "axios";

export const sourceName = "SpdUseOfForceDataset";
export const cronExpression = "*/30 * * * * *"; // This is a default and can be changed in the database
export const description = "Seattle Police Department Use of Force Dataset";
export const link =
  "https://data.seattle.gov/Public-Safety/Use-Of-Force/ppi5-g2bj";

export function getUniqueKey(event: any) {
  return `SPD_Use_Of_Force_${event.uniqueid}`;
}

const LIMIT = 100;

export async function fetchData() {
  let offsetMultiplier = 0;
  try {
    while (true) {
      const response = await axios.get(
        `https://data.seattle.gov/resource/ppi5-g2bj.json?$limit=${LIMIT}&$offset=${
          offsetMultiplier * LIMIT
        }&$order=occured_date_time DESC`
      );
      const useOfForceEvents = response.data;

      if (useOfForceEvents.length === 0) {
        break;
      }

      const eventsToProcess = useOfForceEvents.map((event: any) => {
        return {
          uniqueKey: getUniqueKey(event),
          sourceName,
          link: "https://data.seattle.gov/resource/ppi5-g2bj.json",
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
