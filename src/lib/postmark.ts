// Require:
var postmark = require("postmark");

// Send an email:
// TODO: examine if this needs to be secretified
var client = new postmark.ServerClient("b985efe6-54a2-4aa8-a41d-dcb7d0ce68aa");

// client.sendEmail({
//   From: "sender@example.org",
//   To: "sender@example.org",
//   Subject: "Hello from Postmark",
//   HtmlBody: "<strong>Hello</strong> dear Postmark user.",
//   TextBody: "Hello from Postmark!",
//   MessageStream: "broadcast",
// });

export function sendEmail(
  from: string,
  to: string,
  subject: string,
  htmlBody: string,
  textBody: string,
  streamName: string
) {
  if (process.env.POSTMARK_ENV === "local") {
    console.log("Email not sent in local environment");
    console.log("Email Data:");
    console.log("From: ", from);
    console.log("To: ", to);
    console.log("Subject: ", subject);
    console.log("HtmlBody: ", htmlBody);
    console.log("TextBody: ", textBody);
    console.log("MessageStream: ", streamName);
    return;
  } else if (process.env.POSTMARK_ENV === "local_live") {
    client.sendEmail({
      From: "shikev@umich.edu",
      To: "shikev@umich.edu", // edit this to your email
      Subject: subject,
      HtmlBody: htmlBody,
      TextBody: textBody,
      MessageStream: "local-test-stream", // test broadcast stream set up in postmark
    });
  } else if (process.env.POSTMARK_ENV === "prod") {
    client.sendEmail({
      From: from,
      To: to,
      Subject: subject,
      HtmlBody: htmlBody,
      TextBody: textBody,
      MessageStream: streamName,
    });
  }
}
