import { getDb } from "../db/";

export enum ContactMode {
  Email = "email",
  Sms = "sms",
}

export type ContactLog = {
  _id: string;
  organizationId: string;
  contactMode: ContactMode;
  contactId: string; // References contact
  instanceId: string; // Reference SmsInstance or EmailInstance
  initiatorEmail: string; // references email of account (Seaport)
  timestamp: Date;
  successful: boolean;
  associatedGroupId: string | null; // is defined if contact was contacted as part of a group
};

async function createContactLog(
  contactLog: Omit<ContactLog, "_id" | "timestamp">
): Promise<ContactLog> {
  const db = await getDb();

  const timestamp = new Date();
  const result = await db.collection("contactLogs").insertOne({
    ...contactLog,
    timestamp,
  });
  const insertedId = result.insertedId;

  return {
    ...contactLog,
    timestamp,
    _id: insertedId.toString(),
  };
}

// TODO paginate this (reverse chrono)
async function getContactLogs(organizationId: string): Promise<ContactLog[]> {
  const db = await getDb();

  const emailInstances = await db
    .collection("contactLogs")
    .find({
      organizationId,
    })
    .toArray();

  return emailInstances as unknown as ContactLog[];
}

async function getContactLogsForContact(
  organizationId: string,
  contactId: string
): Promise<ContactLog[]> {
  const db = await getDb();

  const emailInstances = await db
    .collection("contactLogs")
    .find({
      organizationId,
      contactId,
    })
    .toArray();

  return emailInstances as unknown as ContactLog[];
}

export { createContactLog, getContactLogs, getContactLogsForContact };
