import { getDb } from "../db";

export enum SmsMessageDirection {
  Inbound = "inbound",
  Outbound = "outbound",
}

export type SmsMessage = {
  _id: string;
  messageId?: string;
  organizationId: string;
  contactId: string;
  message: string;
  messageDirection: SmsMessageDirection;
  timestamp: Date;
  successful: boolean;
};

async function createSmsMessage(
  smsMessage: Omit<SmsMessage, "_id" | "timestamp">
): Promise<SmsMessage> {
  const db = await getDb();

  const timestamp = new Date();
  const result = await db.collection("smsMessages").insertOne({
    ...smsMessage,
    timestamp,
  });
  const insertedId = result.insertedId;

  return {
    ...smsMessage,
    timestamp,
    _id: insertedId.toString(),
  };
}

// TODO: paginate and order by reverse chrono
async function getSmsMessageForContact(
  organizationId: string,
  contactId: string
): Promise<SmsMessage[]> {
  const db = await getDb();

  const smsMessages = (await db
    .collection("smsMessages")
    .find({
      organizationId,
      contactId,
    })
    .toArray()) as unknown as SmsMessage[];

  return smsMessages;
}

export { createSmsMessage, getSmsMessageForContact };
