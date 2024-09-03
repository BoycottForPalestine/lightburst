// const client = require("twilio")("accountSid", "authToken");

// export function sendSms(from: string, to: string, body: string) {
//   if (process.env.TWILIO_ENV === "local") {
//     console.log("SMS not sent in local environment");
//     console.log("SMS Data:");
//     console.log("From: ", from);
//     console.log("To: ", to);
//     console.log("Body: ", body);
//     return;
//   } else if (process.env.TWILIO_ENV === "local_live") {
//     client.messages
//       .create({
//         body: body,
//         from: "+18447553069",
//         to: "+17342729760",
//       })
//       .then((message: any) => console.log(message.sid));
//   } else if (process.env.TWILIO_ENV === "prod") {
//     client.messages
//       .create({
//         body,
//         from,
//         to,
//       })
//       .then((message: any) => console.log(message.sid))
//       .done();
//   }
// }

export function sendSms() {
  return "NOOP";
}
