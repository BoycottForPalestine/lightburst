import { ObjectId } from "mongodb";
import { getDb } from "../db";
import { Contact } from "./contacts";
import { LighthouseError } from "../common/errors";
import HttpStatusCode from "../common/errors/http-status-code";
import { LighthouseErrorMessage } from "../common/errors/lighthouse-error";

export type Tag = {
  _id: string;
  name: string;
  organizationId: string;
  color: string; // hex string
};

export type TagWithMembers = {
  _id: string;
  name: string;
  organizationId: string;
  contacts: Contact[];
};

export type ContactTag = {
  _id: string;
  tagId: string;
  contactId: string;
};

function getContactTagsUniqueId(tagId: string, contactId: string) {
  return `${tagId}-${contactId}`;
}

async function getAllTags(organizationId: string): Promise<Tag[]> {
  const db = await getDb();

  return db
    .collection("tags")
    .find({ organizationId })
    .toArray() as unknown as Promise<Tag[]>;
}

async function getAllContactsForTag(tagId: string): Promise<string[]> {
  const db = await getDb();
  const tagMembers: ContactTag[] = (await db
    .collection("contactsTags")
    .find({ tagId: new ObjectId(tagId) })
    .toArray()) as unknown as ContactTag[];

  const contactIds = tagMembers.map((tagMember) => tagMember.contactId);
  return contactIds;
}

async function searchTagsByName(
  organizationId: string,
  name: string
): Promise<Tag[]> {
  const db = await getDb();

  const tags = await db
    .collection("tags")
    .find({ organizationId, name: { $regex: name, $options: "i" } })
    .toArray();

  return tags as unknown as Tag[];
}

async function deleteTag(tagId: string): Promise<void> {
  const db = await getDb();
  const tag = await db.collection("tags").findOne({ _id: new ObjectId(tagId) });

  if (!tag) {
    throw new LighthouseError(
      HttpStatusCode.NOT_FOUND,
      LighthouseErrorMessage.TAG_NOT_FOUND
    );
  }

  const tagMembers = await db
    .collection("contactsTags")
    .find({ tagId: new ObjectId(tagId) })
    .toArray();

  if (tagMembers.length > 0) {
    throw new LighthouseError(
      HttpStatusCode.BAD_REQUEST,
      LighthouseErrorMessage.TAG_STILL_HAS_CONTACTS
    );
  }
  await db.collection("tags").deleteOne({ _id: new ObjectId(tagId) });
}

async function addContactsToTag(
  contactIds: string[],
  tagId: string
): Promise<void> {
  const db = await getDb();
  const tag = await db.collection("tags").findOne({ _id: new ObjectId(tagId) });
  if (!tag) {
    throw new LighthouseError(
      HttpStatusCode.NOT_FOUND,
      LighthouseErrorMessage.TAG_NOT_FOUND
    );
  }

  const docsToInsert = contactIds.map((contactId) => {
    return {
      // this should act as a constraint so that no contact-tag pair is inserted twice
      _id: getContactTagsUniqueId(contactId, tagId),
      tagId: new ObjectId(tagId),
      contactId: new ObjectId(contactId),
    };
  });

  // @ts-ignore TypeScript doesn't know you can use non ObjectIds as _ids
  await db.collection("contactsTags").insertMany(docsToInsert);
}

// Function to remove a contact from a tag
async function removeContactFromTag(
  contactId: string,
  tagId: string
): Promise<void> {
  const db = await getDb();
  const contactTagId = getContactTagsUniqueId(contactId, tagId);

  const contactTag = await db
    .collection("contactsTags")
    // @ts-ignore TypeScript doesn't know you can use non ObjectIds as _ids
    .findOne({ _id: contactTagId });
  if (!contactTag) {
    throw new LighthouseError(
      HttpStatusCode.NOT_FOUND,
      LighthouseErrorMessage.TAG_NOT_FOUND
    );
  }

  await db
    .collection("contactsTags")
    // @ts-ignore TypeScript doesn't know you can use non ObjectIds as _ids
    .deleteOne({ _id: contactTagId });
}

async function updateTag(tagId: string, updatedTag: Tag): Promise<void> {
  const db = await getDb();
  const tag = (await db
    .collection("tags")
    .findOne({ _id: new ObjectId(tagId) })) as unknown as Tag;
  if (!tag) {
    throw new LighthouseError(
      HttpStatusCode.NOT_FOUND,
      LighthouseErrorMessage.TAG_NOT_FOUND
    );
  }

  // If tag name is being updated, ensure that we're not using a name that already exists
  if (tag.name !== updatedTag.name) {
    const existingTag = await getTagByName(tag.organizationId, updatedTag.name);
    if (existingTag) {
      throw new LighthouseError(
        HttpStatusCode.BAD_REQUEST,
        LighthouseErrorMessage.DUPLICATE_TAG_NAME
      );
    }
  }

  await db
    .collection("tags")
    .updateOne(
      { _id: new ObjectId(tagId) },
      { $set: { name: updatedTag.name, color: updatedTag.color } }
    );
}

// Function to create a new tag
async function createTag(organizationId: string, name: string, color: string) {
  const db = await getDb();
  const tag: Omit<Tag, "_id"> = {
    organizationId,
    name,
    color,
  };
  const existingTag = await getTagByName(organizationId, name);
  if (existingTag) {
    throw new LighthouseError(
      HttpStatusCode.BAD_REQUEST,
      LighthouseErrorMessage.DUPLICATE_TAG_NAME
    );
  }

  const result = await db.collection("tags").insertOne(tag);
  return result;
}

async function getTagWithMembers(tagId: string): Promise<TagWithMembers> {
  const db = await getDb();
  const tag = (await db
    .collection("tags")
    .findOne({ _id: new ObjectId(tagId) })) as unknown as Tag;
  if (!tag) {
    throw new LighthouseError(
      HttpStatusCode.NOT_FOUND,
      LighthouseErrorMessage.TAG_NOT_FOUND
    );
  }

  const contactIds = await getAllContactsForTag(tagId);

  const contacts = (await db
    .collection("contacts")
    .find({ _id: { $in: contactIds.map((id) => new ObjectId(id)) } })
    .toArray()) as unknown as Contact[];

  return { ...tag, contacts };
}

async function getTagsByContactId(contactId: string) {
  const db = await getDb();
  const contactsTags = (await db
    .collection("contactsTags")
    .find({ contactId: new ObjectId(contactId) })
    .toArray()) as unknown as ContactTag[];

  const tagIds = contactsTags.map(
    (contactsTag) => new ObjectId(contactsTag.tagId)
  );

  const tags = await db
    .collection("tags")
    .find({
      _id: {
        $in: tagIds,
      },
    })
    .toArray();

  return tags.map((tag) => {
    return {
      _id: tag._id.toString(),
      name: tag.name,
    };
  });
}

async function getTagByName(organizationId: string, name: string) {
  const db = await getDb();
  return db.collection("tags").findOne({ organizationId, name });
}

async function getTagById(tagId: string) {
  const db = await getDb();
  return db.collection("tags").findOne({ _id: new ObjectId(tagId) });
}

export {
  getAllTags,
  searchTagsByName,
  getAllContactsForTag,
  deleteTag,
  addContactsToTag,
  removeContactFromTag,
  updateTag,
  createTag,
  getTagsByContactId,
  getTagWithMembers,
  getTagByName,
  getTagById,
};
