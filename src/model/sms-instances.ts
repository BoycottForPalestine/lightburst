import { getDb } from "../db/";

export type SmsInstance = {
  _id: string;
  organizationId: string;
  body: string;
  dateCreated: Date;
};

async function createSmsInstance(
  organizationId: string,
  body: string
): Promise<SmsInstance> {
  const db = await getDb();

  const currentDate = new Date();
  const result = await db.collection("smsInstances").insertOne({
    organizationId,
    body,
    dateCreated: currentDate,
  });
  const insertedId = result.insertedId;

  return {
    _id: insertedId.toString(),
    organizationId,
    dateCreated: currentDate,
    body,
  };
}

async function getSmsInstances(organizationId: string): Promise<SmsInstance[]> {
  const db = await getDb();

  const smsInstances = await db
    .collection("smsInstances")
    .find({
      organizationId,
    })
    .toArray();

  return smsInstances as unknown as SmsInstance[];
}

export { createSmsInstance, getSmsInstances };
