import { getDb } from "../db/";
import { ContactMode } from "./contact-logs";

export type GroupContactLog = {
  _id: string;
  organizationId: string;
  contactMode: ContactMode;
  groupId: string; // References group
  instanceId: string; // Reference SmsInstance or EmailInstance
  initiatorEmail: string; // references email of account (Seaport)
  timestamp: Date;
};

async function createGroupContactLog(
  groupContactLog: Omit<GroupContactLog, "_id" | "timestamp">
): Promise<GroupContactLog> {
  const db = await getDb();

  const timestamp = new Date();
  const result = await db.collection("groupContactLogs").insertOne({
    ...groupContactLog,
    timestamp,
  });
  const insertedId = result.insertedId;

  return {
    ...groupContactLog,
    timestamp,
    _id: insertedId.toString(),
  };
}

// TODO paginate this (reverse chrono)
async function getGroupContactLogs(
  organizationId: string
): Promise<GroupContactLog[]> {
  const db = await getDb();

  const emailInstances = await db
    .collection("contactLogs")
    .find({
      organizationId,
    })
    .toArray();

  return emailInstances as unknown as GroupContactLog[];
}

async function getGroupContactLogsForGroup(
  organizationId: string,
  groupId: string
): Promise<GroupContactLog[]> {
  const db = await getDb();

  const emailInstances = await db
    .collection("contactLogs")
    .find({
      organizationId,
      groupId,
    })
    .toArray();

  return emailInstances as unknown as GroupContactLog[];
}

export {
  createGroupContactLog,
  getGroupContactLogs,
  getGroupContactLogsForGroup,
};
