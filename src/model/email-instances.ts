import { getDb } from "../db/";

export type EmailInstance = {
  _id: string;
  organizationId: string;
  body: string;
  subject: string;
  dateCreated: Date;
};

async function createEmailInstance(
  organizationId: string,
  subject: string,
  body: string
): Promise<EmailInstance> {
  const db = await getDb();

  const currentDate = new Date();
  const result = await db.collection("emailInstances").insertOne({
    organizationId,
    body,
    subject,
    dateCreated: currentDate,
  });
  const insertedId = result.insertedId;

  return {
    _id: insertedId.toString(),
    organizationId,
    dateCreated: currentDate,
    body,
    subject,
  };
}

async function getEmailInstances(
  organizationId: string
): Promise<EmailInstance[]> {
  const db = await getDb();

  const emailInstances = await db
    .collection("emailInstances")
    .find({
      organizationId,
    })
    .toArray();

  return emailInstances as unknown as EmailInstance[];
}

export { createEmailInstance, getEmailInstances };
