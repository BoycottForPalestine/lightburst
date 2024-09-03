import { ObjectId } from "mongodb";
import { getDb } from "../db";
import { description } from "../activities/spd-public-arrests";
import { LighthouseError } from "../common/errors";
import HttpStatusCode from "../common/errors/http-status-code";
import { LighthouseErrorMessage } from "../common/errors/lighthouse-error";

export type Group = {
  _id: string;
  organizationId: string;
  name: string;
  dateCreated: string;
  description: string;
};

export type ContactGroup = {
  contactId: string;
  groupId: string;
};

async function createGroup(group: Omit<Group, "_id">): Promise<Group> {
  const db = await getDb();

  const result = await db.collection("groups").insertOne(group);
  const insertedId = result.insertedId;

  return {
    _id: insertedId.toString(),
    ...group,
  };
}

async function updateGroup(group: Group): Promise<void> {
  const db = await getDb();

  const updatedGroup = {
    name: group.name,
    description: group.description,
  };

  await db
    .collection("groups")
    .updateOne({ _id: new ObjectId(group._id) }, { $set: updatedGroup });
}

async function getGroups(organizationId: string): Promise<Group[]> {
  const db = await getDb();

  // TODO: paginate this
  const groups = await db.collection("groups").find().toArray();

  return groups as unknown as Group[];
}

async function searchGroupsByName(
  organizationId: string,
  name: string
): Promise<Group[]> {
  const db = await getDb();

  const groups = await db
    .collection("groups")
    .find({ organizationId, name: { $regex: name, $options: "i" } })
    .toArray();

  return groups as unknown as Group[];
}

async function getGroupById(groupId: string) {
  const db = await getDb();

  const group = await db
    .collection("groups")
    .findOne({ _id: new ObjectId(groupId) });

  const contactIds = (
    await db.collection("contactsGroups").find({ groupId }).toArray()
  ).map((contactGroup) => new ObjectId(contactGroup.contactId as string));

  const contacts = await db
    .collection("contacts")
    .find({ _id: { $in: contactIds } })
    .toArray();

  return {
    group,
    contacts,
  };
}

async function getGroupsByContact(contactId: string): Promise<Group[]> {
  const db = await getDb();

  const contactsGroups = (await db
    .collection("contactsGroups")
    .find({ contactId })
    .toArray()) as unknown as ContactGroup[];

  const groupIds = contactsGroups.map(
    (contactGroup) => new ObjectId(contactGroup.groupId)
  );

  return (await db
    .collection("groups")
    .find({ _id: { $in: groupIds } })
    .toArray()) as unknown as Group[];
}

async function deleteGroup(groupId: string): Promise<void> {
  const db = await getDb();

  const contacts = await db.collection("contactsGroups").findOne({ groupId });

  if (contacts) {
    throw new LighthouseError(
      HttpStatusCode.BAD_REQUEST,
      LighthouseErrorMessage.GROUP_STILL_HAS_CONTACTS
    );
  }

  await db.collection("groups").deleteOne({ _id: new ObjectId(groupId) });
}

async function removeContactFromGroup(
  contactId: string,
  groupId: string
): Promise<void> {
  const db = await getDb();

  await db.collection("contactsGroups").deleteOne({ contactId, groupId });
}

async function addContactsToGroup(
  contactIds: string[],
  groupId: string
): Promise<void> {
  const db = await getDb();

  let contactsGroups: ContactGroup[] = contactIds.map((contactId) => {
    return {
      contactId,
      groupId,
    };
  });

  await db.collection("contactsGroups").insertMany(contactsGroups);
}

export {
  createGroup,
  updateGroup,
  getGroups,
  searchGroupsByName,
  getGroupById,
  getGroupsByContact,
  deleteGroup,
  removeContactFromGroup,
  addContactsToGroup,
};
