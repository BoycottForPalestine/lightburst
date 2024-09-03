import { ObjectId } from "mongodb";
import { getDb } from "../db/";

export type Contact = {
  _id: string;
  name: string;
  organizationId: string;
  dateCreated: string; // ISO string
  notes: string;
  vectors: {
    email: string;
    phone: string;
    instagram: string;
  };
};

// TODO: use with search
// type ContactSearchFilter = {
//   filters: {
//     name?: string;
//     email?: string;
//     phone?: string;
//   };
// };

async function createContact(contact: Omit<Contact, "_id">): Promise<Contact> {
  const db = await getDb();

  const result = await db.collection("contacts").insertOne(contact);
  const insertedId = result.insertedId;

  return {
    _id: insertedId.toString(),
    ...contact,
  };
}

async function updateContact(contact: Contact): Promise<void> {
  const db = await getDb();

  const newContactData = {
    name: contact.name,
    vectors: contact.vectors,
    notes: contact.notes,
  };

  await db
    .collection("contacts")
    .updateOne({ _id: new ObjectId(contact._id) }, { $set: newContactData });
}

async function deleteContact(contactId: string): Promise<void> {
  const db = await getDb();

  await db.collection("contacts").deleteOne({ _id: new ObjectId(contactId) });
}

async function getContacts(organizationId: string): Promise<Contact[]> {
  const db = await getDb();

  // TODO: Paginate this
  const contacts = await db
    .collection("contacts")
    .find({ organizationId })
    .toArray();

  return contacts as unknown as Contact[];
}

// TODO: Make this atlas search and only use regex style for local dev
async function searchContactsByName(
  organizationId: string,
  name: string
): Promise<Contact[]> {
  const db = await getDb();

  const contacts = await db
    .collection("contacts")
    .find({ organizationId, name: { $regex: name, $options: "i" } })
    .toArray();

  return contacts as unknown as Contact[];
}

async function getContactsByGroup(groupId: string): Promise<Contact[]> {
  const db = await getDb();

  // TODO: Paginate this

  const contacts = await db
    .collection("contactsGroups")
    .find({ groupId })
    .toArray();

  const contactIds = contacts.map((contact) => contact.contactId);

  return (await db
    .collection("contacts")
    .find({ _id: { $in: contactIds } })
    .toArray()) as unknown as Contact[];
}

async function getContactById(contactId: string): Promise<Contact | null> {
  const db = await getDb();

  const contact = await db
    .collection("contacts")
    .findOne({ _id: new ObjectId(contactId) });

  return contact as unknown as Contact;
}

export {
  createContact,
  getContactById,
  getContacts,
  searchContactsByName,
  updateContact,
  deleteContact,
  getContactsByGroup,
  // searchContacts,
};
